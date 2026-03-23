// @ts-nocheck
(function () {
  var _b = window.__BOUTIQUE__ || {};
  var _a = window.__AUTH__    || {};
  var PB_URL     = _b.PB_URL;
  var perPage    = _b.perPage;
  var activeTab  = _b.activeTab;
  var likeIconSrc     = _b.likeIconSrc;
  var likeFillIconSrc = _b.likeFillIconSrc;
  var isAuth     = !!(_a.token);
  var token      = _a.token;
  var userId     = _a.userId;

  // État client (mis à jour lors des achats/équipements)
  var state = {
    points:   _b.points   || 0,
    possed:   _b.possed   || { decoration_avatar: [], titre: [], theme: [] },
    equipped: _b.equipped || { decoration_avatar: null, titre: null, theme: null },
  };

  var currentTab = activeTab;

  // Champ PB selon le type
  var POSSED_FIELD  = { decoration_avatar: 'possed_avatar_decoration', titre: 'possed_titre', theme: 'possed_theme' };
  var EQUIP_FIELD   = { decoration_avatar: 'equiper_avatar_decoration', titre: 'equiper_titre', theme: 'equiper_theme' };

  // ─── TOAST ──────────────────────────────────────────────────────────────────
  function showToast(msg, ok) {
    var t = document.getElementById('boutique-toast');
    if (!t) return;
    t.textContent = msg;
    t.style.background = ok ? '#094736' : '#b91c1c';
    t.style.opacity    = '1';
    t.style.transform  = 'translateX(-50%) translateY(0)';
    setTimeout(function () {
      t.style.opacity   = '0';
      t.style.transform = 'translateX(-50%) translateY(20px)';
    }, 2800);
  }

  // ─── BOUTON STATE ───────────────────────────────────────────────────────────
  function getState(itemId, itemType, prix) {
    if (!isAuth) return 'connexion';
    if (state.equipped[itemType] === itemId)            return 'equipe';
    if ((state.possed[itemType] || []).includes(itemId)) return 'equiper';
    if (state.points >= prix)                           return 'acheter';
    return 'insuffisant';
  }

  function applyBtnState(btn, s, prix) {
    var labels = {
      equipe:      'Équipé',
      equiper:     'Équiper',
      acheter:     'Acheter — ' + prix + ' pts',
      insuffisant: prix + ' pts requis',
    };
    var classes = {
      equipe:      'bg-primary-600 cursor-default',
      equiper:     'bg-primary-900 cursor-pointer hover:opacity-90',
      acheter:     'bg-neutral-800 cursor-pointer hover:opacity-90',
      insuffisant: 'bg-neutral-300 cursor-not-allowed',
    };
    btn.textContent = labels[s] || labels.acheter;
    btn.disabled    = (s === 'equipe' || s === 'insuffisant');
    btn.dataset.state = s;
    // reset classes
    ['bg-primary-600','bg-primary-900','bg-neutral-800','bg-neutral-300',
     'cursor-default','cursor-pointer','cursor-not-allowed','hover:opacity-90'].forEach(function (c) {
      btn.classList.remove(c);
    });
    (classes[s] || classes.acheter).split(' ').forEach(function (c) { btn.classList.add(c); });
  }

  // ─── ACHAT ──────────────────────────────────────────────────────────────────
  async function buyItem(btn) {
    var itemId   = btn.dataset.itemId;
    var itemType = btn.dataset.itemType;
    var prix     = parseInt(btn.dataset.itemPrix, 10);
    var field    = POSSED_FIELD[itemType];

    if (!field || state.points < prix) return;

    btn.disabled    = true;
    btn.textContent = '...';

    var newPossed = (state.possed[itemType] || []).concat([itemId]);
    var newPoints = state.points - prix;

    try {
      var res = await fetch(PB_URL + '/api/collections/users/records/' + userId, {
        method:  'PATCH',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ [field]: newPossed, points: newPoints }),
      });
      if (!res.ok) throw new Error();
      // Mettre à jour l'état local
      state.possed[itemType] = newPossed;
      state.points = newPoints;
      // Mettre à jour l'affichage des points
      var ptEl = document.getElementById('user-points-display');
      if (ptEl) ptEl.textContent = newPoints + ' pts';
      // Mettre à jour tous les boutons de ce même item (mobile + desktop)
      document.querySelectorAll('.boutique-action-btn[data-item-id="' + itemId + '"]').forEach(function (b) {
        applyBtnState(b, 'equiper', prix);
      });
      showToast('Achat réussi ! Vous pouvez maintenant équiper cet article.', true);
    } catch {
      applyBtnState(btn, getState(itemId, itemType, prix), prix);
      showToast('Erreur lors de l\'achat. Réessayez.', false);
    }
  }

  // ─── ÉQUIPEMENT ─────────────────────────────────────────────────────────────
  async function equipItem(btn) {
    var itemId   = btn.dataset.itemId;
    var itemType = btn.dataset.itemType;
    var prix     = parseInt(btn.dataset.itemPrix, 10);
    var field    = EQUIP_FIELD[itemType];

    if (!field) return;

    btn.disabled    = true;
    btn.textContent = '...';

    try {
      var res = await fetch(PB_URL + '/api/collections/users/records/' + userId, {
        method:  'PATCH',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ [field]: itemId }),
      });
      if (!res.ok) throw new Error();
      // Remettre l'ancien item équipé en "Équiper"
      var oldId = state.equipped[itemType];
      if (oldId && oldId !== itemId) {
        document.querySelectorAll('.boutique-action-btn[data-item-id="' + oldId + '"]').forEach(function (b) {
          applyBtnState(b, 'equiper', parseInt(b.dataset.itemPrix, 10));
        });
      }
      state.equipped[itemType] = itemId;
      // Mettre à jour tous les boutons de cet item
      document.querySelectorAll('.boutique-action-btn[data-item-id="' + itemId + '"]').forEach(function (b) {
        applyBtnState(b, 'equipe', prix);
      });
      showToast('Article équipé ! Votre profil a été mis à jour.', true);
    } catch {
      applyBtnState(btn, 'equiper', prix);
      showToast('Erreur lors de l\'équipement. Réessayez.', false);
    }
  }

  // ─── CLIC ───────────────────────────────────────────────────────────────────
  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest('.boutique-action-btn');
    if (!btn || !isAuth) return;
    var s = btn.dataset.state;
    if (s === 'acheter')  buyItem(btn);
    if (s === 'equiper')  equipItem(btn);
  });

  // ─── CARD HTML (chargement dynamique par onglet) ─────────────────────────────
  function esc(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function cardHtml(p) {
    var imgField = p.type === 'decoration_avatar' ? p.type_decoration_avatar :
                   p.type === 'theme'             ? p.type_them              : null;
    var imgSrc   = imgField ? PB_URL + '/api/files/' + p.collectionName + '/' + p.id + '/' + imgField : '';
    var prix     = p.prix || 0;
    var s        = getState(p.id, p.type, prix);

    var btnLabel = s === 'equipe'      ? 'Équipé'                     :
                   s === 'equiper'     ? 'Équiper'                    :
                   s === 'acheter'     ? 'Acheter — ' + prix + ' pts' :
                   s === 'insuffisant' ? prix + ' pts requis'         : 'Se connecter';

    var btnBg  = s === 'equipe'      ? 'bg-primary-600 cursor-default'          :
                 s === 'equiper'     ? 'bg-primary-900 cursor-pointer hover:opacity-90' :
                 s === 'acheter'     ? 'bg-neutral-800 cursor-pointer hover:opacity-90' :
                 s === 'insuffisant' ? 'bg-neutral-300 cursor-not-allowed'      :
                                      'bg-neutral-800 cursor-pointer hover:opacity-90';

    var disabled = (s === 'equipe' || s === 'insuffisant') ? 'disabled' : '';
    var btnAttrs = isAuth
      ? 'class="boutique-action-btn w-full h-12 flex items-center justify-center transition-opacity border-0 text-white text-3.5 font-medium ' + btnBg + '" ' +
        'data-item-id="' + esc(p.id) + '" data-item-type="' + esc(p.type) + '" data-item-prix="' + prix + '" data-state="' + s + '" ' + disabled
      : 'class="w-full h-12 bg-neutral-800 flex items-center justify-center hover:opacity-90 transition-opacity border-0 text-white text-3.5 font-medium cursor-pointer"';

    var circleContent = p.type === 'titre'
      ? '<div class="size-27.5 rounded-full bg-neutral-600 flex items-center justify-center px-2"><p style="color:white;font-weight:700;font-size:16px;text-align:center;margin:0;line-height:1.3;">' + esc(p.type_titre || p.nom) + '</p></div>'
      : imgSrc
        ? '<div class="size-27.5 rounded-full overflow-hidden"><img src="' + imgSrc + '" style="width:100%;height:100%;object-fit:cover;" /></div>'
        : '<div class="size-27.5 rounded-full bg-neutral-600"></div>';

    var circleContentD = p.type === 'titre'
      ? '<div class="absolute top-10.5 left-1/2 -translate-x-1/2 size-37.5 rounded-full bg-neutral-600 flex items-center justify-center px-3"><p style="color:white;font-weight:700;font-size:18px;text-align:center;margin:0;line-height:1.3;">' + esc(p.type_titre || p.nom) + '</p></div>'
      : imgSrc
        ? '<div class="absolute top-10.5 left-1/2 -translate-x-1/2 size-37.5 rounded-full overflow-hidden"><img src="' + imgSrc + '" style="width:100%;height:100%;object-fit:cover;" /></div>'
        : '<div class="absolute top-10.5 left-1/2 -translate-x-1/2 size-37.5 rounded-full bg-neutral-600"></div>';

    var likeHtml = isAuth
      ? '<button class="like-btn-item p-0 border-0 bg-transparent cursor-pointer shrink-0" data-id="' + esc(p.id) + '" type="button" aria-label="Favori">' +
          '<img src="' + likeIconSrc + '" alt="" class="like-empty size-6" />' +
          '<img src="' + likeFillIconSrc + '" alt="" class="like-filled size-6 hidden" />' +
        '</button>'
      : '';

    var btnMobile = isAuth
      ? '<button type="button" ' + btnAttrs + '>' + esc(btnLabel) + '</button>'
      : '<a href="/connexion" class="w-full h-12 bg-neutral-800 flex items-center justify-center hover:opacity-90 transition-opacity no-underline"><span class="text-white text-3.5 font-medium">Se connecter</span></a>';

    var btnDesktop = isAuth
      ? '<button type="button" class="boutique-action-btn absolute top-73.75 bottom-3 left-7.25 right-7.5 flex items-center justify-center transition-opacity border-0 text-white text-4 font-medium ' + btnBg + '" data-item-id="' + esc(p.id) + '" data-item-type="' + esc(p.type) + '" data-item-prix="' + prix + '" data-state="' + s + '" ' + disabled + '>' + esc(btnLabel) + '</button>'
      : '<a href="/connexion" class="absolute top-73.75 bottom-3 left-7.25 right-7.5 bg-neutral-800 flex items-center justify-center hover:opacity-90 transition-opacity no-underline"><span class="text-white text-4 font-medium">Se connecter</span></a>';

    return '<div>' +
      // Mobile
      '<div class="block lg:hidden bg-white rounded-0.5 shadow-[0px_7px_4px_0px_rgba(0,0,0,0.25)] overflow-hidden">' +
        '<div class="h-40 bg-neutral-500 flex items-center justify-center">' + circleContent + '</div>' +
        '<div class="p-4">' +
          '<div class="flex items-center justify-between mb-3">' +
            '<h3 class="m-0 text-black text-sm">' + esc(p.nom) + '</h3>' +
            likeHtml +
          '</div>' +
          btnMobile +
        '</div>' +
      '</div>' +
      // Desktop
      '<div class="hidden lg:block h-91.75 rounded-0.5 shadow-[0px_4px_6px_0px_rgba(0,0,0,0.25)] relative overflow-hidden bg-neutral-500">' +
        '<div class="absolute bottom-0 left-0 right-0 h-35.75 bg-white rounded-bl-0.5 rounded-br-0.5"></div>' +
        circleContentD +
        '<div class="absolute top-59.75 left-7.25 right-6.75 flex items-center justify-between">' +
          '<h3 class="m-0 text-black text-5 truncate">' + esc(p.nom) + '</h3>' +
          likeHtml +
        '</div>' +
        btnDesktop +
      '</div>' +
    '</div>';
  }

  // ─── CHARGEMENT D'UN ONGLET ──────────────────────────────────────────────────
  async function loadTab(tabId) {
    var filter = encodeURIComponent('type="' + tabId + '"');
    var url    = PB_URL + '/api/collections/boutique/records?page=1&perPage=' + perPage + '&sort=created&filter=' + filter;
    var res    = await fetch(url);
    var data   = res.ok ? await res.json() : { items: [] };
    var items  = data.items || [];

    var grid  = document.getElementById('boutique-grid');
    var empty = document.getElementById('boutique-empty');
    var wrap  = document.getElementById('boutique-wrap');

    var target = grid || empty;
    if (target) {
      target.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      target.style.opacity    = '0';
      target.style.transform  = 'translateY(8px)';
    }

    await new Promise(function (r) { setTimeout(r, 200); });

    if (items.length === 0) {
      if (grid) grid.remove();
      if (!document.getElementById('boutique-empty')) {
        var p = document.createElement('p');
        p.id = 'boutique-empty';
        p.className = 'text-neutral-500 text-4 font-medium';
        p.textContent = 'Aucun article disponible pour l\'instant.';
        p.style.opacity   = '0';
        p.style.transform = 'translateY(8px)';
        wrap.prepend(p);
        requestAnimationFrame(function () {
          p.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
          p.style.opacity    = '1';
          p.style.transform  = 'translateY(0)';
        });
      }
    } else {
      if (empty) empty.remove();
      if (!document.getElementById('boutique-grid')) {
        var g = document.createElement('div');
        g.id = 'boutique-grid';
        g.className = 'grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8';
        wrap.prepend(g);
        grid = g;
      }
      grid.innerHTML = items.map(cardHtml).join('');
      grid.style.opacity   = '0';
      grid.style.transform = 'translateY(8px)';
      requestAnimationFrame(function () {
        grid.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        grid.style.opacity    = '1';
        grid.style.transform  = 'translateY(0)';
      });
    }

    if (window.__initLikes__) window.__initLikes__();
  }

  // ─── INDICATOR ───────────────────────────────────────────────────────────────
  function moveIndicator(btn) {
    var indicator = document.getElementById('tab-indicator');
    var list      = document.getElementById('tab-list');
    if (!indicator || !list) return;
    var listRect = list.getBoundingClientRect();
    var btnRect  = btn.getBoundingClientRect();
    indicator.style.left  = (btnRect.left - listRect.left + list.scrollLeft) + 'px';
    indicator.style.width = btnRect.width + 'px';
  }

  var activeBtn = document.querySelector('.tab-btn[data-tab="' + currentTab + '"]');
  if (activeBtn) moveIndicator(activeBtn);

  document.querySelectorAll('.tab-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var tabId = btn.dataset.tab;
      if (tabId === currentTab) return;
      currentTab = tabId;
      moveIndicator(btn);
      var u = new URL(window.location.href);
      u.searchParams.set('tab', tabId);
      u.searchParams.set('page', '1');
      history.pushState({}, '', u.pathname + u.search);
      loadTab(tabId);
    });
  });
})();
