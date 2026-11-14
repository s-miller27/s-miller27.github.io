(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var timelines = Array.prototype.slice.call(document.querySelectorAll('.timeline'));

  /* ---- Active section in the nav (works with or without motion) ---- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-list a'));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  function setCurrent(id) {
    navLinks.forEach(function (a) {
      if (a.getAttribute('href') === '#' + id) { a.setAttribute('aria-current', 'true'); }
      else { a.removeAttribute('aria-current'); }
    });
  }

  if ('IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { setCurrent(entry.target.id); }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { navObserver.observe(s); });
    /* Back at the hero, no nav link is current. */
    var hero = document.getElementById('top');
    if (hero) { navObserver.observe(hero); }
  }

  /* Everything below is motion. Skip it for people who ask for less. */
  if (reduceMotion) { return; }

  /* ---- Reveal on scroll ---- */
  if ('IntersectionObserver' in window) {
    var targets = document.querySelectorAll(
      'main .eyebrow, main h2, main .card, main .hero > *, .site-footer .wrap > *'
    );
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

    Array.prototype.forEach.call(targets, function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = ((i % 3) * 80) + 'ms';
      revealObserver.observe(el);
    });

    /* Whatever is on the first screen is shown by a timer, so it never
       depends on the observer firing. */
    window.setTimeout(function () {
      Array.prototype.forEach.call(targets, function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) { el.classList.add('in-view'); }
      });
    }, 60);
  }

  /* ---- Scroll progress bar, timeline fill, and glow drift ---- */
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  var ticking = false;
  function update() {
    var y = window.pageYOffset;
    var vh = window.innerHeight;
    var max = Math.max(document.documentElement.scrollHeight - vh, 1);
    bar.style.transform = 'scaleX(' + Math.min(y / max, 1) + ')';
    root.style.setProperty('--sy', y);

    timelines.forEach(function (t) {
      var r = t.getBoundingClientRect();
      var p = (vh * 0.65 - r.top) / r.height;
      t.style.setProperty('--progress', Math.max(0, Math.min(1, p)));
    });
    ticking = false;
  }
  function onScroll() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
