// academy/tests/image-budget.mjs — referenced lesson images: all .webp, all exist, total < 8 MB
import fs from 'node:fs'; import path from 'node:path';
import { rel, htmlIn, read, fail } from './_util.mjs';
const BUDGET = 8 * 1024 * 1024; const seen = new Set(); let total = 0;
for (const f of htmlIn('academy/courses')) {
  for (const m of read(f).matchAll(/src="(\.\.\/images\/[^"]+)"/g)) {
    const u = m[1];
    if (!u.endsWith('.webp')) fail(`${f}: non-webp image ${u}`);
    const p = path.resolve(path.dirname(rel(f)), u);
    if (!fs.existsSync(p)) { fail(`${f}: missing ${u}`); continue; }
    if (!seen.has(p)) { seen.add(p); total += fs.statSync(p).size; }
  }
}
console.log(`image-budget: ${seen.size} images, ${(total / 1024 / 1024).toFixed(2)} MB (budget 8 MB)`);
if (total > BUDGET) fail('image budget exceeded');
