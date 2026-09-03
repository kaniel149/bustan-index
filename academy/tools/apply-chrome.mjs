// academy/tools/apply-chrome.mjs — swap the duplicated header/footer in all 24 lessons for the shared
// site nav/footer placeholders (rendered by ../../assets/site.js). Content is untouched. Idempotent.
// Usage: node academy/tools/apply-chrome.mjs
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '..');
const DIR = path.join(ROOT, 'courses');
const NAV = '<div id="site-nav" data-page="academy"></div>';
const FOOT = '<div id="site-footer"></div>';
const SCRIPT = '<script src="../../assets/site.js" data-root="../../" defer></script>';

let changed = 0;
for (const f of fs.readdirSync(DIR).filter((f) => /^[a-z-]+-\d{2}\.html$/.test(f))) {
  const p = path.join(DIR, f);
  const before = fs.readFileSync(p, 'utf8');
  let s = before;
  s = s.replace(/<header class="header">[\s\S]*?<\/header>/, NAV);
  s = s.replace(/<footer class="footer">[\s\S]*?<\/footer>/, FOOT);
  s = s.replace(/\n?<div class="bg-ambient"><\/div>/, '');
  if (!s.includes('assets/site.js')) s = s.replace(/<\/body>/, `${SCRIPT}\n</body>`);
  if (s !== before) { fs.writeFileSync(p, s); changed++; }
}
console.log(`apply-chrome: ${changed} lesson(s) updated`);
