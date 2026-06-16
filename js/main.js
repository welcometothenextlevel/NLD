(function () {
  const body = document.body;
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");

  function setHeaderState() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 12);
  }

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      const isOpen = body.classList.toggle("menu-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  document.querySelectorAll(".nav-link").forEach((link) => {
    const linkPath = new URL(link.href).pathname.replace(/\/$/, "");
    const currentPath = window.location.pathname.replace(/\/$/, "");
    if (linkPath === currentPath || (currentPath.endsWith("/index.html") && linkPath.endsWith("/"))) {
      link.classList.add("active");
    }
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll(".reveal, .reveal-left, .reveal-right").forEach((el) => revealObserver.observe(el));

  function animateCounter(el) {
    const target = Number(el.dataset.target || 0);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const decimals = Number(el.dataset.decimals || 0);
    const duration = 1700;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = prefix + value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.45 });

  document.querySelectorAll("[data-counter]").forEach((el) => counterObserver.observe(el));

  document.querySelectorAll("[data-tabs]").forEach((tabs) => {
    const buttons = tabs.querySelectorAll("[data-tab-target]");
    const panels = tabs.querySelectorAll("[data-tab-panel]");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const target = button.dataset.tabTarget;
        buttons.forEach((item) => item.classList.toggle("active", item === button));
        panels.forEach((panel) => panel.classList.toggle("active", panel.dataset.tabPanel === target));
      });
    });
  });

  document.querySelectorAll("[data-carousel]").forEach((shell) => {
    const carousel = shell.querySelector(".carousel");
    const prev = shell.querySelector("[data-prev]");
    const next = shell.querySelector("[data-next]");
    let timer;

    function move(direction) {
      if (!carousel) return;
      carousel.scrollBy({ left: direction * carousel.clientWidth * 0.82, behavior: "smooth" });
    }

    function start() {
      timer = window.setInterval(() => move(1), 5000);
    }

    function stop() {
      window.clearInterval(timer);
    }

    prev && prev.addEventListener("click", () => move(-1));
    next && next.addEventListener("click", () => move(1));
    shell.addEventListener("mouseenter", stop);
    shell.addEventListener("mouseleave", start);
    start();
  });
})();
