# Full-bleed envelope intro gate

## Context

The site currently opens on a gate at `index.html:45-73`: a small boxed envelope (max 800×500) drawn with CSS `clip-path`, sealed with a flat `#a31d1d` circle containing the text "Y & M", plus a "Hai ricevuto un invito da / Yessine & Monica" caption and a "Salta Intro" button. Clicking it snaps the flap open (there is no `transition` on `.envelope-flap`, so the rotation is instantaneous) and cross-fades to the page over ~4s.

Meanwhile `assets/seal.png` — a photoreal gold wax seal with a Y&M monogram, 1280×1229, transparent — sits in the repo completely unreferenced.

The reference frames show what this should be instead: a single sheet of paper filling the entire viewport, folded into an envelope, its two diagonal seams crossing at the centre, the wax seal resting on that crossing. Nothing else on screen. Click the seal and the envelope opens and you fly into it.

**Decisions taken:** ivory/cream paper (not the navy of the reference — it matches the site's `--color-bg-primary`); no caption text; no skip button; no floating language/audio controls; cinematic open (seal breaks → flap swings → camera pushes through → ivory whiteout).

## Approach

### The geometry problem, and the fix

A `100vw × 50vh` flap triangle gives a 29° V on a 1920×1080 desktop but a 59° V on a 390×844 phone — the same markup reads as two different designs. The fix is to derive the apex depth from the **scene's width**, not the viewport's height, and let the scene overscan horizontally:

```css
--uh:      1dvh;                                        /* via @supports, 1vh fallback */
--scene-h: calc(100 * var(--uh));
--scene-w: max(100vw, calc(178 * var(--uh)));
--apex-y:  min(calc(var(--scene-w) * .28), calc(52 * var(--uh)));
```

Since `apex = 0.28 × W`, the half-angle is `atan(2 × 0.28)` = **29.3° on every device**, which is the real-world DL envelope flap angle. `178dvh` is the width at which the apex lands exactly at 50% height. On a phone you are simply cropped into the middle of a large envelope — top corners all flap, bottom corners all pocket, seams crossing dead centre. Only ultrawide (≥2.2:1) compromises: the depth cap gives a 23.7° V.

Never overscan vertically — the hinge must sit exactly on the viewport's top edge.

### Layer stack

`.gate-stage` owns `perspective: 1200px` and, critically, `perspective-origin: 50% var(--apex-y)` — aiming the camera at the seal. Points at the apex are then fixed under z-translation, so the seams stay welded to the seal through the entire camera push with no origin drift.

`.gate-scene` is `transform-style: preserve-3d` and carries the dolly. Inside it, depth is real `translateZ`, not `z-index`:

| layer | z | role |
|---|---|---|
| `.gate-back` + `.gate-interior` | −40px | envelope interior, revealed as the flap lifts |
| `.gate-flap-shadow` | −28px | blurred cast shadow; retreating it is what sells the open |
| `.gate-flap` | +8px | two faces, `backface-visibility:hidden` |
| `.gate-pocket` | +24px | front pocket, upward triangle |
| `.gate-seal-slot` | +34px | seal |

**Two rules that will silently break this if violated:**

1. `clip-path`, `filter`, `opacity < 1`, `mask` and `overflow != visible` force `transform-style` back to `flat`. So `.gate-scene` and `.gate-flap` carry *only* transform; every clip-path lives on a leaf child, and the exit blur lives on `.gate-lens`, outside the perspective element. Put a comment in the CSS saying so.
2. Inside `preserve-3d`, `z-index` does not arbitrate against 3D-transformed siblings — the browser depth-sorts by geometry. If the flap ever renders in front of the pocket, the fix is `translateZ`, not `z-index`.

The flap's underside is a sibling face with `transform: rotateX(180deg)`, a **pre-flipped** `clip-path: polygon(0 100%, 100% 100%, 50% 0)` (because `rotateX(180deg)` mirrors the element vertically — the front polygon would draw an upward triangle), a reversed light gradient (`202deg` vs the front's `158deg`, so the lit edge stays in the same world direction) and the darker `--paper-in-*` tone. That is an actual inside-of-paper, not a mirror.

