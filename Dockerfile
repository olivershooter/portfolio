# Build: Kotlin/JS only needs a JDK; Gradle fetches Node and the npm packages itself.
# Ubuntu-based rather than Alpine, because the Node that Gradle downloads needs glibc.
FROM eclipse-temurin:21-jdk-noble AS build
WORKDIR /app
COPY gradlew settings.gradle.kts build.gradle.kts ./
COPY gradle gradle
COPY kotlin-js-store kotlin-js-store
COPY src src
RUN chmod +x gradlew && ./gradlew --no-daemon jsBrowserDistribution

# Serve: the built site is plain static files
FROM caddy:2.10-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/build/dist/js/productionExecutable /srv
EXPOSE 80
