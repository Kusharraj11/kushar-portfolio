# HiFi Polish + Responsive + Mobile Nav Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix one layout bug, add scroll-reveal animations, upgrade card hover glows + button shimmer, strengthen glass depth, and add a mobile hamburger nav — all in `index.html`, no libraries.

**Architecture:** Single-file HTML/CSS/JS portfolio. All CSS goes in the existing `<style>` block; new HTML (nav-toggle button, backdrop div) goes in `<body>`; new JS appends to the existing `<script>` block.

**Tech Stack:** Vanilla HTML, CSS (custom properties, keyframes), vanilla JS (IntersectionObserver)

---

### Task 1: Bug Fix — projects-featured stays 2-col on tablet

**Files:**
- Modify: `index.html` — `@media (max-width:980px)` block (~line 261)

- [ ] **Step 1: Remove the wrong single-column rule for projects-featured at 980px**

Find this exact string (inside `@media (max-width:980px)`):
```css
  .now-grid,.certs{grid-template-columns:repeat(2,1fr)}
  .projects-featured{grid-template-columns:1fr}
  .projects-grid{grid-template-columns:repeat(2,1fr)}
```

Replace with:
```css
  .now-grid,.certs{grid-template-columns:repeat(2,1fr)}
  .projects-grid{grid-template-columns:repeat(2,1fr)}
```

