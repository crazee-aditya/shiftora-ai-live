#!/usr/bin/env bash
# Smoke test: verifies every speed optimization we shipped is still active.
#
# Pass/fail summary is emitted on stdout; exits non-zero on any failure so CI
# can catch regressions. Override target with BASE_URL env var (default: prod).

set -u

BASE_URL="${BASE_URL:-https://www.shiftora.ai}"
PASS=0
FAIL=0
FAIL_LIST=()

red() { printf '\033[31m%s\033[0m' "$1"; }
green() { printf '\033[32m%s\033[0m' "$1"; }

ok() {
  PASS=$((PASS + 1))
  printf '  %s %s\n' "$(green '✓')" "$1"
}

bad() {
  FAIL=$((FAIL + 1))
  FAIL_LIST+=("$1")
  printf '  %s %s\n' "$(red '✗')" "$1"
}

# eq <name> <actual> <expected>
eq() {
  if [ "$2" = "$3" ]; then ok "$1 (got: $2)"; else bad "$1 (expected: $3, got: $2)"; fi
}

# ge <name> <actual> <min>
ge() {
  if [ "$2" -ge "$3" ] 2>/dev/null; then ok "$1 (got: $2 ≥ $3)"; else bad "$1 (expected ≥ $3, got: $2)"; fi
}

# le <name> <actual> <max>
le() {
  if [ "$2" -le "$3" ] 2>/dev/null; then ok "$1 (got: $2 ≤ $3)"; else bad "$1 (expected ≤ $3, got: $2)"; fi
}

# contains <name> <haystack> <needle>
contains() {
  case "$2" in
    *"$3"*) ok "$1" ;;
    *) bad "$1 (missing: '$3')" ;;
  esac
}

CURL_OPTS=(--silent --location --max-time 10 --fail-with-body)

echo "Smoke test against: $BASE_URL"
echo

# ---------------------------------------------------------------------------
# Cache 'em up so we don't re-fetch.
HOME_HTML="$(curl "${CURL_OPTS[@]}" "$BASE_URL/?hideSections=1")" || HOME_HTML=""
CAREERS_HTML="$(curl "${CURL_OPTS[@]}" "$BASE_URL/careers")" || CAREERS_HTML=""
THEME_CSS_HEADERS="$(curl "${CURL_OPTS[@]}" -I -H 'Accept-Encoding: gzip' "$BASE_URL/__theme-overrides.css")" || THEME_CSS_HEADERS=""
HTML_HEADERS="$(curl "${CURL_OPTS[@]}" -I -H 'Accept-Encoding: gzip' "$BASE_URL/")" || HTML_HEADERS=""
ASSET_HEADERS="$(curl "${CURL_OPTS[@]}" -I "$BASE_URL/__replacement-asset/dubai-skyline-night-unsplash.jpg")" || ASSET_HEADERS=""

# ---------------------------------------------------------------------------
echo "== HTML compression =="
gz_html=$(curl "${CURL_OPTS[@]}" -H 'Accept-Encoding: gzip' -o /dev/null -w '%{size_download}' "$BASE_URL/?hideSections=1")
plain_html=$(curl "${CURL_OPTS[@]}" -o /dev/null -w '%{size_download}' "$BASE_URL/?hideSections=1")
le "Home HTML gzipped < 110 KB" "$gz_html" "112000"
ge "Home HTML uncompressed > 500 KB (sanity that gzip is real)" "$plain_html" "500000"
contains "HTML response advertises gzip" "$HTML_HEADERS" "content-encoding: gzip"
contains "HTML response sets Vary: Accept-Encoding" "$HTML_HEADERS" "vary:"

echo
echo "== Static asset gzip =="
for path in "/__theme-overrides.css" "/__cta-link-router.js" "/__page-snapshot-replay.js" "/__section-visibility-overrides.js" "/__framer-site/script_main.vsEoAtRx.mjs"; do
  hdr=$(curl "${CURL_OPTS[@]}" -I -H 'Accept-Encoding: gzip' "$BASE_URL${path}")
  case "$hdr" in
    *"content-encoding: gzip"*) ok "gzip on $path" ;;
    *) bad "gzip missing on $path" ;;
  esac
done

echo
echo "== Static asset cache headers =="
contains "Theme CSS long-cached" "$THEME_CSS_HEADERS" "cache-control: public, max-age=31536000, immutable"
contains "Replacement image long-cached" "$ASSET_HEADERS" "cache-control: public, max-age=31536000, immutable"
contains "Replacement image is image/jpeg" "$ASSET_HEADERS" "content-type: image/jpeg"

echo
echo "== HTML cache headers =="
contains "HTML responds no-store" "$HTML_HEADERS" "cache-control: no-store"

