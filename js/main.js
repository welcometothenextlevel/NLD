/* ==========================================================================
   NEXT DIGITAL LEVEL — Site behaviour
   Nav · reveals · marquee · live-work carousel · booking calendar · WhatsApp
   ========================================================================== */
(function () {
  "use strict";

  var WA_NUMBER = "61425887683";
  var EMAIL = "contact@nextdigitalevel.com";
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function on(el, ev, fn, opts) { if (el) el.addEventListener(ev, fn, opts); }

  /* ---------------------------------------------------------------- 1. Nav */
  function initNav() {
    var header = $(".site-header");
    var burger = $(".nav__burger");
    var drawer = $(".drawer");
    if (!header) return;

    // The header stays pinned at all times — it only changes its own styling
    // once you've scrolled past the top. It deliberately does not hide on
    // scroll-down: that reads as a glitch, and the nav CTA is the main
    // conversion path, so it should always be one tap away.
    function onScroll() {
      header.classList.toggle("is-scrolled", window.pageYOffset > 24);
    }

    on(window, "scroll", onScroll, { passive: true });
    onScroll();

    function setDrawer(open) {
      if (!drawer || !burger) return;
      drawer.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("is-locked", open);
    }

    on(burger, "click", function () {
      setDrawer(!drawer.classList.contains("is-open"));
    });

    $$(".drawer a").forEach(function (a) {
      on(a, "click", function () { setDrawer(false); });
    });

    on(document, "keydown", function (e) {
      if (e.key === "Escape") setDrawer(false);
    });

    // Mark the active nav item on single-page anchors
    var sections = $$("section[id]");
    var links = $$('.nav__link[href*="#"]');
    if (!sections.length || !links.length || !("IntersectionObserver" in window)) return;

    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        links.forEach(function (l) {
          var href = l.getAttribute("href") || "";
          if (href.indexOf("#") === -1) return;
          l.classList.toggle("is-active", href.split("#")[1] === id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    sections.forEach(function (s) { seen.observe(s); });
  }

  /* ------------------------------------------------------------ 2. Reveals */
  function initReveals() {
    var targets = $$(".reveal, .stagger, .panel");
    if (!targets.length) return;

    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (t) { t.classList.add("is-in"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    targets.forEach(function (t) { io.observe(t); });

    // Backstop: if the observer is throttled (background tab, odd embedding),
    // nothing should ever be left invisible. Sweep on scroll and after load.
    var ticking = false;

    function sweep() {
      ticking = false;
      var h = window.innerHeight || document.documentElement.clientHeight;
      var remaining = 0;
      targets.forEach(function (t) {
        if (t.classList.contains("is-in")) return;
        remaining++;
        var r = t.getBoundingClientRect();
        if (r.top < h * 0.94 && r.bottom > 0) {
          t.classList.add("is-in");
          io.unobserve(t);
        }
      });
      if (!remaining) {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      }
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(sweep);
    }

    on(window, "scroll", onScroll, { passive: true });
    on(window, "resize", onScroll);
    setTimeout(sweep, 1200);
  }

  /* -------------------------------------------------------- 3. Hero words */
  function initHeroWords() {
    $$("[data-words]").forEach(function (el) {
      var parts = el.textContent.split(" ");
      el.textContent = "";
      parts.forEach(function (word, i) {
        var wrap = document.createElement("span");
        wrap.className = "word";
        var inner = document.createElement("span");
        inner.textContent = word;
        inner.style.animationDelay = 0.08 + i * 0.06 + "s";
        wrap.appendChild(inner);
        el.appendChild(wrap);
        if (i < parts.length - 1) el.appendChild(document.createTextNode(" "));
      });
    });
  }

  /* ---------------------------------------------------------- 4. Marquees */
  function initMarquee() {
    $$(".marquee__track").forEach(function (track) {
      track.innerHTML += track.innerHTML; // seamless 50% loop
      var speed = parseFloat(track.getAttribute("data-speed") || "42");
      track.style.animationDuration = speed + "s";
    });
  }

  /* ---------------------------------------------------------- 5. Counters */
  function animateNumber(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    if (isNaN(target)) return;

    if (REDUCED) {
      el.textContent = prefix + target.toFixed(decimals) + suffix;
      return;
    }

    var start = null;
    var dur = 1500;

    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function initCounters() {
    var nums = $$("[data-count]");
    var meters = $$(".meter__fill[data-fill]");
    if (!nums.length && !meters.length) return;

    if (!("IntersectionObserver" in window)) {
      nums.forEach(animateNumber);
      meters.forEach(function (m) { m.style.width = m.getAttribute("data-fill") + "%"; });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el.hasAttribute("data-count")) animateNumber(el);
        else el.style.width = el.getAttribute("data-fill") + "%";
        io.unobserve(el);
      });
    }, { threshold: 0.4 });

    nums.concat(meters).forEach(function (el) { io.observe(el); });
  }

  /* --------------------------------------------- 6. Live work carousel */
  var WORK = [
    { name: "Char's Beauty Room", cat: "Beauty studio · Altona Meadows, Melbourne", url: "https://charsbeautyroom.com.au/" },
    { name: "Talofa Support Services", cat: "NDIS provider · Melbourne", url: "https://talofasupportservices.com.au/" },
    { name: "The Visa Centre", cat: "Migration agency", url: "https://welcometothenextlevel.github.io/thevisacentre/" },
    { name: "Christus Jewelry", cat: "Jewellery · E-commerce", url: "https://welcometothenextlevel.github.io/christusjewelry/" },
    { name: "Ortensia Wedding", cat: "Wedding planning", url: "https://welcometothenextlevel.github.io/ortensiawedding/" },
    { name: "Citiport", cat: "Transport & booking", url: "https://welcometothenextlevel.github.io/citiport/" },
    { name: "Just Quality Lawn Care", cat: "Lawn & garden · Melbourne", url: "https://welcometothenextlevel.github.io/justqualitylawncare/" },
    { name: "Trident Cross Marine", cat: "Marine services", url: "https://welcometothenextlevel.github.io/tridentcrossmarineservices/" },
    { name: "All In 1 Party World", cat: "Party hire · Victoria", url: "https://welcometothenextlevel.github.io/allin1partyworld/" },
    { name: "E&J Carpet Cleaning", cat: "Carpet cleaning", url: "https://welcometothenextlevel.github.io/ejcarpetcleaning/" },
    { name: "Everest Badminton", cat: "Sports club", url: "https://welcometothenextlevel.github.io/badminton/" }
  ];

  var ARROW_OUT =
    '<svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">' +
    '<path d="M4 10 10 4M10 4H5.2M10 4v4.8" stroke="currentColor" stroke-width="1.5" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function buildCard(item) {
    var host = item.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
    var card = document.createElement("article");
    card.className = "wcard";
    card.innerHTML =
      '<div class="wcard__chrome">' +
        '<div class="wcard__dots"><i></i><i></i><i></i></div>' +
        '<div class="wcard__url">' + host + "</div>" +
      "</div>" +
      '<div class="wcard__screen">' +
        '<iframe class="wcard__frame" data-src="' + item.url + '" title="' + item.name +
          '" loading="lazy" scrolling="no" tabindex="-1" aria-hidden="true" ' +
          'sandbox="allow-scripts allow-same-origin" referrerpolicy="no-referrer"></iframe>' +
        '<div class="wcard__skeleton">Loading preview</div>' +
      "</div>" +
      '<div class="wcard__meta">' +
        "<div><b>" + item.name + "</b><span>" + item.cat + "</span></div>" +
        '<a class="wcard__open" href="' + item.url + '" target="_blank" rel="noopener noreferrer" ' +
          'aria-label="Open ' + item.name + ' in a new tab">' + ARROW_OUT + "</a>" +
      "</div>";
    return card;
  }

  function scaleFrames(rail) {
    $$(".wcard", rail).forEach(function (card) {
      var frame = $(".wcard__frame", card);
      if (!frame) return;
      var w = card.getBoundingClientRect().width;
      if (!w) return;
      frame.style.transform = "scale(" + w / 1440 + ")";
    });
  }

  function initWork() {
    var viewport = $("[data-work]");
    if (!viewport) return;

    // Each card is a live site, so on phones we show a shorter set rather than
    // making someone on mobile data load every preview twice over.
    var items = window.innerWidth < 720 ? WORK.slice(0, 6) : WORK;

    var rail = document.createElement("div");
    rail.className = "work__rail";
    items.forEach(function (item) { rail.appendChild(buildCard(item)); });
    // Duplicate the set so the loop never shows a gap
    items.forEach(function (item) { rail.appendChild(buildCard(item)); });
    viewport.appendChild(rail);

    scaleFrames(rail);
    var rescale = null;
    on(window, "resize", function () {
      clearTimeout(rescale);
      rescale = setTimeout(function () { scaleFrames(rail); }, 160);
    });

    // Lazy-load the iframes only when a card approaches the viewport
    function loadCard(card) {
      var frame = $(".wcard__frame", card);
      if (!frame || frame.src) return;
      frame.src = frame.getAttribute("data-src");
      on(frame, "load", function () { card.classList.add("is-loaded"); });
      setTimeout(function () { card.classList.add("is-loaded"); }, 5000);
    }

    if ("IntersectionObserver" in window) {
      var frameIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          loadCard(entry.target);
          frameIO.unobserve(entry.target);
        });
      }, { rootMargin: "300px" });
      $$(".wcard", rail).forEach(function (c) { frameIO.observe(c); });

      // Backstop for throttled observers: load whatever is on screen.
      var sweepFrames = function () {
        var h = window.innerHeight || document.documentElement.clientHeight;
        var w = window.innerWidth || document.documentElement.clientWidth;
        $$(".wcard", rail).forEach(function (c) {
          var r = c.getBoundingClientRect();
          if (r.top < h + 300 && r.bottom > -300 && r.left < w + 600 && r.right > -600) loadCard(c);
        });
      };
      on(window, "scroll", function () { requestAnimationFrame(sweepFrames); }, { passive: true });
      setTimeout(sweepFrames, 1800);
    } else {
      $$(".wcard", rail).forEach(loadCard);
    }

    /* ---- auto-scroll + drag ---- */
    var offset = 0;
    var speed = 0.42;          // px per frame
    var paused = false;
    var dragging = false;
    var dragStartX = 0;
    var dragStartOffset = 0;
    var half = 0;
    var raf = null;

    function measure() { half = rail.scrollWidth / 2; }
    measure();
    setTimeout(measure, 400);
    on(window, "resize", measure);

    function apply() {
      if (half > 0) {
        if (offset <= -half) offset += half;
        if (offset > 0) offset -= half;
      }
      rail.style.transform = "translate3d(" + offset + "px,0,0)";
    }

    function loop() {
      if (!paused && !dragging) {
        offset -= speed;
        apply();
      }
      raf = requestAnimationFrame(loop);
    }

    if (!REDUCED) raf = requestAnimationFrame(loop);
    else apply();

    on(viewport, "mouseenter", function () { paused = true; });
    on(viewport, "mouseleave", function () { paused = false; });
    on(viewport, "focusin", function () { paused = true; });
    on(viewport, "focusout", function () { paused = false; });

    // Pause when off-screen to save battery
    if ("IntersectionObserver" in window) {
      var visIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { if (!raf && !REDUCED) raf = requestAnimationFrame(loop); }
          else if (raf) { cancelAnimationFrame(raf); raf = null; }
        });
      }, { threshold: 0 });
      visIO.observe(viewport);
    }
    on(document, "visibilitychange", function () {
      paused = document.hidden;
    });

    function pointerDown(e) {
      dragging = true;
      viewport.classList.add("is-dragging");
      dragStartX = (e.touches ? e.touches[0].clientX : e.clientX);
      dragStartOffset = offset;
    }
    function pointerMove(e) {
      if (!dragging) return;
      var x = (e.touches ? e.touches[0].clientX : e.clientX);
      offset = dragStartOffset + (x - dragStartX);
      apply();
    }
    function pointerUp() {
      dragging = false;
      viewport.classList.remove("is-dragging");
    }

    on(viewport, "mousedown", function (e) { e.preventDefault(); pointerDown(e); });
    on(window, "mousemove", pointerMove);
    on(window, "mouseup", pointerUp);
    on(viewport, "touchstart", pointerDown, { passive: true });
    on(viewport, "touchmove", pointerMove, { passive: true });
    on(viewport, "touchend", pointerUp);

    var step = 422;
    on($("[data-work-prev]"), "click", function () { offset += step; apply(); });
    on($("[data-work-next]"), "click", function () { offset -= step; apply(); });
  }

  /* ------------------------------------------------- 7. Booking calendar */
  var MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  var DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  var SLOTS = ["9:00 am", "9:30 am", "10:00 am", "11:00 am", "12:00 pm",
    "1:00 pm", "2:00 pm", "3:00 pm", "4:00 pm", "5:00 pm"];

  function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function fmtDate(d) {
    return DOW[(d.getDay() + 6) % 7] + " " + d.getDate() + " " + MONTHS[d.getMonth()];
  }

  // A stable pseudo-random so "taken" slots don't reshuffle on every render
  function seededTaken(date, index) {
    var seed = (date.getFullYear() * 372 + date.getMonth() * 31 + date.getDate()) * 17 + index * 7;
    return (seed % 11) < 3;
  }

  function initCalendar() {
    var root = $("[data-calendar]");
    if (!root) return;

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var cursor = new Date(today.getFullYear(), today.getMonth(), 1);
    var lastMonth = new Date(today.getFullYear(), today.getMonth() + 3, 1);
    var selectedDate = null;
    var selectedTime = null;

    root.innerHTML =
      '<div class="cal__head">' +
        '<div><b>Book your free 15-minute call</b>' +
        "<span>Australia · AEST · no obligation</span></div>" +
        '<div class="cal__steps"><i class="on"></i><i></i><i></i></div>' +
      "</div>" +
      '<div class="cal__body" data-cal-body></div>' +
      '<div class="cal__foot" data-cal-foot></div>';

    var body = $("[data-cal-body]", root);
    var foot = $("[data-cal-foot]", root);
    var steps = $$(".cal__steps i", root);

    function setStep(n) {
      steps.forEach(function (s, i) { s.classList.toggle("on", i <= n); });
    }

    function isBookable(d) {
      var dow = d.getDay();
      if (dow === 0) return false;                 // closed Sundays
      if (d.getTime() < today.getTime()) return false;
      return true;
    }

    function renderMonth() {
      setStep(0);
      var first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
      var startPad = (first.getDay() + 6) % 7;     // Monday-first grid
      var daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
      var prevDisabled = cursor.getFullYear() === today.getFullYear() && cursor.getMonth() === today.getMonth();
      var nextDisabled = cursor.getTime() >= lastMonth.getTime();

      var html =
        '<div class="cal__month">' +
          "<b>" + MONTHS[cursor.getMonth()] + " " + cursor.getFullYear() + "</b>" +
          '<div class="cal__nav">' +
            '<button type="button" data-prev aria-label="Previous month"' + (prevDisabled ? " disabled" : "") + ">" +
              '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M8.5 3 4.5 7l4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            "</button>" +
            '<button type="button" data-next aria-label="Next month"' + (nextDisabled ? " disabled" : "") + ">" +
              '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M5.5 3l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            "</button>" +
          "</div>" +
        "</div>" +
        '<div class="cal__dow" aria-hidden="true">' +
          DOW.map(function (d) { return "<span>" + d[0] + "</span>"; }).join("") +
        "</div>" +
        '<div class="cal__grid" role="grid">';

      for (var p = 0; p < startPad; p++) {
        html += '<span class="cal__day is-empty" aria-hidden="true"></span>';
      }

      for (var day = 1; day <= daysInMonth; day++) {
        var d = new Date(cursor.getFullYear(), cursor.getMonth(), day);
        var ok = isBookable(d);
        var cls = "cal__day" + (ok ? " is-avail" : " is-off");
        if (sameDay(d, today)) cls += " is-today";
        if (selectedDate && sameDay(d, selectedDate)) cls += " is-selected";
        html += "<button type='button' class='" + cls + "' data-day='" + day + "'" +
          (ok ? "" : " disabled") +
          " aria-label='" + fmtDate(d) + (ok ? "" : " — unavailable") + "'" +
          " style='animation-delay:" + Math.min(day * 12, 320) + "ms'>" + day + "</button>";
      }

      html += "</div>";
      body.innerHTML = html;

      foot.innerHTML =
        '<p class="form-note">Pick a day that suits you — we\'ll confirm on WhatsApp within the hour. ' +
        "Prefer to talk now? <a class='tlink' href='" + waLink("Hi, I'd like to book a call about my website.") +
        "' target='_blank' rel='noopener'>Message us</a></p>";

      on($("[data-prev]", body), "click", function () {
        cursor = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1);
        renderMonth();
      });
      on($("[data-next]", body), "click", function () {
        cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
        renderMonth();
      });

      $$(".cal__day.is-avail", body).forEach(function (btn) {
        on(btn, "click", function () {
          selectedDate = new Date(cursor.getFullYear(), cursor.getMonth(), parseInt(btn.getAttribute("data-day"), 10));
          selectedTime = null;
          renderSlots();
        });
      });
    }

    function renderSlots() {
      setStep(1);
      var now = new Date();
      var html =
        '<div class="cal__recap">' +
          '<div><b>' + fmtDate(selectedDate) + "</b><span>15-minute call · AEST</span></div>" +
          '<button type="button" data-back>Change</button>' +
        "</div>" +
        '<div class="slots"><div class="slots__head"><b>Choose a time</b>' +
        '<span class="t-body-sm">All times AEST (Sydney)</span></div>' +
        '<div class="slots__grid">';

      var any = false;
      var isToday = sameDay(selectedDate, now);
      var allPast = isToday;
      SLOTS.forEach(function (t, i) {
        var taken = seededTaken(selectedDate, i);
        // Same-day: a time that has already passed can't be booked
        if (isToday) {
          var hr = parseInt(t, 10) + (t.indexOf("pm") > -1 && parseInt(t, 10) !== 12 ? 12 : 0);
          if (hr <= now.getHours()) taken = true;
          else allPast = false;
        }
        if (!taken) any = true;
        html += "<button type='button' class='slot' data-time=\"" + t + "\"" +
          (taken ? " disabled" : "") + " style='animation-delay:" + i * 40 + "ms'>" + t + "</button>";
      });

      html += "</div>";
      if (!any) {
        html += '<p class="cal__empty">' + (allPast
          ? "That's us done for today — pick tomorrow, or message us on WhatsApp and we'll sort a time."
          : "Fully booked that day — try another, or message us on WhatsApp.") + "</p>";
      }
      html += "</div>";
      body.innerHTML = html;

      foot.innerHTML = '<p class="form-note">Free, no obligation. We\'ll ask what your business does, ' +
        "what you want the website to achieve, and answer anything you want to ask.</p>";

      on($("[data-back]", body), "click", function () { selectedDate = null; renderMonth(); });
      $$(".slot:not(:disabled)", body).forEach(function (btn) {
        on(btn, "click", function () {
          selectedTime = btn.getAttribute("data-time");
          renderForm();
        });
      });
    }

    function renderForm() {
      setStep(2);
      body.innerHTML =
        '<div class="cal__recap">' +
          "<div><b>" + fmtDate(selectedDate) + " · " + selectedTime + "</b>" +
          "<span>15-minute call · AEST</span></div>" +
          '<button type="button" data-back>Change</button>' +
        "</div>" +
        '<form class="form-grid" data-book-form novalidate>' +
          '<div class="field"><label for="bk-name">Your name</label>' +
            '<input id="bk-name" name="name" type="text" autocomplete="name" placeholder="Jane Smith" required>' +
            '<span class="field__err">Please tell us your name</span></div>' +
          '<div class="field"><label for="bk-biz">Business name</label>' +
            '<input id="bk-biz" name="business" type="text" autocomplete="organization" placeholder="Smith Plumbing"></div>' +
          '<div class="field"><label for="bk-phone">Phone or WhatsApp</label>' +
            '<input id="bk-phone" name="phone" type="tel" autocomplete="tel" placeholder="04XX XXX XXX" required>' +
            '<span class="field__err">We need a number to call you on</span></div>' +
          '<div class="field"><label for="bk-email">Email</label>' +
            '<input id="bk-email" name="email" type="email" autocomplete="email" placeholder="you@business.com.au"></div>' +
          '<div class="field field--full"><label for="bk-goal">What do you need?</label>' +
            '<select id="bk-goal" name="goal">' +
              "<option>A new website</option>" +
              "<option>Website + advertising</option>" +
              "<option>Advertising only (Facebook &amp; Instagram)</option>" +
              "<option>A free sample first</option>" +
              "<option>Not sure yet — let's talk</option>" +
            "</select></div>" +
          '<div class="field field--full"><label for="bk-note">Anything we should know? (optional)</label>' +
            '<textarea id="bk-note" name="note" placeholder="What your business does, what you want the website to achieve..."></textarea></div>' +
          '<div class="field--full">' +
            '<button class="btn btn--primary btn--full btn--lg" type="submit">Confirm booking' +
            '<span class="btn__ico" aria-hidden="true">' + ARROW_OUT + "</span></button></div>" +
        "</form>" +
        '<div class="success" data-success>' +
          '<div class="success__ring"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
          '<path d="M5 12.5 10 17.5 19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
          '<h3 class="t-display-sm">Request sent</h3>' +
          '<p class="t-body-sm" data-success-msg></p>' +
        "</div>";

      foot.innerHTML = '<p class="form-note">Your details go straight to us — never shared, never sold.</p>';

      on($("[data-back]", body), "click", renderSlots);
      var form = $("[data-book-form]", body);
      on(form, "submit", function (e) {
        e.preventDefault();
        if (!validate(form)) return;

        var data = readForm(form);
        var msg =
          "New call booking — Next Digital Level\n" +
          "----------------------------------\n" +
          "When: " + fmtDate(selectedDate) + " at " + selectedTime + " (AEST)\n" +
          "Name: " + data.name + "\n" +
          (data.business ? "Business: " + data.business + "\n" : "") +
          "Phone: " + data.phone + "\n" +
          (data.email ? "Email: " + data.email + "\n" : "") +
          "Needs: " + data.goal + "\n" +
          (data.note ? "Notes: " + data.note : "");

        openWhatsApp(msg);

        form.style.display = "none";
        var ok = $("[data-success]", body);
        $("[data-success-msg]", body).innerHTML =
          "We've opened WhatsApp with your booking for <b>" + fmtDate(selectedDate) + " at " +
          selectedTime + "</b>. Just hit send and we'll confirm within the hour.<br><br>" +
          "WhatsApp didn't open? <a class='tlink' href='" + mailtoLink("Call booking — " + fmtDate(selectedDate) + " " + selectedTime, msg) + "'>Email it instead</a>.";
        ok.classList.add("is-visible");
      });
    }

    renderMonth();
  }

  /* ------------------------------------------------------ 8. Contact form */
  function readForm(form) {
    var out = {};
    $$("input, select, textarea", form).forEach(function (f) {
      if (f.name) out[f.name] = (f.value || "").trim();
    });
    return out;
  }

  function validate(form) {
    var valid = true;

    function flag(f, bad) {
      var field = f.closest(".field");
      if (field) field.classList.toggle("field--invalid", bad);
      if (bad && valid) { f.focus(); valid = false; }
    }

    $$("[required]", form).forEach(function (f) {
      flag(f, !f.value.trim());
    });

    // An email that's filled in has to look like one, required or not
    $$('input[type="email"]', form).forEach(function (f) {
      var v = f.value.trim();
      if (v) flag(f, !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
    });

    return valid;
  }

  function waLink(text) {
    return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text);
  }

  function mailtoLink(subject, body) {
    return "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  function openWhatsApp(text) {
    window.open(waLink(text), "_blank", "noopener");
  }

  function initContactForms() {
    $$("[data-contact-form]").forEach(function (form) {
      on(form, "submit", function (e) {
        e.preventDefault();
        if (!validate(form)) return;

        var d = readForm(form);
        var msg =
          "New enquiry — Next Digital Level\n" +
          "--------------------------------\n" +
          "Name: " + d.name + "\n" +
          (d.business ? "Business: " + d.business + "\n" : "") +
          "Phone: " + d.phone + "\n" +
          (d.email ? "Email: " + d.email + "\n" : "") +
          (d.goal ? "Interested in: " + d.goal + "\n" : "") +
          (d.note ? "Message: " + d.note : "");

        openWhatsApp(msg);

        var wrap = form.parentElement;
        var ok = $("[data-success]", wrap);
        form.style.display = "none";
        if (ok) {
          var m = $("[data-success-msg]", wrap);
          if (m) {
            m.innerHTML = "We've opened WhatsApp with your enquiry — hit send and we'll reply within the hour.<br><br>" +
              "WhatsApp didn't open? <a class='tlink' href='" + mailtoLink("Website enquiry", msg) + "'>Email it instead</a>.";
          }
          ok.classList.add("is-visible");
        }
      });

      $$("input, select, textarea", form).forEach(function (f) {
        on(f, "input", function () {
          var field = f.closest(".field");
          if (field) field.classList.remove("field--invalid");
        });
      });
    });
  }

  /* --------------------------------------------------- 9. WhatsApp widget */
  function initWhatsApp() {
    var wa = $("[data-wa]");
    if (!wa) return;

    var fab = $(".wa__fab", wa);
    var close = $(".wa__close", wa);

    function setOpen(open) { wa.classList.toggle("is-open", open); }

    on(fab, "click", function () { setOpen(!wa.classList.contains("is-open")); });
    on(close, "click", function (e) { e.stopPropagation(); setOpen(false); });
    on(document, "keydown", function (e) { if (e.key === "Escape") setOpen(false); });

    // Nudge open once, after the visitor has settled in
    if (!sessionStorage.getItem("ndl-wa-seen")) {
      setTimeout(function () {
        if (!wa.classList.contains("is-open")) {
          setOpen(true);
          sessionStorage.setItem("ndl-wa-seen", "1");
          setTimeout(function () { setOpen(false); }, 9000);
        }
      }, 14000);
    }

    // Wire every wa.me link that hasn't got its own message
    $$("[data-wa-msg]").forEach(function (a) {
      a.setAttribute("href", waLink(a.getAttribute("data-wa-msg")));
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    });
  }

  /* ------------------------------------------------------------- 10. FAQ */
  function initFaq() {
    $$(".faq__item").forEach(function (item) {
      var q = $(".faq__q", item);
      var a = $(".faq__a", item);
      if (!q || !a) return;

      on(q, "click", function () {
        var open = item.classList.contains("is-open");
        $$(".faq__item.is-open").forEach(function (other) {
          if (other === item) return;
          other.classList.remove("is-open");
          var oa = $(".faq__a", other);
          if (oa) oa.style.maxHeight = "0px";
          var oq = $(".faq__q", other);
          if (oq) oq.setAttribute("aria-expanded", "false");
        });
        item.classList.toggle("is-open", !open);
        q.setAttribute("aria-expanded", open ? "false" : "true");
        a.style.maxHeight = open ? "0px" : a.scrollHeight + "px";
      });
    });

    on(window, "resize", function () {
      $$(".faq__item.is-open .faq__a").forEach(function (a) {
        a.style.maxHeight = a.scrollHeight + "px";
      });
    });
  }

  /* --------------------------------------------------------- 11. Year etc */
  function initMisc() {
    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

    // Smooth-scroll in-page anchors with a nav offset
    $$('a[href^="#"]').forEach(function (a) {
      var id = a.getAttribute("href");
      if (!id || id === "#" || id.length < 2) return;
      on(a, "click", function (e) {
        var target = document.getElementById(id.slice(1));
        if (!target) return;
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.pageYOffset - 96;
        window.scrollTo({ top: top, behavior: REDUCED ? "auto" : "smooth" });
        history.replaceState(null, "", id);
      });
    });
  }

  /* ------------------------------------------------------------ 12. Boot */
  function boot() {
    initNav();
    initHeroWords();
    initReveals();
    initMarquee();
    initCounters();
    initWork();
    initCalendar();
    initContactForms();
    initWhatsApp();
    initFaq();
    initMisc();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
