# Multi-Portfolio Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace single-page gamer portfolio with a chooser landing that lets visitors pick one of three persona variants (gamer / professional / coder) — each rendered as its own static page with its own visual world.

**Architecture:** Three independent static HTML pages plus a chooser landing. Tiny shared JS+CSS layer (`shared/persona.js`, `shared/persona.css`) handles cross-page persona-switch + localStorage. Hosted on Cloudflare Pages. No backend, no build step. Notion content pulled at build time and hand-authored into `pro.html`.

**Tech Stack:** Vanilla HTML/CSS/JS (no framework, no bundler). Existing fonts: Zen Dots, JetBrains Mono, Noto Serif JP, Space Grotesk. localStorage for persistence. No test framework — manual browser verification per acceptance checklist (spec Section "Testing & Verification").

**Spec:** `docs/superpowers/specs/2026-05-09-multi-portfolio-entry-design.md`

---

## File Structure

| File | Purpose | Status |
|---|---|---|
| `index.html` | Chooser landing (teaser + modal + 3 tiles) | NEW (replaces existing) |
| `gamer.html` | Gamer variant — current `index.html` content + persona-switch | RENAME from `index.html` |
| `pro.html` | Professional variant — Notion-sourced content | NEW |
| `code.html` | Coder variant — fake-REPL terminal | NEW |
| `404.html` | Fallback page with persona links | NEW |
| `shared/persona.js` | localStorage + switch-button + force-modal | NEW |
| `shared/persona.css` | `.persona-switch` button styles | NEW |
| `assets/pro/` | Notion-pulled images (profile, gifs, project covers) | NEW DIR |
| `assets/pro/profile.jpg` | Hero photo | NEW |
| `assets/pro/anime.gif` | "Beyond my World" gif | NEW |
| `assets/pro/gaming.gif` | "in the WORLD of" gif | NEW |
| `assets/pro/tv.gif` | "Dark Worlds" gif | NEW |
| `assets/pro/projects/*.{jpg,png}` | Design project covers | NEW |

Each variant page has fully inline CSS/JS scoped to itself. Only cross-page concern (persona switch) lives in `shared/`.

---

## Task 1: Rename existing index.html to gamer.html

**Files:**
- Rename: `index.html` → `gamer.html`

- [ ] **Step 1: Rename file via git**

Run: `git mv index.html gamer.html`
Expected: file moved; `git status` shows `renamed: index.html -> gamer.html`.

- [ ] **Step 2: Update internal references inside gamer.html**

Search the file for any `href="index.html"` or `href="/"` links (e.g., logo links). Update them to `href="/gamer.html"` so the gamer page links to itself, not the chooser.

Run: `grep -n 'href="index.html"\|href="/"' gamer.html` (use Grep tool, not bash)
For each match, decide:
- Self-referencing logo / "back to home" link → change to `href="/gamer.html"`
- Anchor link `href="#section"` → leave as-is

- [ ] **Step 3: Open gamer.html in browser, confirm visual identity unchanged**

