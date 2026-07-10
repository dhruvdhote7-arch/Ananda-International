/* ================================
   INTRO ANIMATION PARTICLES
   File: scripts/intro.js
================================ */

(() => {
  const intro = document.getElementById("intro");
  const particleCanvas = document.getElementById("particleCanvas");

  if (!intro || !particleCanvas) return;

  const particleCtx = particleCanvas.getContext("2d");

  let introParticles = [];
  let introRafId;

  function sizeIntroCanvas() {
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
  }

  function makeIntroParticles() {
    introParticles = [];

    const particleCount = window.innerWidth < 768 ? 60 : 125;

    for (let i = 0; i < particleCount; i += 1) {
      introParticles.push({
        x: Math.random() * particleCanvas.width,
        y: Math.random() * particleCanvas.height,
        r: Math.random() * 2 + 0.35,
        vx: (Math.random() - 0.5) * 0.38,
        vy: -Math.random() * 0.55 - 0.05,
        alpha: Math.random() * 0.65 + 0.15,
        pulse: Math.random() * Math.PI * 2
      });
    }
  }

  function drawIntroParticles() {
    particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

    for (const particle of introParticles) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.pulse += 0.026;

      if (particle.y < -20) {
        particle.y = particleCanvas.height + 20;
        particle.x = Math.random() * particleCanvas.width;
      }

      if (particle.x < -20) {
        particle.x = particleCanvas.width + 20;
      }

      if (particle.x > particleCanvas.width + 20) {
        particle.x = -20;
      }

      const alpha = Math.max(
        0,
        Math.min(1, particle.alpha + Math.sin(particle.pulse) * 0.18)
      );

      particleCtx.beginPath();
      particleCtx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      particleCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      particleCtx.shadowColor = "rgba(255, 255, 255, 0.95)";
      particleCtx.shadowBlur = 14;
      particleCtx.fill();
      particleCtx.shadowBlur = 0;
    }

    introRafId = requestAnimationFrame(drawIntroParticles);
  }

  function exitIntro() {
    /*
      Direct cut:
      No fly-to-navbar.
      No fade.
      No blur.
      The homepage appears immediately after intro animation.
    */

    document.body.classList.remove("is-loading");
    document.body.classList.add("loaded");

    intro.classList.add("remove");
    intro.style.display = "none";

    if (introRafId) {
      cancelAnimationFrame(introRafId);
    }
  }

  function initIntro() {
    sizeIntroCanvas();
    makeIntroParticles();
    drawIntroParticles();

    /*
      Intro timing:
      0.2s  - bottom line starts
      0.65s - arch starts
      1.45s - A appears
      2.05s - orange stroke flows
      2.82s - leaves grow
      3.8s  - text appears
      5.2s  - direct cut to homepage
    */

    setTimeout(exitIntro, 5200);
  }

  window.addEventListener("resize", () => {
    sizeIntroCanvas();
    makeIntroParticles();
  });

  window.addEventListener("load", initIntro);
})();