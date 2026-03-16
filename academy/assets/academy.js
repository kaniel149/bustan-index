/* ============================================
   TM Energy Academy — Shared JavaScript
   ============================================ */

// ---- User Auth System ----
const USERS_KEY = 'tm_academy_users';
const SESSION_KEY = 'tm_academy_session';

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
  catch { return []; }
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function seedDefaultUsers() {
  let users = getUsers();
  const defaultUsers = [
    { id: 'erez', name: 'Erez', pin: '1234', role: 'installer', createdAt: '2026-03-16' },
    { id: 'kaniel', name: 'Kaniel', pin: '2626', role: 'admin', createdAt: '2026-03-16' }
  ];
  defaultUsers.forEach(du => {
    if (!users.find(u => u.id === du.id)) users.push(du);
  });
  saveUsers(users);
}

function getCurrentUser() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); }
  catch { return null; }
}
function setCurrentUser(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}
function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  location.reload();
}

function showLoginGate() {
  if (document.getElementById('login-overlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'login-overlay';
  overlay.innerHTML = `
    <style>
      #login-overlay { position:fixed; inset:0; z-index:99999; background:rgba(10,22,40,0.97);
        display:flex; align-items:center; justify-content:center; font-family:'Inter',sans-serif; }
      .login-box { background:rgba(255,255,255,0.05); border:1px solid rgba(0,214,143,0.3);
        border-radius:16px; padding:48px 40px; max-width:380px; width:90%; text-align:center;
        backdrop-filter:blur(20px); }
      .login-box img { height:40px; margin-bottom:8px; }
      .login-box h2 { color:#fff; margin:0 0 4px; font-size:22px; }
      .login-box .sub { color:rgba(255,255,255,0.5); font-size:13px; margin-bottom:28px; }
      .login-field { margin-bottom:16px; text-align:left; }
      .login-field label { display:block; color:rgba(255,255,255,0.6); font-size:12px;
        text-transform:uppercase; letter-spacing:1px; margin-bottom:6px; }
      .login-field input { width:100%; padding:12px 16px; border:1px solid rgba(255,255,255,0.15);
        border-radius:8px; background:rgba(255,255,255,0.06); color:#fff; font-size:16px;
        outline:none; transition:border 0.2s; box-sizing:border-box; }
      .login-field input:focus { border-color:#00D68F; }
      .login-btn { width:100%; padding:14px; border:none; border-radius:8px; background:#00D68F;
        color:#0A1628; font-size:16px; font-weight:700; cursor:pointer; margin-top:8px;
        transition:transform 0.15s, opacity 0.15s; }
      .login-btn:hover { transform:translateY(-1px); opacity:0.9; }
      .login-error { color:#ff6b6b; font-size:13px; margin-top:12px; min-height:20px; }
      .login-pin-dots { display:flex; gap:12px; justify-content:center; margin:8px 0 0; }
      .login-pin-dots input { width:48px; height:56px; text-align:center; font-size:24px;
        font-weight:700; border:2px solid rgba(255,255,255,0.15); border-radius:12px;
        background:rgba(255,255,255,0.06); color:#fff; outline:none; transition:border 0.2s; }
      .login-pin-dots input:focus { border-color:#00D68F; }
    </style>
    <div class="login-box">
      <img src="${location.pathname.includes('/courses/') ? '../' : ''}../proposals/tm-logo.png" alt="TM Energy" onerror="this.style.display='none'">
      <h2>TM Energy Academy</h2>
      <div class="sub">Employee Login</div>
      <div class="login-field">
        <label>Username</label>
        <input type="text" id="login-user" placeholder="Enter username" autocomplete="off">
      </div>
      <div class="login-field">
        <label>PIN</label>
        <div class="login-pin-dots">
          <input type="password" maxlength="1" inputmode="numeric" class="pin-digit" data-idx="0">
          <input type="password" maxlength="1" inputmode="numeric" class="pin-digit" data-idx="1">
          <input type="password" maxlength="1" inputmode="numeric" class="pin-digit" data-idx="2">
          <input type="password" maxlength="1" inputmode="numeric" class="pin-digit" data-idx="3">
        </div>
      </div>
      <button class="login-btn" id="login-submit">Login</button>
      <div class="login-error" id="login-error"></div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  // PIN digit auto-advance
  const pins = overlay.querySelectorAll('.pin-digit');
  pins.forEach((p, i) => {
    p.addEventListener('input', () => {
      if (p.value && i < 3) pins[i+1].focus();
    });
    p.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !p.value && i > 0) { pins[i-1].focus(); pins[i-1].value = ''; }
    });
  });

  const doLogin = () => {
    const username = document.getElementById('login-user').value.trim().toLowerCase();
    const pin = Array.from(pins).map(p => p.value).join('');
    const errEl = document.getElementById('login-error');

    if (!username) { errEl.textContent = 'Enter username'; return; }
    if (pin.length < 4) { errEl.textContent = 'Enter 4-digit PIN'; return; }

    const users = getUsers();
    const user = users.find(u => u.id.toLowerCase() === username && u.pin === pin);
    if (!user) {
      errEl.textContent = 'Invalid username or PIN';
      pins.forEach(p => { p.value = ''; p.style.borderColor = '#ff6b6b'; });
      pins[0].focus();
      setTimeout(() => pins.forEach(p => p.style.borderColor = ''), 1000);
      return;
    }

    setCurrentUser(user);
    overlay.remove();
    document.body.style.overflow = '';
    initUserUI();
  };

  document.getElementById('login-submit').addEventListener('click', doLogin);
  pins[3].addEventListener('input', () => setTimeout(doLogin, 100));
  overlay.addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });
  document.getElementById('login-user').focus();
}

function initUserUI() {
  const user = getCurrentUser();
  if (!user) return;

  // Add user badge to header
  const header = document.querySelector('.header-nav') || document.querySelector('.header-inner');
  if (header && !document.getElementById('user-badge')) {
    const badge = document.createElement('div');
    badge.id = 'user-badge';
    badge.style.cssText = 'display:flex;align-items:center;gap:8px;margin-left:16px;';
    badge.innerHTML = `
      <span style="width:32px;height:32px;border-radius:50%;background:#00D68F;color:#0A1628;
        display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;">
        ${user.name.charAt(0).toUpperCase()}</span>
      <span style="color:rgba(255,255,255,0.7);font-size:13px;">${user.name}</span>
      <button onclick="logout()" style="background:none;border:1px solid rgba(255,255,255,0.2);
        color:rgba(255,255,255,0.5);padding:4px 10px;border-radius:6px;font-size:11px;
        cursor:pointer;margin-left:4px;">Logout</button>
    `;
    header.appendChild(badge);
  }
}

function checkAuth() {
  seedDefaultUsers();
  const user = getCurrentUser();
  if (!user) {
    showLoginGate();
  } else {
    initUserUI();
  }
}

// ---- Progress Store (per-user) ----
const STORAGE_KEY = 'tm_academy_progress';

function getProgressKey() {
  const user = getCurrentUser();
  return user ? `tm_academy_progress_${user.id}` : STORAGE_KEY;
}

function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(getProgressKey())) || {};
  } catch { return {}; }
}
function saveProgress(data) {
  localStorage.setItem(getProgressKey(), JSON.stringify(data));
  // Also sync to admin panel data
  syncToAdmin();
}

function syncToAdmin() {
  const user = getCurrentUser();
  if (!user) return;
  try {
    const adminData = JSON.parse(localStorage.getItem('tm_academy_admin')) || { employees: [] };
    let emp = adminData.employees.find(e => e.id === user.id);
    if (!emp) {
      emp = { id: user.id, name: user.name, role: user.role, startDate: user.createdAt, progress: {} };
      adminData.employees.push(emp);
    }
    emp.progress = getProgress();
    emp.lastActivity = new Date().toISOString();
    localStorage.setItem('tm_academy_admin', JSON.stringify(adminData));
  } catch(e) {}
}

function markLessonComplete(courseId, lessonNum) {
  const p = getProgress();
  if (!p[courseId]) p[courseId] = { completed: [], quizScores: {} };
  if (!p[courseId].completed.includes(lessonNum)) {
    p[courseId].completed.push(lessonNum);
  }
  saveProgress(p);
}

function isLessonComplete(courseId, lessonNum) {
  const p = getProgress();
  return p[courseId]?.completed?.includes(lessonNum) || false;
}

function getCompletedCount(courseId) {
  const p = getProgress();
  return p[courseId]?.completed?.length || 0;
}

function saveQuizScore(courseId, lessonNum, score, total) {
  const p = getProgress();
  if (!p[courseId]) p[courseId] = { completed: [], quizScores: {} };
  p[courseId].quizScores[lessonNum] = { score, total, ts: Date.now() };
  saveProgress(p);
}

// ---- Language Toggle ----
function initLanguage() {
  const saved = localStorage.getItem('tm_academy_lang') || 'en';
  setLanguage(saved);
}

function setLanguage(lang) {
  document.body.setAttribute('data-lang', lang);
  localStorage.setItem('tm_academy_lang', lang);
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

// ---- Scroll Animations ----
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}

// ---- Quiz Engine ----
function initQuiz(courseId, lessonNum, questions) {
  const container = document.getElementById('quiz-container');
  if (!container) return;

  const lang = () => document.body.getAttribute('data-lang') || 'en';
  let answered = 0;
  let correct = 0;

  questions.forEach((q, qi) => {
    const qDiv = document.createElement('div');
    qDiv.className = 'quiz-question';

    const qText = document.createElement('p');
    qText.innerHTML = `<span data-en>${qi+1}. ${q.question.en}</span><span data-he>${qi+1}. ${q.question.he}</span><span data-th>${qi+1}. ${q.question.th}</span>`;
    qDiv.appendChild(qText);

    // Make spans visible based on current lang
    const updateQVis = () => {
      qText.querySelectorAll('span').forEach(s => {
        s.style.display = s.dataset[lang()] !== undefined ? 'inline' : 'none';
      });
    };

    const optContainer = document.createElement('div');
    optContainer.className = 'quiz-options';

    q.options.forEach((opt, oi) => {
      const optEl = document.createElement('div');
      optEl.className = 'quiz-option';
      optEl.innerHTML = `<span class="marker">${String.fromCharCode(65+oi)}</span><span class="opt-en" data-en>${opt.en}</span><span class="opt-he" data-he>${opt.he}</span><span class="opt-th" data-th>${opt.th}</span>`;

      const updateOptVis = () => {
        optEl.querySelectorAll('[data-en],[data-he],[data-th]').forEach(s => {
          s.style.display = s.dataset[lang()] !== undefined ? 'inline' : 'none';
        });
      };

      optEl.addEventListener('click', () => {
        if (qDiv.classList.contains('answered')) return;
        qDiv.classList.add('answered');
        answered++;

        const isCorrect = oi === q.correct;
        if (isCorrect) correct++;

        optEl.classList.add(isCorrect ? 'correct' : 'incorrect');
        // Show correct answer
        if (!isCorrect) {
          optContainer.children[q.correct].classList.add('correct');
        }
        // Disable all options
        Array.from(optContainer.children).forEach(o => o.classList.add('disabled'));

        // Check if quiz complete
        if (answered === questions.length) {
          showQuizResult(correct, questions.length, courseId, lessonNum);
        }
      });

      // Store update function
      optEl._updateVis = updateOptVis;
      optContainer.appendChild(optEl);
    });

    qDiv.appendChild(optContainer);
    container.appendChild(qDiv);

    // Observe lang changes
    qText._updateVis = updateQVis;
    qDiv._updateAll = () => {
      updateQVis();
      Array.from(optContainer.children).forEach(o => o._updateVis?.());
    };
    qDiv._updateAll();
  });

  // Re-run visibility on lang change
  const origSetLang = window.setLanguage;
  window.setLanguage = (lang) => {
    origSetLang(lang);
    container.querySelectorAll('.quiz-question').forEach(q => q._updateAll?.());
    // Update result text if visible
    updateResultText();
  };
}

function showQuizResult(score, total, courseId, lessonNum) {
  saveQuizScore(courseId, lessonNum, score, total);
  const result = document.getElementById('quiz-result');
  if (!result) return;

  const pass = score >= Math.ceil(total * 0.6);
  result.className = `quiz-result show ${pass ? 'pass' : 'fail'}`;
  result.dataset.score = score;
  result.dataset.total = total;
  updateResultText();
}

function updateResultText() {
  const result = document.getElementById('quiz-result');
  if (!result || !result.dataset.score) return;
  const score = result.dataset.score;
  const total = result.dataset.total;
  const lang = document.body.getAttribute('data-lang') || 'en';
  const pass = score >= Math.ceil(total * 0.6);

  const msgs = {
    en: pass ? `Great job! ${score}/${total} correct!` : `${score}/${total} — Review the material and try again.`,
    he: pass ? `כל הכבוד! ${score}/${total} תשובות נכונות!` : `${score}/${total} — חזור על החומר ונסה שוב.`,
    th: pass ? `เยี่ยมมาก! ${score}/${total} ข้อถูก!` : `${score}/${total} — ทบทวนเนื้อหาแล้วลองอีกครั้ง`
  };
  result.textContent = msgs[lang] || msgs.en;
}

// ---- Complete Lesson Button ----
function initCompleteButton(courseId, lessonNum) {
  const btn = document.getElementById('complete-btn');
  if (!btn) return;

  const updateBtn = () => {
    const lang = document.body.getAttribute('data-lang') || 'en';
    if (isLessonComplete(courseId, lessonNum)) {
      btn.classList.add('completed');
      const texts = { en: '✓ Lesson Completed', he: '✓ השיעור הושלם', th: '✓ เรียนจบแล้ว' };
      btn.textContent = texts[lang] || texts.en;
    } else {
      btn.classList.remove('completed');
      const texts = { en: 'Mark as Complete', he: 'סמן כהושלם', th: 'ทำเครื่องหมายว่าเรียนจบ' };
      btn.textContent = texts[lang] || texts.en;
    }
  };

  btn.addEventListener('click', () => {
    if (!isLessonComplete(courseId, lessonNum)) {
      markLessonComplete(courseId, lessonNum);
      updateBtn();
    }
  });

  updateBtn();

  // Update on language change
  const origSetLang2 = window.setLanguage;
  window.setLanguage = (lang) => {
    origSetLang2(lang);
    updateBtn();
  };
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  initLanguage();
  initScrollAnimations();

  // Language toggle buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });
});
