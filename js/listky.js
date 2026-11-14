/* Padající lístky v pozadí (barvy loga). Každý se při pádu otáčí, naklání a kolébá.
   Plátno nereaguje na kliknutí, vypne se při „omezení pohybu“ v systému a zastaví při skryté záložce. */
(function () {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var canvas = document.createElement('canvas');
  canvas.className = 'leaves';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var COLORS = [[7, 129, 116], [30, 174, 138], [150, 200, 137], [30, 174, 138], [120, 190, 160]]; // tyrkys, mint, světle zelená
  var w = 0, h = 0, dpr = 1, leaves = [], last = 0, running = false;

  function rand(a, b) { return a + Math.random() * (b - a); }

  function make(startAnywhere) {
    var c = COLORS[Math.floor(Math.random() * COLORS.length)];
    var size = rand(9, 19);                                // polovina délky lístku
    return {
      x: rand(0, w),
      y: startAnywhere ? rand(-20, h) : rand(-40, -10),
      size: size,
      speed: rand(20, 46) * (0.75 + size / 26),            // větší padají o trochu rychleji
      swayAmp: rand(14, 40), swaySpeed: rand(0.45, 1.1), swayPhase: rand(0, 6.28),
      rot: rand(0, 6.28), rotSpeed: rand(-1.2, 1.2),       // otáčení v rovině
      flip: rand(0, 6.28), flipSpeed: rand(1.0, 2.8),      // převracení kolem osy (naklánění lístku)
      alpha: rand(0.45, 0.8),
      c: c
    };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var want = Math.max(10, Math.min(36, Math.round(w / 45)));
    while (leaves.length < want) leaves.push(make(true));
    if (leaves.length > want) leaves.length = want;
  }

  function draw(f) {
    var tilt = Math.cos(f.flip);                           // −1…1
    var scaleY = 0.25 + 0.75 * Math.abs(tilt);             // lístek se při pádu zplošťuje a zase otevírá
    var light = tilt > 0 ? 1 : 0.82;                       // druhá strana lístku je o něco tmavší
    var L = f.size, W = f.size * 0.46;
    ctx.save();
    ctx.translate(f.x + Math.sin(f.swayPhase) * f.swayAmp, f.y);
    ctx.rotate(f.rot);
    ctx.scale(1, scaleY);
    ctx.globalAlpha = f.alpha;
    ctx.fillStyle = 'rgb(' + Math.round(f.c[0] * light) + ',' + Math.round(f.c[1] * light) + ',' + Math.round(f.c[2] * light) + ')';
    ctx.beginPath();                                       // tvar lístku jako v logu: oblý, na koncích špičatý
    ctx.moveTo(-L, 0);
    ctx.quadraticCurveTo(-L * 0.1, -W * 1.5, L, 0);
    ctx.quadraticCurveTo(-L * 0.1, W * 1.5, -L, 0);
    ctx.fill();
    ctx.globalAlpha = f.alpha * 0.55;                      // žilka
    ctx.strokeStyle = 'rgba(255,255,255,.9)';
    ctx.lineWidth = Math.max(0.7, f.size * 0.08);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-L * 0.85, 0);
    ctx.lineTo(L * 0.7, 0);
    ctx.stroke();
    ctx.restore();
  }

  function frame(t) {
    if (!running) return;
    var dt = last ? Math.min((t - last) / 1000, 0.05) : 0;
    last = t;
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < leaves.length; i++) {
      var f = leaves[i];
      f.y += f.speed * dt;
      f.swayPhase += f.swaySpeed * dt;
      f.rot += f.rotSpeed * dt;
      f.flip += f.flipSpeed * dt;
      if (f.y - f.size * 2 > h) leaves[i] = f = make(false);
      draw(f);
    }
    requestAnimationFrame(frame);
  }

  function start() { if (running) return; running = true; last = 0; requestAnimationFrame(frame); }
  function stop() { running = false; }

  resize();
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  start();
})();
