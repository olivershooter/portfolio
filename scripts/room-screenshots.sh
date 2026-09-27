#!/usr/bin/env bash
# Usage: scripts/room-screenshots.sh [base-url]
# Needs `npm run build && npm run preview` running (default http://localhost:4173).
# Set CHROME to your Chrome/Chromium binary if it isn't at the Windows default.
set -euo pipefail
BASE="${1:-http://localhost:4173}"
CHROME="${CHROME:-/c/Program Files/Google/Chrome/Application/chrome.exe}"
OUT="screenshots"
mkdir -p "$OUT"
# Chrome resolves relative paths against its own working directory
OUT_ABS="$(cd "$OUT" && (pwd -W 2>/dev/null || pwd))"
target() {
	case "$1" in
	__FRAME__*) echo "$BASE/__frame.html#${1#__FRAME__}" ;;
	*) echo "$BASE$1" ;;
	esac
}
# Same-origin frame (served from dist/ by `vite preview`) so headless virtual time reaches it
cat > dist/__frame.html <<'HTML'
<!doctype html><body style="margin:0;background:#111"><iframe id="f" width="390" height="844" style="border:0"></iframe><script>document.getElementById('f').src = location.hash.slice(1)</script>
HTML
shot() {
	"$CHROME" --headless=new --hide-scrollbars --window-size="$2" \
		--virtual-time-budget=4000 --screenshot="$OUT_ABS/$1.png" "$(target "$3")" >/dev/null 2>&1
	echo "$OUT/$1.png"
}
# Headless Chrome won't shrink the window below ~500px, so phones render in a 390px iframe
phone() {
	shot "$1" 520,860 "__FRAME__$2"
}
for tod in dawn day dusk night; do
	shot "desk-$tod" 1280,720 "/late-shift?tod=$tod"
	phone "phone-$tod" "/late-shift?tod=$tod"
done
shot desk-hover 1280,720 "/late-shift?tod=dusk&hover=experience"
shot desk-android 1280,720 "/late-shift/android?tod=dusk"
phone phone-android "/late-shift/android?tod=dusk"
shot desk-experience 1280,720 "/late-shift/experience?tod=night"
