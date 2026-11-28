(function () {
  "use strict";

  const SLIDE_W = 1280;
  const SLIDE_H = 720;
  const THEME_KEY = "laika_deck_theme";

  const rootEl = document.documentElement;
  const slides = Array.from(document.querySelectorAll(".slide"));
  const viewport = document.getElementById("deck-viewport");
  const counterEl = document.getElementById("toolbar-counter");
  const sectionEl = document.getElementById("toolbar-section");
  const sectionDotEl = document.getElementById("toolbar-section-dot");
  const progressEl = document.getElementById("deck-progress-bar");

  const btnPrev = document.getElementById("btn-prev");
  const btnNext = document.getElementById("btn-next");
  const btnOverview = document.getElementById("btn-overview");
  const btnTheme = document.getElementById("btn-theme");
  const btnFullscreen = document.getElementById("btn-fullscreen");
  const btnPrint = document.getElementById("btn-print");

  const canvas = document.getElementById("starfield-canvas");
  const ctx = canvas ? canvas.getContext("2d") : null;
  const lightboxEl = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");

  function openLightbox(src, caption) {
    if (!lightboxEl || !lightboxImg) return;
    lightboxImg.src = src;
    if (lightboxCaption) lightboxCaption.textContent = caption || "";
    lightboxEl.classList.add("is-open");
  }

  function closeLightbox() {
    if (!lightboxEl) return;
    lightboxEl.classList.remove("is-open");
  }

  if (lightboxEl) {
    lightboxEl.addEventListener("click", closeLightbox);
  }

  document.querySelectorAll("[data-zoom-src]").forEach(function (el) {
    el.addEventListener("click", function (ev) {
      if (document.body.classList.contains("overview-mode")) return;
      ev.stopPropagation();
      openLightbox(el.getAttribute("data-zoom-src"), el.getAttribute("data-zoom-caption"));
    });
  });

  let currentIndex = 0;
  let stars = [];
  let shootingStar = null;
  let nextShootAt = 0;
  let starFrameId = null;

  const BLOCK_COLORS = {
    light: {
      core: "#e8531a",
      b1: "#b45309",
      b2: "#0e7490",
      b3: "#15803d"
    },
    dark: {
      core: "#ff6e30",
      b1: "#f59e0b",
      b2: "#22d3ee",
      b3: "#34d399"
    }
  };

  function clamp(index) {
    if (index < 0) return 0;
    if (index >= slides.length) return slides.length - 1;
    return index;
  }

  function formatNumber(n) {
    return String(n).padStart(2, "0");
  }

  function getTheme() {
    return rootEl.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function updateBlockAccentUI() {
    const activeSlide = slides[currentIndex];
    const blockKey = activeSlide.getAttribute("data-block") || "core";
    const theme = getTheme();
    const color = BLOCK_COLORS[theme][blockKey] || BLOCK_COLORS[theme].core;
    if (sectionDotEl) sectionDotEl.style.backgroundColor = color;
    if (progressEl) progressEl.style.backgroundColor = color;
  }

  function updateScale() {
    if (document.body.classList.contains("overview-mode")) {
      viewport.style.transform = "none";
      return;
    }
    const availW = window.innerWidth - 40;
    const availH = window.innerHeight - 94;
    const scale = Math.min(availW / SLIDE_W, availH / SLIDE_H, 1.35);
    viewport.style.transform = "scale(" + Math.max(scale, 0.25) + ")";
  }

  function render() {
    slides.forEach(function (slide, idx) {
      slide.classList.toggle("is-current", idx === currentIndex);
    });

    const activeSlide = slides[currentIndex];
    const total = slides.length;
    const current = currentIndex + 1;

    counterEl.textContent = formatNumber(current) + " / " + formatNumber(total);
    sectionEl.textContent = activeSlide.getAttribute("data-section") || "Presentación";
    progressEl.style.width = ((current / total) * 100).toFixed(2) + "%";

    btnPrev.disabled = currentIndex === 0;
    btnNext.disabled = currentIndex === total - 1;

    updateBlockAccentUI();

    if (window.location.hash !== "#slide-" + current) {
      history.replaceState(null, "", "#slide-" + current);
    }
  }

  function goTo(index) {
    currentIndex = clamp(index);
    render();
  }

  function toggleOverview(forceState) {
    const nextState = typeof forceState === "boolean"
      ? forceState
      : !document.body.classList.contains("overview-mode");
    document.body.classList.toggle("overview-mode", nextState);
    btnOverview.classList.toggle("is-active", nextState);
    updateScale();
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(function () {});
    } else {
      document.exitFullscreen().catch(function () {});
    }
  }

  /* ========================================================================
     Cielo estelar nitido para modo oscuro — visible a traves de las laminas
     ======================================================================== */

  function resizeStarfield() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = Math.min(Math.max(Math.floor((canvas.width * canvas.height) / 5800), 170), 320);
    stars = [];
    for (let i = 0; i < count; i++) {
      const bright = Math.random() > 0.88;
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: bright ? Math.random() * 1.1 + 1.4 : Math.random() * 1.0 + 0.5,
        baseAlpha: bright ? Math.random() * 0.28 + 0.72 : Math.random() * 0.45 + 0.35,
        speed: Math.random() * 0.16 + 0.04,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.025 + 0.008,
        bright: bright,
        tint: Math.random() > 0.82 ? "warm" : (Math.random() > 0.55 ? "cool" : "white")
      });
    }
    nextShootAt = performance.now() + 2600;
  }

  function spawnShootingStar() {
    if (!canvas) return;
    shootingStar = {
      x: Math.random() * canvas.width * 0.75 + canvas.width * 0.15,
      y: Math.random() * canvas.height * 0.35 + 20,
      vx: -(Math.random() * 7 + 8),
      vy: Math.random() * 3.5 + 3.2,
      life: 1.0
    };
  }

  function drawStarfield(now) {
    if (!ctx || getTheme() !== "dark") {
      starFrameId = null;
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      s.y -= s.speed;
      if (s.y < -6) {
        s.y = canvas.height + 6;
        s.x = Math.random() * canvas.width;
      }
      s.phase += s.twinkleSpeed;
      const alpha = s.baseAlpha * (0.58 + 0.42 * Math.sin(s.phase));

      let color;
      if (s.tint === "warm") {
        color = "rgba(255, 205, 165, " + alpha.toFixed(3) + ")";
      } else if (s.tint === "cool") {
        color = "rgba(186, 224, 255, " + alpha.toFixed(3) + ")";
      } else {
        color = "rgba(255, 255, 255, " + alpha.toFixed(3) + ")";
      }

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      if (s.bright) {
        const arm = s.r * 3.1;
        ctx.strokeStyle = "rgba(255, 255, 255, " + (alpha * 0.45).toFixed(3) + ")";
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(s.x - arm, s.y);
        ctx.lineTo(s.x + arm, s.y);
        ctx.moveTo(s.x, s.y - arm);
        ctx.lineTo(s.x, s.y + arm);
        ctx.stroke();
      }
    }

    if (!shootingStar && now > nextShootAt) {
      spawnShootingStar();
      nextShootAt = now + 5200 + Math.random() * 4800;
    }

    if (shootingStar) {
      const st = shootingStar;
      const tailX = st.x - st.vx * 6.5;
      const tailY = st.y - st.vy * 6.5;
      const grad = ctx.createLinearGradient(st.x, st.y, tailX, tailY);
      grad.addColorStop(0, "rgba(255, 240, 225, " + (st.life * 0.85).toFixed(3) + ")");
      grad.addColorStop(1, "rgba(255, 240, 225, 0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(st.x, st.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      st.x += st.vx;
      st.y += st.vy;
      st.life -= 0.022;
      if (st.life <= 0) {
        shootingStar = null;
      }
    }

    starFrameId = window.requestAnimationFrame(drawStarfield);
  }

  function syncStarfield() {
    if (getTheme() === "dark") {
      resizeStarfield();
      if (!starFrameId) {
        starFrameId = window.requestAnimationFrame(drawStarfield);
      }
    } else if (starFrameId) {
      window.cancelAnimationFrame(starFrameId);
      starFrameId = null;
      shootingStar = null;
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }

  function applyTheme(theme) {
    const nextTheme = theme === "dark" ? "dark" : "light";
    rootEl.setAttribute("data-theme", nextTheme);
    btnTheme.textContent = nextTheme === "dark" ? "Tema claro" : "Tema oscuro";
    try {
      localStorage.setItem(THEME_KEY, nextTheme);
    } catch (e) {}
    updateBlockAccentUI();
    syncStarfield();
  }

  function readInitialTheme() {
    let saved = "dark";
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === "dark" || stored === "light") {
        saved = stored;
      }
    } catch (e) {}
    applyTheme(saved);
  }

  function readInitialHash() {
    const match = window.location.hash.match(/^#slide-(\d+)$/);
    if (match) {
      const parsed = parseInt(match[1], 10) - 1;
      if (!isNaN(parsed)) {
        currentIndex = clamp(parsed);
      }
    }
  }

  btnPrev.addEventListener("click", function () {
    goTo(currentIndex - 1);
  });

  btnNext.addEventListener("click", function () {
    goTo(currentIndex + 1);
  });

  btnOverview.addEventListener("click", function () {
    toggleOverview();
  });

  btnTheme.addEventListener("click", function () {
    applyTheme(getTheme() === "dark" ? "light" : "dark");
  });

  btnFullscreen.addEventListener("click", function () {
    toggleFullscreen();
  });

  btnPrint.addEventListener("click", function () {
    if (document.body.classList.contains("overview-mode")) {
      toggleOverview(false);
    }
    window.print();
  });

  slides.forEach(function (slide, idx) {
    slide.addEventListener("click", function () {
      if (document.body.classList.contains("overview-mode")) {
        goTo(idx);
        toggleOverview(false);
      }
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
      if (!document.body.classList.contains("overview-mode")) {
        event.preventDefault();
        goTo(currentIndex + 1);
      }
    } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
      if (!document.body.classList.contains("overview-mode")) {
        event.preventDefault();
        goTo(currentIndex - 1);
      }
    } else if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      goTo(slides.length - 1);
    } else if (event.key === "g" || event.key === "G") {
      toggleOverview();
    } else if (event.key === "t" || event.key === "T") {
      applyTheme(getTheme() === "dark" ? "light" : "dark");
    } else if (event.key === "Escape") {
      if (lightboxEl && lightboxEl.classList.contains("is-open")) {
        closeLightbox();
      } else if (document.body.classList.contains("overview-mode")) {
        toggleOverview(false);
      }
    } else if (event.key === "f" || event.key === "F") {
      toggleFullscreen();
    }
  });

  window.addEventListener("resize", function () {
    updateScale();
    if (getTheme() === "dark") {
      resizeStarfield();
    }
  });

  window.addEventListener("hashchange", function () {
    readInitialHash();
    render();
  });

  readInitialHash();
  readInitialTheme();
  render();
  updateScale();
})();
