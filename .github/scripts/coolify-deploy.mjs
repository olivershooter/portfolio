// Deploys the app through Coolify's API, waits for the deployment to finish,
// then waits for the production health check to pass. Used by the pipeline's
// deploy job; dependency-free so it runs on a bare Node 22 runner.
import { pathToFileURL } from "node:url";

export class DeployError extends Error {}

/** A hiccup worth retrying while polling: network error, timeout, 5xx, or a non-JSON body. */
class TransientError extends Error {}

const FAILED_STATUSES = new Set(["failed", "cancelled-by-user"]);
const FULL_SHA = /^[0-9a-f]{40}$/i;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const trimSlash = (url) => url.replace(/\/+$/, "");

/**
 * "HTTP 403: <reason>" for a refused request: Coolify's JSON `message`, or the
 * start of the page's text when something else (e.g. a proxy) answered.
 */
async function refusal(res) {
  const text = await res.text().catch(() => "");
  let reason;
  try {
    reason = JSON.parse(text)?.message;
  } catch {
    // not JSON; fall back to the raw text below
  }
  reason ??= text
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 150);
  return reason ? `HTTP ${res.status}: ${reason}` : `HTTP ${res.status}`;
}

export async function deploy({
  coolifyUrl,
  token: rawToken,
  appUuid,
  productionUrl,
  deployTimeoutMs = 20 * 60_000,
  pollIntervalMs = 10_000,
  healthTimeoutMs = 2 * 60_000,
  requestTimeoutMs = 15_000,
  maxTransientErrors = 3,
  /** The commit this run checked; warns if Coolify reports building another. */
  expectedCommit,
  log = console.log,
}) {
  // A secret pasted with a stray space or newline would otherwise be sent as "Bearer  <token>"
  const token = rawToken?.trim();
  const missing = Object.entries({
    COOLIFY_URL: coolifyUrl,
    COOLIFY_TOKEN: token,
    COOLIFY_APP_UUID: appUuid,
    PRODUCTION_URL: productionUrl,
  })
    .filter(([, value]) => !value)
    .map(([name]) => name);
  if (missing.length) {
    throw new DeployError(
      `Missing ${missing.join(", ")} — set them in the repository's Actions secrets/variables`,
    );
  }

  const coolifyBase = trimSlash(coolifyUrl);
  const productionBase = trimSlash(productionUrl);

  /**
   * Calls Coolify's API. Auth and not-found answers are final (DeployError with
   * the given hint); network errors, timeouts, 5xx and non-JSON bodies are
   * TransientError so a polling loop can retry them.
   */
  async function coolify(path, { forbidden, notFound }) {
    let res;
    try {
      res = await fetch(`${coolifyBase}${path}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        signal: AbortSignal.timeout(requestTimeoutMs),
      });
    } catch (err) {
      throw new TransientError(err?.name === "TimeoutError" ? "request timed out" : "unreachable");
    }
    if (res.status === 401 || res.status === 403)
      throw new DeployError(`${forbidden} (${await refusal(res)})`);
    if (res.status === 404) throw new DeployError(`${notFound} (${await refusal(res)})`);
    if (res.status >= 500) throw new TransientError(`HTTP ${res.status}`);
    if (!res.ok)
      throw new DeployError(`Coolify returned HTTP ${res.status} for ${path.split("?")[0]}`);
    try {
      return await res.json();
    } catch {
      throw new TransientError(`HTTP ${res.status} with a non-JSON body`);
    }
  }

  log("Triggering deployment in Coolify…");
  let started;
  try {
    started = await coolify(`/api/v1/deploy?uuid=${encodeURIComponent(appUuid)}&force=false`, {
      forbidden:
        "Coolify refused to start a deployment — check COOLIFY_TOKEN has deploy permission and the API is enabled in Coolify's settings",
      notFound: "Coolify doesn't know this app — check COOLIFY_APP_UUID",
    });
  } catch (err) {
    // Unlike polling, a failed trigger isn't retried: it may or may not have queued a deploy
    if (err instanceof TransientError)
      throw new DeployError(`Couldn't reach Coolify to start the deployment (${err.message})`);
    throw err;
  }
  const deploymentUuid = started?.deployments?.[0]?.deployment_uuid;
  if (!deploymentUuid)
    throw new DeployError(
      "Unexpected response from Coolify's deploy endpoint (no deployment_uuid)",
    );
  log(`Deployment ${deploymentUuid} started`);

  const deployDeadline = Date.now() + deployTimeoutMs;
  let lastStatus = "unknown";
  let deployment;
  let transientErrors = 0;
  for (;;) {
    try {
      deployment = await coolify(`/api/v1/deployments/${encodeURIComponent(deploymentUuid)}`, {
        forbidden:
          "Coolify refused to report the deployment's status — check COOLIFY_TOKEN also has read permission",
        notFound: `Coolify lost track of deployment ${deploymentUuid}`,
      });
      transientErrors = 0;
      const { status } = deployment;
      if (status !== lastStatus) log(`Deployment status: ${status}`);
      lastStatus = status;
      if (status === "finished") break;
      if (FAILED_STATUSES.has(status)) {
        throw new DeployError(
          `Deployment ${deploymentUuid} ${status === "failed" ? "failed" : "was cancelled"} — see its logs in Coolify`,
        );
      }
    } catch (err) {
      if (!(err instanceof TransientError)) throw err;
      transientErrors++;
      log(`Couldn't get the deployment status (${err.message}); retrying`);
      if (transientErrors >= maxTransientErrors) {
        throw new DeployError(
          `Coolify kept failing while reporting deployment ${deploymentUuid} (last: ${err.message})`,
        );
      }
    }
    if (Date.now() + pollIntervalMs > deployDeadline) {
      throw new DeployError(`Deployment ${deploymentUuid} timed out (last status: ${lastStatus})`);
    }
    await sleep(pollIntervalMs);
  }

  // Coolify builds the branch tip, which can differ from the commit this run
  // checked if another push landed in between; that push's own run deploys it.
  const builtCommit = deployment?.commit;
  if (expectedCommit && FULL_SHA.test(builtCommit ?? "") && builtCommit !== expectedCommit) {
    log(
      `::warning::Coolify built ${builtCommit.slice(0, 7)} but this run checked ${expectedCommit.slice(0, 7)} — a newer push probably landed; its own run will deploy it after its checks`,
    );
  }

  log(`Checking ${productionBase}/api/health…`);
  const healthDeadline = Date.now() + healthTimeoutMs;
  let lastHealth;
  for (;;) {
    try {
      const res = await fetch(`${productionBase}/api/health`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(requestTimeoutMs),
      });
      const body = await res.json().catch(() => null);
      if (res.status === 200 && body?.status === "ok") break;
      lastHealth = `HTTP ${res.status}${body?.status ? ` (${body.status})` : ""}`;
    } catch {
      lastHealth = "unreachable";
    }
    if (Date.now() + pollIntervalMs > healthDeadline) {
      throw new DeployError(`Health check did not pass in time (last result: ${lastHealth})`);
    }
    await sleep(pollIntervalMs);
  }
  log("Production is healthy");
}

const runDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (runDirectly) {
  const number = (value) => (value ? Number(value) : undefined);
  try {
    await deploy({
      coolifyUrl: process.env.COOLIFY_URL,
      token: process.env.COOLIFY_TOKEN,
      appUuid: process.env.COOLIFY_APP_UUID,
      productionUrl: process.env.PRODUCTION_URL,
      deployTimeoutMs: number(process.env.DEPLOY_TIMEOUT_MS),
      pollIntervalMs: number(process.env.POLL_INTERVAL_MS),
      healthTimeoutMs: number(process.env.HEALTH_TIMEOUT_MS),
      expectedCommit: process.env.EXPECTED_COMMIT,
    });
  } catch (err) {
    console.error(
      `::error::${err instanceof DeployError ? err.message : `Deploy script crashed: ${err}`}`,
    );
    process.exit(1);
  }
}
