// academy/tests/docs-index.mjs — assets.html is the business-docs index
import fs from 'node:fs';
import { rel, htmlIn, read, fail, isDupe } from './_util.mjs';
const SKIP = new Set(['index.html', 'assets.html', '_admin-cta.html']); // public landing, the index itself, an include snippet
const idx = read('assets.html');
const counts = {};
for (const m of idx.matchAll(/href="([^"#/:]+\.html)"/g)) counts[m[1]] = (counts[m[1]] || 0) + 1;
for (const f of fs.readdirSync(rel('.')).filter(f => f.endsWith('.html') && !isDupe(f) && !SKIP.has(f))) {
  if (!counts[f]) fail(`assets.html does not link ${f}`);
  else if (counts[f] > 1) fail(`assets.html links ${f} ${counts[f]}× (expected once)`);
}
if (!idx.includes('href="presentations/index.html"')) fail('assets.html must link presentations/index.html');
if (!read('index.html').includes('href="/assets.html"')) fail('root index.html must link /assets.html');
for (const f of [...htmlIn('.'), ...htmlIn('academy'), ...htmlIn('presentations'), ...htmlIn('blog')])
  if (read(f).includes('_retired')) fail(`${f} references _retired/`);
console.log('docs-index: all root docs linked once, no _retired refs');