`clip-path` on a `rotateX`'d element is correct in Chrome, Safari and Firefox — it clips in local space before the transform maps it out, which is exactly what's wanted.

### Paper texture, no new asset

Two `feTurbulence` data-URI backgrounds at different scales, both `type="fractalNoise"` (never `turbulence` — its absolute-value output is the hard speckle that reads as TV static), both `stitchTiles="stitch"`, both `mix-blend-mode: multiply`:

- fine fibre — `baseFrequency="0.85"`, authored 200px, **painted at 124px** so each cell is sub-pixel on retina, `opacity: .055`
- broad mottle — `baseFrequency="0.012" numOctaves="4"`, authored 600px, painted 760px, `opacity: .085`

Above ~`.10` on the fine layer it reads as static. Both sit over a `linear-gradient(158deg, #fffdf8, #f3efe4)` so the sheet has a lit side and a shaded side — noise over flat colour always looks synthetic. Add `repeating-linear-gradient(0deg, rgba(26,42,68,.016) 0 1px, transparent 1px 4px)` for the laid ruling of cotton stock.

These are **background-images** (rasterized once, tiled, cached). Using `feTurbulence` as a live `filter: url(#…)` on a fullscreen animated element re-runs the filter graph every frame — single-digit fps.

Seam shadows via `filter: drop-shadow()` on the *clipped* elements: `drop-shadow` respects `clip-path`, so the shadow traces the diagonals exactly with no rotated pseudo-elements. Flap `drop-shadow(0 3px 5px …)`, pocket `drop-shadow(0 -2px 4px …)`.

The pocket needs `height: calc(var(--scene-h) - var(--apex-y) + 1px)` — the two antialiased clip-path vertices meeting at the apex otherwise leave a 1px light hairline.

### Camera push: dolly, not scale

Animate `z: 0 → 982` on the preserve-3d scene under the fixed `perspective: 1200` (apparent scale `p/(p−z)` = 5.5×; keep `z ≤ 0.85·p` or it explodes and inverts). Not `scale()` on a wrapper, and **not** an animated `perspective` — that's a lens zoom, it's non-composited, and it eases badly.

The reason is parallax: push `pocket 24 → 92` (rushes past the camera) and `back −40 → −150` (recedes) and you get real perspective divergence. With `scale()` everything grows uniformly and it reads as zooming a flat picture.

**Pixelation is real and must be hidden.** Composited layers rasterize at the scale in effect when created and are not re-rasterized mid-animation, so at 5.5× you're stretching a 1× bitmap — banded gradients, blocky shadows, stair-stepped diagonals. Two mitigations, both already in the timing:

- the ivory wash starts at t=1.55 and overlaps the dolly, so the peak 5.5× frame is ~90% washed out
- `filter: blur(0 → 7px)` on `.gate-lens` reads as motion blur and makes raster blur indistinguishable from intent — gated to `(min-width:900px) and (pointer:fine)`, since fullscreen blur costs 30+ ms/frame on low-end Android

### Open timeline (~2.3s to handoff)

| t | | dur | ease |
|---|---|---|---|
| 0.00 | seal press in `scale→0.86, y+3` | 0.13 | `power2.in` |
| 0.13 | seal release `scale→1.08, y−10` | 0.22 | `power3.out` |
| 0.30 | **flap `rotationX 0 → −180`** | 1.05 | `power2.inOut` |
| 0.30 | cast shadow `scaleY 1→0` | 0.75 | `power2.in` |
| 0.32 | seal exits `y−92, rot 24, scale 1.3, opacity 0` | 0.50 | `power2.in` |
| 0.55 | interior shading in | 0.70 | `power1.out` |
| 0.70 | glow spills from the envelope mouth | 0.85 | `power2.out` |
| 0.86 | flap `opacity→0` (crossover insurance) | 0.24 | `none` |
| 0.95 | **dolly `z 0→982`**, pocket `→92`, back `→−150` | 1.25 | `power2.in` |
| 1.55 | ivory wash `opacity 0→1` | 0.72 | `power2.in` |
| 1.70 | lens `blur 0→7px` (desktop only) | 0.55 | `power2.in` |
| 2.27 | handoff — hide lens, un-`inert` + show `#main-content`, unlock scroll, dispatch `site-entered` | — | — |
| 2.30 | gate fades and `.remove()`s | 0.65 | `power2.out` |

