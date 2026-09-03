// academy/tests/run-all.mjs
import { spawnSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path';
const dir = new URL('.', import.meta.url).pathname;
let bad = 0;
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.mjs') && !f.startsWith('_') && f !== 'run-all.mjs').sort()) {
  const r = spawnSync('node', [path.join(dir, f)], { stdio: 'inherit' });
  if (r.status !== 0) bad++;
}
console.log(bad ? `\n${bad} test file(s) failed` : '\nall checks passed'); process.exit(bad ? 1 : 0);
