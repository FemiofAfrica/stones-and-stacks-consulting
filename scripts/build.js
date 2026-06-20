/**
 * Build script for Stones and Stacks website.
 * Minifies CSS via lightningcss, minifies HTML, copies assets.
 * Usage: node scripts/build.js
 */
const fs = require('fs');
const path = require('path');
const lightningcss = require('lightningcss');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

fs.mkdirSync(DIST, { recursive: true });

// ── CSS ──────────────────────────────────────────────
console.log('CSS  …');
const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8');
const result = lightningcss.transform({
  filename: 'styles.css',
  code: Buffer.from(css),
  minify: true,
  targets: {
    safari: (16 << 16) | (4 << 8),
    chrome: (110 << 16),
    firefox: (110 << 16),
  },
});
fs.writeFileSync(path.join(DIST, 'styles.css'), result.code);
const cssSaved = ((css.length - result.code.length) / css.length * 100).toFixed(0);
console.log(`  → dist/styles.css  (${(result.code.length / 1024).toFixed(1)} KB, -${cssSaved}%)`);

// ── HTML ─────────────────────────────────────────────
console.log('HTML …');
let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
html = html.replace(/<!--[\s\S]*?-->/g, '');
html = html.replace(/>\s{2,}</g, '> <');
html = html.replace(/\n\s{2,}/g, '\n');
html = html.replace(/\n{3,}/g, '\n');
html = html.split('\n').map(l => l.trim()).join('\n');
fs.writeFileSync(path.join(DIST, 'index.html'), html);
const htmlSaved = ((fs.statSync(path.join(ROOT, 'index.html')).size - Buffer.byteLength(html)) / fs.statSync(path.join(ROOT, 'index.html')).size * 100).toFixed(0);
console.log(`  → dist/index.html  (${(Buffer.byteLength(html) / 1024).toFixed(1)} KB, -${htmlSaved}%)`);

// ── JS ───────────────────────────────────────────────
console.log('JS   …');
fs.cpSync(path.join(ROOT, 'script.js'), path.join(DIST, 'script.js'));
console.log(`  → dist/script.js   (${(fs.statSync(path.join(DIST, 'script.js')).size / 1024).toFixed(1)} KB)`);

// ── Assets ────────────────────────────────────────────
console.log('Assets …');
for (const file of ['hero-bg.jpg', 'hero-bg.webp']) {
  const src = path.join(ROOT, file);
  if (fs.existsSync(src)) {
    fs.cpSync(src, path.join(DIST, file));
    console.log(`  → dist/${file}`);
  }
}

console.log('\n✓ Build complete');
