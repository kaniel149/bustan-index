// academy/tests/docs-index.mjs — catalog.json (home-page catalog) must list every content file exactly once
import fs from 'node:fs'; import path from 'node:path';
import { rel, htmlIn, read, fail, isDupe } from './_util.mjs';
const SKIP = new Set(['index.html', 'assets.html', '_admin-cta.html', 'roof-scanner.html', 'solar-atlas.html']); // home, redirect stubs, include snippet
const cat = JSON.parse(read('catalog.json'));
const counts = {};
for (const e of cat.entries) if (!e.external) counts[e.path] = (counts[e.path] || 0) + 1;
for (const f of fs.readdirSync(rel('.')).filter(f => f.endsWith('.html') && !isDupe(f) && !SKIP.has(f))) {
  if (!counts[f]) fail(`catalog.json does not list ${f}`);
  else if (counts[f] > 1) fail(`catalog.json lists ${f} ${counts[f]}× (expected once)`);
}
for (const [p, n] of Object.entries(counts)) {
  if (n > 1) fail(`catalog.json lists ${p} ${n}×`);
  if (!fs.existsSync(rel(p))) fail(`catalog.json entry missing on disk: ${p}`);
}
for (const e of cat.entries) if (e.thumb && !fs.existsSync(rel(e.thumb))) fail(`missing thumbnail ${e.thumb} (${e.path})`);
if (!counts['presentations/index.html']) fail('catalog.json must list presentations/index.html');
if (!read('index.html').includes('catalog.json')) fail('root index.html must load catalog.json');
if (!/url=\/#catalog/.test(read('assets.html'))) fail('assets.html must redirect to /#catalog');
for (const f of [...htmlIn('.'), ...htmlIn('academy'), ...htmlIn('presentations'), ...htmlIn('blog')])
  if (read(f).includes('_retired')) fail(`${f} references _retired/`);
console.log(`docs-index: ${cat.entries.length} catalog entries, all root docs listed once, no _retired refs`);
