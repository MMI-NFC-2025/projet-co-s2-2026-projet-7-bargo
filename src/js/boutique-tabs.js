// @ts-nocheck
(function () {
  var _b = window.__BOUTIQUE__ || {};
  var PB_URL     = _b.PB_URL;
  var perPage    = _b.perPage;
  var activeTab  = _b.activeTab;
  var likeIconSrc     = _b.likeIconSrc;
  var likeFillIconSrc = _b.likeFillIconSrc;
  var isAuth     = !!(window.__AUTH__);

  var currentTab  = activeTab;

  function esc(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function cardHtml(p) {
    var imageFile = Array.isArray(p.item) ? p.item[0] : p.item;
    var imgSrc    = imageFile ? PB_URL + '/api/files/' + p.collectionName + '/' + p.id + '/' + imageFile : '';
    var likeHtml  = isAuth
      ? '<button class="like-btn-item p-0 border-0 bg-transparent cursor-pointer" data-id="' + p.id + '" type="button" aria-label="Favori">' +
          '<img src="' + likeIconSrc + '" alt="" class="like-empty size-6" />' +
          '<img src="' + likeFillIconSrc + '" alt="" class="like-filled size-6 hidden" />' +
        '</button>'
      : '';
    var circleM = imgSrc ? '<div class="size-27.5 rounded-full overflow-hidden"><img src="' + imgSrc + '" style="width:100%;height:100%;object-fit:cover;" /></div>' : '';
    var circleD = imgSrc ? '<div class="absolute top-10.5 left-1/2 -translate-x-1/2 size-37.5 rounded-full overflow-hidden"><img src="' + imgSrc + '" style="width:100%;height:100%;object-fit:cover;" /></div>' : '';
    return '<div>' +
      // Mobile
      '<div class="block lg:hidden bg-white rounded-0.5 shadow-[0px_7px_4px_0px_rgba(0,0,0,0.25)] overflow-hidden">' +
        '<div class="h-40 bg-neutral-500 flex items-center justify-center">' + circleM + '</div>' +
        '<div class="p-4">' +
          '<div class="flex items-center justify-between mb-3">' +
            '<h3 class="m-0 text-black">' + esc(p.prix) + ' pts</h3>' +
            likeHtml +
          '</div>' +
          '<button type="button" class="w-full h-12 bg-neutral-800 flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer border-0">' +
            '<span class="text-white text-4 font-medium">Acheter</span>' +
          '</button>' +
        '</div>' +
      '</div>' +
      // Desktop
      '<div class="hidden lg:block h-91.75 rounded-0.5 shadow-[0px_4px_6px_0px_rgba(0,0,0,0.25)] relative overflow-hidden bg-neutral-500">' +
        '<div class="absolute bottom-0 left-0 right-0 h-35.75 bg-white rounded-bl-0.5 rounded-br-0.5"></div>' +
        circleD +
        '<div class="absolute top-59.75 left-7.25 right-6.75 flex items-center justify-between">' +
          '<h3 class="m-0 text-black text-6.25">' + esc(p.prix) + ' pts</h3>' +
          likeHtml +
        '</div>' +
        '<button type="button" class="absolute top-73.75 bottom-3 left-7.25 right-7.5 bg-neutral-800 flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer border-0">' +
          '<span class="text-white text-4 font-medium">Acheter</span>' +
        '</button>' +
      '</div>' +
    '</div>';
  }

  async function loadTab(tabId) {
    var filter  = encodeURIComponent('type="' + tabId + '"');
    var url     = PB_URL + '/api/collections/boutique/records?page=1&perPage=' + perPage + '&sort=created&filter=' + filter;
    var res     = await fetch(url);
    var data    = res.ok ? await res.json() : { items: [] };
    var items   = data.items ?? [];

    var grid  = document.getElementById('boutique-grid');
    var empty = document.getElementById('boutique-empty');
    var wrap  = document.getElementById('boutique-wrap');

    // Fade out
    var target = grid || empty;
    if (target) {
      target.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      target.style.opacity = '0';
      target.style.transform = 'translateY(8px)';
    }

    await new Promise(function (r) { setTimeout(r, 200); });

    if (items.length === 0) {
      if (grid) grid.remove();
      if (!document.getElementById('boutique-empty')) {
        var p = document.createElement('p');
        p.id = 'boutique-empty';
        p.className = 'text-neutral-500 text-4 font-medium';
        p.textContent = 'Aucun article disponible pour l\'instant.';
        p.style.opacity = '0';
        p.style.transform = 'translateY(8px)';
        wrap.prepend(p);
        requestAnimationFrame(function () {
          p.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
          p.style.opacity = '1';
          p.style.transform = 'translateY(0)';
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
      grid.style.opacity = '0';
      grid.style.transform = 'translateY(8px)';
      requestAnimationFrame(function () {
        grid.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        grid.style.opacity = '1';
        grid.style.transform = 'translateY(0)';
      });
    }

    if (window.__initLikes__) window.__initLikes__();
  }

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
  var activeBtn = document.querySelector('.tab-btn[data-tab="' + currentTab + '"]');
  if (activeBtn) moveIndicator(activeBtn);

  document.querySelectorAll('.tab-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var tabId = btn.dataset.tab;
      if (tabId === currentTab) return;
      currentTab = tabId;

      moveIndicator(btn);

      // Mise à jour URL sans rechargement
      var u = new URL(window.location.href);
      u.searchParams.set('tab', tabId);
      u.searchParams.set('page', '1');
      history.pushState({}, '', u.pathname + u.search);

      loadTab(tabId);
    });
  });
})();
