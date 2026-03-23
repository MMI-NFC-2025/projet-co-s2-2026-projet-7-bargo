// @ts-nocheck
(function () {
  var btn   = document.getElementById('notif-btn');
  var panel = document.getElementById('notif-panel');

  if (!btn || !panel) return;

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    var isOpen = panel.classList.toggle('notif-panel--open');
    btn.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', function (e) {
    var widget = document.getElementById('notif-widget');
    if (widget && !widget.contains(e.target instanceof Node ? e.target : null)) {
      panel.classList.remove('notif-panel--open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
})();
