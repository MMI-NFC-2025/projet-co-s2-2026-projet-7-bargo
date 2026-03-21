// @ts-nocheck
// Boutique — toggle like items_favori dans PocketBase

(function () {
  var PB_URL = 'https://pbbargo.pierre-mouilleseaux-lhuillier.fr';
  var auth   = window.__AUTH__ || {};
  var token  = auth.token  || null;
  var userId = auth.userId || null;

  var favs = [];

  function initBtns() {
    document.querySelectorAll('.like-btn-item').forEach(function (btn) {
      var id       = btn.dataset.id;
      var emptyEl  = btn.querySelector('.like-empty');
      var filledEl = btn.querySelector('.like-filled');

      if (favs.indexOf(id) >= 0) {
        emptyEl  && emptyEl.classList.add('hidden');
        filledEl && filledEl.classList.remove('hidden');
      }

      btn.addEventListener('click', function () {
        toggleLike(id, emptyEl, filledEl);
      });
    });
  }

  function toggleLike(itemId, emptyEl, filledEl) {
    var idx     = favs.indexOf(itemId);
    var updated;
    if (idx >= 0) {
      updated = favs.filter(function (id) { return id !== itemId; });
      emptyEl  && emptyEl.classList.remove('hidden');
      filledEl && filledEl.classList.add('hidden');
    } else {
      updated = favs.concat([itemId]);
      emptyEl  && emptyEl.classList.add('hidden');
      filledEl && filledEl.classList.remove('hidden');
    }
    favs = updated;

    if (!token || !userId) return;

    fetch(PB_URL + '/api/collections/users/records/' + userId, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body:    JSON.stringify({ items_favori: updated }),
    }).catch(function () {
      favs = idx >= 0 ? favs.concat([itemId]) : favs.filter(function(id) { return id !== itemId; });
    });
  }

  if (token && userId) {
    fetch(PB_URL + '/api/collections/users/records/' + userId, {
      headers: { Authorization: 'Bearer ' + token },
    })
    .then(function (r) { return r.ok ? r.json() : {}; })
    .then(function (user) {
      favs = Array.isArray(user.items_favori) ? user.items_favori : [];
      initBtns();
    })
    .catch(initBtns);
  }
})();
