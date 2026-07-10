/* =========================================================
   ANANDA AMBIENT FLOW
   Smooth reactive topographic contour field
   GSAP ticker + Lenis + spring pointer
========================================================= */

(function () {
  "use strict";

  const canvas = document.getElementById("ambientCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

  let width = 0;
  let height = 0;
  let dpr = 1;

  let gridSize = 24;
  let cols = 0;
  let rows = 0;
  let field = new Float32Array(0);
  let blobs = [];

  let lenis = null;
  let rafId = null;
  let gsapTick = null;

  const LEVELS = [0.62, 0.82, 1.02, 1.22, 1.42];
  const LINE_COLOR = "rgba(16, 16, 16, 0.96)";

  const state = {
    time: 0,
    scrollNorm: 0
  };

  const pointer = {
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    vx: 0,
    vy: 0,
    active: false,
    energy: 0,
    radius: 180,
    push: 24
  };

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function fract(v) {
    return v - Math.floor(v);
  }

  function hash(n) {
    return fract(Math.sin(n) * 43758.5453123);
  }

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;

    dpr = Math.min(window.devicePixelRatio || 1, isTouchDevice ? 1.35 : 1.8);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    gridSize = width < 768 ? 20 : 24;
    cols = Math.ceil(width / gridSize) + 2;
    rows = Math.ceil(height / gridSize) + 2;
    field = new Float32Array(cols * rows);

    pointer.x = pointer.tx = width * 0.5;
    pointer.y = pointer.ty = height * 0.5;
    pointer.vx = 0;
    pointer.vy = 0;
    pointer.radius = width < 768 ? 120 : 180;
    pointer.push = width < 768 ? 18 : 24;

    buildBlobs();
  }

  function buildBlobs() {
    const presets = width < 768
      ? [
          { x: -0.08, y: 0.12, rx: 110, ry: 180, w: 1.18 },
          { x: 0.22, y: 0.20, rx: 108, ry: 160, w: 1.04 },
          { x: 0.64, y: 0.18, rx: 112, ry: 175, w: 1.12 },
          { x: 0.96, y: 0.14, rx: 108, ry: 150, w: 1.00 },

          { x: 0.10, y: 0.48, rx: 120, ry: 165, w: 1.02 },
          { x: 0.50, y: 0.46, rx: 110, ry: 165, w: 1.18 },
          { x: 0.88, y: 0.48, rx: 122, ry: 160, w: 1.00 },

          { x: -0.06, y: 0.86, rx: 120, ry: 145, w: 1.02 },
          { x: 0.34, y: 0.82, rx: 145, ry: 220, w: 1.10 },
          { x: 0.74, y: 0.82, rx: 145, ry: 165, w: 1.04 }
        ]
      : [
          { x: -0.10, y: 0.12, rx: 170, ry: 275, w: 1.20 },
          { x: 0.16, y: 0.20, rx: 150, ry: 215, w: 1.02 },
          { x: 0.48, y: 0.18, rx: 160, ry: 255, w: 1.12 },
          { x: 0.82, y: 0.16, rx: 165, ry: 210, w: 1.04 },
          { x: 1.06, y: 0.16, rx: 150, ry: 190, w: 0.96 },

          { x: 0.10, y: 0.50, rx: 165, ry: 210, w: 1.00 },
          { x: 0.50, y: 0.46, rx: 155, ry: 210, w: 1.22 },
          { x: 0.88, y: 0.48, rx: 165, ry: 195, w: 1.00 },

          { x: -0.05, y: 0.88, rx: 165, ry: 155, w: 1.02 },
          { x: 0.30, y: 0.82, rx: 200, ry: 285, w: 1.12 },
          { x: 0.72, y: 0.80, rx: 205, ry: 195, w: 1.04 },
          { x: 1.04, y: 0.86, rx: 170, ry: 170, w: 0.98 }
        ];

    blobs = presets.map((p, i) => ({
      baseX: p.x * width,
      baseY: p.y * height,
      rx: p.rx,
      ry: p.ry,
      weight: p.w,
      seed: 100 + i * 17.37,
      driftX: 3 + hash(i * 3.91) * 6,
      driftY: 3 + hash(i * 5.23) * 6,
      speed: 0.05 + hash(i * 7.17) * 0.035
    }));
  }

  function fieldAt(x, y, time) {
    let px = x;
    let py = y;

    /* ultra-slow domain warp so the pattern "flows" instead of wobbling */
    px += Math.sin(y * 0.0046 + time * 0.18) * 10;
    px += Math.sin(x * 0.0018 - time * 0.10) * 4;

    py += Math.cos(x * 0.0042 - time * 0.16) * 9;
    py += Math.cos(y * 0.0015 + time * 0.08) * 4;

    /* smooth pointer influence */
    if (!prefersReducedMotion) {
      const dx = px - pointer.x;
      const dy = py - pointer.y;
      const dist = Math.hypot(dx, dy);

      if (dist < pointer.radius) {
        const falloff = Math.pow(1 - dist / pointer.radius, 2.2);
        const inv = dist > 0.0001 ? 1 / dist : 0;
        const force = pointer.push * falloff * pointer.energy;

        px -= dx * inv * force;
        py -= dy * inv * force;
      }
    }

    let sum = 0;

    for (let i = 0; i < blobs.length; i++) {
      const b = blobs[i];

      const cx = b.baseX + Math.sin(time * b.speed + b.seed) * b.driftX;
      const cy =
        b.baseY +
        Math.cos(time * b.speed * 0.92 + b.seed * 0.77) * b.driftY -
        state.scrollNorm * 12;

      const dx = (px - cx) / b.rx;
      const dy = (py - cy) / b.ry;

      sum += b.weight / (0.96 + dx * dx + dy * dy);
    }

    return sum;
  }

  function computeField(time) {
    let index = 0;

    for (let row = 0; row < rows; row++) {
      const y = row * gridSize;

      for (let col = 0; col < cols; col++) {
        const x = col * gridSize;
        field[index++] = fieldAt(x, y, time);
      }
    }
  }

  function interp(x1, y1, v1, x2, y2, v2, level) {
    const denom = v2 - v1;
    const t = Math.abs(denom) < 0.00001 ? 0.5 : (level - v1) / denom;

    return [
      x1 + (x2 - x1) * t,
      y1 + (y2 - y1) * t
    ];
  }

  function drawSeg(a, b) {
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
  }

  function drawLevel(level) {
    ctx.beginPath();

    for (let row = 0; row < rows - 1; row++) {
      for (let col = 0; col < cols - 1; col++) {
        const i = row * cols + col;

        const tl = field[i];
        const tr = field[i + 1];
        const bl = field[i + cols];
        const br = field[i + cols + 1];

        const x = col * gridSize;
        const y = row * gridSize;
        const x2 = x + gridSize;
        const y2 = y + gridSize;

        let bits = 0;
        if (tl >= level) bits |= 8;
        if (tr >= level) bits |= 4;
        if (br >= level) bits |= 2;
        if (bl >= level) bits |= 1;

        if (bits === 0 || bits === 15) continue;

        const top = interp(x, y, tl, x2, y, tr, level);
        const right = interp(x2, y, tr, x2, y2, br, level);
        const bottom = interp(x, y2, bl, x2, y2, br, level);
        const left = interp(x, y, tl, x, y2, bl, level);

        switch (bits) {
          case 1:  drawSeg(left, bottom); break;
          case 2:  drawSeg(bottom, right); break;
          case 3:  drawSeg(left, right); break;
          case 4:  drawSeg(top, right); break;
          case 5:  drawSeg(top, left); drawSeg(bottom, right); break;
          case 6:  drawSeg(top, bottom); break;
          case 7:  drawSeg(top, left); break;
          case 8:  drawSeg(top, left); break;
          case 9:  drawSeg(top, bottom); break;
          case 10: drawSeg(top, right); drawSeg(left, bottom); break;
          case 11: drawSeg(top, right); break;
          case 12: drawSeg(left, right); break;
          case 13: drawSeg(bottom, right); break;
          case 14: drawSeg(left, bottom); break;
        }
      }
    }

    ctx.stroke();
  }

  function update(dt, time) {
    state.time = time;

    /* spring-smoothed pointer = no jitter */
    const spring = 0.085;
    const damping = 0.78;

    pointer.vx += (pointer.tx - pointer.x) * spring * dt * 60;
    pointer.vy += (pointer.ty - pointer.y) * spring * dt * 60;

    pointer.vx *= damping;
    pointer.vy *= damping;

    pointer.x += pointer.vx;
    pointer.y += pointer.vy;

    pointer.energy = lerp(
      pointer.energy,
      pointer.active ? 1 : 0,
      pointer.active ? 0.085 : 0.05
    );
  }

  function render(time) {
    computeField(time);

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = width < 768 ? 1.05 : 1.15;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (let i = 0; i < LEVELS.length; i++) {
      drawLevel(LEVELS[i]);
    }
  }

  function setupPointer() {
    function move(x, y) {
      pointer.tx = x;
      pointer.ty = y;
      pointer.active = true;
    }

    window.addEventListener("pointermove", function (e) {
      move(e.clientX, e.clientY);
    }, { passive: true });

    window.addEventListener("pointerdown", function (e) {
      move(e.clientX, e.clientY);
      pointer.energy = 1;
    }, { passive: true });

    window.addEventListener("pointerup", function () {
      pointer.active = false;
    }, { passive: true });

    window.addEventListener("pointerleave", function () {
      pointer.active = false;
    }, { passive: true });

    window.addEventListener("touchmove", function (e) {
      if (!e.touches || !e.touches.length) return;
      const t = e.touches[0];
      move(t.clientX, t.clientY);
    }, { passive: true });

    window.addEventListener("touchend", function () {
      pointer.active = false;
    }, { passive: true });
  }

  function setupLenis() {
    if (!window.Lenis) return null;

    const smooth = new Lenis({
      duration: 1.05,
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.05,
      infinite: false
    });

    document.documentElement.classList.add("lenis");

    smooth.on("scroll", function (event) {
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );

      const scroll = event.scroll || window.scrollY || 0;
      state.scrollNorm = scroll / maxScroll;
    });

    return smooth;
  }

  function startLoop() {
    lenis = setupLenis();

    if (window.gsap) {
      gsap.ticker.lagSmoothing(0);

      gsapTick = function (time, deltaTime) {
        if (lenis) {
          lenis.raf(time * 1000);
        }

        const dt = Math.min(((deltaTime || 16.67) / 1000), 0.033);
        update(dt, time);
        render(time);
      };

      gsap.ticker.add(gsapTick);
      return;
    }

    let last = performance.now();

    function fallback(now) {
      if (lenis) {
        lenis.raf(now);
      }

      const dt = Math.min((now - last) / 1000, 0.033);
      last = now;

      const t = now * 0.001;
      update(dt, t);
      render(t);

      rafId = requestAnimationFrame(fallback);
    }

    rafId = requestAnimationFrame(fallback);
  }

  function init() {
    resizeCanvas();
    setupPointer();
    startLoop();

    window.addEventListener("resize", resizeCanvas, { passive: true });

    window.setTimeout(function () {
      document.body.classList.remove("is-loading");
    }, 700);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.addEventListener("beforeunload", function () {
    if (rafId) cancelAnimationFrame(rafId);
    if (lenis && typeof lenis.destroy === "function") lenis.destroy();
    if (window.gsap && gsapTick) gsap.ticker.remove(gsapTick);
  });
})();