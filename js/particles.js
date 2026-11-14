/* Decorative constellation behind the hero: drifting dots joined by faint lines.
   No libraries. Hidden from assistive tech; drawn once and left still when the
   visitor prefers reduced motion; paused when the hero is off screen. */
(function () {
  'use strict';

  var hero = document.querySelector('.hero');
  if (!hero || !window.HTMLCanvasElement) { return; }

  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext && canvas.getContext('2d');
  if (!ctx) { return; }
  canvas.className = 'hero-particles';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(canvas, document.body.firstChild);

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LINK = 130;          /* px: dots closer than this get a line */
  var dots = [];
  var w = 0, h = 0, running = false, visible = true, frame = 0;

  function makeDot() {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 1 + Math.random() * 1.2
    };
  }

  function resize() {
    var newW = document.documentElement.clientWidth;
    var newH = hero.offsetTop + hero.offsetHeight;
    if (newW === w && newH === h) { return; }
    w = newW; h = newH;
    /* Keep the drawing surface under about 2.5 million pixels, so a large
       or high-density screen does not pay for a huge canvas every frame. */
    var dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(2500000 / Math.max(w * h, 1)));
    canvas.style.height = h + 'px';
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var want = Math.max(12, Math.min(70, Math.round((w * h) / 16000)));
    while (dots.length < want) { dots.push(makeDot()); }
    dots.length = want;
    dots.forEach(function (d) {
      if (d.x > w) { d.x = Math.random() * w; }
      if (d.y > h) { d.y = Math.random() * h; }
    });
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    var i, j, a, b, dx, dy, dist;
    /* Fade toward the bottom so the dots never sit behind the next section's text */
    var fadeStart = h * 0.7, fadeLen = Math.max(h * 0.3, 1);
    function fade(y) { return y < fadeStart ? 1 : Math.max(0, 1 - (y - fadeStart) / fadeLen); }
    ctx.lineWidth = 1;
    for (i = 0; i < dots.length; i++) {
      a = dots[i];
      for (j = i + 1; j < dots.length; j++) {
        b = dots[j];
        dx = a.x - b.x; dy = a.y - b.y;
        dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK) {
          ctx.strokeStyle = 'rgba(200, 214, 230, ' +
            (0.16 * (1 - dist / LINK) * fade(Math.max(a.y, b.y))).toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    for (i = 0; i < dots.length; i++) {
      a = dots[i];
      ctx.fillStyle = 'rgba(200, 214, 230, ' + (0.38 * fade(a.y)).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
    }
  }

  /* Redraw about 30 times a second whatever the screen's refresh rate; the
     drift is slow, so more frames than that only cost processing time. */
  var lastDraw = 0;
  function step(now) {
    if (now - lastDraw >= 33) {
      var k = lastDraw ? Math.min((now - lastDraw) / 16.7, 4) : 1;
      lastDraw = now;
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        d.x += d.vx * k; d.y += d.vy * k;
        if (d.x < 0 || d.x > w) { d.vx = -d.vx; }
        if (d.y < 0 || d.y > h) { d.vy = -d.vy; }
      }
      draw();
    }
    frame = running ? window.requestAnimationFrame(step) : 0;
  }

  function setRunning() {
    var should = !reduceMotion && visible && !document.hidden;
    if (should && !running) { running = true; frame = window.requestAnimationFrame(step); }
    else if (!should && running) { running = false; window.cancelAnimationFrame(frame); }
  }

  resize();
  window.addEventListener('resize', resize);
  if ('ResizeObserver' in window) { new ResizeObserver(resize).observe(document.body); }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[entries.length - 1].isIntersecting;
      setRunning();
    }).observe(canvas);
  }
  document.addEventListener('visibilitychange', setRunning);
  setRunning();
})();