- [ ] **Step 2: Open `index.html` in browser, resize to 900px — verify featured project cards show side-by-side (2 columns)**

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "fix: keep projects-featured 2-col on tablet (was wrongly collapsing to 1-col)"
```

---

### Task 2: Visual Depth CSS — Glows, Shimmer, Glass

**Files:**
- Modify: `index.html` — `<style>` block, targeting existing `.btn.primary`, `.hud-card`, and hover rules

- [ ] **Step 1: Add shimmer keyframe + upgrade `.btn.primary`**

Find:
```css
.btn.primary{border-color:var(--crimson);color:var(--bone);background:linear-gradient(180deg,rgba(255,40,64,0.05),transparent)}
```

Replace with:
```css
.btn.primary{border-color:var(--crimson);color:var(--bone);background:linear-gradient(180deg,rgba(255,40,64,0.05),transparent);overflow:hidden}
.btn.primary::after{content:"";position:absolute;top:0;left:-100%;width:50%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,80,80,0.13),transparent);animation:btnShimmer 2.8s ease-in-out infinite;pointer-events:none}
@keyframes btnShimmer{0%{left:-100%}60%,100%{left:260%}}
```

- [ ] **Step 2: Strengthen `.hud-card` glass**

Find:
```css
.hud-card{border:1px solid var(--line);background:rgba(13,13,20,0.5);padding:22px;position:relative;backdrop-filter:blur(4px)}
```

Replace with:
```css
.hud-card{border:1px solid var(--line-2);background:rgba(13,13,20,0.6);padding:22px;position:relative;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
```

- [ ] **Step 3: Add crimson glow to `.proj-feat:hover`**

Find:
```css
.proj-feat:hover{border-color:var(--crimson);transform:translateY(-2px)}
```

Replace with:
```css
.proj-feat:hover{border-color:rgba(255,40,64,0.5);transform:translateY(-3px);box-shadow:0 0 0 1px rgba(255,40,64,0.1),0 0 32px rgba(255,40,64,0.18),0 8px 40px rgba(0,0,0,0.55)}
```

- [ ] **Step 4: Add cyan glow to `.proj-card:hover`**

Find:
```css
.proj-card:hover{border-color:rgba(125,249,255,0.3);transform:translateY(-2px)}
```

Replace with:
```css
.proj-card:hover{border-color:rgba(125,249,255,0.4);transform:translateY(-3px);box-shadow:0 0 0 1px rgba(125,249,255,0.08),0 0 20px rgba(125,249,255,0.13),0 6px 28px rgba(0,0,0,0.5)}
```

- [ ] **Step 5: Add gold glow to `.cert:hover`**

Find:
```css
.cert:hover{border-color:var(--gold);transform:translateY(-2px)}
```

Replace with:
```css
.cert:hover{border-color:rgba(216,178,90,0.55);transform:translateY(-3px);box-shadow:0 0 0 1px rgba(216,178,90,0.1),0 0 24px rgba(216,178,90,0.15),0 6px 28px rgba(0,0,0,0.5)}
```

- [ ] **Step 6: Add crimson glow to `.np:hover`**

Find:
```css
.np:hover{border-color:var(--crimson);transform:translateY(-2px)}
```

Replace with:
```css
.np:hover{border-color:rgba(255,40,64,0.45);transform:translateY(-3px);box-shadow:0 0 0 1px rgba(255,40,64,0.08),0 0 22px rgba(255,40,64,0.14),0 6px 26px rgba(0,0,0,0.5)}
```

- [ ] **Step 7: Open browser — hover over a project card, cert, now-playing card, and primary button. Verify glow + shimmer visible.**

- [ ] **Step 8: Commit**

```bash
git add index.html
git commit -m "feat: add card hover glows, button shimmer, stronger hud glass depth"
```

---

### Task 3: Scroll Reveal — CSS + HTML + JS

**Files:**
- Modify: `index.html` — CSS `<style>` block (new rules after `@keyframes gl`), HTML (add `.reveal` class to cards), `<script>` block (IntersectionObserver)

- [ ] **Step 1: Add scroll reveal CSS after the `@keyframes gl` block**

Find:
```css
@keyframes gl{0%{transform:translate(-3px,1px)}50%{transform:translate(3px,-1px)}100%{transform:translate(0,0)}}
```

Insert immediately after it (on the next line):
```css

.reveal{opacity:0;transform:translateY(24px);transition:opacity .55s ease,transform .55s ease}
.reveal.visible{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){.reveal,.reveal.visible{opacity:1 !important;transform:none !important;transition:none !important}}
```

- [ ] **Step 2: Add `.reveal` to each `.skill-cat` div (6 total)**

The skills grid has 6 `.skill-cat` divs. Find the opening tag of each and add `reveal` to the class. They all look like:
```html
      <div class="skill-cat">
```

Replace ALL occurrences with:
```html
      <div class="skill-cat reveal">
```

(Use replace-all — there are exactly 6 and all need it.)

- [ ] **Step 3: Add `.reveal` to each `.tl-item` div (5 total)**

Find:
```html
      <div class="tl-item now">
```
Replace with:
```html
      <div class="tl-item now reveal">
```

Then find all remaining `.tl-item` opens (4 more):
```html
      <div class="tl-item">
```
Replace ALL with:
```html
      <div class="tl-item reveal">
```

- [ ] **Step 4: Add `.reveal` to each `.np` article (3 total)**

Find all:
```html
      <article class="np"
```
Replace ALL with:
```html
      <article class="np reveal"
```

- [ ] **Step 5: Add `.reveal` to each `.cert` div (5 total)**

Find:
```html
      <div class="cert">
```
Replace ALL with:
```html
      <div class="cert reveal">
```

Also the full-width cert:
```html
      <div class="cert" style="grid-column:1/-1">
```
Replace with:
```html
      <div class="cert reveal" style="grid-column:1/-1">
```

- [ ] **Step 6: Add `.reveal` to project cards and featured cards**

Find all small grid cards (9 total):
```html
      <div class="proj-card">
```
Replace ALL with:
```html
      <div class="proj-card reveal">
```

Both featured cards have the same inline style — replace ALL occurrences of:
```html
      <div class="proj-feat" style="border-color:rgba(125,249,255,0.15)">
```
With:
```html
      <div class="proj-feat reveal" style="border-color:rgba(125,249,255,0.15)">
```
```

- [ ] **Step 7: Add IntersectionObserver + stagger JS — append inside `<script>` before the closing `</script>` tag**

Find:
```javascript
});
</script>
```
(This is the closing of the easter egg keydown listener and end of script.)

Replace with:
```javascript
});

// Scroll reveal
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if(e.isIntersecting){
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, {threshold:0.1, rootMargin:'0px 0px -40px 0px'});

document.querySelectorAll('.reveal').forEach((el, _, all) => {
  // stagger siblings in same grid parent
  const siblings = el.parentElement ? [...el.parentElement.querySelectorAll('.reveal')] : [];
  const idx = siblings.indexOf(el);
  if(idx > 0) el.style.transitionDelay = Math.min(idx * 0.08, 0.32) + 's';
  revealObserver.observe(el);
});
</script>
```

- [ ] **Step 8: Reload browser, scroll down — verify cards fade/slide up as they enter viewport. Verify stagger on project grid (each card appears slightly after previous).**

- [ ] **Step 9: Commit**

```bash
git add index.html
git commit -m "feat: add scroll-reveal animations with stagger on grid items"
```

---

### Task 4: Mobile Hamburger Nav

**Files:**
- Modify: `index.html` — `<style>` block (hamburger + mobile sidenav CSS), HTML (nav-toggle button + backdrop div), `<script>` block (toggle JS)

- [ ] **Step 1: Add hamburger button CSS + backdrop CSS — insert before the `@media` blocks**

Find:
```css
@media (max-width:980px){
```

Insert immediately before it:
```css
.nav-toggle{display:none;align-items:center;justify-content:center;width:30px;height:30px;background:none;border:1px solid var(--line);cursor:pointer;padding:0;flex-shrink:0;position:relative}
.nav-toggle span,.nav-toggle span::before,.nav-toggle span::after{display:block;width:16px;height:1.5px;background:var(--bone-dim);transition:all .25s ease;position:relative}
.nav-toggle span::before,.nav-toggle span::after{content:"";position:absolute;left:0;transition:all .25s ease}
.nav-toggle span::before{top:-5px}
.nav-toggle span::after{top:5px}
.nav-toggle.open span{background:transparent}
.nav-toggle.open span::before{transform:rotate(45deg);top:0;background:var(--crimson)}
.nav-toggle.open span::after{transform:rotate(-45deg);top:0;background:var(--crimson)}
.nav-backdrop{display:none;position:fixed;inset:0;background:rgba(7,7,11,0.75);z-index:105;backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px)}
.nav-backdrop.open{display:block}
```

- [ ] **Step 2: Add mobile sidenav overrides inside `@media (max-width:980px)` — at the end of that block**

Find (the end of the 980px block — just before `@media (max-width:640px)`):
```css
  .contact h3{font-size:44px}
  .avatar-frame{aspect-ratio:1/1.05;max-width:340px;margin-left:auto;margin-right:auto}
}
```

Replace with:
```css
  .contact h3{font-size:44px}
  .avatar-frame{aspect-ratio:1/1.05;max-width:340px;margin-left:auto;margin-right:auto}
  .nav-toggle{display:flex}
  .sidenav{display:flex;left:-220px;top:0;bottom:0;height:100%;transform:none;transition:left .3s cubic-bezier(.4,0,.2,1);z-index:110;padding-top:60px;width:200px;gap:14px}
  .sidenav.open{left:0}
}
```

- [ ] **Step 3: Add nav-toggle button HTML inside `.statusbar .right` div**

Find:
```html
  <div class="right">
    <span id="clock">--:--:-- IST</span>
    <span>v3.04.26</span>
    <span>侍 // BUSHIDŌ.MODE</span>
  </div>
```

Replace with:
```html
  <div class="right">
    <span id="clock">--:--:-- IST</span>
    <span>v3.04.26</span>
    <span>侍 // BUSHIDŌ.MODE</span>
    <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation"><span></span></button>
  </div>
```

- [ ] **Step 4: Add backdrop div to HTML — just before the sidenav**

Find:
```html
<nav class="sidenav">
```

Replace with:
```html
<div class="nav-backdrop" id="navBackdrop"></div>
<nav class="sidenav">
```

- [ ] **Step 5: Add mobile nav JS — append before `</script>` (before the scroll reveal code added in Task 3)**

Find (the start of the scroll reveal code added in Task 3):
```javascript
// Scroll reveal
```

Insert immediately before it:
```javascript
// Mobile nav
const navToggle = document.getElementById('navToggle');
const navBackdrop = document.getElementById('navBackdrop');
const sidenavEl = document.querySelector('.sidenav');

function closeNav(){
  if(navToggle) navToggle.classList.remove('open');
  if(sidenavEl) sidenavEl.classList.remove('open');
  if(navBackdrop) navBackdrop.classList.remove('open');
}

if(navToggle){
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    sidenavEl.classList.toggle('open');
    navBackdrop.classList.toggle('open');
  });
}
if(navBackdrop) navBackdrop.addEventListener('click', closeNav);
document.querySelectorAll('.sidenav a').forEach(a => a.addEventListener('click', closeNav));

```

- [ ] **Step 6: Resize browser to 600px — verify hamburger icon appears in top-right statusbar. Click it — verify sidenav slides in from left. Click a nav link — verify nav closes and scrolls to section. Click backdrop — verify nav closes.**

- [ ] **Step 7: Verify hamburger animates to X when open (middle line disappears, top/bottom form an X in crimson).**

- [ ] **Step 8: Commit**

```bash
git add index.html
git commit -m "feat: add mobile hamburger nav with slide-in sidenav and backdrop overlay"
```

---

### Task 5: Final Cross-Viewport Verification

- [ ] **Step 1: Desktop 1280px — scroll full page. Verify: no hamburger visible, all card glows work on hover, shimmer on primary buttons, cards reveal on scroll, no layout regressions.**

- [ ] **Step 2: Tablet 900px (DevTools) — verify: featured project cards are side-by-side (bug fix confirmed), hamburger appears, certs/now-grid show 2-col, sidenav slide works.**

- [ ] **Step 3: Mobile 375px — verify: all grids stack correctly, hamburger works, no horizontal overflow, statusbar doesn't clip button, scroll reveal works.**

- [ ] **Step 4: Reduced motion (DevTools → Rendering → Emulate prefers-reduced-motion) — verify cards appear immediately, no fade/slide animation.**

- [ ] **Step 5: Final commit if any minor fixes made, otherwise done.**
