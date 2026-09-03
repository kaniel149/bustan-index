// academy/assets/gate.js — shared-passcode gate for team tracks.
// NOT authentication: every lesson is a public file on GitHub Pages. This hides team
// material from casual visitors and (with noindex) from search. Rotate: replace KEY_HASH
// with  node -e "console.log(require('crypto').createHash('sha256').update('NEW').digest('hex'))"
(function (root) {
  const PUBLIC_TRACKS = ['solar-fundamentals', 'ev-storage'];
  const TEAM_TRACKS = ['sales-bd', 'technical', 'management'];
  const KEY_HASH = '410db3ada1cea7e8db8bcbee91b354991a1ee41db076e42dad483609c5bac864'; // sha256('bustan-team-2026')
  const STORE = 'bustan_academy_key';
  const trackOf = (p) => { const m = String(p).match(/(solar-fundamentals|sales-bd|technical|ev-storage|management)-\d{2}\.html$/); return m ? m[1] : null; };
  const isTeamTrack = (t) => TEAM_TRACKS.includes(t);
  async function sha256(s) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
  const unlocked = () => { try { return localStorage.getItem(STORE) === KEY_HASH; } catch { return false; } };
  async function acceptKey(key) { if (!key) return unlocked(); const ok = (await sha256(key.trim())) === KEY_HASH; if (ok) localStorage.setItem(STORE, KEY_HASH); return ok; }
  const T = { en: ['Team material', 'This track is for Bustan Energy staff. Enter the team passcode to continue.', 'Passcode', 'Unlock', 'Wrong passcode', '← Back to Academy'],
    he: ['חומר לצוות', 'המסלול הזה מיועד לצוות Bustan Energy. הזינו את קוד הצוות כדי להמשיך.', 'קוד', 'פתח', 'קוד שגוי', '← חזרה לאקדמיה'],
    th: ['เนื้อหาสำหรับทีม', 'หลักสูตรนี้สำหรับทีม Bustan Energy กรุณาใส่รหัสทีมเพื่อดำเนินการต่อ', 'รหัส', 'ปลดล็อก', 'รหัสไม่ถูกต้อง', '← กลับไปที่ Academy'] };
  function renderGate(container) {
    const s = T[document.body.getAttribute('data-lang') || 'en'] || T.en;
    container.innerHTML = `<section class="glass-card gate-box"><h1>🔒 ${s[0]}</h1><p>${s[1]}</p>
      <form id="gate-form"><label>${s[2]} <input id="gate-key" type="password" autocomplete="off" autofocus></label>
      <button type="submit" class="complete-btn">${s[3]}</button><p id="gate-err" class="gate-err"></p></form><a href="../index.html">${s[5]}</a></section>`;
    container.querySelector('#gate-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      if (await acceptKey(container.querySelector('#gate-key').value)) location.reload(); else container.querySelector('#gate-err').textContent = s[4];
    });
  }
  async function init() {
    await acceptKey(new URLSearchParams(location.search).get('key')); const on = unlocked();
    document.querySelectorAll('.track-card[data-team]').forEach(c => c.classList.toggle('locked', !on));
    const track = trackOf(location.pathname);
    if (track && isTeamTrack(track) && !on) { const c = document.querySelector('.lesson-container'); if (c) renderGate(c); }
  }
  root.AcademyGate = { PUBLIC_TRACKS, TEAM_TRACKS, KEY_HASH, trackOf, isTeamTrack, unlocked, acceptKey };
  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', init);
})(typeof window !== 'undefined' ? window : root);
