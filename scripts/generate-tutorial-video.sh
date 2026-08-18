#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:4173}"
OUT="/workspace/public/tutorial.mp4"
WORKDIR=$(mktemp -d)
SHOTS="$WORKDIR/screenshots"
AUDIO="$WORKDIR/audio"
SEGMENTS="$WORKDIR/segments"
FONT_BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

mkdir -p "$SHOTS" "$AUDIO" "$SEGMENTS"

cleanup() { rm -rf "$WORKDIR"; }
trap cleanup EXIT

echo "==> Capturing app screenshots from $BASE_URL"

capture_page() {
  local path="$1"
  local file="$2"
  local url="${BASE_URL}${path}"
  set +e
  timeout 40 google-chrome \
    --headless=new \
    --disable-gpu \
    --no-sandbox \
    --user-data-dir="/tmp/chrome-shot-$$" \
    --hide-scrollbars \
    --window-size=1280,800 \
    --virtual-time-budget=4000 \
    --screenshot="$file" \
    "$url" >/dev/null 2>&1
  set -e
  rm -rf "/tmp/chrome-shot-$$"
  if [[ ! -s "$file" ]]; then
    echo "  ERROR: failed to capture $path" >&2
    exit 1
  fi
  echo "  captured $path"
}

capture_page "/" "$SHOTS/01-dashboard.png"
capture_page "/customers" "$SHOTS/02-customers.png"
capture_page "/quotes" "$SHOTS/03-quotes.png"
capture_page "/invoices" "$SHOTS/04-invoices.png"
capture_page "/projects" "$SHOTS/05-projects.png"
capture_page "/hr" "$SHOTS/06-hr.png"

# Title card with branding
ffmpeg -y -f lavfi -i "color=c=0x1a2332:s=1280x720:d=1" \
  -vf "drawtext=fontfile=${FONT_BOLD}:text='LUSABUSISIWE':fontsize=64:fontcolor=0xe67e22:x=(w-text_w)/2:y=260,\
drawtext=fontfile=${FONT_REG}:text='Construction Management Platform':fontsize=32:fontcolor=white:x=(w-text_w)/2:y=350,\
drawtext=fontfile=${FONT_REG}:text='User Tutorial':fontsize=28:fontcolor=0x94a3b8:x=(w-text_w)/2:y=410" \
  -frames:v 1 "$SHOTS/00-intro.png" 2>/dev/null

echo "==> Generating narration audio"

declare -a NARRATIONS=(
  "Welcome to LUSABUSISIWE BuildFlow, your construction management platform. All amounts are shown in South African Rands."
  "The Dashboard gives you a complete business overview. See active projects, revenue collected, outstanding invoices, and your team at a glance."
  "In Customers, manage your client relationships. Add new customers, search by name or company, and track leads versus active accounts."
  "Quotes lets you create detailed estimates with line items. Track each quote from draft, to sent, to accepted."
  "Invoices and Billing helps you issue invoices in Rands, track payments, mark invoices as paid, and monitor overdue accounts."
  "Projects is where you manage construction jobs. Assign teams, set budgets, track tasks, and monitor progress on every site."
  "Human Resources keeps your team organised. View employees, certifications, and approve or deny time-off requests."
  "Get started with LUSABUSISIWE BuildFlow today. Download this tutorial anytime from the Tutorial page in the sidebar."
)

SLIDES=(
  "$SHOTS/00-intro.png"
  "$SHOTS/01-dashboard.png"
  "$SHOTS/02-customers.png"
  "$SHOTS/03-quotes.png"
  "$SHOTS/04-invoices.png"
  "$SHOTS/05-projects.png"
  "$SHOTS/06-hr.png"
  "$SHOTS/00-intro.png"
)

for i in "${!NARRATIONS[@]}"; do
  espeak-ng -v en-gb -s 150 -w "$AUDIO/$(printf '%02d' $i).wav" "${NARRATIONS[$i]}"
done

echo "==> Building video segments"

for i in "${!NARRATIONS[@]}"; do
  idx=$(printf '%02d' $i)
  img="${SLIDES[$i]}"
  aud="$AUDIO/${idx}.wav"
  seg="$SEGMENTS/${idx}.mp4"

  # Scale screenshot to 1280x720 with padding
  ffmpeg -y -loop 1 -i "$img" -i "$aud" \
    -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=0x1a2332,format=yuv420p" \
    -c:v libx264 -preset medium -crf 23 -r 30 \
    -c:a aac -b:a 128k -ar 44100 -ac 2 \
    -shortest -movflags +faststart \
    "$seg" 2>/dev/null
  echo "  segment $idx done"
done

echo "==> Concatenating final video"

LIST="$WORKDIR/list.txt"
for seg in "$SEGMENTS"/*.mp4; do
  echo "file '$seg'" >> "$LIST"
done

ffmpeg -y -f concat -safe 0 -i "$LIST" \
  -c:v libx264 -preset medium -crf 23 \
  -c:a aac -b:a 128k -ar 44100 -ac 2 \
  -movflags +faststart \
  -pix_fmt yuv420p \
  "$OUT" 2>/dev/null

# Generate PNG poster from first screenshot
ffmpeg -y -i "$SHOTS/00-intro.png" -vf "scale=1280:720" /workspace/public/tutorial-poster.png 2>/dev/null

echo "==> Done: $OUT"
ffprobe -v quiet -show_entries format=duration,size -show_entries stream=codec_type -of csv=p=0 "$OUT"
ls -lh "$OUT"
