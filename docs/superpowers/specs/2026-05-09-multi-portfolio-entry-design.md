# Multi-Portfolio Entry — Design Spec

**Date:** 2026-05-09
**Status:** Approved (pending user spec review)
**Owner:** Kushar Raj Kashyap
**Repository:** `kushar-portfolio` (current branch: `master`)

## Goal

Replace the current single-page portfolio (`index.html`, gamer/samurai theme) with a multi-persona portfolio: a chooser landing that lets visitors pick one of three identity variants — **gamer**, **professional**, **coder** — each rendered as its own page with its own visual world.

The current portfolio is preserved as the gamer variant unchanged. The professional variant is rebuilt from scratch using content sourced from the user's Notion workspace. The coder variant is a new fake-REPL terminal interface.

## Non-Goals

- Replacing or touching the existing super.site landing (`iamkrk.super.site`) — it stays running as a legacy professional URL.
- Building a CMS, runtime Notion sync, or backend API.
- Auto-detecting persona from referrer / UA / IP — pick is always explicit.
- Sharing layout / typography between variants — each has its own world.

## Architecture Summary

Three independent static HTML pages plus a chooser landing, hosted on Cloudflare Pages, with a tiny shared JS+CSS layer for cross-page persona-switch behavior.

```
kushar-portfolio/
├── index.html          # chooser landing (teaser + modal)
├── gamer.html          # current index.html, renamed (visual unchanged)
├── pro.html            # new — hand-authored from Notion content
├── code.html           # new — fake-REPL terminal interface
├── 404.html            # minimal fallback page
├── shared/
│   ├── persona.js      # localStorage + switch-button + force-modal flag
│   └── persona.css     # .persona-switch button styles
└── assets/
    ├── samurai-*.png   # existing gamer assets
    ├── cert-*.jpg      # existing certificate assets
    ├── pro/            # NEW — profile photo, project covers from Notion
    └── coder/          # NEW — any coder-only assets (none anticipated)
```

## High-Level Decisions

| Decision | Choice |
|---|---|
| Page structure | **Three separate HTML pages** — full isolation per persona |
| Chooser format | **Modal over teaser hero** — cinematic intro, then forced choice |
| Persistence | **Remember + skip flag** — `localStorage` stores pick; switch button always visible on every variant |
| Pro content source | **Build-time pull from Notion** — manually transcribed into `pro.html`; re-pull when content drifts |
| Coder interactivity | **Fake REPL** — fixed command set, client-side JS, no real shell |
| Hosting | **Cloudflare Pages** — global CDN, push-to-deploy, custom domain |
| Mobile | **Full responsive everything** — including coder (touch-friendly REPL with tap-suggestion chips) |
| Code organization | **Per-page inline CSS/JS + minimal shared layer** for persona switch only |

## Component: Chooser Landing (`index.html`)

### Teaser Hero
Renders solo for ~1.5s before the modal fades in:
- Large centered `KUSHAR` wordmark (Zen Dots font)
- Animated underline (CSS-only)
- Small `// loading personas...` label below
- Faint kanji `三` (three) watermark in background

CSS-only (no images) so first paint is immediate. Fonts use `font-display: swap`.

### Modal
Fades in over the teaser at ~1.5s. Layout (980×580 desktop, full-bleed mobile):
- **Modal header:** `// access protocol` label · "Choose your path" (Space Grotesk 200) · `三` icon + "three identities · one me" subtitle
- **Tile row** (3 tiles, equal width on desktop, stacked vertical <768px)
- **Modal footer:** keyboard hints (`↹ tab to navigate · ↵ enter to confirm`)

Modal frame: 1px line-rgba border, `linear-gradient(180deg, rgba(13,13,20,0.85), rgba(7,7,11,0.92))` background, `backdrop-filter: blur(14px)`.

### Tiles (height 420px desktop)

Each tile carries its own persona aesthetic. All tiles share the same height and grid position; their interior style differs.

#### Gamer tile (Japanese vibe)
- Background: `linear-gradient(180deg, #0a0a0f, #070710)` with `radial-gradient` crimson glow at top
- HUD corner brackets (crimson top-left + bottom-right; cyan top-right + bottom-left at 40% opacity)
- Scanline overlay (repeating-linear-gradient at low opacity, mix-blend-mode: overlay)
- Center: huge `侍` kanji (Noto Serif JP, 280px, crimson, 0.92 opacity)
- Vertical kanji rail right edge: `流転 · 侍道`
- Live-pulse dot top-left: "live · raw"
- Bottom strip: `GAMER` (Zen Dots 20px) · `samurai · HUD · kanji` · `ENTER →`
- Hover: translateY(-4px), border becomes solid crimson, crimson glow shadow