Open `gamer.html` directly in a browser (file://). Confirm:
- HUD frame, samurai theme, kanji rail all render
- All sections visible (hero, certs, projects, contact)
- Mobile nav opens (resize <900px)

- [ ] **Step 4: Commit**

```bash
git add gamer.html
git commit -m "refactor: rename index.html to gamer.html for multi-persona structure"
```

---

## Task 2: Create shared/persona.js

**Files:**
- Create: `shared/persona.js`

- [ ] **Step 1: Create shared directory**

Run: `mkdir shared` (use Bash tool with `mkdir -p shared`)
Expected: directory exists.

- [ ] **Step 2: Write persona.js**

Create `shared/persona.js` with the following exact content:

```js
(function () {
  const PERSONAS = ["gamer", "pro", "code"];
  const KEY = "persona";

  function getPersona() {
    try {
      const v = localStorage.getItem(KEY);
      return PERSONAS.includes(v) ? v : null;
    } catch (e) {
      return null;
    }
  }

  function setPersona(p) {
    if (!PERSONAS.includes(p)) return;
    try {
      localStorage.setItem(KEY, p);
    } catch (e) {
      /* ignore */
    }
  }

  function clearPersona() {
    try {
      localStorage.removeItem(KEY);
    } catch (e) {
      /* ignore */
    }
  }

  function isForceParam() {
    return new URLSearchParams(location.search).has("force");
  }

  function maybeAutoRoute() {
    if (isForceParam()) return false;
    const p = getPersona();
    if (!p) return false;
    location.replace(`/${p}.html`);
    return true;
  }

  function mountSwitchButton() {
    if (document.querySelector(".persona-switch")) return;
    const a = document.createElement("a");
    a.className = "persona-switch";
    a.href = "/?force=1";
    a.textContent = "↺ switch persona";
    document.body.appendChild(a);
  }

  window.persona = {
    PERSONAS,
    get: getPersona,
    set: setPersona,
    clear: clearPersona,
    isForce: isForceParam,
    maybeAutoRoute,
    mountSwitchButton,
  };
})();
```

- [ ] **Step 3: Verify in browser console**

Open any HTML file (e.g., `gamer.html`) with `<script src="/shared/persona.js" defer></script>` temporarily added.
In console, run: `window.persona.set("gamer"); window.persona.get();` → returns `"gamer"`.
Then `window.persona.clear(); window.persona.get();` → returns `null`.
Remove the temp script tag before committing.

- [ ] **Step 4: Commit**

```bash
git add shared/persona.js
git commit -m "feat: add shared persona module for localStorage and switch button"
```

---

## Task 3: Create shared/persona.css

**Files:**
- Create: `shared/persona.css`

- [ ] **Step 1: Write persona.css**

Create `shared/persona.css` with exact content:

```css
.persona-switch {
  position: fixed;
  top: 18px;
  right: 18px;
  z-index: 100;
  font: 500 10px/1 "JetBrains Mono", ui-monospace, monospace;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  text-decoration: none;
  padding: 8px 12px;
  border: 1px solid var(--persona-switch-border, currentColor);
  background: var(--persona-switch-bg, transparent);
  color: var(--persona-switch-fg, currentColor);
  opacity: 0.7;
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: auto;
  user-select: none;
}

.persona-switch:hover,
.persona-switch:focus-visible {
  opacity: 1;
  transform: translateY(-1px);
  outline: none;
}

@media (max-width: 640px) {
  .persona-switch {
    top: 10px;
    right: 10px;
    padding: 6px 10px;
    font-size: 9px;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add shared/persona.css
git commit -m "feat: add shared persona-switch button stylesheet"
```

---

## Task 4: Wire persona switch into gamer.html

**Files:**
- Modify: `gamer.html` (add `<head>` link/script + `<body>` switch button)

- [ ] **Step 1: Add link + script to gamer.html `<head>`**

Find the line in `gamer.html` matching `<link href="https://fonts.googleapis.com/css2?...` (the Google Fonts link).
Immediately AFTER that line, add:

```html
<link rel="stylesheet" href="/shared/persona.css">
<script src="/shared/persona.js" defer></script>
```

- [ ] **Step 2: Define persona-switch CSS vars in gamer.html style block**

In `gamer.html`, find the `:root` selector inside the `<style>` block. After the existing `--gold:#d8b25a;` line, add:

```css
  --persona-switch-fg: var(--bone);
  --persona-switch-bg: rgba(13,13,20,0.7);
  --persona-switch-border: var(--line-2);
```

- [ ] **Step 3: Mount switch button via JS**

In `gamer.html`, find the closing `</body>` tag. Immediately BEFORE it, add:

```html
<script>
  if (window.persona) window.persona.mountSwitchButton();
</script>
```

- [ ] **Step 4: Manual verify in browser**

Open `gamer.html` in browser. Confirm:
- Top-right corner shows `↺ SWITCH PERSONA` button
- Hover: button becomes opaque, shifts up 1px
- Click: navigates to `/?force=1` (will 404 until Task 6 builds chooser; that's fine for now)
- No console errors

- [ ] **Step 5: Commit**

```bash
git add gamer.html
git commit -m "feat: wire persona-switch button into gamer page"
```

---

## Task 5: Create 404.html

**Files:**
- Create: `404.html`

- [ ] **Step 1: Write 404.html**

Create `404.html` with exact content:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>404 — kushar.raj</title>
<link rel="stylesheet" href="/shared/persona.css">
<style>
  :root {
    --persona-switch-fg: #e8e6e0;
    --persona-switch-bg: rgba(13,13,20,0.7);
    --persona-switch-border: rgba(232,230,224,0.18);
  }
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{
    background:#07070b;color:#e8e6e0;
    font-family:"JetBrains Mono",ui-monospace,monospace;
    min-height:100vh;display:flex;align-items:center;justify-content:center;
    padding:24px;
  }
  .wrap{max-width:520px;text-align:center}
  .code{font-size:96px;color:#ff2840;font-weight:200;letter-spacing:-.02em;line-height:1}
  .msg{margin-top:16px;color:#8d8a82;font-size:13px;letter-spacing:.18em;text-transform:uppercase}
  .links{margin-top:36px;display:flex;flex-direction:column;gap:10px}
  .links a{
    color:#e8e6e0;text-decoration:none;border:1px solid rgba(232,230,224,0.18);
    padding:12px 18px;font-size:11px;letter-spacing:.22em;text-transform:uppercase;
    transition:border-color .2s, color .2s;
  }
  .links a:hover{border-color:#ff2840;color:#ff2840}
  .home{margin-top:24px;font-size:10px;letter-spacing:.32em;color:#56544f;text-transform:uppercase}
  .home a{color:#7df9ff;text-decoration:none}
  .home a:hover{text-decoration:underline}
</style>
</head>
<body>
  <div class="wrap">
    <div class="code">404</div>
    <div class="msg">// path not found</div>
    <div class="links">
      <a href="/gamer.html">→ Gamer</a>
      <a href="/pro.html">→ Professional</a>
      <a href="/code.html">→ Coder</a>
    </div>
    <div class="home">or <a href="/?force=1">return to chooser</a></div>
  </div>
</body>
</html>
```

- [ ] **Step 2: Manual verify**

Open `404.html` directly in browser. Confirm:
- Big red `404` renders
- Three persona links + "return to chooser" link
- Hover state on each link shows red border
- Mobile responsive (resize <500px)

- [ ] **Step 3: Commit**

```bash
git add 404.html
git commit -m "feat: add 404 fallback page with persona links"
```

---

## Task 6: Create chooser index.html — base structure + teaser

**Files:**
- Create: `index.html` (replaces deleted/renamed file from Task 1)

- [ ] **Step 1: Write index.html base shell**

Create `index.html` with this initial content (modal/tiles added in next tasks):

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>KUSHAR.RAJ — choose your path</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Zen+Dots&family=JetBrains+Mono:wght@300;400;500;700&family=Noto+Serif+JP:wght@200;400;700;900&family=Space+Grotesk:wght@200;300;400;500;600;700&display=swap" rel="stylesheet">
<script src="/shared/persona.js" defer></script>
<style>
  :root {
    --ink:#07070b;
    --ink-2:#0d0d14;
    --bone:#e8e6e0;
    --bone-dim:#8d8a82;
    --bone-faint:#56544f;
    --crimson:#ff2840;
    --cyan:#7df9ff;
    --line:rgba(232,230,224,0.10);
    --line-2:rgba(232,230,224,0.18);
  }
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{
    background:var(--ink);color:var(--bone);
    font-family:"JetBrains Mono",ui-monospace,monospace;font-size:14px;
    line-height:1.55;-webkit-font-smoothing:antialiased;
    overflow-x:hidden;min-height:100vh;
  }

  /* TEASER HERO */
  .teaser{
    position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
    background:radial-gradient(900px 600px at 50% 50%, rgba(255,40,64,0.06), transparent 70%), var(--ink);
    z-index:1;
  }
  .teaser .label{
    font-size:10px;letter-spacing:.4em;color:var(--bone-faint);text-transform:uppercase;
  }
  .teaser .word{
    font-family:"Zen Dots",sans-serif;font-size:clamp(56px,12vw,180px);
    color:var(--bone);letter-spacing:-.02em;line-height:1;margin-top:18px;
    opacity:0;animation:wordIn 600ms cubic-bezier(.2,.7,.2,1) 100ms forwards;
  }
  .teaser .underline{
    width:0;height:2px;background:var(--crimson);margin-top:24px;
    animation:lineGrow 700ms cubic-bezier(.2,.7,.2,1) 800ms forwards;
  }
  .teaser .loading{
    margin-top:18px;font-size:10px;letter-spacing:.32em;color:var(--bone-faint);
    text-transform:uppercase;opacity:0;animation:fadeIn 400ms 1100ms forwards;
  }
  .teaser .kanji-bg{
    position:absolute;font-family:"Noto Serif JP",serif;font-weight:900;
    font-size:clamp(280px,40vw,520px);color:var(--bone);opacity:0.025;
    pointer-events:none;user-select:none;line-height:.85;
  }

  @keyframes wordIn { 0%{opacity:0;transform:translateY(12px)} 100%{opacity:1;transform:translateY(0)} }
  @keyframes lineGrow { 0%{width:0} 100%{width:120px} }
  @keyframes fadeIn { 0%{opacity:0} 100%{opacity:0.85} }

  .teaser.hidden{opacity:0;pointer-events:none;transition:opacity 400ms ease}
</style>
</head>
<body>

<div class="teaser" id="teaser">
  <div class="kanji-bg">三</div>
  <div class="label">// kushar.raj</div>
  <div class="word">KUSHAR</div>
  <div class="underline"></div>
  <div class="loading">// loading personas...</div>
</div>

<noscript>
  <div style="position:fixed;inset:0;background:#07070b;color:#e8e6e0;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:monospace;padding:24px;text-align:center">
    <div style="font-size:48px;color:#ff2840;font-family:'Zen Dots',sans-serif">KUSHAR</div>
    <div style="margin-top:18px;font-size:11px;letter-spacing:.32em;color:#8d8a82;text-transform:uppercase">choose your path</div>
    <div style="margin-top:32px;display:flex;flex-direction:column;gap:10px">
      <a href="/gamer.html" style="color:#e8e6e0;border:1px solid rgba(232,230,224,0.2);padding:12px 24px;text-decoration:none">→ Gamer</a>
      <a href="/pro.html" style="color:#e8e6e0;border:1px solid rgba(232,230,224,0.2);padding:12px 24px;text-decoration:none">→ Professional</a>
      <a href="/code.html" style="color:#e8e6e0;border:1px solid rgba(232,230,224,0.2);padding:12px 24px;text-decoration:none">→ Coder</a>
    </div>
  </div>
</noscript>

<script>
  // Auto-route returning visitors (unless ?force=1)
  if (window.persona && window.persona.maybeAutoRoute()) {
    // page navigates away; nothing else to do
  }
</script>

</body>
</html>
```

- [ ] **Step 2: Manual verify teaser**

Open `index.html` in browser. Confirm:
- "KUSHAR" wordmark fades in
- Underline grows from 0 to 120px
- "// loading personas..." label fades in
- Faint 三 kanji visible behind
- No console errors
- No-JS check: temporarily disable JS in devtools, refresh — see fallback links

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add chooser landing teaser hero with auto-route"
```

---

## Task 7: Add modal frame + header/footer to chooser

**Files:**
- Modify: `index.html` (add modal CSS + DOM after teaser)

- [ ] **Step 1: Append modal CSS to index.html style block**

In `index.html`, find the `.teaser.hidden` rule. Immediately AFTER it, before the closing `</style>`, append:

```css
/* MODAL */
.modal-wrap{
  position:fixed;inset:0;display:flex;align-items:center;justify-content:center;
  padding:24px;z-index:2;opacity:0;pointer-events:none;
  transition:opacity 400ms cubic-bezier(.2,.7,.2,1);
}
.modal-wrap.visible{opacity:1;pointer-events:auto}

.modal{
  width:100%;max-width:1040px;
  border:1px solid var(--line-2);
  background:linear-gradient(180deg,rgba(13,13,20,0.85),rgba(7,7,11,0.92));
  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
  padding:42px 36px 32px;
  transform:translateY(12px);transition:transform 400ms cubic-bezier(.2,.7,.2,1);
}
.modal-wrap.visible .modal{transform:translateY(0)}

.modal-head{
  display:flex;align-items:flex-end;justify-content:space-between;gap:24px;
  border-bottom:1px solid var(--line);padding-bottom:18px;margin-bottom:30px;
}
.modal-head .title-block .lbl{
  font-size:10px;letter-spacing:.4em;color:var(--crimson);text-transform:uppercase;
}
.modal-head .title-block h1{
  font-family:"Space Grotesk",sans-serif;font-weight:200;
  font-size:clamp(24px,3.5vw,34px);color:var(--bone);
  margin-top:6px;letter-spacing:-.015em;line-height:1;
}
.modal-head .right{text-align:right}
.modal-head .right .kanji{
  font-family:"Noto Serif JP",serif;font-size:24px;color:var(--bone-faint);line-height:1;
}
.modal-head .right .sub{
  font-size:9px;letter-spacing:.3em;color:var(--bone-faint);margin-top:4px;text-transform:uppercase;
}

.modal-foot{
  display:flex;align-items:center;justify-content:space-between;gap:12px;
  margin-top:28px;font-size:9.5px;letter-spacing:.28em;
  color:var(--bone-faint);text-transform:uppercase;flex-wrap:wrap;
}
.modal-foot .kbd{display:flex;gap:14px}

@media (max-width:640px){
  .modal{padding:28px 18px 22px}
  .modal-head{flex-direction:column;align-items:flex-start;gap:10px}
  .modal-head .right{text-align:left}
  .modal-foot{flex-direction:column;align-items:flex-start;gap:8px}
  .modal-foot .kbd{flex-wrap:wrap;gap:10px}
}
```

- [ ] **Step 2: Add modal HTML after `<noscript>` block**

In `index.html`, find the closing `</noscript>`. Immediately AFTER it (before the `<script>` tag for auto-route), add:

```html
<div class="modal-wrap" id="modalWrap" aria-hidden="true">
  <div class="modal" role="dialog" aria-labelledby="modalTitle" aria-modal="true">
    <div class="modal-head">
      <div class="title-block">
        <div class="lbl">// access protocol</div>
        <h1 id="modalTitle">Choose your path</h1>
      </div>
      <div class="right">
        <div class="kanji">三</div>
        <div class="sub">three identities · one me</div>
      </div>
    </div>

    <div class="tiles" id="tiles">
      <!-- TILES inserted in next task -->
    </div>

    <div class="modal-foot">
      <div>// pick a path. switch anytime via persona menu.</div>
      <div class="kbd">
        <span>↹ tab to navigate</span>
        <span>↵ enter to confirm</span>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Show modal after teaser delay**

Replace the existing auto-route `<script>` block with:

```html
<script>
  // Auto-route returning visitors (unless ?force=1)
  if (window.persona && window.persona.maybeAutoRoute()) {
    // navigates away
  } else {
    // First visit (or forced): play teaser, then reveal modal
    setTimeout(() => {
      const teaser = document.getElementById("teaser");
      const wrap = document.getElementById("modalWrap");
      if (teaser) teaser.classList.add("hidden");
      if (wrap) {
        wrap.classList.add("visible");
        wrap.setAttribute("aria-hidden", "false");
      }
    }, 1500);
  }
</script>
```

- [ ] **Step 4: Manual verify**

Open `index.html` in browser. Confirm:
- Teaser plays for ~1.5s
- Teaser fades out, modal frame fades + slides in
- Modal header shows label + "Choose your path" + 三 + subtitle
- Modal footer shows kbd hints
- Tiles area is empty (next task fills it)
- No console errors

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: add chooser modal frame with header and footer"
```

---

## Task 8: Add three tiles to chooser modal

**Files:**
- Modify: `index.html` (add tile CSS + tile DOM)

- [ ] **Step 1: Append tile CSS to index.html style block**

In `index.html` style block, before closing `</style>`, append:

```css
/* TILES */
.tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
@media (max-width:900px){.tiles{grid-template-columns:1fr;gap:14px}}

.tile{
  position:relative;height:420px;cursor:pointer;overflow:hidden;
  border:1px solid;text-decoration:none;color:inherit;display:block;
  transition:transform .35s cubic-bezier(.2,.7,.2,1), border-color .25s, box-shadow .25s;
}
.tile:hover,.tile:focus-visible{transform:translateY(-4px);outline:none}

.tile .meta-num{
  position:absolute;top:16px;right:18px;z-index:5;
  font-size:9px;letter-spacing:.32em;
}

.tile .enter-cta{
  position:absolute;bottom:0;left:0;right:0;padding:14px 22px;
  display:flex;align-items:center;justify-content:space-between;gap:8px;z-index:4;
  backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);
}
.tile .enter-cta .arrow{
  width:24px;height:1px;background:currentColor;position:relative;transition:width .25s;
}
.tile .enter-cta .arrow::after{
  content:"";position:absolute;right:0;top:-3px;width:7px;height:7px;
  border-top:1px solid currentColor;border-right:1px solid currentColor;transform:rotate(45deg);
}
.tile:hover .enter-cta .arrow{width:42px}

/* GAMER tile */
.tile-gamer{background:linear-gradient(180deg,#0a0a0f 0%,#070710 100%);border-color:rgba(255,40,64,0.32)}
.tile-gamer:hover{border-color:#ff2840;box-shadow:0 0 0 1px rgba(255,40,64,0.4),0 20px 60px -10px rgba(255,40,64,0.25)}
.tile-gamer::before{content:"";position:absolute;inset:0;background:radial-gradient(600px 400px at 50% 20%,rgba(255,40,64,0.22),transparent 65%);pointer-events:none}
.tile-gamer::after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,0.025) 0 1px,transparent 1px 3px);pointer-events:none;mix-blend-mode:overlay}
.tile-gamer .corner{position:absolute;width:14px;height:14px;z-index:3}
.tile-gamer .corner.tl{top:8px;left:8px;border-top:1px solid #ff2840;border-left:1px solid #ff2840}
.tile-gamer .corner.br{bottom:8px;right:8px;border-bottom:1px solid #ff2840;border-right:1px solid #ff2840}
.tile-gamer .corner.tr{top:8px;right:8px;border-top:1px solid #7df9ff;border-right:1px solid #7df9ff;opacity:.4}
.tile-gamer .corner.bl{bottom:8px;left:8px;border-bottom:1px solid #7df9ff;border-left:1px solid #7df9ff;opacity:.4}
.tile-gamer .gamer-kanji{
  position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  font-family:"Noto Serif JP",serif;font-weight:900;font-size:clamp(180px,28vw,280px);
  color:#ff2840;opacity:0.92;line-height:.85;letter-spacing:-.04em;
}
.tile-gamer .gamer-rail{
  position:absolute;right:12px;top:50%;transform:translateY(-50%);writing-mode:vertical-rl;
  font-family:"Noto Serif JP",serif;font-size:11px;letter-spacing:.4em;color:rgba(232,230,224,0.4);z-index:3;
}
.tile-gamer .live{
  position:absolute;top:38px;left:22px;z-index:3;
  display:inline-flex;align-items:center;gap:6px;font-size:9px;
  letter-spacing:.3em;color:#8d8a82;text-transform:uppercase;
}
.tile-gamer .live .dot{width:6px;height:6px;border-radius:50%;background:#ff2840;box-shadow:0 0 8px #ff2840;animation:pulse 1.6s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
.tile-gamer .enter-cta{color:#e8e6e0;background:linear-gradient(180deg,transparent,rgba(0,0,0,0.85));border-top:1px solid rgba(255,40,64,0.25)}

/* PRO tile */
.tile-pro{background:linear-gradient(170deg,#f5f3ec 0%,#e8e4d8 100%);color:#14141d;border-color:rgba(232,230,224,0.18)}
.tile-pro:hover{border-color:#14141d;box-shadow:0 20px 60px -12px rgba(0,0,0,0.4)}
.tile-pro::before{content:"";position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(20,20,29,0.3),transparent)}
.tile-pro .pro-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(20,20,29,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(20,20,29,0.025) 1px,transparent 1px);background-size:24px 24px;opacity:.7;pointer-events:none}
.tile-pro .pro-content{position:relative;z-index:2;padding:38px 24px 0}
.tile-pro .pro-eyebrow{font-size:9.5px;letter-spacing:.32em;color:#56544f;text-transform:uppercase;margin-bottom:14px;display:flex;align-items:center;gap:8px}
.tile-pro .pro-eyebrow span{width:24px;height:1px;background:#14141d}
.tile-pro .pro-name{font-family:"Space Grotesk",sans-serif;font-weight:200;font-size:clamp(30px,3.4vw,42px);line-height:1;color:#14141d;letter-spacing:-.03em}
.tile-pro .pro-name b{font-weight:500}
.tile-pro .pro-bio{margin-top:18px;font-family:"Space Grotesk",sans-serif;font-size:13px;line-height:1.55;color:#3a3a44;max-width:90%}
.tile-pro .chips{position:absolute;bottom:78px;left:24px;right:24px;display:flex;gap:6px;flex-wrap:wrap;z-index:2}
.tile-pro .chip{font-size:9px;border:1px solid rgba(20,20,29,0.2);padding:3px 8px;letter-spacing:.15em;color:#3a3a44}
.tile-pro .enter-cta{color:#14141d;background:rgba(245,243,236,0.92);border-top:1px solid rgba(20,20,29,0.12)}

/* CODER tile */
.tile-coder{background:#000;border-color:rgba(125,249,255,0.22);font-family:"JetBrains Mono",monospace}
.tile-coder:hover{border-color:#7df9ff;box-shadow:0 0 0 1px rgba(125,249,255,0.4),0 20px 60px -10px rgba(125,249,255,0.18)}
.term-bar{height:26px;background:linear-gradient(180deg,#1c1c1f,#141416);border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;padding:0 12px;gap:6px}
.term-dot{width:11px;height:11px;border-radius:50%}
.term-body{padding:18px 18px 80px;font-size:11.5px;line-height:1.85;color:#cdcdc0}
.term-body .pl{color:#27c93f}
.term-body .at{color:#56544f}
.term-body .pa{color:#7df9ff}
.term-body .cm{color:#e8e6e0}
.term-body .out{color:#8d8a82}
.term-body .key{color:#d8b25a}
.term-body .blink{display:inline-block;width:7px;height:13px;background:#7df9ff;vertical-align:-2px;animation:tileblink 1s steps(2) infinite}
@keyframes tileblink{50%{opacity:0}}
.tile-coder .meta-num{top:36px}
.tile-coder .enter-cta{color:#7df9ff;background:linear-gradient(180deg,transparent,rgba(0,0,0,0.95));border-top:1px solid rgba(125,249,255,0.2)}

.tile .name{font-family:"Zen Dots",sans-serif;font-size:20px;color:#e8e6e0;letter-spacing:-.01em}
.tile .sub{font-size:9.5px;letter-spacing:.18em;color:#8d8a82;margin-top:4px;text-transform:uppercase}
.tile-pro .name{font-family:"Space Grotesk",sans-serif;font-weight:500;font-size:19px;color:#14141d;letter-spacing:-.01em}
.tile-pro .sub{color:#56544f}
.tile-coder .name{font-family:"JetBrains Mono",monospace;font-size:18px;color:#7df9ff;letter-spacing:.04em}

@media (max-width:900px){
  .tile{height:340px}
  .tile-gamer .gamer-kanji{font-size:200px}
}
```

- [ ] **Step 2: Replace empty tiles container with tile DOM**

Find `<div class="tiles" id="tiles">` and the comment line below it. Replace the entire empty container's inner content so it reads:

```html
<div class="tiles" id="tiles">

  <a class="tile tile-gamer" href="/gamer.html" data-persona="gamer" tabindex="0">
    <span class="corner tl"></span><span class="corner br"></span>
    <span class="corner tr"></span><span class="corner bl"></span>
    <span class="meta-num" style="color:#ff2840">/01 — GAMER</span>
    <span class="gamer-rail">流転 · 侍道</span>
    <span class="live"><span class="dot"></span>live · raw</span>
    <span class="gamer-kanji">侍</span>
    <span class="enter-cta">
      <span>
        <span class="name">GAMER</span>
        <span class="sub" style="display:block">samurai · HUD · kanji</span>
      </span>
      <span style="display:flex;align-items:center;gap:10px;color:#ff2840;font-size:9.5px;letter-spacing:.3em">ENTER<span class="arrow"></span></span>
    </span>
  </a>

  <a class="tile tile-pro" href="/pro.html" data-persona="pro" tabindex="0">
    <span class="pro-grid"></span>
    <span class="meta-num" style="color:#56544f">02 / PRO</span>
    <span class="pro-content">
      <span class="pro-eyebrow"><span></span>currently building</span>
      <span class="pro-name">Kushar Raj<br><b>Kashyap.</b></span>
      <span class="pro-bio">MCA · Game Dev Trainee. Designer<br>and builder. Available for hire.</span>
    </span>
    <span class="chips">
      <span class="chip">RESUME</span>
      <span class="chip">WORK</span>
      <span class="chip">WRITING</span>
      <span class="chip">CONTACT</span>
    </span>
    <span class="enter-cta">
      <span>
        <span class="name">Professional</span>
        <span class="sub" style="display:block">resume · work · writing</span>
      </span>
      <span style="display:flex;align-items:center;gap:10px;color:#14141d;font-size:9.5px;letter-spacing:.3em">VIEW<span class="arrow"></span></span>
    </span>
  </a>

  <a class="tile tile-coder" href="/code.html" data-persona="code" tabindex="0">
    <span class="term-bar">
      <span class="term-dot" style="background:#ff5f56"></span>
      <span class="term-dot" style="background:#ffbd2e"></span>
      <span class="term-dot" style="background:#27c93f"></span>
      <span style="margin-left:auto;font-size:9.5px;color:#56544f;font-family:'JetBrains Mono',monospace">kushar@portfolio: ~ — 80×24</span>
    </span>
    <span class="meta-num" style="color:#7df9ff">/03 — CODER</span>
    <span class="term-body" style="display:block">
      <span style="display:block"><span class="pl">kushar</span><span class="at">@</span><span class="pl">portfolio</span><span class="at">:</span><span class="pa">~</span><span class="at">$</span> <span class="cm">cat about.txt</span></span>
      <span class="out" style="display:block">&gt; MCA grad · india · game dev trainee</span>
      <span class="out" style="display:block">&gt; writes shaders, scripts, tools</span>
      <span style="display:block;margin-top:8px"><span class="pl">kushar</span><span class="at">@</span><span class="pl">portfolio</span><span class="at">:</span><span class="pa">~</span><span class="at">$</span> <span class="cm">ls -la projects/</span></span>
      <span class="out" style="display:block">drwxr-xr-x  <span class="key">10</span> kushar  <span class="pa">repos</span></span>
      <span class="out" style="display:block">drwxr-xr-x  <span class="key">3</span>  kushar  <span class="pa">scripts</span></span>
      <span class="out" style="display:block">-rw-r--r--  <span class="key">1</span>  kushar  <span class="pa">README.md</span></span>
      <span style="display:block;margin-top:8px"><span class="pl">kushar</span><span class="at">@</span><span class="pl">portfolio</span><span class="at">:</span><span class="pa">~</span><span class="at">$</span> <span class="cm">./enter</span><span class="blink"></span></span>
    </span>
    <span class="enter-cta">
      <span>
        <span class="name">&gt; CODER</span>
        <span class="sub" style="display:block">terminal · repos · live</span>
      </span>
      <span style="display:flex;align-items:center;gap:10px;color:#7df9ff;font-size:9.5px;letter-spacing:.3em">EXEC<span class="arrow"></span></span>
    </span>
  </a>

</div>
```

- [ ] **Step 3: Add tile-click handler to set localStorage before navigation**

In the existing `<script>` block (the one with `setTimeout`), AFTER the `setTimeout` call, append:

```js
document.querySelectorAll(".tile[data-persona]").forEach((tile) => {
  tile.addEventListener("click", (e) => {
    if (window.persona) window.persona.set(tile.dataset.persona);
  });
});
```

(Anchors handle navigation natively; the click handler just persists the choice. The default `<a>` href triggers navigation after the listener runs.)

- [ ] **Step 4: Manual verify**

Open `index.html` in browser. Confirm:
- After teaser, modal shows three full tiles
- Gamer tile: 侍 kanji, HUD corners, scanlines, live pulse
- Pro tile: cream background, name, chips, "VIEW →"
- Coder tile: mac chrome, terminal output, blinking cursor, "EXEC →"
- Hover each tile: lift + colored glow
- Click gamer tile → navigates to `/gamer.html`, localStorage shows `persona=gamer`
- Reload `/` (clear `?force=1` if added) → auto-routes to `/gamer.html`
- Mobile resize <900px: tiles stack vertically

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: add three persona tiles with click-to-set behavior"
```

---

## Task 9: Pull Notion content + assets to local

**Files:**
- Create: `assets/pro/profile.jpg`
- Create: `assets/pro/anime.gif` (if downloadable)
- Create: `assets/pro/gaming.gif` (if downloadable)
- Create: `assets/pro/tv.gif` (if downloadable)
- Create: `assets/pro/projects/<each-project>.{jpg,png}`

> Note: Notion S3 URLs are signed and expire. The agent executing this task must use the Notion MCP `notion-fetch` to obtain fresh URLs at execution time, then download via `curl -L -o <local-path> "<signed-url>"`.

- [ ] **Step 1: Re-fetch the Notion main page to get current S3 URLs for assets**

Use Notion MCP tool: `notion-fetch` with `id: https://www.notion.so/Hi-I-am-Kushar-Raj-Kashyap-21bcbe77d18f80e6a41ce0015c63443d`.
Extract the asset URLs (profile photo, gifs).

- [ ] **Step 2: Create assets/pro directory**

Run: `mkdir -p assets/pro/projects` (Bash tool)
Expected: directories exist.

- [ ] **Step 3: Download profile photo**

From the About-me page Notion fetch, extract the profile photo S3 URL.
Run: `curl -L -o assets/pro/profile.jpg "<signed-url>"`
Expected: file > 10KB, file is valid JPEG (`file assets/pro/profile.jpg` shows JPEG).

- [ ] **Step 4: Re-fetch the Design Projects database for project covers**

Use `notion-fetch` with `id: https://www.notion.so/21bcbe77d18f8123b508f5d9a48d3fbc` and inspect rows. For each project row, fetch the page to get its cover image and the GitHub URL.

Then re-fetch each project page individually (use `notion-fetch` per project URL) to get cover image + page content. Save in plan-doc inline notes (a temporary file) so they can be referenced in Task 12.

- [ ] **Step 5: Download project cover images**

For each project, run:
`curl -L -o assets/pro/projects/<project-slug>.<ext> "<signed-cover-url>"`
where `<project-slug>` is a kebab-case version of the project Name.
Expected: each cover image saved.

- [ ] **Step 6: Download anime / gaming / tv GIFs from About-me page**

For each gif URL extracted in Step 1, run `curl` with appropriate target name:
- `assets/pro/anime.gif`
- `assets/pro/gaming.gif`
- `assets/pro/tv.gif`

If a URL is `file://` (private) and won't download externally, mark it as `MISSING` and use a CSS placeholder block in the pro page instead. Do NOT skip silently.

- [ ] **Step 7: Verify all assets present**

Run: `ls -la assets/pro/ assets/pro/projects/`
Expected: each file present and > 5KB. Note any MISSING items in the commit message.

- [ ] **Step 8: Save Notion content extracts to a temp scratch file**

Create `docs/superpowers/plans/notion-extract.md` with the raw markdown content for:
- Main page intro paragraphs
- "Right now" callouts (4 items)
- "A bit more about me" paragraphs
- About-me page sections (cyber-café, anime, gaming, TV)
- Each design project's name + GitHub URL + cover filename + 1-line description

This file is the source of truth for Task 10–12 hand-authoring. NOT committed (add to `.gitignore` line for `notion-extract.md`).

- [ ] **Step 9: Commit assets**

```bash
git add assets/pro/
git commit -m "feat: add Notion-pulled assets for pro variant (profile, gifs, project covers)"
```

---

## Task 10: Create pro.html scaffold + hero + bio

**Files:**
- Create: `pro.html`

- [ ] **Step 1: Create pro.html with shell + hero + bio sections**

Create `pro.html` with:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Kushar Raj Kashyap — Professional</title>
<meta name="description" content="MCA · Game Developer Trainee · Designer. Portfolio of professional work.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@200;300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Fraunces:opsz,wght@9..144,200;9..144,300;9..144,400;9..144,500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/shared/persona.css">
<script src="/shared/persona.js" defer></script>
<style>
  :root {
    --bg:#f5f3ec;
    --bg-2:#ebe7da;
    --ink:#14141d;
    --ink-dim:#3a3a44;
    --ink-faint:#6a6a75;
    --line:rgba(20,20,29,0.12);
    --line-2:rgba(20,20,29,0.22);
    --accent:#14141d;
    --persona-switch-fg:#14141d;
    --persona-switch-bg:rgba(245,243,236,0.85);
    --persona-switch-border:rgba(20,20,29,0.2);
  }
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{
    background:var(--bg);color:var(--ink);
    font-family:"Space Grotesk",ui-sans-serif,sans-serif;
    -webkit-font-smoothing:antialiased;
    font-size:16px;line-height:1.6;
    min-height:100vh;
  }
  a{color:inherit}
  .shell{max-width:980px;margin:0 auto;padding:80px 32px}
  section{padding:64px 0;border-top:1px solid var(--line)}
  section:first-of-type{border-top:0;padding-top:0}

  .section-label{
    font-family:"JetBrains Mono",monospace;font-size:10px;letter-spacing:.32em;
    color:var(--ink-faint);text-transform:uppercase;margin-bottom:24px;
    display:flex;align-items:center;gap:10px;
  }
  .section-label::before{content:"";width:24px;height:1px;background:var(--ink)}

  h2{
    font-family:"Fraunces","Space Grotesk",serif;font-weight:300;
    font-size:clamp(32px,4vw,48px);line-height:1.1;letter-spacing:-.02em;
    color:var(--ink);margin-bottom:24px;
  }

  /* HERO */
  .hero{display:grid;grid-template-columns:1fr 280px;gap:48px;align-items:end;padding-bottom:48px}
  .hero .photo{
    width:280px;height:340px;background:#ddd center/cover no-repeat;
    border:1px solid var(--line-2);
  }
  .hero h1{
    font-family:"Fraunces","Space Grotesk",serif;font-weight:200;
    font-size:clamp(48px,8vw,96px);line-height:.95;letter-spacing:-.03em;color:var(--ink);
  }
  .hero h1 b{font-weight:500}
  .hero .role{
    margin-top:18px;font-size:15px;color:var(--ink-dim);max-width:520px;
  }
  .hero .meta{
    margin-top:24px;font-family:"JetBrains Mono",monospace;font-size:11px;
    letter-spacing:.18em;color:var(--ink-faint);text-transform:uppercase;
    display:flex;gap:18px;flex-wrap:wrap;
  }

  /* BIO */
  .bio p{margin-bottom:16px;font-size:17px;line-height:1.65;color:var(--ink-dim);max-width:680px}
  .bio strong{color:var(--ink);font-weight:500}

  @media (max-width:760px){
    .shell{padding:60px 22px}
    .hero{grid-template-columns:1fr;gap:24px;align-items:start}
    .hero .photo{width:200px;height:240px;order:-1}
  }
</style>
</head>
<body>

<main class="shell">

  <!-- HERO -->
  <section class="hero">
    <div>
      <div class="section-label">// professional</div>
      <h1>Kushar Raj<br><b>Kashyap.</b></h1>
      <p class="role">MCA graduate · Game Developer Trainee at BR Softech, Jaipur · Designer and builder of interfaces.</p>
      <div class="meta">
        <span>📍 Jaipur, India</span>
        <span>· Available for hire</span>
      </div>
    </div>
    <div class="photo" style="background-image:url('/assets/pro/profile.jpg')" aria-label="Photo of Kushar"></div>
  </section>

  <!-- BIO -->
  <section class="bio">
    <div class="section-label">/01 · about</div>
    <h2>Hey, I'm Kushar.</h2>
    <p>I'm an <strong>MCA graduate</strong> who loves building things — whether that's a game, a CI/CD pipeline, or a clean UI. Right now I'm working as a <strong>Game Developer Trainee at BR Softech Pvt. Ltd.</strong> in Jaipur, which honestly feels like a dream — I get to spend my days thinking about game mechanics and writing JavaScript that actually does something fun.</p>
    <p>Before this, I spent six months at <strong>Orbiqe Technologies</strong> as an AI-DevOps Engineer, where I got deep into Docker, Kubernetes, Terraform, and all things automation. That experience taught me a lot about how software actually runs in the real world — not just how it's written.</p>
    <p>I did my MCA from <strong>Haldia Institute of Technology</strong> (CGPA: 8.11) and my BCA from <strong>BIT Mesra</strong> (CGPA: 8.63). Both gave me a solid foundation, but honestly, most of what I know I learned by building things and breaking them.</p>
    <p>Outside of work, I'm into anime (currently One Piece 🏴‍☠️), design, and anything that sits at the intersection of code and creativity. I believe good software should feel good — not just work well.</p>
  </section>

</main>

<script>
  if (window.persona) window.persona.mountSwitchButton();
</script>

</body>
</html>
```

- [ ] **Step 2: Manual verify**

Open `pro.html` in browser. Confirm:
- Cream background, dark text
- Profile photo loads (or shows broken-image gracefully if photo missing)
- "Kushar Raj Kashyap." headline in serif
- Bio paragraphs render
- Switch button top-right
- Mobile <760px: photo collapses above name
- No console errors

- [ ] **Step 3: Commit**

```bash
git add pro.html
git commit -m "feat: add pro.html scaffold with hero and bio sections"
```

---

## Task 11: Add "Currently" + "Experience" + "Skills" sections to pro.html

**Files:**
- Modify: `pro.html`

- [ ] **Step 1: Add CSS for the three sections**

In `pro.html` style block, before closing `</style>`, append:

```css
/* CURRENTLY */
.callouts{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
.callout{
  border:1px solid var(--line);background:#fff;
  padding:18px 20px;display:flex;gap:14px;align-items:flex-start;
}
.callout .ic{font-size:22px;line-height:1;flex-shrink:0}
.callout .body{font-size:14px;line-height:1.5;color:var(--ink-dim)}
.callout .body strong{color:var(--ink);font-weight:500}

/* EXPERIENCE */
.timeline{display:flex;flex-direction:column;gap:24px}
.tl-item{display:grid;grid-template-columns:140px 1fr;gap:32px;padding-bottom:24px;border-bottom:1px solid var(--line)}
.tl-item:last-child{border-bottom:0}
.tl-item .when{
  font-family:"JetBrains Mono",monospace;font-size:11px;
  letter-spacing:.18em;color:var(--ink-faint);text-transform:uppercase;line-height:1.4;
}
.tl-item .what h3{
  font-family:"Fraunces",serif;font-weight:300;font-size:22px;line-height:1.2;
  color:var(--ink);margin-bottom:4px;letter-spacing:-.01em;
}
.tl-item .what .org{font-size:14px;color:var(--ink-dim);margin-bottom:8px}
.tl-item .what .desc{font-size:14px;color:var(--ink-faint);line-height:1.55;max-width:520px}

/* SKILLS */
.skills-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:32px}
.skill-group h4{
  font-family:"Space Grotesk",sans-serif;font-weight:500;font-size:14px;
  color:var(--ink);margin-bottom:10px;letter-spacing:.01em;
  display:flex;align-items:center;gap:8px;
}
.skill-group .ic{font-size:18px}
.skill-group .list{font-size:14px;color:var(--ink-dim);line-height:1.7}

@media (max-width:760px){
  .callouts{grid-template-columns:1fr}
  .tl-item{grid-template-columns:1fr;gap:6px}
  .tl-item .when{margin-bottom:4px}
  .skills-grid{grid-template-columns:1fr;gap:22px}
}
```

- [ ] **Step 2: Add the three sections after the bio section**

In `pro.html`, find the closing `</section>` of the `<section class="bio">` block. AFTER it, BEFORE the closing `</main>`, insert:

```html
<!-- CURRENTLY -->
<section>
  <div class="section-label">/02 · currently</div>
  <h2>Right now.</h2>
  <div class="callouts">
    <div class="callout">
      <div class="ic">🎮</div>
      <div class="body"><strong>Working at</strong> — Game Developer Trainee @ BR Softech Pvt. Ltd., Jaipur · Feb 2026 – Present</div>
    </div>
    <div class="callout">
      <div class="ic">📖</div>
      <div class="body">Designing with empathy, coding with logic — guided by Inclusion, Joy, Research, and Resilience.</div>
    </div>
    <div class="callout">
      <div class="ic">📺</div>
      <div class="body"><strong>Binge watching</strong> — One Piece 🏴‍☠️ · Black Mirror 🪞 · How I Met Your Mother ☂️</div>
    </div>
    <div class="callout">
      <div class="ic">📚</div>
      <div class="body"><strong>Reading</strong> — The 48 Laws of Power · Robert Greene</div>
    </div>
  </div>
</section>

<!-- EXPERIENCE -->
<section>
  <div class="section-label">/03 · experience</div>
  <h2>Where I've been.</h2>
  <div class="timeline">
    <div class="tl-item">
      <div class="when">Feb 2026<br>— Present</div>
      <div class="what">
        <h3>Game Developer Trainee</h3>
        <div class="org">BR Softech Pvt. Ltd. · Jaipur, India</div>
        <div class="desc">Building game mechanics and interactive systems in JavaScript. Working on real game projects from concept to ship.</div>
      </div>
    </div>
    <div class="tl-item">
      <div class="when">2025<br>· 6 months</div>
      <div class="what">
        <h3>AI-DevOps Engineer</h3>
        <div class="org">Orbiqe Technologies</div>
        <div class="desc">Worked across Docker, Kubernetes, Terraform, Jenkins, AWS. Automated deploys, built CI/CD pipelines, learned how production really works.</div>
      </div>
    </div>
    <div class="tl-item">
      <div class="when">MCA<br>2023 – 2025</div>
      <div class="what">
        <h3>Master of Computer Applications</h3>
        <div class="org">Haldia Institute of Technology · CGPA 8.11</div>
        <div class="desc">Deep dive into systems, software engineering, and applied CS.</div>
      </div>
    </div>
    <div class="tl-item">
      <div class="when">BCA<br>2020 – 2023</div>
      <div class="what">
        <h3>Bachelor of Computer Applications</h3>
        <div class="org">BIT Mesra · CGPA 8.63</div>
        <div class="desc">Foundations: data structures, algorithms, web, databases.</div>
      </div>
    </div>
  </div>
</section>

<!-- SKILLS -->
<section>
  <div class="section-label">/04 · skills</div>
  <h2>What I work with.</h2>
  <div class="skills-grid">
    <div class="skill-group">
      <h4><span class="ic">🎮</span>Game Development</h4>
      <div class="list">JavaScript · Game Mechanics · Interactive Design · 2D Game Systems</div>
    </div>
    <div class="skill-group">
      <h4><span class="ic">⚙️</span>DevOps &amp; Cloud</h4>
      <div class="list">Docker · Terraform · Kubernetes · Jenkins · Ansible · AWS · GitHub Actions · Linux · CI/CD</div>
    </div>
    <div class="skill-group">
      <h4><span class="ic">💻</span>Programming</h4>
      <div class="list">Python · JavaScript · HTML / CSS · SQL · Java · C</div>
    </div>
    <div class="skill-group">
      <h4><span class="ic">🧪</span>Testing &amp; QA</h4>
      <div class="list">Selenium · Postman · JMeter</div>
    </div>
    <div class="skill-group">
      <h4><span class="ic">🎨</span>Design</h4>
      <div class="list">Graphic Design · Brand Logos · Social Media Graphics · Web Layouts · Figma · Canva · Adobe Creative Suite</div>
    </div>
    <div class="skill-group">
      <h4><span class="ic">🛠️</span>Tools</h4>
      <div class="list">Git / GitHub · VS Code · GitLab · Notion · Figma · Canva · Adobe Creative Suite</div>
    </div>
    <div class="skill-group">
      <h4><span class="ic">🤝</span>Soft Skills</h4>
      <div class="list">Problem Solving · Analytical Thinking · Agile Collaboration · Time Management · Attention to Detail</div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Manual verify**

Open `pro.html` in browser. Confirm:
- Three new sections render: Currently (4 callouts), Experience (4 timeline items), Skills (7 grouped lists)
- All section labels show with leading dash
- Timeline left column dates align with right content
- Mobile <760px: callouts stack 1-col, timeline collapses to single column with date above title
- No console errors

- [ ] **Step 4: Commit**

```bash
git add pro.html
git commit -m "feat: add currently, experience, and skills sections to pro page"
```

---

## Task 12: Add "Design Projects" gallery + "About me content" + "Contact" sections to pro.html

**Files:**
- Modify: `pro.html`

> Note: Design Projects content depends on Notion DB rows pulled in Task 9. The agent should reference `docs/superpowers/plans/notion-extract.md` (the scratch file from Task 9 Step 8) for the exact list of projects, names, GitHub URLs, and cover filenames. If the file doesn't exist, re-run Task 9 Step 4-5.

- [ ] **Step 1: Append CSS for gallery + content blocks + contact**

In `pro.html` style block, before closing `</style>`, append:

```css
/* PROJECTS */
.gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.proj{
  border:1px solid var(--line);background:#fff;text-decoration:none;color:var(--ink);
  display:flex;flex-direction:column;transition:transform .25s, box-shadow .25s;
}
.proj:hover{transform:translateY(-3px);box-shadow:0 12px 30px -10px rgba(0,0,0,0.2)}
.proj .cover{
  aspect-ratio:4/3;background:#ddd center/cover no-repeat;
}
.proj .body{padding:14px 16px}
.proj h3{
  font-family:"Fraunces",serif;font-weight:400;font-size:16px;line-height:1.3;color:var(--ink);
}
.proj .gh{
  margin-top:8px;font-family:"JetBrains Mono",monospace;font-size:10px;
  color:var(--ink-faint);letter-spacing:.1em;text-transform:uppercase;
}

/* CONTENT BLOCKS (about-me content) */
.content-block{display:grid;grid-template-columns:1fr 200px;gap:32px;align-items:start;margin-bottom:48px}
.content-block.flip{grid-template-columns:200px 1fr}
.content-block .gif{
  width:100%;aspect-ratio:4/5;background:var(--bg-2) center/cover no-repeat;
  border:1px solid var(--line);
}
.content-block h3{
  font-family:"Fraunces",serif;font-weight:400;font-size:24px;line-height:1.25;
  color:var(--ink);margin-bottom:12px;letter-spacing:-.01em;
}
.content-block p{font-size:15px;line-height:1.6;color:var(--ink-dim);margin-bottom:12px}
.content-block .quote{
  border-left:2px solid var(--ink);padding-left:14px;margin:14px 0;
  font-style:italic;color:var(--ink);
}

/* CONTACT */
.contact-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;max-width:520px}
.contact-link{
  display:flex;align-items:center;gap:12px;
  border:1px solid var(--line-2);padding:14px 18px;
  text-decoration:none;color:var(--ink);font-size:14px;
  transition:border-color .2s, transform .2s;
}
.contact-link:hover{border-color:var(--ink);transform:translateY(-1px)}
.contact-link .ic{font-size:18px}
.contact-link .lbl{font-family:"JetBrains Mono",monospace;font-size:10px;letter-spacing:.18em;color:var(--ink-faint);text-transform:uppercase;margin-bottom:2px}
.contact-link .val{font-weight:500}

@media (max-width:760px){
  .gallery{grid-template-columns:1fr}
  .content-block,.content-block.flip{grid-template-columns:1fr;gap:18px}
  .content-block .gif{aspect-ratio:5/3;max-width:300px}
  .contact-grid{grid-template-columns:1fr}
}
```

- [ ] **Step 2: Add Projects + About-content + Contact sections**

After the Skills section's closing `</section>` (and before the closing `</main>`), insert:

```html
<!-- DESIGN PROJECTS -->
<section>
  <div class="section-label">/05 · design projects</div>
  <h2>The journey from empathising to prototyping.</h2>
  <div class="gallery" id="gallery">
    <!-- AGENT: replace this comment with one .proj block per project from notion-extract.md -->
    <!-- Template:
    <a class="proj" href="<github-url>" target="_blank" rel="noopener">
      <div class="cover" style="background-image:url('/assets/pro/projects/<slug>.jpg')"></div>
      <div class="body">
        <h3><Project Name></h3>
        <div class="gh">→ github</div>
      </div>
    </a>
    -->
  </div>
</section>

<!-- ABOUT CONTENT -->
<section>
  <div class="section-label">/06 · beyond the resume</div>
  <h2>A bit more about me.</h2>

  <p style="font-size:16px;color:var(--ink-dim);margin-bottom:32px;max-width:680px">Growing up, I spent countless hours in cyber cafés — those buzzing hubs filled with the hum of computers and the excitement of discovery. Whether I was experimenting with new software, helping friends set up their first email accounts, or diving into intense gaming sessions at Xbox cafés, these experiences became the foundation of my fascination with technology.</p>

  <div class="content-block">
    <div>
      <h3>Beyond my World</h3>
      <p>I'm a huge anime fan — especially the legendary trio: <strong>Naruto</strong>, <strong>Bleach</strong>, and <strong>One Piece</strong> — plus thought-provoking series like <strong>Monster</strong> and <strong>Vinland Saga</strong>.</p>
      <div class="quote">"You have no enemies. No one on this earth is your enemy." — A reminder that peace is possible if we choose to see people as fellow humans, not threats.</div>
      <p>These stories aren't just entertainment to me — they're life lessons, motivation, and the fuel that keeps me pushing forward.</p>
    </div>
    <div class="gif" style="background-image:url('/assets/pro/anime.gif')"></div>
  </div>

  <div class="content-block flip">
    <div class="gif" style="background-image:url('/assets/pro/gaming.gif')"></div>
    <div>
      <h3>In the world of 🎮</h3>
      <p>I love story-driven games — the kind where you can dive in for hours and feel like you're part of the adventure. Roaming the landscapes of <strong>Ghost of Tsushima</strong> as a samurai (my gamer tag is "Ronin" for a reason), battling gods in <strong>God of War</strong>, wandering <strong>Death Stranding</strong>, joining Nathan Drake's wild rides in <strong>Uncharted</strong>.</p>
      <p>For me, gaming isn't just a pastime — it's about living unforgettable narratives, exploring new identities, and experiencing every twist as if I'm there myself.</p>
    </div>
  </div>

  <div class="content-block">
    <div>
      <h3>Dark Worlds &amp; Moral Mazes</h3>
      <p>I'm drawn to TV with deep, complex stories and a dark, intense vibe. <strong>Better Call Saul</strong> and <strong>Breaking Bad</strong> live in moral gray areas. <strong>Peaky Blinders</strong> delivers style and brooding atmosphere. <strong>Black Mirror</strong> pushes tech-tales to their limits. <strong>Westworld</strong> asks the big questions about consciousness.</p>
      <p>If you love shows that challenge, thrill, and stay with you long after the credits — we're already on the same wavelength.</p>
    </div>
    <div class="gif" style="background-image:url('/assets/pro/tv.gif')"></div>
  </div>
</section>

<!-- CONTACT -->
<section>
  <div class="section-label">/07 · contact</div>
  <h2>Let's talk.</h2>
  <p style="font-size:15px;color:var(--ink-dim);margin-bottom:24px">Open to roles in game dev, frontend, or DevOps. Always up for interesting conversations.</p>
  <div class="contact-grid">
    <a class="contact-link" href="mailto:kusharraj11@gmail.com">
      <span class="ic">📩</span>
      <span><span class="lbl" style="display:block">email</span><span class="val">kusharraj11@gmail.com</span></span>
    </a>
    <a class="contact-link" href="https://www.linkedin.com/in/kushar-raj-kashyap/" target="_blank" rel="noopener">
      <span class="ic">💼</span>
      <span><span class="lbl" style="display:block">linkedin</span><span class="val">kushar-raj-kashyap</span></span>
    </a>
    <a class="contact-link" href="https://github.com/Kusharraj11" target="_blank" rel="noopener">
      <span class="ic">⌨️</span>
      <span><span class="lbl" style="display:block">github</span><span class="val">Kusharraj11</span></span>
    </a>
    <a class="contact-link" href="https://www.instagram.com/iamkrk11/" target="_blank" rel="noopener">
      <span class="ic">📸</span>
      <span><span class="lbl" style="display:block">instagram</span><span class="val">@iamkrk11</span></span>
    </a>
    <a class="contact-link" href="https://www.overleaf.com/read/qhndsfwfmngb#02b2e5" target="_blank" rel="noopener" style="grid-column:1/-1">
      <span class="ic">📃</span>
      <span><span class="lbl" style="display:block">resume</span><span class="val">Read on Overleaf →</span></span>
    </a>
  </div>
</section>
```

- [ ] **Step 3: Fill the gallery with actual project entries**

Open `docs/superpowers/plans/notion-extract.md` (created in Task 9). For each project entry, replace the `<!-- AGENT: ... -->` placeholder block in the gallery with a real `.proj` `<a>` block, using:
- The project's Name as the `<h3>` text
- The project's GitHub URL as the `href`
- The downloaded cover filename for `background-image`

If `notion-extract.md` doesn't exist or has zero project entries, leave a single placeholder card:
```html
<div class="proj" style="opacity:0.5;cursor:not-allowed">
  <div class="cover" style="background:#ddd"></div>
  <div class="body">
    <h3>Projects coming soon</h3>
    <div class="gh">— work in progress</div>
  </div>
</div>
```
And note this gap in the commit message.

- [ ] **Step 4: Manual verify**

Open `pro.html` in browser. Confirm:
- Gallery shows project cards with cover, title, "→ github" label
- Hover lifts card with shadow
- About-content blocks alternate left/right (gif + text), then text + gif (flipped middle)
- Quote block has left border accent
- Contact grid: 2-col with email/linkedin/github/instagram, full-row Resume below
- Each contact link hover: border darkens
- Mobile <760px: gallery 1-col, content-blocks stack, contact 1-col
- All external links open in new tab; email opens mail client

- [ ] **Step 5: Commit**

```bash
git add pro.html
git commit -m "feat: add design projects gallery, about-content, and contact sections to pro page"
```

---

## Task 13: Pro page mobile + image-error handling pass

**Files:**
- Modify: `pro.html`

- [ ] **Step 1: Add image-error inline-handler to all `background-image` divs**

Background-image errors don't fire `onerror`. Convert critical images to `<img>` where they were `background-image` divs to enable graceful fallback:

In `pro.html`, replace the hero photo div:

```html
<div class="photo" style="background-image:url('/assets/pro/profile.jpg')" aria-label="Photo of Kushar"></div>
```

with:

```html
<div class="photo">
  <img src="/assets/pro/profile.jpg" alt="Kushar Raj Kashyap" onerror="this.style.display='none';this.parentElement.style.background='#ddd'">
</div>
```

And add to the style block:
```css
.hero .photo img{width:100%;height:100%;object-fit:cover;display:block}
```

Repeat for the three `.gif` divs in the about-content section — convert each to `<img>` with `onerror` fallback. Wrap each with the existing `.gif` div as a frame and put `<img>` inside.

- [ ] **Step 2: Mobile viewport test**

Open Chrome DevTools, toggle device toolbar. Test:
- iPhone SE (375×667): all sections readable, no horizontal scroll
- iPad (768×1024): layouts use tablet breakpoints
- Galaxy S20 (360×800): same as iPhone SE
- Photo collapses above name on <760px (already in CSS)
- Timeline collapses to single column
- Contact grid 1-col

If any element overflows or breaks layout, fix the responsive CSS directly in the style block.

- [ ] **Step 3: Lighthouse audit**

In DevTools, run Lighthouse on `pro.html` (mobile + desktop, performance + accessibility + best practices).
Target: Performance ≥ 85 mobile / ≥ 90 desktop, Accessibility ≥ 95, Best Practices ≥ 95.

If Accessibility fails:
- Check all images have `alt`
- Check `<a>` with no text (icon-only) has `aria-label`
- Check color contrast on `.section-label` and `.tl-item .when` (lighten or strengthen if low)

If Performance fails: defer non-critical fonts, add `loading="lazy"` to project cover images.

- [ ] **Step 4: Commit fixes**

```bash
git add pro.html
git commit -m "fix: pro page image error fallbacks and mobile breakpoints"
```

---

## Task 14: Create code.html — base shell + macOS chrome + boot sequence

**Files:**
- Create: `code.html`

- [ ] **Step 1: Write code.html with shell, chrome, output area, input, and boot sequence**

Create `code.html`:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>kushar@portfolio:~$</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/shared/persona.css">
<script src="/shared/persona.js" defer></script>
<style>
  :root{
    --bg:#0a0a0d;
    --ink:#cdcdc0;
    --green:#27c93f;
    --cyan:#7df9ff;
    --gold:#d8b25a;
    --dim:#56544f;
    --mid:#8d8a82;
    --persona-switch-fg:#cdcdc0;
    --persona-switch-bg:rgba(10,10,13,0.85);
    --persona-switch-border:rgba(125,249,255,0.3);
  }
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{
    background:var(--bg);color:var(--ink);
    font-family:"JetBrains Mono",ui-monospace,monospace;
    font-size:14px;line-height:1.7;-webkit-font-smoothing:antialiased;
    min-height:100vh;
    overflow:hidden;
  }
  /* Subtle scanline overlay for CRT vibe */
  body::before{
    content:"";position:fixed;inset:0;pointer-events:none;z-index:60;
    background:repeating-linear-gradient(0deg,rgba(255,255,255,0.012) 0 1px,transparent 1px 3px);
    mix-blend-mode:overlay;
  }

  .term-wrap{
    position:fixed;inset:18px;display:flex;flex-direction:column;
    border:1px solid rgba(125,249,255,0.2);
    background:#000;
    overflow:hidden;
  }

  .term-bar{
    height:30px;background:linear-gradient(180deg,#1c1c1f,#141416);
    border-bottom:1px solid rgba(255,255,255,0.06);
    display:flex;align-items:center;padding:0 14px;gap:8px;flex-shrink:0;
  }
  .term-dot{width:12px;height:12px;border-radius:50%}
  .term-bar .title{margin-left:auto;font-size:10.5px;color:var(--dim)}

  .term-output{
    flex:1;overflow-y:auto;padding:18px 22px 12px;
    scrollbar-width:thin;scrollbar-color:rgba(125,249,255,0.3) transparent;
  }
  .term-output::-webkit-scrollbar{width:6px}
  .term-output::-webkit-scrollbar-thumb{background:rgba(125,249,255,0.3)}

  .line{white-space:pre-wrap;word-break:break-word}
  .line.cmd .pl{color:var(--green)}
  .line.cmd .at{color:var(--dim)}
  .line.cmd .pa{color:var(--cyan)}
  .line.cmd .input{color:var(--ink)}
  .line.out{color:var(--mid)}
  .line.err{color:#ff6b6b}
  .line a{color:var(--cyan);text-decoration:none}
  .line a:hover{text-decoration:underline}
  .key{color:var(--gold)}
  .ascii{color:var(--cyan);font-size:11px;line-height:1.2;white-space:pre;margin:8px 0}

  .term-input-row{
    display:flex;align-items:center;padding:10px 22px 14px;border-top:1px solid rgba(125,249,255,0.12);flex-shrink:0;
    gap:8px;
  }
  .term-input-row .prompt-pre{color:var(--green);white-space:nowrap}
  .term-input-row .prompt-pre .at{color:var(--dim)}
  .term-input-row .prompt-pre .pa{color:var(--cyan)}
  .term-input{
    flex:1;background:transparent;border:0;outline:0;color:var(--ink);
    font:inherit;caret-color:var(--cyan);padding:0;
  }

  .chips{
    display:none;
    overflow-x:auto;gap:6px;padding:8px 22px;border-top:1px solid rgba(125,249,255,0.08);
    scrollbar-width:none;
  }
  .chips::-webkit-scrollbar{display:none}
  .chip{
    flex-shrink:0;border:1px solid rgba(125,249,255,0.3);background:transparent;
    color:var(--cyan);font:inherit;font-size:11px;padding:6px 10px;cursor:pointer;
    letter-spacing:.05em;
  }
  .chip:hover,.chip:active{background:rgba(125,249,255,0.08)}

  @media (max-width:768px){
    .term-wrap{inset:0;border:0}
    .term-output{padding:14px 14px 8px}
    .term-input-row{padding:8px 14px 12px}
    .chips{display:flex}
    html,body{font-size:13px}
  }
</style>
</head>
<body>

<div class="term-wrap">
  <div class="term-bar">
    <span class="term-dot" style="background:#ff5f56"></span>
    <span class="term-dot" style="background:#ffbd2e"></span>
    <span class="term-dot" style="background:#27c93f"></span>
    <span class="title">kushar@portfolio: ~ — bash</span>
  </div>

  <div class="term-output" id="termOutput" aria-live="polite"></div>

  <div class="chips" id="chips" role="toolbar" aria-label="Quick commands">
    <button class="chip" data-cmd="help">help</button>
    <button class="chip" data-cmd="whoami">whoami</button>
    <button class="chip" data-cmd="projects">projects</button>
    <button class="chip" data-cmd="cat resume.md">cat resume.md</button>
    <button class="chip" data-cmd="socials">socials</button>
    <button class="chip" data-cmd="exit">exit</button>
  </div>

  <form class="term-input-row" id="termForm" autocomplete="off">
    <span class="prompt-pre">kushar<span class="at">@</span>portfolio<span class="at">:</span><span class="pa">~</span><span class="at">$</span></span>
    <input class="term-input" id="termInput" autocomplete="off" autocapitalize="off" spellcheck="false" autofocus aria-label="Terminal input">
  </form>
</div>

<noscript>
  <div style="position:fixed;inset:0;background:#000;color:#cdcdc0;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:monospace;padding:24px;text-align:center">
    <div style="color:#ff2840;font-size:14px">$ js: command not found</div>
    <div style="margin-top:14px;color:#8d8a82;font-size:12px">Coder variant requires JavaScript. Try the <a href="/pro.html" style="color:#7df9ff">professional</a> variant.</div>
  </div>
</noscript>

<script>
  // REPL added in Task 15
</script>

</body>
</html>
```

- [ ] **Step 2: Manual verify shell renders**

Open `code.html` in browser. Confirm:
- macOS-style title bar with red/yellow/green dots
- Empty terminal body (REPL not yet implemented)
- Bottom prompt input with `kushar@portfolio:~$`
- Mobile <768px: chips bar shows above input, full-bleed terminal
- Switch button top-right
- No console errors

- [ ] **Step 3: Commit**

```bash
git add code.html
git commit -m "feat: add code.html shell with macOS chrome and prompt input"
```

---

## Task 15: Implement REPL core — print, execute, dispatch

**Files:**
- Modify: `code.html` (replace the placeholder REPL `<script>`)

- [ ] **Step 1: Replace the empty REPL script with the core class**

In `code.html`, find the comment `// REPL added in Task 15` inside the final `<script>` block. Replace the entire `<script>...</script>` (the one near `</body>`) with:

```html
<script>
(function(){
  const out = document.getElementById("termOutput");
  const input = document.getElementById("termInput");
  const form = document.getElementById("termForm");
  const chips = document.getElementById("chips");

  const STATE = {
    history: [],
    historyIndex: -1,
  };

  function el(tag, cls, html){
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function print(html, cls){
    const line = el("div", "line " + (cls || ""), html);
    out.appendChild(line);
    out.scrollTop = out.scrollHeight;
  }

  function printPrompt(cmd){
    const html = `<span class="pl">kushar</span><span class="at">@</span><span class="pl">portfolio</span><span class="at">:</span><span class="pa">~</span><span class="at">$</span> <span class="input">${escapeHTML(cmd)}</span>`;
    print(html, "cmd");
  }

  function escapeHTML(s){
    return String(s).replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
    }[c]));
  }

  // Command dispatch
  const COMMANDS = {};

  function execute(raw){
    const trimmed = raw.trim();
    printPrompt(raw);

    if (!trimmed) return; // empty line: just newline

    STATE.history.push(trimmed);
    if (STATE.history.length > 50) STATE.history.shift();
    STATE.historyIndex = STATE.history.length;

    // Parse: first token = command, rest = args
    const parts = trimmed.split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);

    const fn = COMMANDS[cmd];
    if (fn){
      try { fn(args); }
      catch(err){ print(`error: ${err.message || err}`, "err"); }
    } else {
      print(`bash: ${escapeHTML(cmd)}: command not found`, "err");
    }
  }

  // Wire form submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = input.value;
    input.value = "";
    execute(v);
  });

  // History (↑/↓), Tab completion, Ctrl+L
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp"){
      e.preventDefault();
      if (STATE.history.length === 0) return;
      STATE.historyIndex = Math.max(0, STATE.historyIndex - 1);
      input.value = STATE.history[STATE.historyIndex] || "";
    } else if (e.key === "ArrowDown"){
      e.preventDefault();
      if (STATE.history.length === 0) return;
      STATE.historyIndex = Math.min(STATE.history.length, STATE.historyIndex + 1);
      input.value = STATE.history[STATE.historyIndex] || "";
    } else if (e.key === "Tab"){
      e.preventDefault();
      const prefix = input.value;
      if (!prefix) return;
      const matches = Object.keys(COMMANDS).filter(c => c.startsWith(prefix));
      if (matches.length === 1) input.value = matches[0];
      else if (matches.length > 1){
        print(matches.join("  "), "out");
      }
    } else if (e.key === "l" && (e.ctrlKey || e.metaKey)){
      e.preventDefault();
      out.innerHTML = "";
    }
  });

  // Suggestion chips inject command and execute
  chips.addEventListener("click", (e) => {
    const c = e.target.closest(".chip");
    if (!c) return;
    const cmd = c.dataset.cmd;
    input.value = "";
    execute(cmd);
    input.focus();
  });

  // Click anywhere on output focuses input
  document.addEventListener("click", (e) => {
    if (e.target.closest("a")) return; // don't steal link clicks
    if (e.target.closest(".chip")) return;
    if (e.target.closest(".persona-switch")) return;
    input.focus();
  });

  // Expose for command modules to add commands
  window.__repl = { print, COMMANDS, escapeHTML, execute };

  // Mount switch button
  if (window.persona) window.persona.mountSwitchButton();

  // Run boot sequence at startup (defined in next task)
  if (typeof boot === "function") boot();
})();
</script>
```

- [ ] **Step 2: Manual verify REPL core**

Open `code.html`. Confirm:
- Type `xyz` + Enter → prompt echoes + `bash: xyz: command not found`
- Type empty + Enter → just newline
- Press ↑ → recalls previous command
- Press Tab on empty input → no error
- Ctrl+L → clears terminal
- Click suggestion chip → command runs
- No console errors

- [ ] **Step 3: Commit**

```bash
git add code.html
git commit -m "feat: implement REPL core with history, tab-complete, and dispatch"
```

---

## Task 16: Implement individual commands — help, whoami, about, experience

**Files:**
- Modify: `code.html` (extend COMMANDS)

- [ ] **Step 1: Add command implementations + boot sequence**

In `code.html`, find the line `if (typeof boot === "function") boot();` near the end of the script. IMMEDIATELY ABOVE that line, insert:

```js
  // ────────── COMMANDS ──────────

  COMMANDS.help = () => {
    print(`<span class="out">Available commands:</span>`, "");
    const list = [
      ["help", "show this list"],
      ["whoami", "who is kushar"],
      ["about", "longer bio"],
      ["experience", "work + education timeline"],
      ["skills", "technologies and tools"],
      ["projects", "list of repos"],
      ["ls", "files available for cat"],
      ["cat &lt;file&gt;", "read a file (resume.md, contact.md, hobbies.md)"],
      ["socials", "social links"],
      ["theme", "toggle terminal color scheme"],
      ["clear", "clear screen (Ctrl+L)"],
      ["exit", "switch persona"],
    ];
    list.forEach(([c,d]) => print(`  <span class="key">${c}</span>  <span class="out">${d}</span>`, ""));
  };

  COMMANDS.whoami = () => {
    print(`kushar — MCA grad · game dev trainee · designer · cli native`, "out");
  };

  COMMANDS.about = () => {
    print(`Hey — I'm Kushar.`, "");
    print(``);
    print(`MCA graduate. Currently a Game Developer Trainee at BR Softech in Jaipur,`, "out");
    print(`writing JavaScript that turns into actual game mechanics.`, "out");
    print(``);
    print(`Before this, six months at Orbiqe Technologies as an AI-DevOps Engineer.`, "out");
    print(`Docker, Kubernetes, Terraform, Jenkins. Learned how things really run.`, "out");
    print(``);
    print(`MCA · Haldia Institute of Technology · 8.11`, "out");
    print(`BCA · BIT Mesra · 8.63`, "out");
    print(``);
    print(`Off the clock: anime, samurai culture, design, the odd late-night project.`, "out");
  };

  COMMANDS.experience = () => {
    print(`<span class="key">CURRENT</span>`, "");
    print(`  Game Developer Trainee · BR Softech Pvt. Ltd., Jaipur`, "");
    print(`  Feb 2026 – Present`, "out");
    print(``);
    print(`<span class="key">PREVIOUS</span>`, "");
    print(`  AI-DevOps Engineer · Orbiqe Technologies`, "");
    print(`  6 months · Docker, K8s, Terraform, Jenkins, AWS, CI/CD`, "out");
    print(``);
    print(`<span class="key">EDUCATION</span>`, "");
    print(`  MCA · Haldia Institute of Technology · CGPA 8.11`, "");
    print(`  BCA · BIT Mesra · CGPA 8.63`, "");
  };
```

- [ ] **Step 2: Manual verify**

Open `code.html`. Run:
- `help` → list of commands
- `whoami` → one-liner
- `about` → bio block
- `experience` → 3 grouped blocks
- `xyz` → still command not found

Confirm: every output line wraps properly, scrolls at bottom, no HTML rendered as text.

- [ ] **Step 3: Commit**

```bash
git add code.html
git commit -m "feat: add help, whoami, about, and experience commands"
```

---

## Task 17: Implement remaining commands — skills, projects, ls, cat, socials, clear, theme, exit

**Files:**
- Modify: `code.html` (extend COMMANDS)

> Note: `projects` command lists project repos. Use the same notion-extract data as Task 12. If unavailable, hardcode a placeholder list pointing to https://github.com/Kusharraj11.

- [ ] **Step 1: Append remaining command implementations**

In `code.html`, immediately AFTER the `COMMANDS.experience` block, insert:

```js
  COMMANDS.skills = () => {
    print(`<span class="key">programming</span>  python · javascript · html / css · sql · java · c`, "");
    print(`<span class="key">game dev</span>     javascript · game mechanics · 2d systems`, "");
    print(`<span class="key">devops</span>       docker · kubernetes · terraform · jenkins · ansible · aws · ci/cd · linux`, "");
    print(`<span class="key">testing</span>      selenium · postman · jmeter`, "");
    print(`<span class="key">design</span>       figma · canva · adobe creative suite · brand · web layouts`, "");
    print(`<span class="key">tools</span>        git · github · gitlab · vs code · notion`, "");
  };

  // Project list — replace this array with real data from notion-extract.md
  const PROJECTS = [
    // { name: "ProjectName", url: "https://github.com/...", desc: "one-line description" },
    { name: "kushar-portfolio", url: "https://github.com/Kusharraj11/kushar-portfolio", desc: "this multi-persona portfolio" },
    // AGENT: append entries from notion-extract.md here
  ];

  COMMANDS.projects = () => {
    if (PROJECTS.length === 0){
      print(`no projects to show`, "out");
      return;
    }
    print(`total ${PROJECTS.length}`, "out");
    PROJECTS.forEach((p) => {
      const link = `<a href="${p.url}" target="_blank" rel="noopener">${escapeHTML(p.name)}</a>`;
      print(`-rwxr-xr-x  <span class="key">1</span>  kushar  ${link}  <span class="out">${escapeHTML(p.desc)}</span>`, "");
    });
  };

  COMMANDS.ls = () => {
    print(`resume.md  contact.md  hobbies.md`, "out");
  };

  const FILES = {
    "resume.md": () => {
      print(`<span class="key"># resume.md</span>`, "");
      print(``);
      print(`Kushar Raj Kashyap`, "");
      print(`MCA · Game Developer Trainee · Designer`, "out");
      print(``);
      print(`Full PDF: <a href="https://www.overleaf.com/read/qhndsfwfmngb#02b2e5" target="_blank" rel="noopener">overleaf.com/read/qhndsfwfmngb</a>`, "");
    },
    "contact.md": () => {
      print(`<span class="key"># contact.md</span>`, "");
      print(``);
      print(`email     <a href="mailto:kusharraj11@gmail.com">kusharraj11@gmail.com</a>`, "");
      print(`linkedin  <a href="https://www.linkedin.com/in/kushar-raj-kashyap/" target="_blank" rel="noopener">/in/kushar-raj-kashyap</a>`, "");
      print(`github    <a href="https://github.com/Kusharraj11" target="_blank" rel="noopener">/Kusharraj11</a>`, "");
      print(`instagram <a href="https://www.instagram.com/iamkrk11/" target="_blank" rel="noopener">/iamkrk11</a>`, "");
    },
    "hobbies.md": () => {
      print(`<span class="key"># hobbies.md</span>`, "");
      print(``);
      print(`anime    naruto · bleach · one piece · monster · vinland saga`, "out");
      print(`gaming   ghost of tsushima · god of war · death stranding · uncharted`, "out");
      print(`tv       breaking bad · better call saul · peaky blinders · black mirror · westworld`, "out");
      print(`reading  the 48 laws of power — robert greene`, "out");
    },
  };

  COMMANDS.cat = (args) => {
    if (args.length === 0){
      print(`usage: cat &lt;file&gt;`, "err");
      return;
    }
    const name = args[0];
    const fn = FILES[name];
    if (!fn){
      print(`cat: ${escapeHTML(name)}: No such file or directory`, "err");
      return;
    }
    fn();
  };

  COMMANDS.socials = () => {
    COMMANDS.cat(["contact.md"]);
  };

  COMMANDS.clear = () => {
    out.innerHTML = "";
  };

  COMMANDS.theme = () => {
    const root = document.documentElement;
    const isAmber = root.dataset.theme === "amber";
    if (isAmber){
      root.dataset.theme = "default";
      root.style.removeProperty("--ink");
      root.style.removeProperty("--cyan");
      root.style.removeProperty("--green");
      print(`theme: green-on-black`, "out");
    } else {
      root.dataset.theme = "amber";
      root.style.setProperty("--ink", "#ffb000");
      root.style.setProperty("--cyan", "#ffd060");
      root.style.setProperty("--green", "#ffb000");
      print(`theme: amber-on-black`, "out");
    }
  };

  COMMANDS.exit = () => {
    print(`logout`, "out");
    print(`returning to chooser...`, "out");
    setTimeout(() => { window.location.href = "/?force=1"; }, 600);
  };

  // ────────── BOOT SEQUENCE ──────────

  function boot(){
    const today = new Date().toLocaleDateString(undefined, { weekday:"short", month:"short", day:"numeric" });
    print(`Last login: ${today} on portfolio`, "out");
    print(``);
    const banner =
      " _              _                   \n" +
      "| | ___   _ ___| |__   __ _ _ __  \n" +
      "| |/ / | | / __| '_ \\ / _` | '__| \n" +
      "|   <| |_| \\__ \\ | | | (_| | |    \n" +
      "|_|\\_\\\\__,_|___/_| |_|\\__,_|_|    ";
    const asciiEl = el("pre", "ascii", escapeHTML(banner));
    out.appendChild(asciiEl);
    print(`<span class="out">&gt; session: visitor · type</span> <span class="key">help</span> <span class="out">to begin</span>`);
    print(``);
  }
```

- [ ] **Step 2: Replace project array with real data**

If `docs/superpowers/plans/notion-extract.md` has project entries, append objects to the `PROJECTS` array in this format:
```js
{ name: "ProjectName", url: "https://github.com/Kusharraj11/repo-name", desc: "one-line description" }
```

If no notion-extract data exists, leave the single placeholder entry plus a TODO comment in the commit message.

- [ ] **Step 3: Manual verify all commands**

Open `code.html`. Run each:
- Boot sequence shows date + ASCII banner + help hint
- `help` → list
- `whoami`, `about`, `experience`, `skills` → render correctly
- `ls` → 3 files
- `cat resume.md`, `cat contact.md`, `cat hobbies.md` → each renders
- `cat unknown.md` → error
- `cat` (no args) → usage error
- `projects` → list with clickable links opening in new tab
- `socials` → contact.md output
- `clear` → wipes output
- `theme` → toggles amber, again toggles back
- `exit` → "logout" + "returning..." + navigates to `/?force=1`
- Tab on `c` → completes / shows matches
- ↑/↓ navigates history

- [ ] **Step 4: Commit**

```bash
git add code.html
git commit -m "feat: add skills, projects, cat, ls, theme, clear, socials, exit commands"
```

---

## Task 18: Coder mobile + responsive verification

**Files:**
- Modify: `code.html` (only if issues surface)

- [ ] **Step 1: Mobile keyboard layout test**

Open `code.html` on a real mobile device or Chrome DevTools mobile emulation:
- iPhone SE: input row pinned to bottom; tapping input opens keyboard
- Suggestion chips horizontal-scroll above input
- Output area scrolls independently
- Tapping a chip executes the command

- [ ] **Step 2: Verify text doesn't shrink-zoom on focus (iOS Safari)**

The `font-size: 13px` minimum on mobile prevents iOS zoom-on-focus. Confirm focusing the input on iOS doesn't pinch-zoom.

- [ ] **Step 3: Long-output scroll test**

Run `help`, then `about`, then `experience`, then `cat hobbies.md` in sequence.
Confirm: output scrolls, latest content visible, prompt input still reachable, no layout shift.

- [ ] **Step 4: Fix any issues found**

If the input row gets pushed off-screen or chips overlap input, adjust the responsive CSS:
- Use `position: sticky; bottom: 0` on `.term-input-row` if needed
- Ensure `.term-output` has `padding-bottom` accommodating chips height

If issues found, edit `code.html` style block and commit.

- [ ] **Step 5: Commit any fixes**

```bash
git add code.html
git commit -m "fix: coder mobile keyboard and scroll behavior"
```
(Skip commit if no changes needed.)

---

## Task 19: Cross-browser + Lighthouse pass on all pages

**Files:** none modified unless issues surface

- [ ] **Step 1: Cross-browser smoke test**

For each browser (Chrome latest, Firefox latest, Safari macOS + iOS, Edge latest):
- Visit `index.html` → teaser plays, modal shows tiles
- Pick gamer → lands on gamer page, switch button visible
- Pick pro → all sections render, images load
- Pick code → REPL works, all commands run
- Reload `/` → auto-routes to last persona
- Click switch → modal again

Record any browser-specific issues. Fix them inline in the relevant page's CSS/JS.

- [ ] **Step 2: Lighthouse audit on each page**

Run Lighthouse (mobile + desktop) on:
- `/` (chooser)
- `/gamer.html`
- `/pro.html`
- `/code.html`

Targets: Performance ≥ 85 mobile / ≥ 90 desktop, Accessibility ≥ 95, Best Practices ≥ 95.

- [ ] **Step 3: Fix any common findings**

| Finding | Fix |
|---|---|
| Missing `lang` attribute | Already set; verify each `<html>` |
| Missing alt text | Add `alt=""` for decorative; describe for content |
| Insufficient contrast | Adjust `--bone-faint` / `--ink-faint` color tokens |
| Missing `meta description` | Add to each page |
| Render-blocking resources | Confirm `defer` on scripts; use `font-display: swap` |
| Missing `theme-color` meta | Add `<meta name="theme-color" content="#07070b">` (or per-page color) |

- [ ] **Step 4: Commit fixes**

```bash
git add <changed-files>
git commit -m "fix: cross-browser and accessibility polish across all pages"
```
(Skip if no changes.)

---

## Task 20: Cloudflare Pages deploy configuration

**Files:**
- Create: `_headers` (optional — caching directives)
- Create: `_redirects` (optional — clean URLs)

- [ ] **Step 1: Verify the repo is GitHub-hosted**

Run: `git remote -v`
Expected: `origin git@github.com:Kusharraj11/kushar-portfolio.git` (or HTTPS variant).
If not pushed yet, push current branch:

```bash
git push -u origin master
```

- [ ] **Step 2: Add `_redirects` file (Cloudflare Pages convention)**

Create `_redirects`:

```
# Clean URLs — handled by static hosting; explicit not necessary but documents intent
/gamer    /gamer.html  200
/pro      /pro.html    200
/code     /code.html   200

# 404
/*  /404.html  404
```

- [ ] **Step 3: Add `_headers` for caching + security**

Create `_headers`:

```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/shared/*
  Cache-Control: public, max-age=86400

/*.html
  Cache-Control: public, max-age=300, must-revalidate
```

- [ ] **Step 4: Commit deploy config**

```bash
git add _redirects _headers
git commit -m "chore: add Cloudflare Pages headers and redirects config"
git push origin master
```

- [ ] **Step 5: Connect repo to Cloudflare Pages (manual UI step)**

User performs in Cloudflare dashboard (this is a manual step the agent cannot do):
1. Cloudflare Dashboard → Pages → Create a project → Connect to Git
2. Select `kushar-portfolio` repo, branch `master`
3. Build settings: framework preset = "None", build command = (empty), output directory = `/`
4. Deploy

Once deployed, default URL: `https://kushar-portfolio.pages.dev`.

- [ ] **Step 6: Smoke test the live deploy**

Visit `https://<project>.pages.dev`. Run the smoke-test checklist from spec Section 5:
1. Clear localStorage; visit `/` → chooser shows
2. Pick gamer → land on gamer page
3. Reload `/` → auto-routes to gamer
4. Click switch → modal again
5. Pick pro → all sections + images load
6. Pick code → REPL + all commands
7. Visit `/nonexistent` → 404 page
8. Disable JS, visit `/` → fallback chooser

Record any production-specific issues (e.g., asset paths case-sensitivity differences) and fix.

- [ ] **Step 7: Final commit if fixes needed**

```bash
git add <changed>
git commit -m "fix: production deploy issues"
git push
```

---

## Done

All 20 tasks complete = full multi-persona portfolio shipped to Cloudflare Pages.

**Final smoke test walkthrough:**
1. New visitor: `/` → teaser → modal → pick → variant page renders → switch button visible
2. Returning visitor: `/` → auto-route to last persona
3. Force-pick: `/?force=1` → modal again
4. Direct deep-link: `/pro.html` → renders without modal, switch button works
5. 404: `/anything-else` → fallback page

If all green: done.
