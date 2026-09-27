#!/usr/bin/env bash
set -euo pipefail

echo "Initialising A-Level Physics modules and course tools..."
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

if [[ ! -f "tools/practicals/index.html" ]]; then
  echo "Missing bundled A-Level practical app: tools/practicals/index.html" >&2
  exit 1
fi

echo "Applying verified integration compatibility fixes..."
python3 scripts/apply-integration-fixes.py

echo "Applying focused unified visual system to all topic apps..."
python3 scripts/apply-unified-topic-theme.py

for file in "${required[@]}"; do
  dir="$(dirname "$file")"
  for asset in unified-course-theme.css unified-course-focus.css unified-course-embedded.js; do
    if [[ ! -f "$dir/$asset" ]]; then
      echo "Missing unified topic asset: $dir/$asset" >&2
      exit 1
    fi
  done
  if ! grep -q "unified-course-topic-theme" "$file"; then
    echo "Unified topic UI was not injected into: $file" >&2
    exit 1
  fi
done

materials_dir="topics/04-mechanics-materials/materials"
if [[ ! -f "$materials_dir/vendor/three.module.min.js" || ! -f "$materials_dir/vendor/xlsx.full.min.js" || ! -f "$materials_dir/vendor/three.core.js" ]]; then
  echo "Generating Materials local vendor assets for embedded deployment..."
  npm install --prefix "$materials_dir" --ignore-scripts --no-audit --no-fund
  npm --prefix "$materials_dir" run vendor
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

node --check app.js
node --check student-notebook.js
node --check ai-coach.js
node --check course-tools.js
node --check mobile-mode.js
node --check api/physics-coach.js
node --check shared/unified-topic-embedded.js

for file in student-notebook.js student-notebook.css course-tools.js course-tools.css mobile-mode.js mobile-mode.css; do
  if [[ ! -f "$file" ]]; then
    echo "Missing course-wide shell asset: $file" >&2
    exit 1
  fi
done

rm -rf dist
mkdir -p dist/tools
cp index.html app.js student-notebook.js ai-coach.js course-tools.js mobile-mode.js styles.css course-enhancements.css focus-layout.css student-notebook.css course-tools.css mobile-mode.css manifest.webmanifest .nojekyll dist/
cp -R topics dist/topics
cp -R tools/practicals dist/tools/practicals

find dist/topics -name .git -exec rm -rf {} + 2>/dev/null || true
find dist/topics -type d -name node_modules -prune -exec rm -rf {} + 2>/dev/null || true
find dist/tools -name .git -exec rm -rf {} + 2>/dev/null || true
find dist/tools -type d -name node_modules -prune -exec rm -rf {} + 2>/dev/null || true

echo "Unified A-Level Physics course assembled in dist/ with Practical Lab and Marking launcher."