The `0.86` crossover is derived, not guessed: for `power2.inOut`, output `100/180 = 0.556` occurs at input `1 − √(0.444/2) = 0.529`, so `0.30 + 0.529 × 1.05`. Past ~100° the flap is off-screen above the viewport anyway (projected tip at y ≈ −234px at −135°), which is why the **retreating cast shadow** and the interior/glow reveal carry the reading of "it opened" — not the flap itself.

The 0.65s dissolve deliberately overlaps `triggerSiteEntrance()` in `js/animations.js:89-114`, so the hero is already animating as the ivory lifts.

Entrance (~1.6s on load): scene `z:−300 → 0` + `rotationX 2.4 → 0` over 1.30s `power3.out` (a mini reverse-dolly, so entrance and exit share one camera), cast shadow up, then the seal drops in with `back.out(1.8)` and a 0.09s squash + `elastic.out(1, 0.55)` settle — a wax stamp landing.

### Idle affordance (no text allowed)

Three stacked cues on the seal: a 1px gold ring pulsing `scale 0.92→1.78, opacity 0.5→0` (2.2s, `repeatDelay: 1.5`); a specular sheen sweeping `xPercent −145 → 145`, `mix-blend-mode: overlay`, **masked with `mask-image: url('../assets/seal.png')`** so the highlight is clipped to the wax silhouette rather than a square (note: mask URLs resolve relative to the stylesheet, and the `-webkit-` prefix is still needed); and a `scale 1 → 1.032` breath on a *separate wrapper* from the button, so the click timeline's scale tweens never fight the idle loop. Plus `cursor: pointer` on the whole gate and a gold bloom under `@media (hover: hover)`.

## Files

**`index.html:45-73`** — replace the overlay. Drop `.intro-labels`, `#skip-intro`, `.particles`, `.seal-inner`. New tree:

```
#intro-gate[role=dialog][aria-modal]
└── .gate-lens
    └── .gate-stage
        └── .gate-scene
            ├── .gate-back > .gate-interior
            ├── .gate-flap-shadow
            ├── .gate-flap > .gate-face--front + .gate-face--back
            ├── .gate-pocket
            ├── .gate-glow
            └── .gate-seal-slot
                ├── .gate-seal-ring
                └── .gate-seal-breath > button.gate-seal > img + .gate-seal-sheen
└── .gate-wash
```

Use `<button type="button">` for the seal, not `role="button"` — tabindex, Enter/Space and AT semantics come free, and the current markup has `role="button"` with *no* tabindex and no key handler, so it is not reachable today. `alt=""` on the `<img>` since the button carries the label. Keep `data-i18n-attr="aria-label" data-i18n-key="intro.openInvitation"` — that key already exists in both locales at `js/i18n.js:6-8` / `js/i18n.js:102-104`.

Leave `<main id="main-content" style="opacity:0;visibility:hidden">` at `index.html:76` exactly as is — three places in `envelope.js` are the only things that undo it.

**`css/animations.css`** — replace all 184 lines. The file is 100% intro code, nothing else imports from it.

**`js/envelope.js`** — rewrite. Keep the `initEnvelope` export name so `js/app.js:2` and `js/app.js:9` are untouched. `createParticles()` goes away (nothing else references `#particles`).

**`assets/seal.png`** — 2.25 MB at 1280×1229 is far too heavy for the first thing a visitor sees, and it's render-blocking for the gate. Displayed at ~128px but pushed to 5.5×, so ~700px of source is the real requirement. Resize to 640px and re-compress (`sips -Z 640`, then `pngquant` if available) — expect ~150–300 KB. Add `fetchpriority="high" decoding="async"` and a `<link rel="preload" as="image">` in `<head>`.

