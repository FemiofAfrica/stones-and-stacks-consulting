/**
 * Minimal HTML minifier — no dependencies.
 * Strips comments, collapses whitespace, removes optional quotes.
 * Usage: node scripts/minify-html.js
 */
const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '..', 'index.html');
const dest = path.resolve(__dirname, '..', 'dist', 'index.html');

let html = fs.readFileSync(src, 'utf8');

// Strip HTML comments (but not conditional comments or JSON-LD)
html = html.replace(/<!--[\s\S]*?-->/g, (m) => {
  if (m.includes('application/ld+json')) return m;
  return '';
});

// Collapse multi-line whitespace between tags
html = html.replace(/>\s{2,}</g, '> <');
html = html.replace(/\n\s{2,}/g, '\n');
html = html.replace(/\n{3,}/g, '\n\n');

// Trim each line
html = html.split('\n').map(l => l.trim()).join('\n');

// Collapse repeated blank lines
html = html.replace(/\n{3,}/g, '\n\n');

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, html, 'utf8');
console.log(`Minified: ${src} → ${dest} (${(Buffer.byteLength(html) / 1024).toFixed(1)} KB)`);
