// academy/tests/public-tracks.mjs — team lessons noindex + gated; public lessons indexable; sitemap = public only; Course JSON-LD
import { htmlIn, read, fail, LESSON_RE } from './_util.mjs';
import path from 'node:path';
const TEAM = ['sales-bd', 'technical', 'management'];
const sitemap = read('sitemap.xml'); const hub = read('academy/index.html');
for (const f of htmlIn('academy/courses')) {
  const m = path.basename(f).match(LESSON_RE); if (!m) continue;
  const html = read(f), team = TEAM.includes(m[1]);
  const noindex = /<meta name="robots" content="noindex,nofollow">/.test(html), inMap = sitemap.includes(`/academy/${f.replace(/^academy\//, '')}`);
  if (!html.includes('../assets/gate.js')) fail(`${f}: missing gate.js`);
  if (team !== noindex) fail(`${f}: team lessons must be noindex, public lessons indexable`);
  if (team === inMap) fail(`${f}: sitemap must list public lessons only`);
}
if (!sitemap.includes('/academy/</loc>')) fail('sitemap: hub missing');
const ld = [...hub.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
const courses = ld.flatMap(d => d['@graph'] || [d]).filter(d => d['@type'] === 'Course');
if (courses.length !== 2) fail(`hub: expected 2 Course schemas, got ${courses.length}`);
for (const t of TEAM) if (!hub.includes(`data-track="${t}" data-team="1"`)) fail(`hub: ${t} card needs data-team`);
console.log('public-tracks: ok');
