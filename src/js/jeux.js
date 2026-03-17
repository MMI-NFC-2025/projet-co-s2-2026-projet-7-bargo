// @ts-nocheck
// Jeux — toggle like (persisté en localStorage)

document.querySelectorAll('.like-btn').forEach(btn => {
  const id = btn.dataset.id;
  const emptyIcon  = btn.querySelector('.like-empty');
  const filledIcon = btn.querySelector('.like-filled');

  if (localStorage.getItem(`like_jeux_${id}`) === '1') {
    emptyIcon?.classList.add('hidden');
    filledIcon?.classList.remove('hidden');
  }

  btn.addEventListener('click', () => {
    const isLiked = localStorage.getItem(`like_jeux_${id}`) === '1';
    if (isLiked) {
      localStorage.removeItem(`like_jeux_${id}`);
      emptyIcon?.classList.remove('hidden');
      filledIcon?.classList.add('hidden');
    } else {
      localStorage.setItem(`like_jeux_${id}`, '1');
      emptyIcon?.classList.add('hidden');
      filledIcon?.classList.remove('hidden');
    }
  });
});