#### Pro tile (English / clean vibe)
- Background: `linear-gradient(170deg, #f5f3ec, #e8e4d8)` (cream cardstock)
- Subtle 24px grid texture overlay
- Top: `currently building` label with leading dash
- Center: `Kushar Raj` (200 weight) `Kashyap.` (500 weight) — Space Grotesk, 42px, dark on cream
- Sub-line: bio one-liner
- Tag chips: `RESUME` `WORK` `WRITING` `CONTACT` (1px outlined, 9px label)
- Bottom strip: `Professional` (Space Grotesk 500) · `resume · work · writing` · `VIEW →`
- Hover: translateY(-4px), border becomes solid dark, soft drop shadow

#### Coder tile (Linux terminal vibe)
- Background: `#000`, JetBrains Mono throughout
- macOS window chrome: 26px title bar with red/yellow/green dots and `kushar@portfolio: ~ — 80×24`
- Terminal body content (rendered as static HTML, not real REPL — that's only on the dedicated page):
  - `kushar@portfolio:~$ cat about.txt` → CS career one-liner
  - `kushar@portfolio:~$ ls -la projects/` → faux `drwxr-xr-x` listing of repos/scripts/README
  - `kushar@portfolio:~$ ./enter` + cyan blinking block cursor
- Bottom strip: `> CODER` (JetBrains Mono 18px cyan) · `terminal · repos · live` · `EXEC →`
- Hover: translateY(-4px), border becomes solid cyan, cyan glow shadow

### Tile Click Behavior
Persona ID maps 1:1 to filename: `gamer` → `gamer.html`, `pro` → `pro.html`, `code` → `code.html`.

```js
tile.addEventListener("click", () => {
  const p = tile.dataset.persona;  // "gamer" | "pro" | "code"
  setPersona(p);
  window.location.href = `/${p}.html`;
});
```

## Component: Gamer Page (`gamer.html`)

Byte-for-byte equivalent to the current `index.html`. The only changes:
1. File renamed from `index.html` to `gamer.html`
2. `<script src="/shared/persona.js" defer></script>` added in `<head>`
3. `<link rel="stylesheet" href="/shared/persona.css">` added in `<head>`
4. `<a class="persona-switch" href="/?force=1">↺ switch persona</a>` added inside `<body>` (positioned via `persona.css`)

No other visual or content changes. Existing mobile nav, scroll-reveal animations, certificate cards, projects grid all preserved as-is.

## Component: Professional Page (`pro.html`)

New file. Hand-authored from Notion content (see Notion Inventory below). Visual style: clean English typography, Space Grotesk + a serif for body, light/cream theme distinct from the gamer's dark theme.

### Sections (top to bottom)

1. **Hero** — Profile photo + name + 1-line title ("MCA · Game Developer Trainee · Designer")
2. **Bio** — multi-paragraph from Notion main page intro
3. **Currently** — 4 callout cards from Notion:
   - 🎮 Working at — Game Developer Trainee @ BR Softech Pvt. Ltd., Jaipur · Feb 2026 – Present
   - 📖 Designing with empathy, coding with logic — guided by Inclusion, Joy, Research, and Resilience
   - 📺 Binge watching — One Piece · Black Mirror · How I Met Your Mother
   - 📚 Reading — The 48 Laws of Power · Robert Greene
4. **Experience timeline**
   - Game Developer Trainee · BR Softech Pvt. Ltd., Jaipur · Feb 2026 – Present
   - AI-DevOps Engineer · Orbiqe Technologies · 6 months
   - MCA · Haldia Institute of Technology · CGPA 8.11
   - BCA · BIT Mesra · CGPA 8.63
5. **Skills** — Two-column from Notion:
   - Left: Game Development · Programming · Design · Soft Skills
   - Right: DevOps & Cloud · Testing & QA · Tools
6. **Design Projects** — Gallery cards (Notion DB rows). Schema: `Name` + `GitHub` URL + cover image. Card grid 3-col desktop, 2-col tablet, 1-col mobile.
7. **About me content** — Transcribed near-verbatim from the Notion "About me" page (light editing for tone consistency with pro variant):
   - Cyber-café origin story
   - "Beyond my World" anime block (Naruto / Bleach / One Piece + Monster + Vinland Saga + the quote)
   - "in the WORLD of 🎮" gaming block (Ghost of Tsushima — gamer tag "Ronin" — God of War, Death Stranding, Uncharted)
   - "Dark Worlds & Moral Mazes" TV block (Better Call Saul, Breaking Bad, Peaky Blinders, Black Mirror, Westworld)
8. **Contact** —
   - Email: kusharraj11@gmail.com
   - LinkedIn: https://www.linkedin.com/in/kushar-raj-kashyap/
   - GitHub: https://github.com/Kusharraj11
   - Instagram: https://www.instagram.com/iamkrk11/
   - Resume: https://www.overleaf.com/read/qhndsfwfmngb#02b2e5
9. **Persona-switch button** — top-right corner

### Notion Asset Pull
Images and gifs referenced in Notion (profile photo, "Beyond my World" gif, gaming gif, dark-worlds gif) get downloaded once and stored in `assets/pro/`. We do NOT hot-link Notion S3 URLs — they expire.

## Component: Coder Page (`code.html`)

New file. Full-screen black background, JetBrains Mono throughout, cyan + green prompt colors mirroring real bash.

### Layout
- macOS window chrome at top (red/yellow/green dots + title bar) — matches the coder tile look for continuity from the chooser
- Scrollable terminal output area (`#term-output`)
- Fixed-position prompt input row at the bottom (sticks to viewport bottom)
- Mobile only: horizontal-scroll suggestion chip row above the input

### Boot Sequence (auto-runs on page load)
```
Last login: <today> on portfolio
                                            
   _              _                          
  | | ___   _ ___| |__   __ _ _ __           
  | |/ / | | / __| '_ \ / _` | '__|          
  |   <| |_| \__ \ | | | (_| | |             
  |_|\_\\__,_|___/_| |_|\__,_|_|             
                                            
> session: visitor · type 'help' to begin

kushar@portfolio:~$ █
```

### Command Set

| Command | Output |
|---|---|
| `help` | List of available commands with short descriptions |
| `whoami` | `kushar — MCA grad · game dev trainee · designer · cli native` |
| `about` | Multi-line bio paragraph |
| `experience` | Timeline of jobs + education |
| `skills` | Categorized skill list (matches pro skills sections) |
| `projects` | `ls -la`-style list of repo links → opens GitHub in new tab on click |
| `cat resume.md` | Inline resume summary + link to overleaf full PDF |
| `cat contact.md` | Email + social links |
| `cat hobbies.md` | Anime / gaming / TV picks |
| `ls` | Lists available files for `cat` |
| `clear` / `Ctrl+L` | Clears `#term-output` |
| `socials` | Quick list of social URLs |
| `theme` | Toggles between green-on-black and amber-on-black |
| `exit` | Triggers persona switch (navigates to `/?force=1`) |
| `<unknown>` | `bash: <cmd>: command not found` |
| (empty) | newline only |

### REPL Implementation

Vanilla JS, ~150-200 lines, no dependencies. Single class `Repl` with:
- `history: string[]` — last 50 commands, persisted in `sessionStorage` for the tab
- `historyIndex: number` — for ↑/↓ navigation
- `commands: { [name]: () => string | HTMLElement }` — dispatch table
- Methods: `execute(line)`, `print(text)`, `printHTML(node)`, `clear()`, `complete(prefix)` (tab completion)
- Event listeners: `keydown` on input for Enter / ↑ / ↓ / Tab / Ctrl+L

### Mobile Adaptations
- Suggestion chips: `[help] [whoami] [projects] [cat resume.md] [exit]` — horizontal scroll, tap injects into input
- Virtual keyboard: input row uses `position: sticky` so it follows the keyboard
- Font size minimum 14px on mobile (avoids zoom-on-focus)

### Persona Switch Affordance on Coder
- Subtle text link top-right: `↺ switch persona`
- Plus the `exit` command does the same thing

## Component: Shared Layer

### `shared/persona.js`

```js
const PERSONAS = ["gamer", "pro", "code"];
const KEY = "persona";

function getPersona() {
  try {
    const v = localStorage.getItem(KEY);
    return PERSONAS.includes(v) ? v : null;
  } catch { return null; }
}

function setPersona(p) {
  if (!PERSONAS.includes(p)) return;
  try { localStorage.setItem(KEY, p); } catch {}
}

function clearPersona() {
  try { localStorage.removeItem(KEY); } catch {}
}

function isForceParam() {
  return new URLSearchParams(location.search).has("force");
}

// On chooser page (index.html): auto-route if persona stored and not forced.
// Page calls this manually so it can decide when (after teaser, etc.)
function maybeAutoRoute() {
  if (isForceParam()) return false;
  const p = getPersona();
  if (!p) return false;
  location.replace(`/${p}.html`);
  return true;
}

window.persona = { get: getPersona, set: setPersona, clear: clearPersona, isForce: isForceParam, maybeAutoRoute };
```

### `shared/persona.css`

```css
.persona-switch {
  position: fixed;
  top: 18px;
  right: 18px;
  z-index: 100;
  font: 500 10px/1 "JetBrains Mono", monospace;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  text-decoration: none;
  padding: 8px 12px;
  border: 1px solid var(--persona-switch-border, currentColor);
  background: var(--persona-switch-bg, transparent);
  color: var(--persona-switch-fg, currentColor);
  opacity: 0.7;
  transition: opacity 0.2s, transform 0.2s;
}
.persona-switch:hover { opacity: 1; transform: translateY(-1px); }
```

Each variant page sets `--persona-switch-*` CSS vars to theme the button.

## Data Flow

### First-visit flow
```
GET /
  → teaser hero renders (~1.5s)
  → modal fades in
  → user clicks tile (e.g., "gamer")
  → setPersona("gamer")
  → window.location.href = "/gamer.html"
```

### Returning-visit flow
```
GET /
  → window.persona.maybeAutoRoute() runs after teaser
  → if persona stored AND no ?force=1: location.replace("/<persona>.html")
  → else: render chooser
```

### Direct deep-link flow
```
GET /pro.html (or /gamer.html, /code.html)
  → page renders directly
  → does NOT touch localStorage
  → switch button visible top-right
```

### Switch-persona flow
```
user clicks ↺ switch persona on any variant page
  → window.location.href = "/?force=1"
  → chooser shows modal (skips auto-route)
  → new pick overwrites localStorage.persona
```

### localStorage Schema
```json
{
  "persona": "gamer" | "pro" | "code"
}
```

## Error Handling

| Case | Behavior |
|---|---|
| No JS | `<noscript>` chooser at `/` shows three plain anchor links; variants render their static content; coder shows fallback message pointing to pro |
| localStorage disabled / quota | `try/catch` around all calls; treat as "no persona stored" |
| Corrupted persona value | `getPersona()` validates against allow-list; unknown → `null` |
| Direct visit to non-existent page | `404.html` with persona links + back-to-chooser button |
| Asset 404 (rotted Notion image) | `<img onerror="this.style.display='none'">` so layout doesn't break |
| Coder unknown command | `bash: <cmd>: command not found` |
| Coder `cat <unknown>` | `cat: <name>: No such file or directory` |
| Mobile <320px | All layouts collapse to single column without horizontal scroll |
| Slow connection | CSS-only teaser hero, all critical content inline, fonts use `font-display: swap` |

## Performance Budget

| Page | HTML+CSS+JS total | LCP target (3G) |
|---|---|---|
| `/` (chooser) | < 50KB | < 1s |
| `/gamer.html` | (current size, unchanged) | (current, unchanged) |
| `/pro.html` | < 200KB excluding lazy-loaded images | < 1.5s |
| `/code.html` | < 30KB JS for REPL | < 1s |

Lighthouse targets per page: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95.

## Testing & Verification

No automated test suite. Manual browser verification per checklist.

### Cross-browser matrix
Chrome (latest), Firefox (latest), Safari (latest desktop + iOS Safari), Edge.

### Per-page acceptance checklists

**Chooser (`/`)**
- Teaser renders within 200ms (no layout shift)
- Modal fades in after teaser; all 3 tiles visible
- Each tile click navigates to correct variant + sets `localStorage.persona`
- Returning visit auto-routes to stored persona
- `/?force=1` shows chooser even with persona stored
- No-JS: three plain links visible and functional
- Mobile <768px: tiles stack vertically, no horizontal scroll
- Keyboard: Tab cycles tiles, Enter activates focused tile

**Gamer (`/gamer.html`)**
- Visual identical to current `index.html` (regression diff)
- Switch-persona button top-right; click → `/?force=1`
- Existing mobile nav still works
- Existing scroll-reveal animations still fire
- All certificate / projects / mood-map sections render

**Pro (`/pro.html`)**
- All 9 sections render (hero, bio, currently, experience, skills, projects, about-content, contact, switch)
- All images load (no broken `<img>`)
- Resume link opens Overleaf in new tab
- Email link opens mail client (mailto:)
- Social links open in new tab (target="_blank" + rel="noopener")
- Mobile: single-column collapse, body type ≥ 16px
- Switch button works

**Coder (`/code.html`)**
- Boot sequence renders, prompt appears
- Every command in the table returns expected output
- Unknown command → `command not found`
- ↑/↓ scrolls history; Tab completes
- `Ctrl+L` clears
- `exit` triggers persona switch
- Mobile: suggestion chips work, virtual keyboard doesn't break layout
- Project list links open repos in new tab

### Manual smoke test before deploy
1. Clear localStorage; visit `/` → chooser shows
2. Pick gamer → land on gamer page
3. Reload `/` → auto-routes to gamer
4. Click switch button → modal again
5. Pick pro → land on pro
6. Pick code → land on code; run all commands
7. Type wrong URL → 404 page
8. Disable JS, visit `/` → fallback chooser

## Notion Content Inventory (snapshot 2026-05-09)

Source: `https://www.notion.so/Hi-I-am-Kushar-Raj-Kashyap-21bcbe77d18f80e6a41ce0015c63443d`

**Main page blocks:**
- Title + photo + 3-col link grid (About me / Design Projects / Resume)
- Bio: MCA grad · Game Developer Trainee @ BR Softech, Jaipur (current) · ex-AI-DevOps @ Orbiqe Technologies (6mo) · MCA Haldia 8.11 · BCA BIT Mesra 8.63
- 4 "Right now" callouts (working / values / binge watching / reading)
- "A bit more about me": anime, dogs, samurai, Japan, design hobbies
- Contact: kusharraj11@gmail.com, LinkedIn, GitHub, Instagram
- Database: "The journey from empathising to prototyping" — gallery view, schema = Name + GitHub URL, cover images
- Skills 2-col block

**About me sub-page blocks:**
- Photo + intro paragraph
- Cyber-café childhood story
- "Beyond my World!" — anime trio + Monster + Vinland Saga + quote
- "in the WORLD of 🎮" — gaming list (Ghost of Tsushima — "Ronin" tag, GoW, Death Stranding, Uncharted)
- "Dark Worlds & Moral Mazes" — TV list (BCS, BB, Peaky, Black Mirror, Westworld)
- Music mix embed (skip on pro page — link out instead)

**Assets to download:**
- Profile photo (S3 link in Notion — pull and save to `assets/pro/profile.jpg`)
- "Beyond my World" gif → `assets/pro/anime.gif`
- "in the WORLD of" gif → `assets/pro/gaming.gif`
- "Dark Worlds" gif → `assets/pro/tv.gif`
- Design Projects gallery covers — pull each cover image when implementing pro projects gallery

## Open Questions / Future Work

- **Custom domain:** which domain ships pointed at Cloudflare Pages? (Decision deferred — does not block implementation; works on default `*.pages.dev` URL.)
- **Analytics:** none planned. If desired later, add Plausible or Cloudflare Web Analytics.
- **Coder REPL persistence:** history is `sessionStorage`-only (resets between visits). Could promote to `localStorage` if user wants; deferred.

## Risks

| Risk | Mitigation |
|---|---|
| Notion image URLs expire (S3 signed) | Pull and store images locally during build; never hot-link |
| Coder REPL bundle balloons | Hard 30KB cap; if exceeded, trim command outputs not features |
| Three personas demand three full design systems → scope creep | Use existing gamer style as-is; pro and coder use minimal token sets per persona |
| Mobile coder UX poor | Suggestion chips + sticky input row; if real testing reveals issues, add a mobile-first simplified menu |

## Implementation Order (high level — detailed plan to follow)

1. Rename `index.html` → `gamer.html`; add persona-switch script + button
2. Create `shared/persona.js` and `shared/persona.css`
3. Create new chooser `index.html` with teaser + modal + tiles
4. Create `404.html`
5. Create `pro.html` from Notion inventory
6. Pull and store Notion assets in `assets/pro/`
7. Create `code.html` with REPL
8. Mobile pass on all four pages
9. Cross-browser pass
10. Cloudflare Pages deploy + custom domain config
