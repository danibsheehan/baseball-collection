#!/usr/bin/env bash
# afterFileEdit: format the edited file with Prettier (fail open).
set -u

input="$(cat)"
raw_path="$(
  printf '%s' "$input" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("file_path") or "")'
)"

[[ -n "$raw_path" ]] || exit 0

root="$(cd "$(dirname "$0")/../.." && pwd)"

# Cursor may send absolute paths or workspace-relative paths.
if [[ "$raw_path" = /* ]]; then
  file_path="$raw_path"
else
  file_path="$root/$raw_path"
fi

[[ -f "$file_path" ]] || exit 0

prettier_bin="$root/node_modules/.bin/prettier"
config="$root/prettier.config.mjs"
ignore="$root/.prettierignore"

# Use the repo-pinned Prettier (same as npm run format:check), not a floating npx download.
if [[ ! -x "$prettier_bin" ]]; then
  echo "prettier-format hook: node_modules/.bin/prettier missing; run npm install" >&2
  exit 0
fi

# --ignore-unknown skips files Prettier has no parser for instead of erroring; --ignore-path
# keeps this in sync with .prettierignore (dist, coverage, public/lottie, etc.) with no separate
# list to maintain here.
"$prettier_bin" --write --ignore-unknown --config "$config" --ignore-path "$ignore" -- "$file_path" >/dev/null 2>&1 || true
exit 0
