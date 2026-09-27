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

echo "Applying verified integration compatibility fixes..."
python3 scripts/apply-integration-fixes.py

echo "Applying unified visual system to all topic apps..."
python3 scripts/apply-unified-topic-theme.py

for file in "${required[@]}"; do
  theme="$(dirname "$file")/unified-course-theme.css"
  if [[ ! -f "$theme" ]]; then
    echo "Missing unified topic theme: $theme" >&2
    exit 1
  fi
  if ! grep -q "unified-course-topic-theme" "$file"; then
    echo "Unified topic theme was not injected into: $file" >&2
    exit 1
  fi
done

materials_dir="topics/04-mechanics-materials/materials"
if [[ ! -f "$materials_dir/vendor/three.module.min.js" || ! -f "$materials_dir/vendor/xlsx.full.min.js" || ! -f "$materials_dir/vendor/three.core.js" ]]; then
  echo "Generating Materials local vendor assets for embedded deployment..."
  npm install --prefix "$materials_dir" --ignore-scripts --no-audit --no-fund
  npm --prefix "$materials_dir" run vendor

  # Three.js 0.18x splits the ESM build into three.module.js + three.core.js.
  # The Materials repo's older vendor helper only copies the entry module, so
  # copy the companion module explicitly for a fully local/offline deployment.
  if [[ -f "$materials_dir/node_modules/three/build/three.core.js" ]]; then
    cp "$materials_dir/node_modules/three/build/three.core.js" "$materials_dir/vendor/three.core.js"
  fi
fi

for file in \
  "$materials_dir/three-performance-v10.js" \
  "$materials_dir/vendor/three.module.min.js" \
  "$materials_dir/vendor/three.core.js" \
  "$materials_dir/vendor/xlsx.full.min.js"; do
  if [[ ! -f "$file" ]]; then
    echo "Missing generated Materials runtime dependency: $file" >&2
    exit 1
  fi
done

# Catch shell/coach syntax regressions before packaging the static output.
node --check app.js
node --check ai-coach.js
node --check api/physics-coach.js

rm -rf dist
mkdir -p dist
cp index.html app.js ai-coach.js styles.css course-enhancements.css manifest.webmanifest .nojekyll dist/
cp -R topics dist/topics

# Submodule Git metadata and package-manager install folders are not required in the deployed static output.
find dist/topics -name .git -exec rm -rf {} + 2>/dev/null || true
find dist/topics -type d -name node_modules -prune -exec rm -rf {} + 2>/dev/null || true

echo "Unified A-Level Physics course assembled in dist/."
