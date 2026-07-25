/* ==========================================================================
   NEXT DIGITAL LEVEL — shared script
   Menu toggle · header state · scroll reveal · work carousel
   Respects prefers-reduced-motion.
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var body = document.body;

  /* ---- sticky header hairline on scroll ---- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- mobile menu ---- */
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".nav-links");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a") && body.classList.contains("menu-open")) {
        body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && body.classList.contains("menu-open")) {
        body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* ---- active nav link (relative-path aware) ---- */
  var here = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach(function (link) {
    var target = link.getAttribute("href").split("/").pop();
    if (target === here) link.classList.add("active");
  });

  /* ---- scroll reveal ---- */
  var revealEls = document.querySelectorAll(".reveal");
  document.querySelectorAll("[data-stagger]").forEach(function (group) {
    group.querySelectorAll(":scope > .reveal").forEach(function (el, i) {
      el.style.setProperty("--i", i);
    });
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { revObs.observe(el); });
  }

  /* ==========================================================================
     Work carousel — vanilla, no library.
     1 slide on mobile, 2 on tablet (>=768px), 3 on desktop (>=1024px).
     Auto-advances every 5s, pauses on hover/focus, swipeable, keyboard
     accessible, arrow buttons + dot indicators.
     ========================================================================== */
  document.querySelectorAll("[data-carousel]").forEach(function (root) {
    var viewport = root.querySelector(".carousel__viewport");
    var track = root.querySelector(".carousel__track");
    var slides = Array.prototype.slice.call(root.querySelectorAll(".carousel__slide"));
    var prevBtn = root.querySelector("[data-carousel-prev]");
    var nextBtn = root.querySelector("[data-carousel-next]");
    var dotsWrap = root.querySelector("[data-carousel-dots]");
    if (!track || !slides.length) return;

    var AUTO_MS = 5000;
    var timer = null;
    var index = 0;
    var perView = 1;
    var pageCount = 1;

    function getPerView() {
      var w = window.innerWidth;
      if (w >= 1024) return 3;
      if (w >= 768) return 2;
      return 1;
    }

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      for (var i = 0; i < pageCount; i++) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel__dot";
        dot.setAttribute("aria-label", "Go to slide " + (i + 1) + " of " + pageCount);
        dot.addEventListener("click", function (idx) {
          return function () { goTo(idx); restart(); };
        }(i));
        dotsWrap.appendChild(dot);
      }
    }

    function updateDots() {
      if (!dotsWrap) return;
      var dots = dotsWrap.querySelectorAll(".carousel__dot");
      dots.forEach(function (d, i) { d.classList.toggle("is-active", i === index); });
    }

    function updateArrows() {
      if (prevBtn) prevBtn.disabled = false;
      if (nextBtn) nextBtn.disabled = false;
    }

    function layout() {
      perView = getPerView();
      var slideWidth = 100 / perView;
      slides.forEach(function (slide) {
        slide.style.flexBasis = slideWidth + "%";
      });
      pageCount = Math.max(1, slides.length - perView + 1);
      if (index > pageCount - 1) index = pageCount - 1;
      buildDots();
      render();
    }

    function render() {
      var slideWidth = 100 / perView;
      track.style.transform = "translateX(-" + (index * slideWidth) + "%)";
      updateDots();
      updateArrows();
    }

    function goTo(i) {
      index = (i + pageCount) % pageCount;
      render();
    }

    function next() { goTo(index + 1); }
    function prevSlide() { goTo(index - 1); }

    function start() {
      if (reduceMotion) return;
      stop();
      timer = window.setInterval(next, AUTO_MS);
    }
    function stop() {
      if (timer) { window.clearInterval(timer); timer = null; }
    }
    function restart() { start(); }

    if (nextBtn) nextBtn.addEventListener("click", function () { next(); restart(); });
    if (prevBtn) prevBtn.addEventListener("click", function () { prevSlide(); restart(); });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", function (e) {
      if (!root.contains(e.relatedTarget)) start();
    });

    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { next(); restart(); }
      if (e.key === "ArrowLeft") { prevSlide(); restart(); }
    });

    /* touch swipe */
    var touchStartX = null;
    var touchDeltaX = 0;
    var vp = viewport || track;
    vp.addEventListener("touchstart", function (e) {
      touchStartX = e.touches[0].clientX;
      touchDeltaX = 0;
      stop();
    }, { passive: true });
    vp.addEventListener("touchmove", function (e) {
      if (touchStartX === null) return;
      touchDeltaX = e.touches[0].clientX - touchStartX;
    }, { passive: true });
    vp.addEventListener("touchend", function () {
      if (Math.abs(touchDeltaX) > 40) {
        if (touchDeltaX < 0) next(); else prevSlide();
      }
      touchStartX = null;
      touchDeltaX = 0;
      restart();
    });

    window.addEventListener("resize", layout, { passive: true });

    layout();
    start();
  });
})();
