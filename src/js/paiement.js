// @ts-nocheck
(function () {
  var _p = window.__PAIEMENT__ || {};
  var PB_URL      = _p.PB_URL;
  var token       = _p.token;
  var userId      = _p.userId;
  var planPbValue = _p.planPbValue;
  var planId      = _p.planId;

  document.getElementById('demo-close').addEventListener('click', function () {
    document.getElementById('demo-overlay').style.display = 'none';
  });

  function fmtCard(el) {
    el.addEventListener('input', function () {
      var v = this.value.replace(/\D/g, '').slice(0, 16);
      this.value = v.replace(/(.{4})/g, '$1  ').trim();
    });
  }
  function fmtExpiry(el) {
    el.addEventListener('input', function () {
      var v = this.value.replace(/\D/g, '').slice(0, 4);
      this.value = v.length >= 3 ? v.slice(0, 2) + ' / ' + v.slice(2) : v;
    });
  }
  function fmtCvv(el) {
    el.addEventListener('input', function () {
      this.value = this.value.replace(/\D/g, '').slice(0, 3);
    });
  }

  ['card-number','card-number-m'].forEach(function(id) { var el = document.getElementById(id); if (el) fmtCard(el); });
  ['card-expiry','card-expiry-m'].forEach(function(id) { var el = document.getElementById(id); if (el) fmtExpiry(el); });
  ['card-cvv','card-cvv-m'].forEach(function(id)    { var el = document.getElementById(id); if (el) fmtCvv(el); });

  async function updateAbonnement() {
    var newPlan = planPbValue[planId];
    if (!newPlan || !token || !userId) return;
    try {
      await fetch(PB_URL + '/api/collections/users/records/' + userId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ abonnements: newPlan }),
      });
    } catch (_) {}
  }

  function handleSubmit(e) {
    e.preventDefault();
    var btn = document.getElementById('btn-pay');
    if (btn) { btn.disabled = true; btn.textContent = 'Traitement…'; }
    setTimeout(async function () {
      await updateAbonnement();
      document.getElementById('success-overlay').style.display = 'flex';
    }, 1500);
  }

  ['payment-form','payment-form-mobile'].forEach(function(id) {
    var f = document.getElementById(id);
    if (f) f.addEventListener('submit', handleSubmit);
  });
})();
