# Deploy Notes

## CI/CD pipeline

Every push and pull request runs the **Pipeline** workflow (GitHub → Actions):

1. **Kotlin tests, deploy script tests** — builds the Dockerfile's `test` stage, which runs the Kotlin tests in headless Chromium, then runs the deploy script's own tests on Node 22.
2. **Docker image builds and serves the site** — builds the production image and runs `.github/scripts/smoke-test.sh` against it: the health route, the page, unknown paths, `portfolio.js`, the `Cache-Control` header and the Prometheus metrics.
3. **Deploy to production** — pushes to `main` only, after 1 and 2 pass: asks Coolify to deploy, waits for it to finish, then checks `/api/health`. Coolify always builds the newest commit on `main`, so if you pushed again while checks were running, this run skips its deploy and the newer push deploys after its own checks.
4. **Release** — after this run deployed, creates `v<version>` from `version` in `build.gradle.kts` if that release doesn't exist yet, with notes from the commit messages since the last release.

On Dependabot pull requests, a **Merge Dependabot update** job runs after 1 and 2 pass instead: it squash-merges minor and patch updates, then starts the pipeline on `main`, which checks and deploys it. Major updates are left for you to review.

All jobs, pull requests included, run on the self-hosted runner: the one whose label is in the `CI_RUNNER` repository variable (e.g. `coolify`), or any runner labelled `self-hosted` if it's unset. It needs Docker with buildx, `git` and the `gh` CLI. It does not need Java or Chrome: the tests run inside Docker. If jobs sit at "Queued", the runner is offline or its label doesn't match.

To run the same checks locally: `docker build --target test .`, then `docker build -t portfolio . && sh .github/scripts/smoke-test.sh portfolio` (in Git Bash, prefix the second command with `MSYS_NO_PATHCONV=1`).

## Coolify

- Build pack **Dockerfile**, Ports Exposes **80**.
- **Auto Deploy must stay off** — the pipeline triggers deploys after the checks pass.
- The image has a Docker `HEALTHCHECK` on `/api/health`, so Coolify only switches traffic to a new container once it answers.

Manual deploy of the current `main`: Actions → Pipeline → **Run workflow**. Emergency: Coolify's **Redeploy** button still works without GitHub.

Repository settings → Secrets and variables → Actions:

- Secret `COOLIFY_URL` — Coolify's address, e.g. `https://coolify.example.com`
- Secret `COOLIFY_TOKEN` — Coolify → Keys & Tokens → API tokens, with **read** and **deploy** permissions (the API must also be enabled in Coolify → Settings)
- Secret `COOLIFY_APP_UUID` — the app's ID: the `uuid=` value in its Webhooks → Deploy Webhook URL
- Variable `PRODUCTION_URL` — the site's address, e.g. `https://olivershooter.com`
- Variable `CI_RUNNER` — optional, the self-hosted runner's label

Repository settings → Code security → enable **Dependabot security updates**. Dependabot also opens a weekly grouped pull request for minor/patch Gradle updates, which merges and deploys itself once its checks pass; GitHub Actions and the Docker base images are checked monthly.

## Monitoring

### Umami events

The page loads Umami from `umami.olivershooter.com`. On top of page views it sends:

| Event | Data | When |
| --- | --- | --- |
| `project-link` | `project` (e.g. `Screendle`), `kind` (`Live`, `AppStore`, `PlayStore`, `GitHub`) | A visitor clicks a project's link |
| `contact` | `method` (`email`, `github`, `linkedin`) | A visitor clicks a contact link |
| `web-vital` | `metric` (`LCP`, `CLS`, `INP`), `value`, `rating` (`good`, `needs-improvement`, `poor`) | Once per metric per visit: the page's real load time (ms), layout shift (no unit) and responsiveness (ms) |

See them in Umami → Events, and filter `web-vital` by `metric` to read each one. Visitors who block Umami send nothing.

### Prometheus

Caddy serves Prometheus metrics (request counts, status codes, durations) on port **9180** inside the container, at `/metrics`. Coolify doesn't route that port to the internet. To scrape it, put Prometheus on the same Docker network as the app (Coolify → the app → **Connect to Predefined Network**) and add a scrape target for the app's container on port 9180, e.g.:

```yaml
scrape_configs:
  - job_name: portfolio
    static_configs:
      - targets: ['<the app container name>:9180']
```

Useful series: `caddy_http_requests_total`, `caddy_http_request_duration_seconds`, `caddy_http_response_size_bytes`. The health check calls `/api/health` every 30 seconds, so expect those requests in the counts.
