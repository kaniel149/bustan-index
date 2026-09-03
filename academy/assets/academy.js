/* ============================================
   Bustan Energy Academy — Shared JavaScript
   ============================================ */

// ---- Auth (disabled 2026-09-03) ----
// The Supabase project that backed academy_users/academy_progress no longer exists.
// Progress is stored per browser in localStorage. admin.html + migrations/ are kept for a future re-enable.
const STORAGE_KEY = 'bustan_academy_progress';
const LEGACY_KEYS = ['tm_academy_progress'];
function getCurrentUser() { return null; }
function checkAuth() { // only job left: one-time migration of pre-rebrand progress
  if (!localStorage.getItem(STORAGE_KEY)) {
    for (const k of LEGACY_KEYS) { const v = localStorage.getItem(k); if (v) { localStorage.setItem(STORAGE_KEY, v); break; } }
  }
}

// ---- Progress Store (localStorage) ----

function getProgressKey() {
  return STORAGE_KEY;
}

function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(getProgressKey())) || {};
  } catch { return {}; }
}

function saveProgress(data) {
  localStorage.setItem(getProgressKey(), JSON.stringify(data));
}

function updateProgressBars() {
  const cards = document.querySelectorAll('.track-card[data-track]');
  cards.forEach(card => {
    const track = card.dataset.track;
    const total = parseInt(card.dataset.total);
    const completed = getCompletedCount(track);
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    const fill = card.querySelector('.progress-bar-fill');
    const text = card.querySelector('.progress-text');
    const pctEl = card.querySelector('.progress-pct');

    if (fill) fill.style.width = pct + '%';
    if (text && !text.querySelector('[data-en]')) text.textContent = `${completed}/${total}`;
    if (pctEl && pctEl.textContent !== '') pctEl.textContent = pct + '%';
  });
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
  const saved = localStorage.getItem('bustan_academy_lang') || localStorage.getItem('tm_academy_lang') || 'en';
  setLanguage(saved);
}

function setLanguage(lang) {
  document.body.setAttribute('data-lang', lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
  localStorage.setItem('bustan_academy_lang', lang);
  const t = document.querySelector('title');
  if (t) { if (!t.dataset.en) t.dataset.en = t.textContent; document.title = t.dataset[lang] || t.dataset.en; }
  document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
  document.dispatchEvent(new CustomEvent('academy:lang', { detail: lang }));
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
        if (!isCorrect) {
          optContainer.children[q.correct].classList.add('correct');
        }
        Array.from(optContainer.children).forEach(o => o.classList.add('disabled'));

        if (answered === questions.length) {
          showQuizResult(correct, questions.length, courseId, lessonNum);
        }
      });

      optEl._updateVis = updateOptVis;
      optContainer.appendChild(optEl);
    });

    qDiv.appendChild(optContainer);
    container.appendChild(qDiv);

    qText._updateVis = updateQVis;
    qDiv._updateAll = () => {
      updateQVis();
      Array.from(optContainer.children).forEach(o => o._updateVis?.());
    };
    qDiv._updateAll();
  });

  const origSetLang = window.setLanguage;
  window.setLanguage = (lang) => {
    origSetLang(lang);
    container.querySelectorAll('.quiz-question').forEach(q => q._updateAll?.());
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

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });
});
