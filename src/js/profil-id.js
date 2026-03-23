// @ts-nocheck
(function () {
  var _p = window.__PROFIL_ID__ || {};
  var pbUrl        = _p.pbUrl;
  var pbToken      = _p.pbToken;
  var pbUserId     = _p.pbUserId;
  var targetUserId = _p.targetUserId;
  var activeTab    = _p.activeTab;

  // ── Indicateur animé ──────────────────────────────────
  function moveIndicator(btn) {
    var indicator = document.getElementById('tab-indicator');
    var list      = document.getElementById('tab-list');
    if (!indicator || !list) return;
    var listRect = list.getBoundingClientRect();
    var btnRect  = btn.getBoundingClientRect();
    indicator.style.left  = (btnRect.left - listRect.left + list.scrollLeft) + 'px';
    indicator.style.width = btnRect.width + 'px';
  }

  // Position initiale
  var initBtn = document.querySelector('.tab-btn[data-tab="' + (activeTab || 'profil') + '"]');
  if (initBtn) moveIndicator(initBtn);

  // ── Tabs ───────────────────────────────────────────────
  document.querySelectorAll('.tab-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var tabId = btn.dataset.tab;
      document.querySelectorAll('[data-panel]').forEach(function (p) { p.classList.add('hidden'); });
      var panel = document.getElementById('panel-' + tabId);
      if (panel) panel.classList.remove('hidden');
      moveIndicator(btn);
    });
  });

  // ── Envoyer une demande ────────────────────────────────
  async function sendRequest(btn) {
    if (!btn) return;
    btn.disabled = true; btn.style.opacity = '0.6';
    try {
      var r = await fetch(pbUrl + '/api/collections/users/records/' + targetUserId, {
        headers: { Authorization: 'Bearer ' + pbToken }
      });
      if (r.ok) {
        var target = await r.json();
        var existing = Array.isArray(target.demande_amies) ? target.demande_amies : [];
        if (existing.indexOf(pbUserId) < 0) {
          existing.push(pbUserId);
          await fetch(pbUrl + '/api/collections/users/records/' + targetUserId, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + pbToken },
            body: JSON.stringify({ demande_amies: existing }),
          });
        }
        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg> Demande envoyée';
        btn.style.background = '#347645';
        btn.style.opacity = '1';
        btn.disabled = true;
      }
    } catch (_) { btn.disabled = false; btn.style.opacity = '1'; }
  }

  var sendBtn = document.getElementById('send-request-btn');
  if (sendBtn) sendBtn.addEventListener('click', function () { sendRequest(sendBtn); });
  var sendBtnM = document.getElementById('send-request-btn-mobile');
  if (sendBtnM) sendBtnM.addEventListener('click', function () { sendRequest(sendBtnM); });

  // ── Accepter une demande ───────────────────────────────
  async function acceptRequest(btn) {
    if (!btn) return;
    btn.disabled = true; btn.style.opacity = '0.6';
    try {
      var meRes = await fetch(pbUrl + '/api/collections/users/records/' + pbUserId, {
        headers: { Authorization: 'Bearer ' + pbToken }
      });
      if (meRes.ok) {
        var me = await meRes.json();
        var myAmies = Array.isArray(me.amies) ? me.amies : [];
        var myDemandes = Array.isArray(me.demande_amies) ? me.demande_amies : [];
        if (myAmies.indexOf(targetUserId) < 0) myAmies.push(targetUserId);
        myDemandes = myDemandes.filter(function (i) { return i !== targetUserId; });
        await fetch(pbUrl + '/api/collections/users/records/' + pbUserId, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + pbToken },
          body: JSON.stringify({ amies: myAmies, demande_amies: myDemandes }),
        });
      }
      var theirRes = await fetch(pbUrl + '/api/collections/users/records/' + targetUserId, {
        headers: { Authorization: 'Bearer ' + pbToken }
      });
      if (theirRes.ok) {
        var them = await theirRes.json();
        var theirAmies = Array.isArray(them.amies) ? them.amies : [];
        if (theirAmies.indexOf(pbUserId) < 0) theirAmies.push(pbUserId);
        await fetch(pbUrl + '/api/collections/users/records/' + targetUserId, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + pbToken },
          body: JSON.stringify({ amies: theirAmies }),
        });
      }
      window.location.reload();
    } catch (_) { btn.disabled = false; btn.style.opacity = '1'; }
  }

  var acceptBtn = document.getElementById('accept-btn');
  if (acceptBtn) acceptBtn.addEventListener('click', function () { acceptRequest(acceptBtn); });
  var acceptBtnM = document.getElementById('accept-btn-mobile');
  if (acceptBtnM) acceptBtnM.addEventListener('click', function () { acceptRequest(acceptBtnM); });

  // ── Refuser une demande ────────────────────────────────
  async function refuseRequest(btn) {
    if (!btn) return;
    btn.disabled = true;
    try {
      var meRes = await fetch(pbUrl + '/api/collections/users/records/' + pbUserId, {
        headers: { Authorization: 'Bearer ' + pbToken }
      });
      if (meRes.ok) {
        var me = await meRes.json();
        var myDemandes = Array.isArray(me.demande_amies) ? me.demande_amies : [];
        myDemandes = myDemandes.filter(function (i) { return i !== targetUserId; });
        await fetch(pbUrl + '/api/collections/users/records/' + pbUserId, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + pbToken },
          body: JSON.stringify({ demande_amies: myDemandes }),
        });
      }
      window.location.reload();
    } catch (_) { btn.disabled = false; }
  }

  var refuseBtn = document.getElementById('refuse-btn');
  if (refuseBtn) refuseBtn.addEventListener('click', function () { refuseRequest(refuseBtn); });
  var refuseBtnM = document.getElementById('refuse-btn-mobile');
  if (refuseBtnM) refuseBtnM.addEventListener('click', function () { refuseRequest(refuseBtnM); });

  // ── Supprimer l'ami ────────────────────────────────────
  async function removeFriend(btn) {
    if (!btn) return;
    btn.disabled = true; btn.style.opacity = '0.6';
    try {
      // Retirer des deux côtés
      var meRes = await fetch(pbUrl + '/api/collections/users/records/' + pbUserId, {
        headers: { Authorization: 'Bearer ' + pbToken }
      });
      if (meRes.ok) {
        var me = await meRes.json();
        var myAmies = (Array.isArray(me.amies) ? me.amies : []).filter(function (i) { return i !== targetUserId; });
        await fetch(pbUrl + '/api/collections/users/records/' + pbUserId, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + pbToken },
          body: JSON.stringify({ amies: myAmies }),
        });
      }
      var theirRes = await fetch(pbUrl + '/api/collections/users/records/' + targetUserId, {
        headers: { Authorization: 'Bearer ' + pbToken }
      });
      if (theirRes.ok) {
        var them = await theirRes.json();
        var theirAmies = (Array.isArray(them.amies) ? them.amies : []).filter(function (i) { return i !== pbUserId; });
        await fetch(pbUrl + '/api/collections/users/records/' + targetUserId, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + pbToken },
          body: JSON.stringify({ amies: theirAmies }),
        });
      }
      window.location.reload();
    } catch (_) { btn.disabled = false; btn.style.opacity = '1'; }
  }

  var removeBtn = document.getElementById('remove-friend-btn');
  if (removeBtn) removeBtn.addEventListener('click', function () { removeFriend(removeBtn); });
  var removeBtnM = document.getElementById('remove-friend-btn-mobile');
  if (removeBtnM) removeBtnM.addEventListener('click', function () { removeFriend(removeBtnM); });

})();
