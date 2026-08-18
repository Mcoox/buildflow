#!/usr/bin/env bash
set -euo pipefail

OUT="/workspace/public/tutorial.mp4"
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
TMPDIR=$(mktemp -d)
DURATION=6

make_slide() {
  local file="$1"
  local title="$2"
  local subtitle="$3"
  local body="$4"

  ffmpeg -y -f lavfi -i "color=c=0x1a2332:s=1280x720:d=${DURATION}" \
    -vf "\
drawtext=fontfile=${FONT}:text='LUSABUSISIWE':fontsize=48:fontcolor=0xe67e22:x=(w-text_w)/2:y=120,\
drawtext=fontfile=${FONT}:text='${title}':fontsize=56:fontcolor=white:x=(w-text_w)/2:y=280,\
drawtext=fontfile=${FONT_REG}:text='${subtitle}':fontsize=32:fontcolor=0x94a3b8:x=(w-text_w)/2:y=370,\
drawtext=fontfile=${FONT_REG}:text='${body}':fontsize=24:fontcolor=0x64748b:x=(w-text_w)/2:y=450" \
    -c:v libx264 -pix_fmt yuv420p -r 30 "$file" 2>/dev/null
}

make_slide "$TMPDIR/01.mp4" "BuildFlow Tutorial" "Construction Management Platform" "South African Rands (ZAR)"
make_slide "$TMPDIR/02.mp4" "Dashboard" "Business Overview" "Revenue  projects  customers  alerts"
make_slide "$TMPDIR/03.mp4" "Customers" "Client Management" "Add  edit  search  track leads"
make_slide "$TMPDIR/04.mp4" "Quotes" "Estimates and Proposals" "Line items  status workflow  totals in Rands"
make_slide "$TMPDIR/05.mp4" "Invoices" "Billing and Payments" "Track payments  mark paid  overdue alerts"
make_slide "$TMPDIR/06.mp4" "Projects" "Job Management" "Tasks  teams  budgets  progress tracking"
make_slide "$TMPDIR/07.mp4" "HR" "Human Resources" "Employees  certifications  time-off requests"
make_slide "$TMPDIR/08.mp4" "Get Started" "Download this tutorial anytime" "Tutorial page in the sidebar"

# Concat
LIST="$TMPDIR/list.txt"
for f in "$TMPDIR"/*.mp4; do
  echo "file '$f'" >> "$LIST"
done

ffmpeg -y -f concat -safe 0 -i "$LIST" -c copy "$OUT" 2>/dev/null

rm -rf "$TMPDIR"
echo "Created $OUT ($(du -h "$OUT" | cut -f1))"