## Things to get right

- **`prefers-reduced-motion`** — GSAP does not read the media query, so branch in JS *before* building any timeline. Reduced path: no entrance timeline (set final state directly), no idle loops (static ring, sheen `display:none` via CSS), and a 0.30s + 0.30s linear crossfade on activate. Everything else routes through the same `revealSite()`. The existing block at `css/responsive.css:57-68` only kills CSS animation and is not sufficient.
- **GSAP-missing fallback** — today if the CDN is blocked the site is a permanently blank page. `index.html:37-42` already sets `.no-js` on `<html>`; add `.no-js .gate { display: none !important }` and `.no-js #main-content { opacity: 1 !important; visibility: visible !important }`.
- **Autoplay** — `music.play()` must be called *synchronously* inside the click handler; a GSAP `onStart`/`.call()` is a separate task and Safari rejects it. (`#bg-music` still doesn't exist — `js/envelope.js:7` is a dead hook. Keep the null-guard.)
- **Focus / scroll** — `inert` + `aria-hidden` on `#main-content` while the gate is up, `html.gate-open { overflow: hidden }` to lock scroll (this also removes the scrollbar, so `100vw` matches the true viewport and the flap corners land on the real corners), focus to the seal after the entrance, Tab trapped onto it, `:focus-visible { outline: 2px solid var(--color-gold); outline-offset: 10px }`. Release all of it in `revealSite()`.
- **Escape skips instantly** — replaces the removed "Salta Intro" button. Click anywhere and any key also open.
- **`will-change`** — add at click, and `display: none` the whole `.gate-lens` at handoff. Leaving `will-change: transform` on a fullscreen layer during idle pins a large GPU texture for as long as the visitor looks at the seal.
- **`dvh`** — set via `@supports (height: 1dvh)`, not a fallback pair. An unknown unit inside a custom property is invalid at computed-value time and `var()` then falls back to nothing.
- **GSAP property names** — `rotationX` and `z`, not `rotateX` and `translateZ`.
- **`clip-path` fallback** — `@supports not (clip-path: polygon(...))` collapses to a flat ivory panel rather than a broken layout.
- The `intro.receivedFrom` and `intro.skip` keys in `js/i18n.js` become unused. Harmless; remove or leave.
- Unrelated pre-existing bug worth knowing about before any DOM surgery near it: `index.html:215-241` has an unbalanced `</div>` — `.details-grid` is never closed.

## Verification

`sessionStorage.introShown` gates the whole intro — **clear it between every test run** (`sessionStorage.clear()` in the console, or use a private window).

Serve with `python3 -m http.server 8000` (the ES modules need a real origin) and check:

1. **Desktop 1920×1080** — arms hit the exact viewport corners, apex dead centre, 29° V. Click the seal: press → lift → flap swings → dolly → ivory. Page lands with the hero already animating.
2. **iPhone-size 390×844** (devtools responsive) — the V must look *identical* in angle to the desktop. Apex dead centre. This is the whole point of the width-derived geometry; if the V is visibly steeper here, `--scene-w` is wrong.
3. **Safari specifically** — the flap must never draw in front of the pocket past 90°, and the paper grain must not band. This is the browser most likely to mis-sort the intersecting planes.
4. **Landscape phone 844×390 and ultrawide 2560×1080** — the depth cap engages; confirm it degrades gracefully rather than clipping.
5. **Reduced motion** — devtools → Rendering → "Emulate prefers-reduced-motion". Should be a plain 0.6s crossfade with no rotation, no dolly, no pulsing ring.
6. **Keyboard only** — Tab reaches the seal and shows a gold focus ring, Enter and Space both open, Escape skips instantly.
7. **Second visit** — reload without clearing sessionStorage; the gate should not appear at all and the site must be fully visible and scrollable.
8. **GSAP blocked** — block `cdnjs.cloudflare.com` in devtools Network, reload. The site must render normally with no gate, not a blank page.
9. **Performance** — devtools Performance panel through the open sequence; no long frames on the dolly. Then Network: confirm the optimised `seal.png` is well under 300 KB.
