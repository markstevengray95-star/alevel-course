import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(process.argv[2] || 'dist');
const failures = [];
const warnings = [];
const stats = { files: 0, html: 0, js: 0, css: 0, refs: 0, images: 0, iframes: 0 };

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return [full];
  });
}

function rel(file) { return path.relative(root, file).replaceAll(path.sep, '/'); }
function fail(message) { failures.push(message); }
function warn(message) { warnings.push(message); }
function cleanRef(value) { return value.trim().replace(/^['"]|['"]$/g, '').split('#')[0].split('?')[0]; }
function isExternal(value) { return !value || value.startsWith('#') || /^(?:https?:|data:|blob:|mailto:|tel:|javascript:|\/\/)/i.test(value); }
function resolveLocal(fromFile, raw) {
  const value = cleanRef(raw);
  if (isExternal(value)) return null;
  return value.startsWith('/') ? path.join(root, value.replace(/^\/+/, '')) : path.resolve(path.dirname(fromFile), value);
}
function existsAsWebTarget(target) { return !target || fs.existsSync(target) || fs.existsSync(path.join(target, 'index.html')); }
function checkRef(fromFile, raw, kind) {
  const value = cleanRef(raw);
  if (isExternal(value)) return;
  stats.refs++;
  const target = resolveLocal(fromFile, value);
  if (!existsAsWebTarget(target)) fail(`${rel(fromFile)}: missing ${kind} reference '${raw}'`);
}
function markupOnly(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<!--([\s\S]*?)-->/g, '');
}

if (!fs.existsSync(root)) {
  console.error(`Audit root does not exist: ${root}`);
  process.exit(2);
}

const files = walk(root);
stats.files = files.length;

for (const file of files) {
  const ext = path.extname(file).toLowerCase();
  const text = ['.html', '.js', '.mjs', '.css', '.json', '.webmanifest'].includes(ext) ? fs.readFileSync(file, 'utf8') : null;

  if (ext === '.js' || ext === '.mjs') {
    stats.js++;
    const syntax = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    if (syntax.status !== 0) fail(`${rel(file)}: JavaScript syntax error\n${(syntax.stderr || syntax.stdout).trim()}`);
    if (/\blocalhost\b|127\.0\.0\.1/.test(text)) warn(`${rel(file)}: contains localhost reference`);
  }

  if (ext === '.html') {
    stats.html++;
    const markup = markupOnly(text);
    const ids = [...markup.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map(m => m[1]);
    const seen = new Set();
    for (const id of ids) {
      if (seen.has(id)) fail(`${rel(file)}: duplicate HTML id '${id}'`);
      seen.add(id);
    }

    for (const m of markup.matchAll(/\b(?:src|href|poster)\s*=\s*["']([^"']+)["']/gi)) checkRef(file, m[1], 'HTML');
    for (const m of markup.matchAll(/\bsrcset\s*=\s*["']([^"']+)["']/gi)) for (const item of m[1].split(',')) checkRef(file, item.trim().split(/\s+/)[0], 'srcset');

    for (const m of markup.matchAll(/<img\b[^>]*>/gi)) {
      stats.images++;
      if (!/\balt\s*=\s*["'][^"']*["']/i.test(m[0])) fail(`${rel(file)}: image missing alt attribute: ${m[0].slice(0,120)}`);
    }
    for (const m of markup.matchAll(/<iframe\b[^>]*>/gi)) {
      stats.iframes++;
      if (!/\btitle\s*=\s*["'][^"']+["']/i.test(m[0])) fail(`${rel(file)}: iframe missing accessible title.`);
    }

    if (!/<title>[\s\S]*?<\/title>/i.test(text)) warn(`${rel(file)}: missing <title>`);
    if (!/<meta[^>]+name=["']viewport["']/i.test(text)) warn(`${rel(file)}: missing viewport meta tag`);
    if (!/<html[^>]+lang=["'][^"']+["']/i.test(text)) warn(`${rel(file)}: missing html lang attribute`);
  }

  if (ext === '.css') {
    stats.css++;
    for (const m of text.matchAll(/url\(\s*([^)]+?)\s*\)/gi)) checkRef(file, m[1], 'CSS url()');
  }

  if (ext === '.webmanifest' || (ext === '.json' && /manifest/i.test(path.basename(file)))) {
    try {
      const json = JSON.parse(text);
      if (json.start_url) checkRef(file, json.start_url, 'manifest start_url');
      for (const icon of json.icons || []) if (icon.src) checkRef(file, icon.src, 'manifest icon');
    } catch (error) { fail(`${rel(file)}: invalid JSON/manifest (${error.message})`); }
  }
}

const required = [
  'index.html','app.js','styles.css','curriculum-map.js','curriculum-map.css','lesson-content.js','lesson-content.css',
  'presentation-mode.js','lesson-phase3.js','lesson-phase3.css','lesson-activities.js','lesson-activities.css',
  'lesson-simulations.js','lesson-simulations.css','lesson-assessment.js','lesson-assessment.css',
  'lesson-progression.js','lesson-progression.css','lesson-teacher-tools.js','lesson-teacher-tools.css',
  'lesson-astar.js','lesson-astar.css','quality-control.js','quality-control.css',
  'topics/01-measurements/index.html','topics/02-particles-radiation/index.html','topics/03-waves/index.html',
  'topics/04-mechanics-materials/mechanics/index.html','topics/04-mechanics-materials/materials/index.html',
  'topics/05-electricity/index.html','topics/06-further-mechanics-thermal/index.html','topics/07-fields/index.html','topics/08-nuclear/index.html',
  'tools/practicals/index.html'
];
for (const item of required) if (!fs.existsSync(path.join(root, item))) fail(`Missing required production file: ${item}`);

console.log(`Static audit: ${stats.files} files, ${stats.html} HTML, ${stats.js} JS, ${stats.css} CSS, ${stats.refs} local references, ${stats.images} images and ${stats.iframes} iframes checked.`);
if (warnings.length) {
  console.log(`Warnings (${warnings.length}):`);
  for (const item of warnings) console.log(`  WARN ${item}`);
}
if (failures.length) {
  console.error(`Failures (${failures.length}):`);
  for (const item of failures) console.error(`  FAIL ${item}`);
  process.exit(1);
}
console.log('Static audit passed with no blocking defects.');
