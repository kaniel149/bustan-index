// academy/tests/_util.mjs
import fs from 'node:fs'; import path from 'node:path';
export const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '../..');
export const rel = (...p) => path.join(ROOT, ...p);
export const isDupe = (f) => / [23]\./.test(f);
export const htmlIn = (dir) => fs.readdirSync(rel(dir)).filter(f => f.endsWith('.html') && !isDupe(f)).map(f => path.join(dir, f));
export const read = (p) => fs.readFileSync(rel(p), 'utf8');
export const LESSON_RE = /^(solar-fundamentals|sales-bd|technical|ev-storage|management)-(\d{2})\.html$/;
export function localRefs(html) {
  const out = [];
  for (const m of html.matchAll(/(?:href|src)="([^"#?]+)/g)) {
    const u = m[1];
    if (/^(https?:|mailto:|tel:|data:|javascript:|\/\/)/.test(u) || u.includes('${')) continue;
    out.push(u);
  }
  return out;
}
export function fail(msg) { console.error('FAIL: ' + msg); process.exitCode = 1; }
