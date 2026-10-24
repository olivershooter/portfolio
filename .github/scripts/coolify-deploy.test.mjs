import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { deploy, DeployError } from "./coolify-deploy.mjs";

/** Starts a local server; `routes` maps a pathname to a handler(req) → { status, body }, or "hang" to never answer. */
async function serve(routes) {
  const requests = [];
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, "http://x");
    requests.push({ path: url.pathname, query: url.search, auth: req.headers.authorization });
    const handler = routes[url.pathname];
    const reply = handler ? handler(req) : { status: 404 };
    if (reply === "hang") return;
    const { status = 200, body = "" } = reply;
    res.writeHead(status, {
      "Content-Type": typeof body === "string" ? "text/html" : "application/json",
    });
    res.end(typeof body === "string" ? body : JSON.stringify(body));
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const url = `http://127.0.0.1:${server.address().port}`;
  const close = () =>
    new Promise((r) => {
      server.closeAllConnections();
      server.close(r);
    });
  return { url, requests, close };
}

/** Returns each value in turn, repeating the last one. */
const sequence = (...items) => {
  let i = 0;
  return () => items[Math.min(i++, items.length - 1)];
};

const FAST = { pollIntervalMs: 5, deployTimeoutMs: 300, healthTimeoutMs: 300 };

async function setup({
  deployResponse,
  statuses = ["finished"],
  statusReplies,
  health = [{ status: 200, body: { status: "ok" } }],
}) {
  const nextStatus = sequence(
    ...(statusReplies ?? statuses.map((status) => ({ body: { status } }))),
  );
  const nextHealth = sequence(...health);
  const coolify = await serve({
    "/api/v1/deploy": () =>
      deployResponse ?? { body: { deployments: [{ deployment_uuid: "dep-1" }] } },
    "/api/v1/deployments/dep-1": () => nextStatus(),
  });
  const production = await serve({ "/api/health": () => nextHealth() });
  const logs = [];
  const options = {
    coolifyUrl: coolify.url,
    token: "secret-token-123",
    appUuid: "app-1",
    productionUrl: production.url,
    log: (line) => logs.push(line),
    ...FAST,
  };
  const close = async () => {
    await coolify.close();
    await production.close();
  };
  return { coolify, production, options, logs, close };
}

test("deploys, waits for the deployment to finish, then checks health", async () => {
  const s = await setup({
    statuses: ["queued", "in_progress", "finished"],
    health: [
      { status: 503, body: { status: "unhealthy" } },
      { status: 200, body: { status: "ok" } },
    ],
  });
  try {
    await deploy(s.options);
    const trigger = s.coolify.requests[0];
    assert.equal(trigger.path, "/api/v1/deploy");
    assert.equal(trigger.query, "?uuid=app-1&force=false");
    assert.equal(trigger.auth, "Bearer secret-token-123");
    assert.ok(s.coolify.requests.filter((r) => r.path === "/api/v1/deployments/dep-1").length >= 3);
    assert.ok(s.production.requests.length >= 2);
    assert.ok(!s.logs.join("\n").includes("secret-token-123"), "token must never be logged");
  } finally {
    await s.close();
  }
});

test("fails when the deployment fails", async () => {
  const s = await setup({ statuses: ["in_progress", "failed"] });
  try {
    await assert.rejects(
      deploy(s.options),
      (e) => e instanceof DeployError && /failed/.test(e.message) && /dep-1/.test(e.message),
    );
  } finally {
    await s.close();
  }
});

test("fails when the deployment is cancelled", async () => {
  const s = await setup({ statuses: ["cancelled-by-user"] });
  try {
    await assert.rejects(deploy(s.options), /cancelled/);
  } finally {
    await s.close();
  }
});

test("times out naming the last status when the deployment never finishes", async () => {
  const s = await setup({ statuses: ["mystery-status"] });
  try {
    await assert.rejects(
      deploy(s.options),
      (e) => /timed out/i.test(e.message) && /mystery-status/.test(e.message),
    );
  } finally {
    await s.close();
  }
});

test("explains a rejected token", async () => {
  const s = await setup({ deployResponse: { status: 401, body: { message: "Unauthenticated." } } });
  try {
    await assert.rejects(deploy(s.options), /COOLIFY_TOKEN/);
  } finally {
    await s.close();
  }
});

test("explains an unknown app", async () => {
  const s = await setup({ deployResponse: { status: 404, body: { message: "Not found." } } });
  try {
    await assert.rejects(deploy(s.options), /COOLIFY_APP_UUID/);
  } finally {
    await s.close();
  }
});

test("rejects an unexpected deploy response", async () => {
  const s = await setup({ deployResponse: { status: 200, body: { deployments: [] } } });
  try {
    await assert.rejects(deploy(s.options), /unexpected/i);
  } finally {
    await s.close();
  }
});

test("fails when health never comes back ok, naming the last result", async () => {
  const s = await setup({ health: [{ status: 503, body: { status: "unhealthy" } }] });
  try {
    await assert.rejects(
      deploy(s.options),
      (e) => /health/i.test(e.message) && /503/.test(e.message),
    );
  } finally {
    await s.close();
  }
});

