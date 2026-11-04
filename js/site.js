/* Kushar Raj Kashyap — portfolio interactions (vanilla JS, no deps) */
(function () {
  "use strict";

  var doc = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Page-load transition ---------- */
  var start = performance.now();
  function markLoaded() {
    var wait = reduceMotion ? 0 : Math.max(0, 380 - (performance.now() - start));
    setTimeout(function () { doc.classList.add("is-loaded"); }, wait);
  }
  if (document.readyState === "complete") markLoaded(); else window.addEventListener("load", markLoaded);
  setTimeout(function () { doc.classList.add("is-loaded"); }, 2500); // fail-safe

  /* ---------- Toast ---------- */
  var toastEl = $("#toast"), toastT;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove("is-on"); }, 1800);
  }

  /* ---------- Theme ---------- */
  var themeBtn = $("#theme-toggle");
  var themeMeta = $('meta[name="theme-color"]');
  function applyThemeUI() {
    var light = doc.getAttribute("data-theme") === "light";
    themeBtn.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
    if (themeMeta) themeMeta.setAttribute("content", light ? "#f6f7fb" : "#0a0c10");
  }
  if (themeBtn) {
    applyThemeUI();
    themeBtn.addEventListener("click", function () {
      var next = doc.getAttribute("data-theme") === "light" ? "dark" : "light";
      doc.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      applyThemeUI();
    });
  }

  /* ---------- Mobile menu ---------- */
  var nav = $("#nav"), menuBtn = $("#menu-toggle");
  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  if (menuBtn) {
    menuBtn.addEventListener("click", function () { setMenu(!nav.classList.contains("is-open")); });
    $$("#nav-links a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); menuBtn.focus(); } });
  }

  /* ---------- Scroll: nav state, progress bar, timeline fill ---------- */
  var bar = $(".progress span");
  var timeline = $("#timeline"), tlFill = timeline && $(".timeline__fill", timeline);
  var ticking = false;
  function onScroll() {
    var y = window.scrollY, h = doc.scrollHeight - window.innerHeight;
    nav.classList.toggle("is-scrolled", y > 8);
    if (bar) bar.style.transform = "scaleX(" + (h > 0 ? Math.min(1, y / h) : 0) + ")";
    if (tlFill) {
      var r = timeline.getBoundingClientRect();
      var p = (window.innerHeight * 0.6 - r.top) / r.height;
      tlFill.style.setProperty("--p", Math.max(0, Math.min(1, p)).toFixed(3));
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- Scroll-spy ---------- */
  var links = $$("#nav-links a");
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("is-active"); a.removeAttribute("aria-current"); });
        var a = byId[en.target.id];
        if (a) { a.classList.add("is-active"); a.setAttribute("aria-current", "true"); }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Reveal on scroll + count-up ---------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion || isNaN(target)) { el.textContent = target + suffix; return; }
    var dur = 1300, t0 = performance.now();
    (function step(now) {
      var k = Math.min(1, (now - t0) / dur);
      var eased = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }
  var revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    $$("[data-count]").forEach(function (el) { el.textContent = "0" + (el.getAttribute("data-suffix") || ""); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-in");
        $$("[data-count]", en.target).forEach(countUp);
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Hero: role rotator + cursor spotlight ---------- */
  var rot = $("#rotator");
  if (rot && !reduceMotion) {
    var words = ["web interfaces", "browser games", "GenAI services", "backend APIs", "CI/CD pipelines"], i = 0;
    rot.style.transition = "opacity .35s, transform .35s";
    setInterval(function () {
      if (document.hidden) return;
      rot.style.opacity = "0"; rot.style.transform = "translateY(6px)";
      setTimeout(function () {
        i = (i + 1) % words.length; rot.textContent = words[i];
        rot.style.opacity = "1"; rot.style.transform = "none";
      }, 350);
    }, 2600);
  }
  var hero = $(".hero"), spot = $(".hero__spot");
  if (hero && spot && finePointer && !reduceMotion) {
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      spot.style.setProperty("--mx", (e.clientX - r.left) + "px");
      spot.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  }

  /* ---------- Skills filter ---------- */
  var filters = $$(".filter"), groups = $$(".skill-group");
  filters.forEach(function (btn) {
    var key = btn.getAttribute("data-filter");
    var n = key === "all" ? $$(".chip").length : $$('.skill-group[data-group="' + key + '"] .chip').length;
    var c = document.createElement("span"); c.className = "count"; c.textContent = n; btn.appendChild(c);
    btn.addEventListener("click", function () {
      filters.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      groups.forEach(function (g) {
        var match = key === "all" || g.getAttribute("data-group") === key;
        g.classList.toggle("is-dim", !match);
        g.classList.toggle("is-focus", match && key !== "all");
      });
    });
  });

  /* ---------- Project cards: tilt + spotlight ---------- */
  if (finePointer && !reduceMotion) {
    $$("[data-tilt]").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.classList.add("is-tilting");
        card.style.setProperty("--ry", ((x - 0.5) * 6).toFixed(2) + "deg");
        card.style.setProperty("--rx", ((0.5 - y) * 6).toFixed(2) + "deg");
        card.style.setProperty("--cx", (x * 100) + "%");
        card.style.setProperty("--cy", (y * 100) + "%");
      });
      card.addEventListener("pointerleave", function () {
        card.classList.remove("is-tilting");
        card.style.setProperty("--rx", "0deg"); card.style.setProperty("--ry", "0deg");
      });
    });
  }

  /* ---------- Diagram slots: fall back when export not present ---------- */
  function initDiagrams(root) {
    $$("[data-diagram]", root).forEach(function (fig) {
      var img = $("img", fig);
      if (!img) return;
      var empty = function () { fig.classList.add("is-empty"); };
      img.addEventListener("error", empty);
      if (img.complete && img.naturalWidth === 0) empty();
    });
  }
  initDiagrams(document);

  /* ---------- Dialog helpers ---------- */
  function wireDialog(dlg) {
    if (!dlg) return;
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg || e.target.closest("[data-close]")) dlg.close();
    });
  }

  /* ---------- Project drawer ---------- */
  var pDialog = $("#project-dialog"), pBody = $("#project-dialog-body"), lastFocus = null;
  wireDialog(pDialog);
  $$("[data-project]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var tpl = document.getElementById("tpl-" + btn.getAttribute("data-project"));
      if (!tpl || !pDialog.showModal) return;
      pBody.innerHTML = "";
      pBody.appendChild(tpl.content.cloneNode(true));
      initDiagrams(pBody);
      lastFocus = btn;
      pDialog.showModal();
      pDialog.scrollTop = 0;
      $("[data-close]", pDialog).focus();
    });
  });
  if (pDialog) pDialog.addEventListener("close", function () { if (lastFocus) lastFocus.focus(); });

  /* ---------- Lightbox ---------- */
  var lb = $("#lightbox"), lbImg = $("#lightbox-img"), lbStage = $("#lightbox-stage"), lbCap = $("#lightbox-caption"), lbOpen = $("#lightbox-open"), lbReturn = null;
  wireDialog(lb);
  document.addEventListener("click", function (e) {
    var trg = e.target.closest("[data-lightbox]");
    if (!trg || !lb || !lb.showModal) return;
    var fig = trg.closest("[data-diagram]");
    if (fig && fig.classList.contains("is-empty")) {
      e.preventDefault();
      var board = $("figcaption a", fig);
      if (board) window.open(board.href, "_blank", "noopener");
      return;
    }
    e.preventDefault();
    var src = trg.getAttribute("data-lightbox");
    var cap = trg.getAttribute("data-caption") || "";
    lbImg.src = src; lbImg.alt = cap; lbCap.textContent = cap; lbOpen.href = src;
    lbStage.classList.remove("is-zoomed");
    lbReturn = trg;
    lb.showModal();
  });
  if (lbStage) lbStage.addEventListener("click", function () { lbStage.classList.toggle("is-zoomed"); });
  if (lb) lb.addEventListener("close", function () { if (lbReturn) lbReturn.focus(); });

  /* ---------- Tabs (ARIA, arrow keys) ---------- */
  var tabs = $$('#wf-tabs [role="tab"]');
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute("aria-controls"));
      panel.hidden = !on;
      panel.classList.toggle("is-shown", on);
    });
    if (focus) tab.focus();
    tab.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
  }
  tabs.forEach(function (t, idx) {
    t.addEventListener("click", function () { selectTab(t, false); });
    t.addEventListener("keydown", function (e) {
      var n = null;
      if (e.key === "ArrowRight") n = tabs[(idx + 1) % tabs.length];
      else if (e.key === "ArrowLeft") n = tabs[(idx - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") n = tabs[0];
      else if (e.key === "End") n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); selectTab(n, true); }
    });
  });

  /* ---------- Copy buttons ---------- */
  var copyIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';
  function writeClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (res, rej) {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy") ? res() : rej(); } catch (e) { rej(e); }
      document.body.removeChild(ta);
    });
  }
  $$(".code .copy").forEach(function (btn) {
    btn.innerHTML = copyIcon + "<span>Copy</span>";
    btn.setAttribute("aria-label", "Copy command to clipboard");
    btn.addEventListener("click", function () {
      var code = $("pre", btn.closest(".code"));
      writeClipboard(code.textContent.replace(/\s+$/, "")).then(function () {
        btn.classList.add("is-done"); $("span", btn).textContent = "Copied";
        toast("Copied to clipboard");
        setTimeout(function () { btn.classList.remove("is-done"); $("span", btn).textContent = "Copy"; }, 1600);
      }, function () { toast("Copy failed — select and copy manually"); });
    });
  });
  $$("[data-copy-text]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      writeClipboard(btn.getAttribute("data-copy-text")).then(function () { toast("Email copied"); }, function () { toast("Copy failed"); });
    });
  });

  /* ---------- Workflow flow animation ---------- */
  var flow = $("#flow"), path = $("#flow-path"), packet = $("#flow-packet");
  if (flow && path && packet && !reduceMotion && path.getTotalLength) {
    var nodes = $$(".node", flow);
    var len = path.getTotalLength(), topLen = 720; // straight run from prompt (x=90) to push (x=810)
    var running = false, t0 = 0, period = 6500, raf;
    var frame = function (now) {
      var k = ((now - t0) % period) / period;
      var d = k * len;
      var pt = path.getPointAtLength(d);
      packet.setAttribute("cx", pt.x.toFixed(1)); packet.setAttribute("cy", pt.y.toFixed(1));
      var active = d <= topLen ? Math.min(4, Math.round((pt.x - 90) / 180)) : -1;
      nodes.forEach(function (n, idx) { n.classList.toggle("is-active", idx === active); });
      if (running) raf = requestAnimationFrame(frame);
    };
    new IntersectionObserver(function (en) {
      if (en[0].isIntersecting && !running) { running = true; t0 = performance.now(); raf = requestAnimationFrame(frame); }
      else if (!en[0].isIntersecting) { running = false; cancelAnimationFrame(raf); }
    }).observe(flow);
  }
})();

/* "More work" toggle */
(function () {
  var btn = document.getElementById("more-toggle"), panel = document.getElementById("more-work");
  if (!btn || !panel) return;
  btn.addEventListener("click", function () {
    var open = btn.getAttribute("aria-expanded") !== "true";
    btn.setAttribute("aria-expanded", String(open));
    panel.hidden = !open;
    btn.querySelector("span").textContent = open ? "Show less" : "More work";
    if (open) panel.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-in"); });
  });
})();
