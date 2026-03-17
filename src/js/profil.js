// @ts-nocheck
// Profil — onglets + mode édition

function switchTab(name) {
  document.querySelectorAll('[data-panel]').forEach(p => p.classList.add('hidden'));
  document.getElementById('panel-' + name)?.classList.remove('hidden');
  document.querySelectorAll('[data-tab]').forEach(t => {
    t.style.borderBottomColor = t.dataset.tab === name ? '#72c073' : 'transparent';
  });
  if (name !== 'profil') resetEdit();
}

function toggleEdit() {
  const editBtn   = document.getElementById('edit-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  if (!editBtn || !cancelBtn) return;
  const isView = editBtn.style.display !== 'none';
  if (isView) {
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
document.getElementById('edit-btn')?.addEventListener('click', toggleEdit);
document.getElementById('cancel-btn')?.addEventListener('click', toggleEdit);
document.getElementById('delete-btn')?.addEventListener('click', confirmDelete);
