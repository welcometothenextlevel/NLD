/* ==========================================================================
   NEXT DIGITAL LEVEL — shared script
   Menu toggle · header state · scroll reveal · count-up · marquee clone
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
    // close when a link is chosen or Escape pressed
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
  // assign stagger index within each staggered group
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

  /* ---- count-up numbers ---- */
  function formatNumber(value, decimals, group) {
    var fixed = value.toFixed(decimals);
    if (group) {
      var parts = fixed.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      fixed = parts.join(".");
    }
    return fixed;
  }

  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-target")) || 0;
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var group = el.getAttribute("data-group") === "true";
    var duration = 1600;
    var startTime = null;

    function step(now) {
      if (startTime === null) startTime = now;
      var p = Math.min((now - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.firstChild.nodeValue = prefix + formatNumber(target * eased, decimals, group) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll("[data-counter]");
  counters.forEach(function (el) {
    // ensure a text node exists as first child so count-up can write to it
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var group = el.getAttribute("data-group") === "true";
    var target = parseFloat(el.getAttribute("data-target")) || 0;
    var finalText = prefix + formatNumber(target, decimals, group) + suffix;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      el.textContent = finalText;
      return;
    }
    el.textContent = prefix + formatNumber(0, decimals, group) + suffix;
  });

  if (!reduceMotion && "IntersectionObserver" in window) {
    var cObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          cObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cObs.observe(el); });
  }

  /* ---- marquee: duplicate track content once for a seamless loop ---- */
  document.querySelectorAll(".marquee__track").forEach(function (track) {
    if (reduceMotion) return;
    track.innerHTML += track.innerHTML;
  });
})();
