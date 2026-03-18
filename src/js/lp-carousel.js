// @ts-nocheck
// Landing page — carousel bars (double-buffering A/B) + carousel valeurs

var _bars    = window.__LP_BARS__ || [];
var _barIdx  = 0;
var _current = 'a';
var _busy    = false;
var DUR      = 600;

function _q(id) { return document.getElementById(id); }

function _fillPanel(panel, b) {
  var prlx = _q('lp-prlx-' + panel);
  if (prlx) prlx.style.backgroundImage = b.parallaxUrl ? "url('" + b.parallaxUrl + "')" : 'none';
  var nom  = _q('lp-nom-'  + panel); if (nom)  nom.textContent = b.nom;
  var adr  = _q('lp-adr-'  + panel); if (adr)  adr.textContent = b.adresse;
  var desc = _q('lp-desc-' + panel); if (desc) desc.textContent = b.description;
  var lnk  = _q('lp-link-' + panel); if (lnk)  lnk.href = '/bar/' + b.id;
  var img  = _q('lp-img-'  + panel);
  if (img) {
    if (b.cardImgUrl) { img.src = b.cardImgUrl; }
    else { img.removeAttribute('src'); }
  }
}

function _updateMobile(b) {
  var img = _q('lp-mob-img');
  if (img) { if (b.cardImgUrl) img.src = b.cardImgUrl; else img.removeAttribute('src'); }
  var bg = _q('lp-mob-bg-src');
  if (bg)  { if (b.parallaxUrl) bg.src = b.parallaxUrl; else bg.removeAttribute('src'); }
  var adr  = _q('lp-mob-adr');  if (adr)  adr.textContent  = b.adresse;
  var desc = _q('lp-mob-desc'); if (desc) desc.textContent = b.description;
  var lnk  = _q('lp-mob-link'); if (lnk)  lnk.href        = '/bar/' + b.id;
  var nom  = _q('lp-mob-nom');  if (nom)  nom.textContent  = b.nom;
}

function _prefetchAlt() {
  var altPanel = _current === 'a' ? 'b' : 'a';
  var nextIdx  = (_barIdx + 1) % _bars.length;
  _fillPanel(altPanel, _bars[nextIdx]);
}

if (_bars.length > 1) { _fillPanel('b', _bars[1]); }

function _goTo(newIdx) {
  if (_busy || !_bars.length || newIdx === _barIdx) return;
  _busy = true;
  var next = _current === 'a' ? 'b' : 'a';
  var b    = _bars[newIdx];

  _fillPanel(next, b);

  var bgCur  = _q('lp-bg-'   + _current);
  var cdCur  = _q('lp-card-' + _current);
  var bgNext = _q('lp-bg-'   + next);
  var cdNext = _q('lp-card-' + next);

  if (bgNext && bgCur && cdNext && cdCur) {
    bgNext.style.transition = 'none'; bgNext.style.transform = 'translateY(100%)';
    cdNext.style.transition = 'none'; cdNext.style.transform = 'translateX(-100%)';
    bgNext.getBoundingClientRect(); cdNext.getBoundingClientRect();
    var ease = 'transform ' + DUR + 'ms cubic-bezier(0.4, 0, 0.2, 1)';
    bgCur.style.transition  = ease; bgCur.style.transform  = 'translateY(-100%)';
    cdCur.style.transition  = ease; cdCur.style.transform  = 'translateX(100%)';
    bgNext.style.transition = ease; bgNext.style.transform = 'translateY(0)';
    cdNext.style.transition = ease; cdNext.style.transform = 'translateX(0)';
  }
  _updateMobile(b);

  setTimeout(function () {
    if (bgCur && cdCur) {
      bgCur.style.transition = 'none'; bgCur.style.transform = 'translateY(100%)';
      cdCur.style.transition = 'none'; cdCur.style.transform = 'translateX(-100%)';
    }
    _current = next; _barIdx = newIdx; _busy = false;
    var ctr = _q('lp-bar-counter');
    if (ctr) ctr.textContent = (_barIdx + 1) + ' / ' + _bars.length;
    _prefetchAlt();
  }, DUR + 50);
}

var prev = _q('lp-bar-prev'); var nxt = _q('lp-bar-next');
if (prev) prev.addEventListener('click', function () { _goTo((_barIdx - 1 + _bars.length) % _bars.length); });
if (nxt)  nxt.addEventListener('click',  function () { _goTo((_barIdx + 1) % _bars.length); });
var mp = _q('lp-mob-prev'); var mn = _q('lp-mob-next');
if (mp) mp.addEventListener('click', function () { _goTo((_barIdx - 1 + _bars.length) % _bars.length); });
if (mn) mn.addEventListener('click', function () { _goTo((_barIdx + 1) % _bars.length); });

window.addEventListener('scroll', function () {
  var prlx = _q('lp-prlx-' + _current); if (!prlx) return;
  var wrap = _q('lp-bg-wrap');           if (!wrap) return;
  var rect = wrap.getBoundingClientRect();
  prlx.style.backgroundPositionY = (50 - (rect.top / window.innerHeight) * 15) + '%';
}, { passive: true });

// ── Carousel valeurs ──────────────────────────────────────────────────────────
var _valIdx   = 0;
var _valTotal = 3;
var _valTrack = _q('lp-val-track');

function _updateVal() {
  if (_valTrack) {
    _valTrack.style.transition = 'transform 0.5s ease-in-out';
    _valTrack.style.transform  = 'translateX(-' + (_valIdx * (100 / _valTotal)) + '%)';
  }
}

var vp = _q('lp-val-prev'); var vn = _q('lp-val-next');
if (vp) vp.addEventListener('click', function () { _valIdx = (_valIdx - 1 + _valTotal) % _valTotal; _updateVal(); });
if (vn) vn.addEventListener('click', function () { _valIdx = (_valIdx + 1) % _valTotal; _updateVal(); });
