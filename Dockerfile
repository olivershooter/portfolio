# Kotlin/JS only needs a JDK; Gradle fetches Node and the npm packages itself.
# Debian: its Node-compatible glibc, plus a chromium package for amd64 and arm64 runners alike.
FROM debian:13-slim AS deps
RUN apt-get update && apt-get install -y --no-install-recommends openjdk-21-jdk-headless \
	&& rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY gradlew settings.gradle.kts build.gradle.kts ./
COPY gradle gradle
COPY kotlin-js-store kotlin-js-store
# Download Gradle, Kotlin and the npm packages in their own layer, so content edits reuse it
RUN chmod +x gradlew && ./gradlew --no-daemon kotlinNpmInstall

# Tests: the pipeline runs `docker build --target test .`; Coolify's default build skips this stage
FROM deps AS test
RUN apt-get update && apt-get install -y --no-install-recommends chromium \
	&& rm -rf /var/lib/apt/lists/*
ENV CHROME_BIN=/usr/bin/chromium
COPY src src
RUN ./gradlew --no-daemon jsTest

FROM deps AS build
COPY src src
RUN ./gradlew --no-daemon jsBrowserDistribution

# Serve: the built site is plain static files
FROM caddy:2.10-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/build/dist/js/productionExecutable /srv
EXPOSE 80
# Coolify waits for this before switching traffic to a new container
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s CMD wget -qO- http://127.0.0.1/api/health || exit 1
