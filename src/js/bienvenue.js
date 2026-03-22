(function () {
  var cfg = window.__ONBOARDING__;
  if (!cfg) return;

  var pbUrl    = cfg.pbUrl;
  var pbToken  = cfg.pbToken;
  var pbUserId = cfg.pbUserId;
  var allUsers = cfg.allUsers;

  var TOTAL        = 4;
  var cur          = 1;
  var selectedAmis = [];
  var avatarFile   = null;

  var leftTitles = ['Photo de<br>profil', 'Informations<br>personnelles', 'Bio &amp;<br>Réseaux', 'Vos<br>amis'];

  function esc(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function $(id) { return document.getElementById(id); }

  // ── Progress ─────────────────────────────────────────────
  function updateProgress(n) {
    cur = n;

    var lt = $('left-title');
    if (lt) lt.innerHTML = leftTitles[n - 1];

    var pct = ((n - 1) / TOTAL) * 100;
    var bar = $('progress-bar');
    if (bar) bar.style.width = pct + '%';

    document.querySelectorAll('.step-circle').forEach(function (el) {
      var s = parseInt(el.dataset.step);
      var num = el.querySelector('.step-num');
      var chk = el.querySelector('.step-check');
      if (s < n) {
        el.style.background = '#72c073';
        el.style.borderColor = '#72c073';
        if (num) num.style.display = 'none';
        if (chk) chk.style.display = 'block';
      } else if (s === n) {
        el.style.background = 'white';
        el.style.borderColor = 'white';
        if (num) { num.style.display = 'block'; num.style.color = '#094736'; }
        if (chk) chk.style.display = 'none';
      } else {
        el.style.background = 'transparent';
        el.style.borderColor = 'rgba(255,255,255,0.3)';
        if (num) { num.style.display = 'block'; num.style.color = 'rgba(255,255,255,0.3)'; }
        if (chk) chk.style.display = 'none';
      }
    });

    document.querySelectorAll('.step-line').forEach(function (line, i) {
      line.style.background = i < n - 1 ? '#72c073' : 'rgba(255,255,255,0.25)';
    });
  }

  function showPanel(n) {
    for (var i = 1; i <= TOTAL; i++) {
      var p = $('panel-' + i);
      if (p) {
        if (i === n) {
          p.classList.remove('hidden');
          p.style.display = 'flex';
        } else {
          p.classList.add('hidden');
          p.style.display = 'none';
        }
      }
    }
    updateProgress(n);
    window.scrollTo(0, 0);
  }

  // ── Avatar ───────────────────────────────────────────────
  var avatarInput = $('avatar-input');
  if (avatarInput) {
    avatarInput.addEventListener('change', function () {
      var file = this.files[0];
      if (!file) return;
      avatarFile = file;
      var reader = new FileReader();
      reader.onload = function (e) {
        var preview = $('avatar-preview');
        preview.innerHTML = '<img src="' + e.target.result + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />';
        preview.style.border = '2px solid #72c073';
      };
      reader.readAsDataURL(file);
    });
  }

  // ── API ──────────────────────────────────────────────────
  async function patchUser(data) {
    try {
      await fetch(pbUrl + '/api/collections/users/records/' + pbUserId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + pbToken },
        body: JSON.stringify(data),
      });
    } catch (_) {}
  }

  async function uploadAvatar() {
    if (!avatarFile) return;
    try {
      var fd = new FormData();
      fd.append('avatar', avatarFile);
      await fetch(pbUrl + '/api/collections/users/records/' + pbUserId, {
        method: 'PATCH',
        headers: { Authorization: 'Bearer ' + pbToken },
        body: fd,
      });
    } catch (_) {}
  }

  // ── Save & Next ──────────────────────────────────────────
  window.saveAndNext = async function (step) {
    if (step === 1) await uploadAvatar();
    if (step === 2) {
      var d = {};
      var prenom = ($('f-prenom') ? $('f-prenom').value : '').trim(); if (prenom) d.prenom = prenom;
      var nom    = ($('f-nom')    ? $('f-nom').value    : '').trim(); if (nom)    d.nom    = nom;
      var age    = parseInt(($('f-age') ? $('f-age').value : '0')) || null; if (age && age >= 18) d.age = age;
      var ville  = ($('f-ville')  ? $('f-ville').value  : '').trim(); if (ville)  d.ville  = ville;
      if (Object.keys(d).length) await patchUser(d);
    }
    if (step === 3) {
      var d2 = {};
      var desc    = ($('f-description') ? $('f-description').value : '').trim(); if (desc)    d2.description = desc;
      var insta   = ($('f-insta')       ? $('f-insta').value       : '').trim(); if (insta)   d2.insta       = insta;
      var facbook = ($('f-facbook')     ? $('f-facbook').value     : '').trim(); if (facbook) d2.facbook     = facbook;
      var discord = ($('f-discord')     ? $('f-discord').value     : '').trim(); if (discord) d2.discord     = discord;
      if (Object.keys(d2).length) await patchUser(d2);
    }
    if (step === 4) {
      // Envoyer une demande d'ami à chaque utilisateur sélectionné
      for (var i = 0; i < selectedAmis.length; i++) {
        var targetId = selectedAmis[i];
        try {
          // Récupérer les demandes existantes de l'utilisateur cible
          var r = await fetch(pbUrl + '/api/collections/users/records/' + targetId, {
            headers: { Authorization: 'Bearer ' + pbToken }
          });
          if (r.ok) {
            var targetUser = await r.json();
            var existing   = Array.isArray(targetUser.demande_amies) ? targetUser.demande_amies : [];
            if (existing.indexOf(pbUserId) < 0) {
              existing.push(pbUserId);
              await fetch(pbUrl + '/api/collections/users/records/' + targetId, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + pbToken },
                body: JSON.stringify({ demande_amies: existing }),
              });
            }
          }
        } catch (_) {}
      }
      window.location.href = '/profil';
      return;
    }
    showPanel(step + 1);
  };

  window.skipStep = function (step) {
    if (step >= TOTAL) { window.location.href = '/profil'; return; }
    showPanel(step + 1);
  };

  // ── Amis ─────────────────────────────────────────────────
  function imgUrl(u) {
    return u.avatar ? pbUrl + '/api/files/' + u.collectionName + '/' + u.id + '/' + u.avatar : null;
  }

  function av(u, size) {
    size = size || 36;
    var url = imgUrl(u);
    if (url) return '<img src="' + url + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />';
    var l = (u.pseudo || u.prenom || '?').charAt(0).toUpperCase();
    return '<div style="width:100%;height:100%;background:#094736;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:' + Math.round(size * 0.38) + 'px;">' + esc(l) + '</div>';
  }

  function renderChips() {
    var el = $('ami-chips');
    if (!el) return;
    el.innerHTML = selectedAmis.map(function (id) {
      var u = allUsers.find(function (x) { return x.id === id; });
      if (!u) return '';
      return '<span style="display:inline-flex;align-items:center;gap:5px;background:#347645;color:white;font-size:12px;font-weight:500;padding:3px 10px 3px 4px;border-radius:20px;">' +
        '<span style="width:22px;height:22px;border-radius:50%;overflow:hidden;flex-shrink:0;">' + av(u, 22) + '</span>' +
        '📨 ' + esc(u.pseudo || u.prenom || 'User') +
        '<button data-rid="' + id + '" style="background:transparent;border:none;color:rgba(255,255,255,0.55);cursor:pointer;font-size:15px;padding:0;line-height:1;margin-left:1px;">×</button>' +
      '</span>';
    }).join('');
    el.querySelectorAll('[data-rid]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectedAmis = selectedAmis.filter(function (id) { return id !== btn.dataset.rid; });
        renderChips();
        var s = $('ami-search'); renderList(s ? s.value : '');
      });
    });
  }

  function renderList(q) {
    var el = $('ami-list');
    if (!el) return;
    q = (q || '').toLowerCase();
    var filtered = allUsers.filter(function (u) {
      return !q || (u.pseudo + ' ' + u.prenom + ' ' + u.nom).toLowerCase().includes(q);
    }).slice(0, 12);

    el.innerHTML = filtered.map(function (u) {
      var sel = selectedAmis.indexOf(u.id) >= 0;
      return '<div style="display:flex;align-items:center;gap:12px;background:#2c2c2c;border-radius:6px;padding:10px 14px;">' +
        '<div style="width:40px;height:40px;flex-shrink:0;border-radius:50%;overflow:hidden;">' + av(u, 40) + '</div>' +
        '<p style="color:white;font-size:14px;font-weight:500;margin:0;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(u.pseudo || (u.prenom + ' ' + u.nom).trim() || 'Utilisateur') + '</p>' +
        '<button data-uid="' + u.id + '" style="flex-shrink:0;height:32px;padding:0 14px;font-size:12px;font-weight:600;border:none;cursor:pointer;border-radius:20px;transition:all 0.15s;background:' + (sel ? '#347645' : '#094736') + ';color:white;">' + (sel ? '✓ Demande envoyée' : '+ Envoyer une demande') + '</button>' +
      '</div>';
    }).join('') || '<p style="color:rgba(255,255,255,0.3);font-size:13px;margin:0;">Aucun résultat.</p>';

    el.querySelectorAll('[data-uid]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var uid = btn.dataset.uid;
        var idx = selectedAmis.indexOf(uid);
        if (idx >= 0) selectedAmis.splice(idx, 1); else selectedAmis.push(uid);
        renderChips();
        var s = $('ami-search'); renderList(s ? s.value : '');
      });
    });
  }

  var amiSearch = $('ami-search');
  if (amiSearch) amiSearch.addEventListener('input', function () { renderList(this.value); });

  showPanel(1);
  renderList('');
})();
