// @ts-nocheck
// Profil — onglets + mode édition

function moveIndicator(btn) {
  const indicator = document.getElementById('tab-indicator');
  const list      = document.getElementById('tab-list');
  if (!indicator || !list) return;
  const listRect = list.getBoundingClientRect();
  const btnRect  = btn.getBoundingClientRect();
  indicator.style.left  = (btnRect.left - listRect.left + list.scrollLeft) + 'px';
  indicator.style.width = btnRect.width + 'px';
}

function switchTab(name) {
  document.querySelectorAll('[data-panel]').forEach(p => p.classList.add('hidden'));
  document.getElementById('panel-' + name)?.classList.remove('hidden');
  const btn = document.querySelector(`.tab-btn[data-tab="${name}"]`);
  if (btn) moveIndicator(btn);
  if (name !== 'profil') resetEdit();
}

function toggleEdit() {
  const editBtn   = document.getElementById('edit-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  if (!editBtn || !cancelBtn) return;
  const isView = editBtn.style.display !== 'none';
  if (isView) {
    switchTab('profil');
    document.querySelectorAll('.view-field').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.edit-field').forEach(el => el.classList.remove('hidden'));
    editBtn.style.display   = 'none';
    cancelBtn.style.display = '';
  } else {
    resetEdit();
  }
}

function resetEdit() {
  document.querySelectorAll('.view-field').forEach(el => el.classList.remove('hidden'));
  document.querySelectorAll('.edit-field').forEach(el => el.classList.add('hidden'));
  const editBtn   = document.getElementById('edit-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  if (editBtn)   editBtn.style.display   = '';
  if (cancelBtn) cancelBtn.style.display = 'none';
}

function confirmDelete() {
  if (confirm('Supprimer définitivement votre compte ? Cette action est irréversible.')) {
    const form = document.getElementById('delete-form');
    if (form) form.submit();
  }
}

// Wiring
document.querySelectorAll('[data-tab]').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// Position initiale de l'indicateur
const initTab   = (window.__ACTIVE_TAB__ || 'profil');
const initBtn   = document.querySelector(`.tab-btn[data-tab="${initTab}"]`);
if (initBtn) moveIndicator(initBtn);
document.getElementById('edit-btn')?.addEventListener('click', toggleEdit);
document.getElementById('cancel-btn')?.addEventListener('click', toggleEdit);
document.getElementById('delete-btn')?.addEventListener('click', confirmDelete);

// Click avatar to open file picker in edit mode
document.getElementById('profile-avatar-wrap')?.addEventListener('click', function() {
  if (document.getElementById('edit-btn')?.style.display === 'none') {
    document.getElementById('avatar-upload')?.click();
  }
});
