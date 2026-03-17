// @ts-nocheck
// Page inscription — désactive le bouton si conditions non acceptées
const checkbox = document.getElementById('terms-checkbox');
const btn = document.getElementById('submit-btn');

function updateBtn() {
  if (!checkbox || !btn) return;
  btn.disabled = !checkbox.checked;
}

if (checkbox) {
  checkbox.addEventListener('change', updateBtn);
  updateBtn();
}

// Validation côté client : les deux mots de passe doivent correspondre
const form = document.getElementById('inscription-form');
if (form) {
  form.addEventListener('submit', function(e) {
    const pwd     = form.querySelector('[name="password"]');
    const confirm = form.querySelector('[name="passwordConfirm"]');
    if (pwd && confirm && pwd.value !== confirm.value) {
      e.preventDefault();
      confirm.setCustomValidity('Les mots de passe ne correspondent pas.');
      confirm.reportValidity();
    } else if (confirm) {
      confirm.setCustomValidity('');
    }
  });
}
