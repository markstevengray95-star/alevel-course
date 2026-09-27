#!/usr/bin/env bash
set -euo pipefail

echo "Initialising A-Level Physics topic modules..."
git submodule sync --recursive
git submodule update --init --recursive

required=(
  "topics/01-measurements/index.html"
  "topics/02-particles-radiation/index.html"
  "topics/03-waves/index.html"
  "topics/04-mechanics-materials/mechanics/index.html"
  "topics/04-mechanics-materials/materials/index.html"
  "topics/05-electricity/index.html"
  "topics/06-further-mechanics-thermal/index.html"
  "topics/07-fields/index.html"
  "topics/08-nuclear/index.html"
)

for file in "${required[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "Missing required course module: $file" >&2
    exit 1
  fi
done

rm -rf dist
mkdir -p dist
cp index.html app.js styles.css manifest.webmanifest .nojekyll dist/
cp -R topics dist/topics

# Submodule Git metadata is not required in the deployed static output.
find dist/topics -name .git -exec rm -rf {} + 2>/dev/null || true

echo "Unified A-Level Physics course assembled in dist/."