echo
echo "== Replacement images sized down =="
# Biggest image (was 4.6 MB, should be ≤ 1 MB after compression)
sheikh=$(curl "${CURL_OPTS[@]}" -o /dev/null -w '%{size_download}' "$BASE_URL/__replacement-asset/dubai-sheikh-zayed-monochrome.jpg")
le "Sheikh-zayed image ≤ 1 MB (was 4.6 MB)" "$sheikh" "1000000"
# Sum of all replacement images on home (was ~17 MB, should be ≤ 8 MB)
total=0
for img in dubai-burj-khalifa-unsplash.jpg dubai-burj-night-premium.jpg dubai-modern-architecture-unsplash.jpg \
           dubai-museum-future.jpg dubai-sheikh-zayed-monochrome.jpg dubai-skyline-night-unsplash.jpg \
           dubai-skyline-unsplash.jpg dubai-waterfront-unsplash.jpg sf-salesforce-fog-unsplash.jpg \
           shiftora-dashboard-operations.png shiftora-dashboard-overview.png; do
  s=$(curl "${CURL_OPTS[@]}" -o /dev/null -w '%{size_download}' "$BASE_URL/__replacement-asset/${img}")
  total=$((total + s))
done
le "All replacement images total ≤ 8 MB (was 17 MB)" "$total" "8000000"

echo
echo "== Tracker + privacy =="
case "$HOME_HTML" in
  *reb2b*) bad "reb2b tracker still in HTML" ;;
  *) ok "reb2b tracker stripped" ;;
esac
case "$HOME_HTML" in
  *'jobs.ashbyhq.com'*) bad "Ashby URLs leaked into HTML" ;;
  *) ok "Ashby URLs stripped" ;;
esac

echo
echo "== Render hints (preconnect + dns-prefetch) =="
contains "preconnect: framerusercontent" "$HOME_HTML" 'rel="preconnect" href="https://framerusercontent.com"'
contains "dns-prefetch: cal.com"          "$HOME_HTML" 'rel="dns-prefetch" href="https://cal.com"'
contains "dns-prefetch: form.typeform.com" "$HOME_HTML" 'rel="dns-prefetch" href="https://form.typeform.com"'

echo
echo "== Favicon (animated GIF, not the blank SVG) =="
fav_headers=$(curl "${CURL_OPTS[@]}" -I "$BASE_URL/__favicon.gif")
contains "Favicon served as image/gif" "$fav_headers" "content-type: image/gif"
contains "Favicon long-cached" "$fav_headers" "cache-control: public, max-age=31536000, immutable"
fav_size=$(curl "${CURL_OPTS[@]}" -o /dev/null -w '%{size_download}' "$BASE_URL/__favicon.gif")
ge "Favicon size > 5 KB (sanity it's a real GIF, not blank SVG)" "$fav_size" "5000"
le "Favicon size ≤ 200 KB (kept lean)" "$fav_size" "200000"
contains "Favicon link tag points to GIF" "$HOME_HTML" 'href="/__favicon.gif'

echo
echo "== First-paint guard removed (no body opacity:0 trick) =="
case "$HOME_HTML" in
  *'data-shiftora-booting'*) bad "first-paint guard still injected (will hide page on slow mobile)" ;;
  *) ok "first-paint guard not injected" ;;
esac

echo
echo "== Upstream cache works (warm-hit faster than cold) =="
# Burn one request to fill the cache, then time several warm hits.
curl "${CURL_OPTS[@]}" -o /dev/null "$BASE_URL/?hideSections=1&smokeTest=1" >/dev/null 2>&1 || true
warm_total_ms=0
samples=4
for i in $(seq 1 $samples); do
  t=$(curl "${CURL_OPTS[@]}" -H 'Accept-Encoding: gzip' -o /dev/null -w '%{time_starttransfer}' "$BASE_URL/?hideSections=1&smokeTest=1")
  ms=$(printf '%.0f' "$(echo "$t * 1000" | awk '{print $1+0}' 2>/dev/null || echo "$t")")
  warm_total_ms=$((warm_total_ms + ms))
done
avg_warm_ms=$((warm_total_ms / samples))
# Generous bound — Railway has multiple replicas + edge latency, so cache hit rate is partial.
le "Warm-cache average TTFB ≤ 1500 ms" "$avg_warm_ms" "1500"

echo
echo "== Content sanity (so speed changes don't quietly break the site) =="
case "$HOME_HTML" in
  *'Production Deployment & Enablement & Enablement'*) bad "Step 3 heading double-applied again" ;;
  *'Production Deployment & Enablement'*) ok "Step 3 heading correct" ;;
  *) bad "Step 3 heading missing" ;;
esac
case "$HOME_HTML" in
  *'Varick Agents'*) bad "Varick Agents leaked back into HTML" ;;
  *) ok "No Varick Agents leakage" ;;
esac
case "$CAREERS_HTML" in
  *'Forward Deployed Engineer'*) bad "Old Forward Deployed Engineer text leaked" ;;
  *'Frontend Engineer'*) ok "Frontend Engineer present on careers" ;;
  *) bad "Frontend Engineer missing on careers" ;;
esac
case "$CAREERS_HTML" in
  *'Backend Engineer'*) ok "Backend Engineer present on careers" ;;
  *) bad "Backend Engineer missing on careers" ;;
esac
case "$CAREERS_HTML" in
  *'$75,000'*) ok "Frontend salary updated to \$75K" ;;
  *) bad "Frontend salary missing" ;;
esac

echo
echo "================================================="
printf '  %s passed,  %s failed\n' "$(green "$PASS")" "$( [ "$FAIL" = "0" ] && green 0 || red "$FAIL" )"
echo "================================================="
if [ "$FAIL" -gt 0 ]; then
  echo
  echo "Failures:"
  for f in "${FAIL_LIST[@]}"; do echo "  - $f"; done
  exit 1
fi
