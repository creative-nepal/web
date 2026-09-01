#!/usr/bin/env bash
# Shared-UI sync. This repo and creative-nepal-admin each keep their own copy
# of the design system; these paths must stay byte-identical between them.
#
#   ./scripts/sync-ui.sh diff [peer]   show drift (default; exit 1 if any)
#   ./scripts/sync-ui.sh pull [peer]   overwrite this repo's copy from the peer
#   ./scripts/sync-ui.sh push [peer]   overwrite the peer's copy from this repo
#
# peer defaults to ../admin

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODE="${1:-diff}"
PEER="${2:-$HERE/../admin}"

if [ ! -d "$PEER/src" ]; then
  echo "peer repo not found: $PEER" >&2
  exit 2
fi

PATHS=(
  src/components/ui
  src/components/form
  src/components/composed
  src/hooks
  src/lib/utils.ts
  src/lib/formatters
  src/lib/api-client
  src/styles/globals.css
)

case "$MODE" in
  diff)
    status=0
    for p in "${PATHS[@]}"; do
      if diff -rq "$HERE/$p" "$PEER/$p" >/dev/null 2>&1; then
        printf '  ok    %s\n' "$p"
      else
        printf '  DRIFT %s\n' "$p"
        diff -rq "$HERE/$p" "$PEER/$p" 2>&1 | sed 's/^/        /'
        status=1
      fi
    done
    exit $status
    ;;
  pull) SRC="$PEER"; DST="$HERE" ;;
  push) SRC="$HERE"; DST="$PEER" ;;
  *) echo "usage: $0 [diff|pull|push] [peer-repo-path]" >&2; exit 2 ;;
esac

for p in "${PATHS[@]}"; do
  rm -rf "${DST:?}/$p"
  mkdir -p "$(dirname "$DST/$p")"
  cp -r "$SRC/$p" "$DST/$p"
  printf '  synced %s\n' "$p"
done
echo "done: $SRC -> $DST"
