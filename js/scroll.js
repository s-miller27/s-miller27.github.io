(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  /* A probe line slides from the top of the screen to the bottom as the page
     scrolls from start to end. The current section is the last one whose top
     has passed the line. This way short sections at the very bottom
     (Education, Contact) still get their turn, which a fixed line never
     reaches. Above the first section (the hero) no link is current. */
  var currentId = null;
  var spyLocked = false;
  function spy() {
    if (spyLocked) { return; }
    var vh = window.innerHeight;
    var max = Math.max(document.documentElement.scrollHeight - vh, 1);
    var probe = vh * Math.min(window.pageYOffset / max, 1);
    var id = '';
    sections.forEach(function (s) {
      if (s.getBoundingClientRect().top <= probe) { id = s.id; }
    });
    if (id !== currentId) { currentId = id; setCurrent(id); }
  }

  /* Clicking a link to a section marks that section straight away and keeps
     it marked while the page glides there, even if the page cannot scroll far
     enough to put it at the top. The next manual scroll hands control back. */
  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!link) { return; }
    var id = link.getAttribute('href').slice(1);
    spyLocked = true;
    currentId = id;
    setCurrent(id);
  });
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (type) {
    window.addEventListener(type, function () { spyLocked = false; }, { passive: true });
  });

  var spyTicking = false;
  function onSpyScroll() {
    if (spyTicking) { return; }
    spyTicking = true;
    window.requestAnimationFrame(function () { spyTicking = false; spy(); });
  }
  window.addEventListener('scroll', onSpyScroll, { passive: true });
  window.addEventListener('resize', onSpyScroll);
  spy();

  /* Everything below is motion. Skip it for people who ask for less. */
  if (reduceMotion) { return; }

  /* ---- Reveal on scroll ---- */
  if ('IntersectionObserver' in window) {
    var targets = document.querySelectorAll(
      'main h2, main .lead, main .stat, main .card, main .hero > *, .site-footer .wrap > *'
    );

    /* Fade the element in, then drop the reveal classes so its own, faster
       hover transition applies afterwards. */
    var show = function (el) {
      if (!el.classList.contains('reveal') || el.classList.contains('in-view')) { return; }
      el.classList.add('in-view');
      window.setTimeout(function () {
        el.classList.remove('reveal', 'in-view');
        el.style.transitionDelay = '';
      }, 1000);
    };

    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          show(entry.target);
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
        if (r.top < window.innerHeight && r.bottom > 0) { show(el); }
      });
    }, 60);

    /* Numbers count up once when they scroll into view. The real value is in
       the HTML and is restored at the end. */
    var countObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        obs.unobserve(entry.target);
        var el = entry.target;
        var end = parseInt(el.getAttribute('data-count'), 10);
        var suffix = el.getAttribute('data-suffix') || '';
        var finalText = el.textContent;
        var startTime = null;
        function tick(now) {
          if (startTime === null) { startTime = now; }
          var t = Math.min((now - startTime) / 1400, 1);
          var eased = 1 - Math.pow(1 - t, 3);
          el.textContent = t < 1 ? Math.round(end * eased).toLocaleString('en-US') + suffix : finalText;
          if (t < 1) { window.requestAnimationFrame(tick); }
        }
        window.requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    Array.prototype.forEach.call(document.querySelectorAll('[data-count]'), function (el) {
      countObserver.observe(el);
    });
  }

  /* ---- Scroll progress bar and the section rail fill ----
     Each update only touches the transform of a few small elements, which the
     browser can apply without re-laying-out or repainting the page. */
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  var rails = Array.prototype.map.call(document.querySelectorAll('.rail'), function (section) {
    var fill = document.createElement('span');
    fill.className = 'rail-fill';
    fill.setAttribute('aria-hidden', 'true');
    section.appendChild(fill);
    return { section: section, fill: fill, last: -1, heading: section.querySelector('h2'), reached: false };
  });

  var ticking = false;
  function update() {
    var y = window.pageYOffset;
    var vh = window.innerHeight;
    var max = Math.max(document.documentElement.scrollHeight - vh, 1);
    bar.style.transform = 'scaleX(' + Math.min(y / max, 1).toFixed(4) + ')';

    rails.forEach(function (rail) {
      var r = rail.section.getBoundingClientRect();
      var p = Math.max(0, Math.min(1, (vh * 0.65 - r.top) / r.height));
      p = Math.round(p * 1000) / 1000;
      if (p !== rail.last) {
        rail.last = p;
        rail.fill.style.transform = 'scaleY(' + p + ')';
      }
      /* Fill the heading's bubble once the line has reached it */
      if (rail.heading) {
        var reached = rail.heading.getBoundingClientRect().top + 16 <= vh * 0.65;
        if (reached !== rail.reached) {
          rail.reached = reached;
          rail.heading.classList.toggle('reached', reached);
        }
      }
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
