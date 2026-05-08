# Design Spec: HiFi Polish + Responsiveness + Mobile Nav

**Date:** 2026-05-09  
**Status:** Approved

---

## 1. Bug Fixes

| # | Bug | Fix |
|---|-----|-----|
| 1 | `projects-featured{grid-template-columns:1fr}` in `@media(max-width:980px)` collapses featured cards to single column on tablet — should stay 2-col | Remove that rule from the 980px breakpoint entirely |

---

## 2. Motion — Scroll Reveal

**Mechanism:** CSS classes + IntersectionObserver, no library.

**Targets** — add `.reveal` to:
- All `<section>` elements
- `.proj-card`, `.proj-feat`, `.cert`, `.np`, `.skill-cat`, `.tl-item` grid items

**CSS:**
```css
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity .6s ease, transform .6s ease;
}
.reveal.visible {
  opacity: 1;
  transform: none;
}
```

**Stagger:** nth-child CSS delays (0, 80ms, 160ms, 240ms) on grid children.

**JS:** Single IntersectionObserver (threshold 0.1) adds `.visible` when element enters viewport. ~20 lines. Boot screen already masks initial paint — no FOUC.

**Constraint:** `prefers-reduced-motion` media query disables all transitions/transforms.

---

## 3. Visual Depth

### Card hover glows
- `.proj-feat:hover` — `box-shadow: 0 0 32px rgba(255,40,64,0.18), 0 8px 40px rgba(0,0,0,0.5)`
- `.proj-card:hover` — `box-shadow: 0 0 20px rgba(125,249,255,0.12), 0 4px 28px rgba(0,0,0,0.45)`
- `.cert:hover` — `box-shadow: 0 0 24px rgba(216,178,90,0.15), 0 4px 28px rgba(0,0,0,0.45)`
- `.np:hover` — `box-shadow: 0 0 20px rgba(255,40,64,0.12), 0 4px 24px rgba(0,0,0,0.4)`

### Shimmer on `.btn.primary`
```css
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
.btn.primary {
  background: linear-gradient(90deg,
    rgba(255,40,64,0.05) 0%,
    rgba(255,40,64,0.18) 40%,
    rgba(255,40,64,0.05) 100%
  );
  background-size: 200% auto;
  animation: shimmer 3s linear infinite;
}
```

### Stronger HUD card glass
`.hud-card` — `backdrop-filter: blur(16px)`, add inner gradient `border: 1px solid rgba(232,230,224,0.14)`.

### Featured card gradient border
`.proj-feat` — replace static `border: 1px solid var(--line)` with glowing pseudo `::before`:
```css
.proj-feat::before {
  content: "";
  position: absolute;
  inset: -1px;
  background: linear-gradient(135deg, rgba(255,40,64,0.3), transparent 50%, rgba(125,249,255,0.15));
  z-index: -1;
  border-radius: inherit;
  opacity: 0;
  transition: opacity .3s;
}
.proj-feat:hover::before { opacity: 1; }
```

---

## 4. Mobile Hamburger Nav

**Trigger:** `<button class="nav-toggle">` inside `.statusbar`, visible only ≤980px (`display:none` on desktop).

**Sidenav mobile state:**
```css
@media (max-width: 980px) {
  .sidenav {
    display: flex;          /* override the existing display:none */
    left: -220px;
    top: 0;
    height: 100%;
    transform: none;
    transition: left .3s ease;
    z-index: 100;
    padding-top: 60px;
  }
  .sidenav.open { left: 0; }
}
```

**Backdrop:** `<div class="nav-backdrop">` — fixed overlay, `background: rgba(7,7,11,0.7)`, hidden by default, visible when `.sidenav.open`.

**JS behavior:**
- Toggle button → toggle `.sidenav.open` + `.nav-backdrop` visibility
- Click backdrop → close
- Click any nav link → close

**Hamburger icon:** Pure CSS 3-line (`::before`, `::after`, `::after` pseudo or spans). Animates to X when open.

---

## 5. Out of Scope
- No cursor glow / parallax
- No magnetic buttons
- No external libraries
- No dark/light toggle
- No changes to content/copy
