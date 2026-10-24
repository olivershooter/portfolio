#!/bin/sh
# Starts the production image and checks what Caddy serves. Usage: smoke-test.sh <image>
# Requests run inside the container (its busybox wget), so no host port is needed.
set -eu
image=$1
name="portfolio-smoke-$$"

docker run -d --rm --name "$name" "$image" >/dev/null
trap 'docker stop "$name" >/dev/null' EXIT

get() { docker exec "$name" wget -qO- "http://127.0.0.1$1"; }
fail() {
	echo "::error::$1"
	exit 1
}

for _ in 1 2 3 4 5 6 7 8 9 10; do
	get /api/health >/dev/null 2>&1 && break
	sleep 1
done

[ "$(get /api/health)" = '{"status":"ok"}' ] || fail '/api/health did not answer {"status":"ok"}'
get / | grep -q 'src="/portfolio.js"' || fail "/ is not the page"
get /late-shift | grep -q 'id="root"' || fail "an unknown path did not get the page"
[ -n "$(get /portfolio.js)" ] || fail "/portfolio.js is missing or empty"
docker exec "$name" wget -qS -O /dev/null http://127.0.0.1/styles.css 2>&1 | grep -qi 'cache-control: no-cache' ||
	fail "/styles.css is missing Cache-Control: no-cache"
docker exec "$name" wget -qO- http://127.0.0.1:9180/metrics | grep -q '^caddy_http_requests_total' ||
	fail "Prometheus metrics on :9180 are missing caddy_http_requests_total"

echo "Smoke test passed"
