// @ts-nocheck
// Logique du quiz (jouer.astro)
(function () {
  var d = window.__QUIZ__;
  if (!d || !d.questions || d.questions.length === 0) return;

  var questions    = d.questions;
  var time         = d.time;
  var quizPbUrl    = d.pbUrl;
  var quizToken    = d.token;
  var quizUserId   = d.userId;
  var quizInSession = d.inSession;

  var cur          = 0;
  var score        = 0;
  var correctCount = 0;
  var answered     = false;
  var timerRef     = null;
  var timeLeft     = time;
  var multiplier   = time <= 10 ? 3 : time <= 20 ? 2 : time <= 30 ? 1.5 : 1;
  var ptsPerQ      = Math.round(10 * multiplier);

  function $(id) { return document.getElementById(id); }

  function setTimerColor(pct) {
    var color = pct > 0.5 ? '#72C073' : pct > 0.25 ? '#f59e0b' : '#ef4444';
    $('timer-text').style.color     = color;
    $('timer-bar').style.background = color;
  }

  function load() {
    answered = false;
    timeLeft = time;
    var q = questions[cur];

    $('q-counter').textContent     = 'Question ' + (cur + 1) + ' / ' + questions.length;
    $('q-theme-badge').textContent = q.t;
    $('q-text').textContent        = q.q;
    $('quiz-progress').style.width = ((cur / questions.length) * 100) + '%';

    document.querySelectorAll('.choice-btn').forEach(function (btn, i) {
      btn.querySelector('.choice-text').textContent = q.c[i] || '';
      btn.style.background  = '';
      btn.style.borderColor = '';
      btn.style.opacity     = '';
      btn.disabled          = false;
      btn.style.display     = q.c[i] ? '' : 'none';
    });

    $('timer-text').textContent     = String(time);
    $('timer-bar').style.transition = 'none';
    $('timer-bar').style.width      = '100%';
    setTimerColor(1);
    $('timer-bar').getBoundingClientRect();
    $('timer-bar').style.transition = 'width 0.9s linear, background 0.5s';

    clearInterval(timerRef);
    timerRef = setInterval(tick, 1000);
  }

  function tick() {
    timeLeft--;
    $('timer-text').textContent = String(Math.max(0, timeLeft));
    var pct = timeLeft / time;
    setTimerColor(Math.max(0, pct));
    $('timer-bar').style.width = (Math.max(0, pct) * 100) + '%';
    if (timeLeft <= 0) { clearInterval(timerRef); reveal(-1); }
  }

  function reveal(selected) {
    if (answered) return;
    answered = true;
    clearInterval(timerRef);
    var correct = questions[cur].a;
    if (selected === correct && selected !== -1) { score += ptsPerQ; correctCount++; }

    document.querySelectorAll('.choice-btn').forEach(function (btn, i) {
      btn.disabled = true;
      if (i === correct) {
        btn.style.background  = '#14532d';
        btn.style.borderColor = '#72C073';
      } else if (i === selected) {
        btn.style.background  = '#7f1d1d';
        btn.style.borderColor = '#ef4444';
      } else {
        btn.style.opacity = '0.4';
      }
    });

    setTimeout(function () {
      cur++;
      if (cur < questions.length) { load(); } else { showResult(); }
    }, 2000);
  }

  function showResult() {
    $('phase-playing').classList.add('hidden');
    $('phase-result').classList.remove('hidden');
    $('quiz-progress').style.width  = '100%';
    var pct = correctCount / questions.length;
    $('result-title').textContent = pct >= 0.8 ? 'Excellent !' : pct >= 0.5 ? 'Bien joué !' : 'Pas mal !';
    var circleSection = $('result-circle-section');
    if (quizToken && quizUserId) {
      $('result-correct').textContent = String(correctCount);
      $('result-score').textContent   = score + ' pts';
      $('result-mult').textContent    = 'x' + multiplier + ' — ' + ptsPerQ + ' pts par bonne réponse';
      if (circleSection) circleSection.style.display = '';
    } else {
      if (circleSection) circleSection.style.display = 'none';
    }
    setTimeout(function () {
      var bar = $('result-bar');
      if (bar) bar.style.width = (pct * 100) + '%';
    }, 100);
    if (quizInSession && score > 0) { savePoints(score); }
  }

  function savePoints(pts) {
    fetch(quizPbUrl + '/api/collections/users/records/' + quizUserId, {
      headers: { Authorization: 'Bearer ' + quizToken }
    })
    .then(function (r) { return r.json(); })
    .then(function (u) {
      var current = u.points ?? 0;
      return fetch(quizPbUrl + '/api/collections/users/records/' + quizUserId, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + quizToken },
        body:    JSON.stringify({ points: current + pts }),
      });
    })
    .then(function () {
      var el = $('result-score');
      if (el) el.title = 'Points ajoutés à votre profil !';
    })
    .catch(function () {});
  }

  document.querySelectorAll('.choice-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { reveal(parseInt(this.dataset.index)); });
  });

  load();
})();
