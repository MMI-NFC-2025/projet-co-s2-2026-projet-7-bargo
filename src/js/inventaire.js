// @ts-nocheck
(function () {
  var _a = window.__AUTH__ || {};
  var _i = window.__INVENTAIRE__ || {};
  var token  = _a.token;
  var userId = _a.userId;
  var PB_URL = _i.PB_URL;
  var equipped = _i.equipped || { decoration_avatar: null, titre: null, theme: null };

  var EQUIP_FIELD = { decoration_avatar: 'equiper_avatar_decoration', titre: 'equiper_titre', theme: 'equiper_theme' };

  function showToast(msg, ok) {
    var toast = document.getElementById('inv-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.background = ok ? '#347645' : '#c0392b';
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 2800);
  }

  async function equipItem(btn) {
    var itemId   = btn.dataset.itemId;
    var itemType = btn.dataset.itemType;
    var field    = EQUIP_FIELD[itemType];
    if (!field || !token) return;
    btn.disabled = true;
    btn.textContent = '...';
    try {
      var res = await fetch(PB_URL + '/api/collections/users/records/' + userId, {
        method: 'PATCH',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: itemId }),
      });
      if (!res.ok) throw new Error();
      var oldId = equipped[itemType];
      if (oldId && oldId !== itemId) {
        updateCard(oldId, itemType, false);
      }
      equipped[itemType] = itemId;
      showToast('Article équipé !', true);
      setTimeout(function () {
        var u = new URL(window.location.href);
        u.searchParams.set('tab', 'inventaire');
        window.location.href = u.toString();
      }, 800);
    } catch {
      btn.disabled = false;
      btn.textContent = 'Équiper';
      showToast('Erreur, réessayez.', false);
    }
  }

  function updateCard(itemId, itemType, isEquipped) {
    document.querySelectorAll('[data-inv-card="' + itemId + '"]').forEach(function (card) {
      var badge = card.querySelector('.inv-equipped-badge');
      var btn   = card.querySelector('.inv-equip-btn');
      if (isEquipped) {
        card.classList.add('ring-2', 'ring-[#72C073]');
        if (badge) badge.classList.remove('hidden');
        if (btn) {
          btn.disabled = true;
          btn.textContent = '✓ Équipé';
          btn.className = btn.className
            .replace('bg-[#1E1E1E]', 'bg-[#72C073]')
            .replace('text-white', 'text-[#094736]')
            .replace('hover:opacity-90', '')
            .replace('cursor-pointer', 'cursor-default')
            .replace('inv-equip-btn', '')
            .trim();
        }
      } else {
        card.classList.remove('ring-2', 'ring-[#72C073]');
        if (badge) badge.classList.add('hidden');
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Équiper';
          btn.className = btn.className
            .replace('bg-[#72C073]', 'bg-[#1E1E1E]')
            .replace('text-[#094736]', 'text-white')
            .replace('cursor-default', 'cursor-pointer hover:opacity-90')
            .trim();
          if (!btn.classList.contains('inv-equip-btn')) {
            btn.classList.add('inv-equip-btn');
          }
        }
      }
    });
  }

  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest('.inv-equip-btn');
    if (btn) equipItem(btn);
  });
})();
