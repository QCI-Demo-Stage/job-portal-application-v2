#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
if command -v spectral >/dev/null 2>&1; then
  exec spectral lint openapi.json --ruleset spectral.yaml
fi
echo "Spectral CLI not found. Install it globally:" >&2
echo "  npm i -g @stoplight/spectral-cli" >&2
exit 1
