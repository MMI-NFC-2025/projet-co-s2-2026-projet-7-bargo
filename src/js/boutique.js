// @ts-nocheck
// Boutique — toggle like (persisté en localStorage)

document.querySelectorAll('.like-btn').forEach(btn => {
  const id = btn.dataset.id;
  const emptyIcon  = btn.querySelector('.like-empty');
  const filledIcon = btn.querySelector('.like-filled');

  // Restaurer l'état sauvegardé
  if (localStorage.getItem(`like_boutique_${id}`) === '1') {
    emptyIcon?.classList.add('hidden');
    filledIcon?.classList.remove('hidden');
  }

  btn.addEventListener('click', () => {
    const isLiked = localStorage.getItem(`like_boutique_${id}`) === '1';
    if (isLiked) {
      localStorage.removeItem(`like_boutique_${id}`);
      emptyIcon?.classList.remove('hidden');
      filledIcon?.classList.add('hidden');
    } else {
      localStorage.setItem(`like_boutique_${id}`, '1');
      emptyIcon?.classList.add('hidden');
      filledIcon?.classList.remove('hidden');
    }
  });
});
