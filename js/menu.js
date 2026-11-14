(function () {
  'use strict';
  var root = document.documentElement;
  var button = document.querySelector('.menu-button');
  var list = document.getElementById('nav-list');
  if (!button || !list) { return; }

  root.classList.add('js');

  function setOpen(open, returnFocus) {
    list.classList.toggle('open', open);
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (!open && returnFocus) { button.focus(); }
  }

  button.addEventListener('click', function () {
    setOpen(button.getAttribute('aria-expanded') !== 'true', false);
  });

  list.addEventListener('click', function (e) {
    if (e.target.closest('a')) { setOpen(false, true); }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
      setOpen(false, true);
    }
  });
})();
