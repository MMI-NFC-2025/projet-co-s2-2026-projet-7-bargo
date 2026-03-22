// @ts-nocheck
// Logique complète de la page session/[id]

(function () {
  var d        = JSON.parse(document.getElementById('page-data').textContent);
  var session  = d.session;
  var PB_URL   = d.PB_URL;
  var TOKEN    = d.token;

  var isEnCours   = d.isEnCours;
  var barActuel   = d.barActuel;
  var isSam       = d.isSam;
  var isHote      = d.isHote;
  var isHoteOrSam = isHote || isSam;
  var samIds      = d.samIds;

  var bars     = d.bars.slice();
  var jeux     = d.jeux.slice();
  var amis     = d.amis.map(function (u) { return Object.assign({}, u, { sam: samIds.indexOf(u.id) >= 0 }); });

  var allBars  = d.allBars;
  var allJeux  = d.allJeux;
  var allUsers = d.allUsers;

  var activeTab     = 'bars';
  var modalMode     = null;
  var paramsEditing = false;

  // ── Helpers ──────────────────────────────────────────────────────
  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function imgUrl(rec, file) {
    return file ? PB_URL + '/api/files/' + rec.collectionName + '/' + rec.id + '/' + file : null;
  }
  function thumb(url, alt) {
    if (!url) return '<div style="width:100%;height:100%;background:#3a3a3a;border-radius:3px;"></div>';
    return '<img src="' + url + '" alt="' + esc(alt) + '" style="width:100%;height:100%;object-fit:cover;" />';
  }
  function avatarHtml(user, size) {
    size = size || 44;
    var url = imgUrl(user, user.avatar);
    if (url) return '<img src="' + url + '" alt="' + esc(user.pseudo) + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />';
    var l = (user.pseudo || user.prenom || '?').charAt(0).toUpperCase();
    return '<div style="width:100%;height:100%;background:#347645;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:' + Math.round(size * 0.38) + 'px;">' + esc(l) + '</div>';
  }
  function card(url, title, sub) {
    return '<div style="display:flex;align-items:center;gap:14px;background:#2c2c2c;border-radius:5px;padding:12px;margin-bottom:10px;">' +
      '<div style="width:50px;height:50px;flex-shrink:0;border-radius:3px;overflow:hidden;">' + thumb(url, title) + '</div>' +
      '<div style="flex:1;min-width:0;"><p style="color:white;font-size:14px;font-weight:500;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(title) + '</p>' +
        (sub ? '<p style="color:rgba(247,241,237,0.5);font-size:12px;margin:2px 0 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(sub) + '</p>' : '') +
      '</div></div>';
  }
  function empty(msg) {
    return '<p style="color:rgba(247,241,237,0.5);font-size:14px;font-weight:500;margin:0;">' + esc(msg) + '</p>';
  }
  function param(label, value) {
    return '<div><p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:rgba(247,241,237,0.5);margin:0 0 4px;">' + esc(label) + '</p><p style="color:white;font-size:15px;font-weight:500;margin:0;">' + esc(value) + '</p></div>';
  }
  function editParam(label, id, type, value) {
    return '<div><p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:rgba(247,241,237,0.5);margin:0 0 4px;">' + esc(label) + '</p>' +
      '<input id="' + id + '" type="' + type + '" value="' + esc(value) + '" style="width:100%;background:#2c2c2c;border:1px solid rgba(255,255,255,0.15);border-radius:3px;padding:7px 12px;color:white;font-size:14px;font-weight:500;outline:none;box-sizing:border-box;" /></div>';
  }
  function editParamArea(label, id, value) {
    return '<div><p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:rgba(247,241,237,0.5);margin:0 0 4px;">' + esc(label) + '</p>' +
      '<textarea id="' + id + '" rows="3" style="width:100%;background:#2c2c2c;border:1px solid rgba(255,255,255,0.15);border-radius:3px;padding:7px 12px;color:white;font-size:14px;font-weight:500;outline:none;resize:none;box-sizing:border-box;">' + esc(value) + '</textarea></div>';
  }
  function bigBarCard(bar, isCurrent) {
    var url    = imgUrl(bar, bar.img);
    var border = isCurrent ? 'border:2px solid #72c073;' : 'border:2px solid rgba(255,255,255,0.08);';
    return '<div style="background:#2c2c2c;border-radius:5px;overflow:hidden;' + border + '">' +
      '<div style="width:100%;height:120px;overflow:hidden;">' +
      (url ? '<img src="' + url + '" alt="' + esc(bar.nom) + '" style="width:100%;height:100%;object-fit:cover;" />'
           : '<div style="width:100%;height:100%;background:#3a3a3a;"></div>') +
      '</div>' +
      '<div style="padding:12px 14px;">' +
        '<p style="color:white;font-size:15px;font-weight:600;margin:0 0 3px;">' + esc(bar.nom) + '</p>' +
        (bar.adresse ? '<p style="color:rgba(247,241,237,0.5);font-size:12px;font-weight:500;margin:0;">' + esc(bar.adresse) + '</p>' : '') +
      '</div>' +
    '</div>';
  }
  function amiCard(ami, isSamRole) {
    var size  = 44;
    var avUrl = imgUrl(ami, ami.avatar);
    var avHtml = avUrl
      ? '<img src="' + avUrl + '" alt="' + esc(ami.pseudo) + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />'
      : '<div style="width:100%;height:100%;background:#347645;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:' + Math.round(size * 0.38) + 'px;">' + esc((ami.pseudo || ami.prenom || '?').charAt(0).toUpperCase()) + '</div>';
    return '<div style="display:flex;align-items:center;gap:12px;background:#2c2c2c;border-radius:5px;padding:12px;margin-bottom:10px;">' +
      '<div style="width:44px;height:44px;flex-shrink:0;border-radius:50%;overflow:hidden;">' + avHtml + '</div>' +
      '<div style="flex:1;min-width:0;"><p style="color:white;font-size:14px;font-weight:500;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(ami.pseudo || (ami.prenom + ' ' + ami.nom).trim() || 'Utilisateur') + '</p>' +
        (isSamRole ? '<span style="display:inline-block;background:#f7f1ed;color:#094736;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;margin-top:4px;">SAM</span>' : '') +
      '</div>' +
    '</div>';
  }
  function bonusRow(label, value) {
    return '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">' +
      '<p style="color:rgba(247,241,237,0.7);font-size:14px;font-weight:500;margin:0;">' + esc(label) + '</p>' +
      '<p style="color:white;font-size:14px;font-weight:600;margin:0;">' + esc(value) + '</p>' +
    '</div>';
  }

  // ── Tab switching ─────────────────────────────────────────────────
  function switchTab(tab) {
    activeTab     = tab;
    paramsEditing = false;
    document.querySelectorAll('.final-tab').forEach(function (btn) {
      var active = btn.dataset.tab === tab;
      btn.style.color             = active ? '#72c073' : 'rgba(247,241,237,0.5)';
      btn.style.borderBottomColor = active ? '#72c073' : 'transparent';
    });
    var bottomBar = document.getElementById('bottom-bar');
    if (bottomBar) bottomBar.style.display = isEnCours ? 'none' : 'block';
    if (!isEnCours) {
      var addBtn = document.getElementById('btn-add-more');
      if (addBtn) {
        if (tab === 'params') {
          addBtn.textContent   = 'Modifier';
          addBtn.style.opacity = isHote ? '1' : '0.3';
          addBtn.style.cursor  = isHote ? 'pointer' : 'not-allowed';
          addBtn.title         = isHote ? '' : "Seul l'hôte peut modifier les paramètres";
        } else {
          addBtn.textContent   = '+ Ajouter';
          var blocked = !isHote;
          addBtn.style.opacity = blocked ? '0.3' : '1';
          addBtn.style.cursor  = blocked ? 'not-allowed' : 'pointer';
          addBtn.title         = blocked ? "Seul l'hôte peut modifier la session" : '';
        }
      }
    }
    renderTab();
  }

  function renderTab() {
    isEnCours ? renderTabEnCours() : renderTabEnAttente();
  }

  // ── Rendu onglets (en attente) ────────────────────────────────────
  function renderTabEnAttente() {
    var el = document.getElementById('tab-content');
    if (activeTab === 'bars') {
      if (!bars.length) { el.innerHTML = empty('Aucun bar sélectionné.'); return; }
      el.innerHTML = bars.map(function (bar) { return card(imgUrl(bar, bar.img), bar.nom, bar.adresse); }).join('');
    } else if (activeTab === 'jeux') {
      if (!jeux.length) { el.innerHTML = empty('Aucun jeu sélectionné.'); return; }
      el.innerHTML = jeux.map(function (jeu) { return card(imgUrl(jeu, jeu.img), jeu.nom, jeu.description); }).join('');
    } else if (activeTab === 'amis') {
      if (!amis.length) { el.innerHTML = empty('Aucun ami invité.'); return; }
      el.innerHTML = amis.map(function (ami) { return amiCard(ami, ami.sam); }).join('');
    } else {
      if (!paramsEditing) {
        el.innerHTML = '<div style="display:flex;flex-direction:column;gap:16px;">' +
          param('Nom',             session.nom || '—') +
          param('Date',            session.date || '—') +
          param('Heure de départ', session.heure_debut || '—') +
          (session.description ? param('Description', session.description) : '') +
          (isHote ? '<div style="margin-top:8px;"><button id="btn-delete-session" style="background:#ef4444;border:none;color:white;font-size:13px;font-weight:500;height:36px;padding:0 18px;border-radius:3px;cursor:pointer;">Supprimer la session</button></div>' : '') +
        '</div>';
        if (isHote) document.getElementById('btn-delete-session')?.addEventListener('click', deleteSession);
      } else {
        el.innerHTML = '<div style="display:flex;flex-direction:column;gap:14px;">' +
          editParam('Nom',             'p-nom',   'text', session.nom || '') +
          editParam('Date',            'p-date',  'date', session.date || '') +
          editParam('Heure de départ', 'p-heure', 'time', session.heure_debut || '') +
          editParamArea('Description', 'p-desc', session.description || '') +
        '</div>';
      }
    }
  }

  // ── Rendu onglets (en cours) ──────────────────────────────────────
  function renderTabEnCours() {
    var el = document.getElementById('tab-content');
    if (activeTab === 'bars') {
      if (!bars.length) { el.innerHTML = empty('Aucun bar dans cette session.'); return; }
      var cur  = Math.min(barActuel, bars.length - 1);
      var next = cur + 1 < bars.length ? bars[cur + 1] : null;
      var html = '<div style="margin-bottom:20px;">';
      html += '<p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#72c073;margin:0 0 10px;">Bar actuel</p>';
      html += bigBarCard(bars[cur], true) + '</div>';
      if (next) {
        html += '<div style="margin-bottom:20px;">';
        html += '<p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:rgba(247,241,237,0.4);margin:0 0 10px;">Prochain bar</p>';
        html += bigBarCard(next, false) + '</div>';
      }
      if (cur < bars.length - 1 && isHoteOrSam) {
        html += '<button id="btn-next-bar" style="width:100%;height:42px;background:#347645;border:none;color:white;font-size:14px;font-weight:500;cursor:pointer;border-radius:3px;margin-top:4px;">Passer au prochain bar →</button>';
      } else if (cur >= bars.length - 1) {
        html += '<p style="color:rgba(247,241,237,0.4);font-size:13px;font-weight:500;margin:8px 0 0;text-align:center;">Dernier bar de la session</p>';
      }
      el.innerHTML = html;
      document.getElementById('btn-next-bar')?.addEventListener('click', passerProchainBar);

    } else if (activeTab === 'jeux') {
      if (!jeux.length) { el.innerHTML = empty('Aucun jeu sélectionné.'); return; }
      el.innerHTML = jeux.map(function (jeu) {
        var url  = imgUrl(jeu, jeu.img);
        var href = jeu.type_du_jeux === 'questionaire' ? '/jeux_questionaire?session=' + session.id : '/jeux';
        return '<div style="display:flex;align-items:center;gap:14px;background:#2c2c2c;border-radius:5px;padding:12px;margin-bottom:10px;">' +
          '<div style="width:50px;height:50px;flex-shrink:0;border-radius:3px;overflow:hidden;">' + thumb(url, jeu.nom) + '</div>' +
          '<div style="flex:1;min-width:0;"><p style="color:white;font-size:14px;font-weight:500;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(jeu.nom) + '</p></div>' +
          '<a href="' + href + '" style="flex-shrink:0;height:32px;padding:0 16px;font-size:13px;font-weight:500;text-decoration:none;display:flex;align-items:center;border-radius:3px;background:#347645;color:white;">Jouer</a>' +
        '</div>';
      }).join('');

    } else if (activeTab === 'amis') {
      if (!amis.length) { el.innerHTML = empty('Aucun ami invité.'); return; }
      var samList   = amis.filter(function (a) { return samIds.indexOf(a.id) >= 0; });
      var otherList = amis.filter(function (a) { return samIds.indexOf(a.id) < 0; });
      var html = '';
      if (samList.length) {
        html += '<p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#72c073;margin:0 0 8px;">SAM</p>';
        html += samList.map(function (a) { return amiCard(a, true); }).join('');
        if (otherList.length) html += '<div style="height:1px;background:rgba(255,255,255,0.1);margin:12px 0;"></div>';
      }
      html += otherList.map(function (a) { return amiCard(a, false); }).join('');
      el.innerHTML = html;

    } else {
      el.innerHTML = '<div style="display:flex;flex-direction:column;gap:16px;">' +
        param('Nom',             session.nom || '—') +
        param('Date',            session.date || '—') +
        param('Heure de départ', session.heure_debut || '—') +
        (session.description ? param('Description', session.description) : '') +
        (isHoteOrSam ? '<div style="margin-top:8px;"><button id="btn-stop-session" style="background:#f59e0b;border:none;color:white;font-size:13px;font-weight:600;height:36px;padding:0 18px;border-radius:3px;cursor:pointer;">⏹ Arrêter la session</button></div>' : '') +
      '</div>';
      document.getElementById('btn-stop-session')?.addEventListener('click', function () {
        document.getElementById('stop-modal').style.display = 'flex';
      });
    }
  }

  // ── Session API calls ─────────────────────────────────────────────
  function deleteSession() {
    document.getElementById('delete-modal').style.display = 'flex';
  }

  async function confirmDeleteSession() {
    var btn = document.getElementById('delete-modal-confirm');
    btn.disabled = true; btn.textContent = 'Suppression…';
    try {
      await fetch(PB_URL + '/api/collections/session_barathon/records/' + session.id, {
        method: 'DELETE', headers: { Authorization: 'Bearer ' + TOKEN }
      });
    } catch (_) {}
    window.location.href = '/session';
  }

  async function patchSessionParams(nom, date, heure_debut, description) {
    try {
      await fetch(PB_URL + '/api/collections/session_barathon/records/' + session.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + TOKEN },
        body: JSON.stringify({ nom: nom, date_session: date, heur_depart: heure_debut, description: description }),
      });
    } catch (_) {}
  }

  async function lancerSession() {
    var btn = document.getElementById('btn-launch-session');
    if (btn) { btn.disabled = true; btn.textContent = 'Lancement…'; }
    try {
      await fetch(PB_URL + '/api/collections/session_barathon/records/' + session.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + TOKEN },
        body: JSON.stringify({ etat_session: 'en_cours' }),
      });
    } catch (_) {}
    isEnCours = true;
    var bottomBar = document.getElementById('bottom-bar');
    if (bottomBar) bottomBar.style.display = 'none';
    renderTab();
  }

  async function passerProchainBar() {
    barActuel = Math.min(barActuel + 1, bars.length - 1);
    try {
      await fetch(PB_URL + '/api/collections/session_barathon/records/' + session.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + TOKEN },
        body: JSON.stringify({ bar_actuel: barActuel }),
      });
    } catch (_) {}
    renderTab();
    refreshMapMarkers();
  }

  async function confirmStopSession() {
    var btn = document.getElementById('stop-modal-confirm');
    btn.disabled = true; btn.textContent = 'Arrêt…';
    try {
      await fetch(PB_URL + '/api/collections/session_barathon/records/' + session.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + TOKEN },
        body: JSON.stringify({ etat_session: 'fini' }),
      });
    } catch (_) {}
    var barsVisited = barActuel + 1;
    var barsBonus   = barsVisited * 5;
    var samBonus    = isSam  ? 50 : 0;
    var hoteBonus   = isHote ? 30 : 0;
    var totalBonus  = barsBonus + samBonus + hoteBonus;
    if (totalBonus > 0) {
      try {
        var userRes  = await fetch(PB_URL + '/api/collections/users/records/' + d.userId, { headers: { Authorization: 'Bearer ' + TOKEN } });
        var userData = await userRes.json();
        await fetch(PB_URL + '/api/collections/users/records/' + d.userId, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + TOKEN },
          body: JSON.stringify({ points: (userData.points ?? 0) + totalBonus }),
        });
      } catch (_) {}
    }
    var memberPoints = [];
    for (var i = 0; i < amis.length; i++) {
      try {
        var r = await fetch(PB_URL + '/api/collections/users/records/' + amis[i].id, { headers: { Authorization: 'Bearer ' + TOKEN } });
        var u = await r.json();
        memberPoints.push({ ami: amis[i], points: u.points ?? 0 });
      } catch (_) { memberPoints.push({ ami: amis[i], points: 0 }); }
    }
    memberPoints.sort(function(a, b) { return b.points - a.points; });
    document.getElementById('stop-modal').style.display = 'none';
    showEndScreen(barsBonus, samBonus, hoteBonus, totalBonus, memberPoints);
  }

  function showEndScreen(barsBonus, samBonus, hoteBonus, totalBonus, memberPoints) {
    var bonusHtml =
      '<div style="background:#252525;border-radius:5px;padding:20px 24px;margin-bottom:28px;">' +
        '<p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#72c073;margin:0 0 16px;">Vos bonus de fin de session</p>' +
        bonusRow('Bars visités (' + (barActuel + 1) + ')', '+' + barsBonus + ' pts') +
        (samBonus  ? bonusRow('Bonus SAM',  '+' + samBonus  + ' pts') : '') +
        (hoteBonus ? bonusRow('Bonus Hôte', '+' + hoteBonus + ' pts') : '') +
        '<div style="height:1px;background:rgba(255,255,255,0.1);margin:14px 0;"></div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center;">' +
          '<p style="color:white;font-size:15px;font-weight:600;margin:0;">Total bonus</p>' +
          '<p style="color:#72c073;font-size:22px;font-weight:700;margin:0;">+' + totalBonus + ' pts</p>' +
        '</div>' +
      '</div>';
    var membersHtml = '';
    if (memberPoints.length) {
      membersHtml += '<p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:rgba(247,241,237,0.4);margin:0 0 12px;">Classement des membres</p>';
      membersHtml += memberPoints.map(function(mp, i) {
        return '<div style="display:flex;align-items:center;gap:12px;background:#2c2c2c;border-radius:5px;padding:12px;margin-bottom:8px;">' +
          '<span style="color:rgba(247,241,237,0.35);font-size:12px;font-weight:700;width:20px;text-align:center;flex-shrink:0;">' + (i + 1) + '</span>' +
          '<div style="width:36px;height:36px;flex-shrink:0;border-radius:50%;overflow:hidden;">' + avatarHtml(mp.ami, 36) + '</div>' +
          '<p style="color:white;font-size:14px;font-weight:500;margin:0;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(mp.ami.pseudo || (mp.ami.prenom + ' ' + mp.ami.nom).trim() || 'Utilisateur') + '</p>' +
          '<p style="color:#72c073;font-size:15px;font-weight:700;margin:0;flex-shrink:0;">' + mp.points + ' pts</p>' +
        '</div>';
      }).join('');
    }
    document.getElementById('end-bonus-card').innerHTML   = bonusHtml;
    document.getElementById('end-members-list').innerHTML = membersHtml;
    document.getElementById('end-screen').style.display   = 'block';
  }

  // ── Modal ─────────────────────────────────────────────────────────
  function openModal(mode) {
    modalMode = mode;
    var titles = { bars: 'Ajouter des bars', jeux: 'Ajouter des jeux', amis: 'Ajouter des amis' };
    document.getElementById('modal-title').textContent = titles[mode] || 'Ajouter';
    document.getElementById('modal-search').value      = '';
    document.getElementById('add-modal').style.display = 'flex';
    renderModal('');
  }
  function closeModal() {
    document.getElementById('add-modal').style.display = 'none';
    renderTab();
  }
  function renderModal(q) {
    q = (q || '').toLowerCase();
    var list = document.getElementById('modal-list');
    var src  = modalMode === 'bars' ? allBars : modalMode === 'jeux' ? allJeux : allUsers;
    var selFn = function (id) {
      if (modalMode === 'bars') return bars.some(function (b) { return b.id === id; });
      if (modalMode === 'jeux') return jeux.some(function (j) { return j.id === id; });
      return amis.some(function (a) { return a.id === id; });
    };
    var filtered = src.filter(function (item) {
      var txt = (item.nom || item.pseudo || '') + ' ' + (item.adresse || item.description || item.prenom || '');
      return !q || txt.toLowerCase().includes(q);
    });
    list.innerHTML = filtered.map(function (item) {
      var s      = selFn(item.id);
      var name   = esc(item.nom || item.pseudo || (item.prenom + ' ' + (item.nom || '')).trim() || 'Item');
      var sub    = esc(item.adresse || item.description || '');
      var file   = item.img || item.avatar || null;
      var isUser = modalMode === 'amis';
      var thumbEl = isUser
        ? '<div style="width:44px;height:44px;flex-shrink:0;border-radius:50%;overflow:hidden;">' + avatarHtml(item, 44) + '</div>'
        : '<div style="width:50px;height:50px;flex-shrink:0;border-radius:3px;overflow:hidden;">' + thumb(imgUrl(item, file), name) + '</div>';
      return '<div style="display:flex;align-items:center;gap:14px;background:#2c2c2c;border-radius:5px;padding:12px;margin-bottom:8px;">' +
        thumbEl +
        '<div style="flex:1;min-width:0;"><p style="color:white;font-size:14px;font-weight:500;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + name + '</p>' +
          (sub ? '<p style="color:rgba(247,241,237,0.5);font-size:12px;margin:2px 0 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + sub + '</p>' : '') +
        '</div>' +
        '<button data-action="modal-toggle" data-id="' + item.id + '" style="flex-shrink:0;height:32px;padding:0 14px;font-size:13px;font-weight:500;border:none;cursor:pointer;border-radius:3px;background:' + (s ? '#72c073' : '#347645') + ';color:' + (s ? '#094736' : 'white') + ';">' + (s ? '✓' : '+') + '</button>' +
      '</div>';
    }).join('') || empty('Aucun résultat.');
    list.querySelectorAll('[data-action="modal-toggle"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        modalToggle(btn.dataset.id);
        renderModal(document.getElementById('modal-search').value);
      });
    });
  }
  function modalToggle(id) {
    if (modalMode === 'bars') {
      var idx = bars.findIndex(function (b) { return b.id === id; });
      if (idx >= 0) bars.splice(idx, 1);
      else { var b = allBars.find(function (b) { return b.id === id; }); if (b) bars.push(b); }
    } else if (modalMode === 'jeux') {
      var idx = jeux.findIndex(function (j) { return j.id === id; });
      if (idx >= 0) jeux.splice(idx, 1);
      else { var j = allJeux.find(function (j) { return j.id === id; }); if (j) jeux.push(j); }
    } else {
      var idx = amis.findIndex(function (a) { return a.id === id; });
      if (idx >= 0) amis.splice(idx, 1);
      else { var u = allUsers.find(function (u) { return u.id === id; }); if (u) amis.push(Object.assign({}, u, { sam: false })); }
    }
    patchSession();
    if (modalMode === 'bars') refreshMapMarkers();
  }
  async function patchSession() {
    try {
      await fetch(PB_URL + '/api/collections/session_barathon/records/' + session.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + TOKEN },
        body: JSON.stringify({
          id_bar:     bars.map(function (b) { return b.id; }),
          id_jeux:    jeux.length > 0 ? jeux[0].id : null,
          id_inviter: amis.map(function (a) { return a.id; }),
          id_sam:     amis.filter(function (a) { return a.sam; }).map(function (a) { return a.id; }),
        }),
      });
    } catch (_) {}
  }

  // ── Carte Leaflet ─────────────────────────────────────────────────
  var leafletMarkers = [];
  function initMap() {
    var mapEl = document.getElementById('session-map');
    mapEl.innerHTML = '';
    function setup() {
      var center = [47.5072, 6.7955];
      window._sessionMap = L.map('session-map').setView(center, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(window._sessionMap);
      addMarkers();
    }
    if (window.L) { setup(); return; }
    var link  = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    var s    = document.createElement('script');
    s.src    = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    s.onload = setup;
    document.head.appendChild(s);
  }
  function addMarkers() {
    var map = window._sessionMap;
    if (!map) return;
    leafletMarkers.forEach(function (m) { m.remove(); });
    leafletMarkers = [];
    var barsToShow = isEnCours ? bars.slice(Math.min(barActuel, bars.length - 1), Math.min(barActuel, bars.length - 1) + 2) : bars;
    var withCoords = barsToShow.filter(function (b) { return b.lat && b.lon; });
    withCoords.forEach(function (bar, idx) {
      var isCurrent = isEnCours && idx === 0;
      var m = L.marker([bar.lat, bar.lon]).addTo(map)
        .bindPopup('<strong style="color:' + (isCurrent ? '#72c073' : '#347645') + '">' + esc(bar.nom) + '</strong><br>' + esc(bar.adresse));
      leafletMarkers.push(m);
    });
    if (withCoords.length > 0) map.fitBounds(L.featureGroup(leafletMarkers).getBounds().pad(0.3));
  }
  function refreshMapMarkers() {
    if (window._sessionMap) addMarkers();
  }

  // ── Événements ───────────────────────────────────────────────────
  document.querySelectorAll('.final-tab').forEach(function (btn) {
    btn.addEventListener('click', function () { switchTab(btn.dataset.tab); });
  });

  document.getElementById('btn-add-more')?.addEventListener('click', function () {
    if (activeTab === 'params') {
      if (!isHote) return;
      if (!paramsEditing) {
        paramsEditing    = true;
        this.textContent = 'Confirmer';
        renderTab();
      } else {
        var nom   = document.getElementById('p-nom')?.value   ?? session.nom;
        var date  = document.getElementById('p-date')?.value  ?? session.date;
        var heure = document.getElementById('p-heure')?.value ?? session.heure_debut;
        var desc  = document.getElementById('p-desc')?.value  ?? session.description;
        session.nom = nom; session.date = date; session.heure_debut = heure; session.description = desc;
        patchSessionParams(nom, date, heure, desc);
        paramsEditing    = false;
        this.textContent = 'Modifier';
        renderTab();
      }
      return;
    }
    if (!isHote) return;
    openModal(activeTab);
  });

  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-confirm').addEventListener('click', closeModal);
  document.getElementById('add-modal').addEventListener('click', function (e) { if (e.target === this) closeModal(); });
  document.getElementById('modal-search').addEventListener('input', function () { renderModal(this.value); });

  document.getElementById('delete-modal-confirm').addEventListener('click', confirmDeleteSession);
  document.getElementById('delete-modal-cancel').addEventListener('click', function () { document.getElementById('delete-modal').style.display = 'none'; });
  document.getElementById('delete-modal').addEventListener('click', function (e) { if (e.target === this) this.style.display = 'none'; });

  document.getElementById('btn-launch-session')?.addEventListener('click', lancerSession);

  document.getElementById('stop-modal-confirm')?.addEventListener('click', confirmStopSession);
  document.getElementById('stop-modal-cancel')?.addEventListener('click', function () { document.getElementById('stop-modal').style.display = 'none'; });
  document.getElementById('stop-modal')?.addEventListener('click', function (e) { if (e.target === this) this.style.display = 'none'; });

  // ── Init ─────────────────────────────────────────────────────────
  renderTab();
  initMap();
})();
