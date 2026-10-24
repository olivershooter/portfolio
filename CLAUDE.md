# Portfolio

Oliver Shooter's one-page portfolio: Kotlin/JS with Compose HTML, served as static files by Caddy, deployed on Coolify by the GitHub Actions pipeline. Deployment, secrets and monitoring are in `deploy.md`.

## Releases: bump the version

Every change that reaches visitors gets a new `version` in `build.gradle.kts`, in the same commit or pull request. After the pipeline deploys `main`, it creates the GitHub release `v<version>` if that release doesn't exist yet, so without a bump the change ships with no release.

- **Patch** (1.0.0 → 1.0.1): fixes, copy and content edits, dependency updates.
- **Minor** (1.0.1 → 1.1.0): a new section, link, page feature or tracked event.
- **Major** (1.1.0 → 2.0.0): a redesign, or a change of framework or hosting.

Changes visitors never see (tests, CI, docs, refactors with the same output) don't need a bump. Dependabot's merges don't bump; the next real release picks them up in its notes.

Write commit subjects as `feat: …`, `fix: …`, `build: …`, `ci: …`: the release notes group `feat` and `fix` commits by those prefixes.

## Where things are

- Page: `src/jsMain/kotlin/portfolio/Home.kt`; styles: `src/jsMain/resources/styles.css`
- Content to edit: `src/jsMain/kotlin/portfolio/content/*.kt`
- Umami events and Web Vitals: `Analytics.kt`, `WebVitals.kt`; click events are `data-umami-event` attributes in `Home.kt`
- Tests: `src/jsTest/kotlin/portfolio/`

## Commands

Needs JDK 21 (`JAVA_HOME`).

- `./gradlew jsBrowserDevelopmentRun --continuous` — dev server on http://localhost:8080
- `./gradlew jsTest` — tests in headless Chrome
- `./gradlew jsBrowserDistribution` — production build in `build/dist/js/productionExecutable`
- `docker build --target test .` — the tests exactly as CI runs them

Don't run the production build while the dev server is running: they share `build/js`, and the production bundle picks up the unoptimised development code. After adding an npm dependency, run `./gradlew kotlinUpgradeYarnLock` and commit `kotlin-js-store/yarn.lock`.