test("does not treat a 200 non-JSON page as healthy", async () => {
  const s = await setup({ health: [{ status: 200, body: "<html>Maintenance</html>" }] });
  try {
    await assert.rejects(deploy(s.options), /health/i);
  } finally {
    await s.close();
  }
});

test("keeps polling health when the site is unreachable, then fails clearly", async () => {
  const s = await setup({});
  await s.production.close(); // nothing listening any more
  try {
    await assert.rejects(deploy(s.options), /health/i);
  } finally {
    await s.coolify.close();
  }
});

test("accepts URLs with a trailing slash", async () => {
  const s = await setup({});
  try {
    await deploy({
      ...s.options,
      coolifyUrl: `${s.coolify.url}/`,
      productionUrl: `${s.production.url}/`,
    });
    assert.equal(s.coolify.requests[0].path, "/api/v1/deploy");
    assert.equal(s.production.requests[0].path, "/api/health");
  } finally {
    await s.close();
  }
});

test("names missing settings instead of calling undefined URLs", async () => {
  await assert.rejects(
    deploy({ coolifyUrl: "", token: "", appUuid: "", productionUrl: "", log: () => {}, ...FAST }),
    (e) =>
      e instanceof DeployError && /COOLIFY_URL/.test(e.message) && /PRODUCTION_URL/.test(e.message),
  );
});

test("explains a refused deploy, including the API switch", async () => {
  const s = await setup({ deployResponse: { status: 403, body: { message: "Forbidden." } } });
  try {
    await assert.rejects(
      deploy(s.options),
      (e) => /deploy permission/.test(e.message) && /API/.test(e.message),
    );
  } finally {
    await s.close();
  }
});

test("ignores whitespace pasted around the token", async () => {
  const s = await setup({});
  try {
    await deploy({ ...s.options, token: " secret-token-123\n" });
    assert.equal(s.coolify.requests[0].auth, "Bearer secret-token-123");
  } finally {
    await s.close();
  }
});

test("passes on Coolify's reason for refusing", async () => {
  const s = await setup({
    deployResponse: { status: 403, body: { message: "You are not allowed to access the API." } },
  });
  try {
    await assert.rejects(
      deploy(s.options),
      (e) =>
        /HTTP 403/.test(e.message) && /You are not allowed to access the API\./.test(e.message),
    );
  } finally {
    await s.close();
  }
});

test("shows the start of a non-JSON refusal, e.g. from a proxy in front of Coolify", async () => {
  const s = await setup({
    deployResponse: {
      status: 403,
      body: "<html><title>Attention Required! | Cloudflare</title></html>",
    },
  });
  try {
    await assert.rejects(
      deploy(s.options),
      (e) => /HTTP 403/.test(e.message) && /Attention Required! \| Cloudflare/.test(e.message),
    );
  } finally {
    await s.close();
  }
});

test("explains that polling needs read permission", async () => {
  const s = await setup({ statusReplies: [{ status: 403, body: { message: "Forbidden." } }] });
  try {
    await assert.rejects(
      deploy(s.options),
      (e) => /read permission/.test(e.message) && /COOLIFY_TOKEN/.test(e.message),
    );
  } finally {
    await s.close();
  }
});

test("rides out a transient error while polling the deployment", async () => {
  const s = await setup({
    statusReplies: [
      { status: 502, body: "<html>Bad gateway</html>" },
      { status: 200, body: "not json" },
      { body: { status: "finished" } },
    ],
  });
  try {
    await deploy(s.options);
  } finally {
    await s.close();
  }
});

test("gives up after repeated transient errors while polling", async () => {
  const s = await setup({ statusReplies: [{ status: 503, body: "<html>Unavailable</html>" }] });
  try {
    await assert.rejects(
      deploy(s.options),
      (e) => /kept failing/i.test(e.message) && /503/.test(e.message),
    );
  } finally {
    await s.close();
  }
});

test("does not hang on a request that never answers", async () => {
  const s = await setup({ statusReplies: ["hang"] });
  const started = Date.now();
  try {
    await assert.rejects(deploy({ ...s.options, requestTimeoutMs: 30 }), DeployError);
    assert.ok(Date.now() - started < 3000, "should give up within the deadlines");
  } finally {
    await s.close();
  }
});

test("warns when Coolify built a different commit than the one checked", async () => {
  const s = await setup({
    statusReplies: [{ body: { status: "finished", commit: "b".repeat(40) } }],
  });
  try {
    await deploy({ ...s.options, expectedCommit: "a".repeat(40) });
    const warning = s.logs.find((line) => line.startsWith("::warning::"));
    assert.ok(warning, "expected a ::warning:: line");
    assert.match(warning, /bbbbbbb/);
    assert.match(warning, /aaaaaaa/);
  } finally {
    await s.close();
  }
});

test("does not warn when Coolify built the checked commit", async () => {
  const sha = "c".repeat(40);
  const s = await setup({ statusReplies: [{ body: { status: "finished", commit: sha } }] });
  try {
    await deploy({ ...s.options, expectedCommit: sha });
    assert.ok(!s.logs.some((line) => line.startsWith("::warning::")));
  } finally {
    await s.close();
  }
});
