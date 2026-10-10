# Artsonist Execution Handoff — NODAL v2 reskin

> **STATUS: LOCKED v2 — approved by Lucho on 2026-10-10.** Type A (Aspekta + Nyght Serif + IBM Plex Mono). Liquid = water-column continuity (no glass). The proposition moves to the header. Execute Slices 1–2, then stop at the Director checkpoint.

| | |
|---|---|
| Project | NODALHackathon-2026 |
| Direction packet | `direction/ADD_REPORT.md` (locked v1) + `direction/ADD_V2_REDIRECT.md` (v2 amendment) |
| Font decision | `direction/font-pairing-decision.md` |
| Direction status/version | LOCKED v2 (amends locked v1), Lucho 2026-10-10 |
| Execution phase | building (skin only) |
| Messaging doctrine | N/A — HANDOFF §1/§3/§7 govern copy (unchanged) |
| Channel/copy source | the existing component copy in `NODAL_STARTER/web/src/components/**` |
| Executor owns | `NODAL_STARTER/web/**` — CSS, component markup and layout wrappers, static font files |
| Director checkpoints | after Slice 2, and after Slice 5 (Pre-Assay); then Glyph cross-assay |
| Branch | If the submitted repo exists, work on branch `add-v2-reskin`. The hackathon build window closed at 3:30 PM ET, so do not overwrite the submitted build without organizer clearance |

**One sentence:** same app, same behavior, new skin. The page becomes a water column (surface → seabed): the network melts into it, a sticky decision rail floats beside it, every evidence label is tethered to its claim, and type comes from Lucho's Font Pantry.

---

## Message functions to express

- **CH-01 First view:** the proposition (serif), the audience line and the task line, with the network as the dominant image.
- **CH-02 Telemetry:** two NOAA readings riding the waterline, each tethered to ● OBSERVED. Every product listed in the evidence ledger.
- **CH-03 Scenario → result → action → suitability:** one sticky plate, co-visible at 1280×720.
- **CH-04 AI explanation:** sits beside the deterministic rail it explains, set in readable carrier text.
- **CH-05 Architecture:** a borderless network hero; glyph geometry untouched.

## Locked decisions to preserve (exact)

- **Evidence tags:** OBSERVED / SIMULATED / CONCEPTUAL / UNKNOWN text + glyph + border style (`Badge.tsx`). Never color alone.
- **Signature Move:** every claim keeps its boundary in the same reading area, now **tethered** (Slice 5).
- **Color tokens:** v1 values stay exactly as they are (`--abyss #061b24`, `--panel #0b2a36`, `--surface-raised #103945`, `--ivory #f1f1e9`, `--muted #b4b9ae`, `--cyan #4fd1d9`, `--amber #e7a477`, `--unknown #c9c4d8`, `--panel-edge #294854`, `--control-line #688792`). No green anywhere. SURPLUS stays neutral.
- **Suitability:** "Site ecological suitability: undetermined" + "Do not deploy yet" stays visible in every energy state.
- **Brand:** "NODAL / RIDGE · RIDGE_01" notation and exact IDs. The logo file `public/brand/nodal-white.svg` is unchanged (human-owned).
- **Copy:** every disclaimer, scope line, freshness label, OUTDATED / UNAVAILABLE / FAILED text and deterministic-fallback label stays word for word. The only copy moves are listed in Slice 4.
- **Plain-language Gemma prompt:** already shipped. Do not touch `gemma.server.ts`.

## Forbidden reinterpretation (hard no)

- Do **not** edit `src/lib/**`, `src/app/api/**`, `tests/**`, `scripts/**`, `shared/network.json` or `package.json` dependencies. Fonts are static files only, so no npm font packages.
- No change to state, props contracts, handlers, fetch calls, IDs used by anchors (`main`, `net-h`, `nodesel`, `noaa-h`, `scn-h`, `asm-h`, `gem-h`) or any ARIA (`role`, `aria-pressed`, `aria-live`, `role="alert"`, `aria-valuetext`, `.sr-only` text).
- `NetworkView.tsx`: do **not** touch `SHAPES` / `PLAN` / `ATOL_*` path data, positions, scales, hit areas or the interactive layer. Allowed: SVG `<text>` font sizes and family, gradient stop colors, and CSS on `.nv`.
- **No "liquid glass":** no `backdrop-filter`, blur, frosted or translucent panels, glow, bloom, drop-shadow stacks or neon. No new animation (keep the existing `.nv-wave` drift). No parallax or scroll-linked effects. No charts, 3D or GLB.
- No organic radii on controls. The shell corner applies to **two plates only**.
- Do not introduce colors beyond the token block below.

## Channel adaptation freedom

Spacing values, exact pixel sizes within the ranges given, markup wrappers and class names, splitting a component's JSX into sub-blocks **without changing its props or logic**, and mobile stacking details. Anything not covered here is an uncovered decision: list it on return and do not invent it.

## Authentic asset boundaries

- **NODAL logo:** Lucho owns it. Keep the file as is and set height only.
- **Architecture glyphs:** Lucho owns silhouettes. No shape edits.
- **Fonts:** copy only the five files listed below from Lucho's Pantry, together with their license files.

---

## Slice 1 — Fonts and tokens (no layout change)

1. Copy these files into `web/public/fonts/`:
   - `~/Documents/studio/_fonts/open-source/aspekta/release/AspektaVF.woff2`
   - `~/Documents/studio/_fonts/open-source/nyght-serif/release/NyghtSerif-Regular.woff2`
   - `~/Documents/studio/_fonts/open-source/nyght-serif/release/NyghtSerif-Medium.woff2`
   - `~/Documents/studio/_fonts/open-source/ibm-plex-mono/release/IBMPlexMono-Regular.woff2`
   - `~/Documents/studio/_fonts/open-source/ibm-plex-mono/release/IBMPlexMono-SemiBold.woff2`

   Copy the license files into `web/public/fonts/LICENSES/`:
   - `aspekta/release/OFL.txt` → `Aspekta-OFL.txt`
   - `nyght-serif/release/LICENSE.txt` → `NyghtSerif-OFL.txt`
   - `ibm-plex-mono/release/LICENSE.txt` → `IBMPlexMono-OFL.txt`
2. Add this to the top of `globals.css`:

```css
@font-face { font-family: "Aspekta"; src: url("/fonts/AspektaVF.woff2") format("woff2"); font-weight: 50 1000; font-display: swap; }
@font-face { font-family: "Nyght Serif"; src: url("/fonts/NyghtSerif-Regular.woff2") format("woff2"); font-weight: 400; font-display: swap; }
@font-face { font-family: "Nyght Serif"; src: url("/fonts/NyghtSerif-Medium.woff2") format("woff2"); font-weight: 500; font-display: swap; }
@font-face { font-family: "IBM Plex Mono"; src: url("/fonts/IBMPlexMono-Regular.woff2") format("woff2"); font-weight: 400; font-display: swap; }
@font-face { font-family: "IBM Plex Mono"; src: url("/fonts/IBMPlexMono-SemiBold.woff2") format("woff2"); font-weight: 600; font-display: swap; }

:root {
  /* v2 additive tokens */
  --water-surface: #0b3340;
  --seabed: #04121a;
  --isobath: rgba(180, 185, 174, 0.18);   /* decorative hairline only; never a control boundary */
  --meniscus: rgba(79, 209, 217, 0.45);   /* the waterline */
  --shell-corner: 3px 3px 3px 22px;       /* two plates only */
  --font-carrier: "Aspekta", "Segoe UI", system-ui, sans-serif;
  --font-expressive: "Nyght Serif", Georgia, serif;
  --font-utility: "IBM Plex Mono", ui-monospace, Menlo, Consolas, monospace;
  /* alias the existing variables so current rules pick up the new faces */
  --font-sans: var(--font-carrier);
  --font-mono: var(--font-utility);
}
```

3. Preload the carrier in `layout.tsx`: `<link rel="preload" href="/fonts/AspektaVF.woff2" as="font" type="font/woff2" crossOrigin="" />`.
4. Badge tracking `0.06em` → `0.04em`. Motto: the four slogan words in utility at 13px with normal tracking; "is an aspiration, not proof." in carrier.

**Type roles (do not cross them):**

| Role | Face | Where |
|---|---|---|
| Expressive | Nyght Serif 400/500, **≥20px only** | Header proposition (32/1.1, ≤22ch); stratum and plate titles (`h2`, 22–24px): Network, Network scenario, Power balance & next action, AI explanation, Evidence ledger; the family in "NODAL / RIDGE" (22px caps, +0.02em); footer closing line (28px) |
| Carrier | Aspekta 400/500/600 | All body copy, labels, controls, task line (600, 22px), action text (17px), suitability statement (600, 19px), **Gemma output (400, 17/1.55, max 68ch)**, captions (≥14px) |
| Utility | IBM Plex Mono 400/600 | Every number + unit, timestamps, IDs, station number, rule IDs, assessment ID, badges, freshness labels, SVG labels. Never sentences |

**Return before Slice 2:** a screenshot at 1440×900 and the network-tab font list.

## Slice 2 — Water column ground, strata, waterline, borderless network

1. `body`:

```css
background: linear-gradient(180deg, var(--water-surface) 0, var(--abyss) 30%, var(--abyss) 72%, var(--seabed) 100%);
background-color: var(--abyss);
```

   Remove the current radial glow.
2. **Strata instead of boxes.** Remove `.panel` borders and backgrounds from the network section, the NOAA section and the Gemma section. Separate top-level sections with a full-bleed `border-top: 1px solid var(--isobath)` and 28–36px vertical rhythm. Section titles use the expressive face.
3. **Waterline** (`NoaaStrip`): no box. A full-bleed `border-bottom: 1px solid var(--meniscus)`. Inside it:
   - station meta (utility, 13px) on the left;
   - the two readings (utility 600, 28px, cyan; unit in carrier, 14px) tethered to OBSERVED (Slice 5);
   - observed time and freshness (utility, 13px) on the right.

   Keep the link target and the `.sr-only` text.
4. **Guided path:** keep the `<nav><ol>` and the six links. Restyle as inline text links "01 Network · 02 Select node · 03 Observe · 04 Simulate · 05 Action · 06 Explain" (utility numerals + carrier words). No pill borders, min-height 44px, 2px cyan focus ring kept.
5. **Network hero:**
   - `.nv { border: 0; border-radius: 0; -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 9%); mask-image: linear-gradient(180deg, transparent 0, #000 9%); }`, so the surface fades into the page water.
   - SVG `<defs id="nodal-water">` stops: `#0b3340` → `#07222d` → `#04121a`.
   - SVG text: node IDs 15 → 20, captions 13 → 15, ATOL label 15 → 18, `fontFamily` → `var(--font-utility)`.

**Return before Slice 3:** a 1440×900 full-page screenshot. **Director checkpoint** here: stop and send it to Lucho / Claude.

## Slice 3 — Stage grid, sticky decision rail, plates

In `Dashboard.tsx` keep DOM order **header → waterline → path → network → selection → rail → AI → ledger → footer** (the logical keyboard and screen-reader order). Place items with grid areas:

```css
@media (min-width: 1180px) {
  .stage { display: grid; grid-template-columns: minmax(0, 8fr) minmax(380px, 4fr); grid-template-areas: "net rail" "sel rail" "ai rail"; column-gap: 32px; row-gap: 28px; align-items: start; }
  .stage > .s-net { grid-area: net; } .stage > .s-sel { grid-area: sel; } .stage > .s-ai { grid-area: ai; }
  .stage > .s-rail { grid-area: rail; grid-row: 1 / span 3; align-self: start; position: sticky; top: 16px; }
}
@media (max-width: 1179px) { .stage { display: grid; gap: 24px; } }
```

- **`.s-rail`** = one plate: `background: var(--panel); border: 1px solid var(--isobath); border-radius: var(--shell-corner); padding: 18px 20px`. It contains `ScenarioPanel` and then the **core** of `AssessmentPanel` (net result, battery line, action, suitability block).
  - Split `AssessmentPanel`'s JSX into `AssessmentCore` (rail) and `AssessmentLedger`: the assessment ID, formula line, "Rules triggered" line and the three `<details>` (missing evidence, rules, assumptions) move to the ledger. Same `a` prop, no logic change; the `aria-live` region stays on the core.
  - Rail compaction: Reset on the same row as battery; scenario intro text as a 14px caption under the sliders.
  - **Target rail height ≤ 660px at 1280px width.**
- **`.s-sel`** = selected-node plate (shell corner, `--surface-raised`, cyan 5px left rule kept) + node selector as a 3×2 grid of quiet rows: utility ID + carrier label, `--control-line` borders (keep: it is the essential control boundary), selected = cyan inset bar + raised surface. Then the concept caption and "Schema and view notes".
- **`.s-ai`** = the `GemmaPanel` stratum (no box): serif title tethered to AI EXPLANATION, Explain button, output in carrier 17/1.55, left 2px rule. Every state unchanged.
- **`.s-net`** = network stratum: serif title "Network" + utility subtitle "6 nodes + ATOL + seabed junction", tethered CONCEPTUAL, NET pill, suitability pill, SECTION/PLAN control, SVG hero.

## Slice 4 — Evidence ledger, header, footer

1. **Ledger** (`<section aria-labelledby="noaa-h">`, full width, serif title "Evidence ledger", existing `h2#noaa-h` text may become "Regional observations · NOAA Tides & Currents" as a sub-heading). Two columns at ≥1180px, 7 and 5:
   - **Left:** NOAA observations as a `<table>` with columns **Product · Reading · Observed (UTC · EDT) · State · Source**. One row per product; `currents` stays filtered out. The caveat goes as a 14px note under the product name. Unavailable rows show "— unavailable" plus the Diagnostics `<details>` in the State cell. CACHED / OLD / live age / q=p (preliminary) are all kept. Refresh button, scope sentence and banners sit above the table; the source sentence sits below. At ≤600px each `tr` becomes a stacked two-line block.
   - **Right:** `AssessmentLedger` (assessment ID, formula, rules-triggered line, the three `<details>`).
2. **Header:** left = logo (height 30px) + **proposition** "Computing shouldn’t simply move into the ocean. It should be accountable to the ocean." (expressive 32/1.1, ≤22ch) + audience sentence (carrier 16, muted). Right (bottom-aligned) = task line (carrier 600, 22px) + "Not an operating data center…" (14px) + slogan.
3. **Footer:** closing line repeated in expressive 28px (the spoken close), legend, data sources, plus the credit "Type: Aspekta (Ivo Dolenc, OFL-1.1) · Nyght Serif (Maksym Kobuzan / Tunera, OFL-1.1) · IBM Plex Mono (IBM, OFL-1.1)". Add the same credits to `web/README.md`.

## Slice 5 — The Tether (Signature Move production rule)

Add `components/Tether.tsx`:

```tsx
import Badge from "./Badge";
import type { Tag } from "@/lib/scenario";
export default function Tether({ tag, children }: { tag: Tag; children: React.ReactNode }) {
  return (
    <span className={`tether tether-${tag}`}>
      {children}
      <span className="tether-line" aria-hidden="true" />
      <Badge tag={tag} />
    </span>
  );
}
```

```css
.tether { display: inline-flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.tether-line { width: 18px; height: 0; border-top: 1px solid currentColor; opacity: 0.7; }
.tether-OBSERVED .tether-line { color: var(--cyan); }
.tether-SIMULATED .tether-line { color: var(--amber); }
.tether-CONCEPTUAL .tether-line { color: var(--ivory); border-top-style: dashed; }
.tether-UNKNOWN .tether-line { color: var(--unknown); border-top-style: dotted; }
```

Apply it in these six places, replacing a free-floating badge in each:

1. Each waterline reading → OBSERVED
2. Network title → CONCEPTUAL
3. Net result `−40 kW net power` → SIMULATED
4. "Site ecological suitability: undetermined" → UNKNOWN
5. "NODAL / RIDGE" in the selected plate → CONCEPTUAL
6. The AI explanation heading → the existing `AI EXPLANATION` label (same hairline in ivory)

The footer legend keeps plain badges, since it is a key, not a claim.

---

## Evidence required on return

1. **Screenshots:**
   - 1440×900 at the top, and scrolled so the rail is sticky;
   - **1280×720 with demand slider, net result, action text and suitability heading fully visible at once**;
   - 768×1024;
   - 390×844.
2. **Measurements:**
   - `scrollWidth == innerWidth` at 1440, 1280, 768, 390 and 720;
   - rail height at 1280×720 (target ≤ 660px);
   - 5 WOFF2 files loaded, total KB.
3. **Determinism replay** (proves logic untouched): RIDGE_01 60/80 → `+20 kW`, assessment **f24c5e8e**; 120/80 → `−40 kW`, **54b0d579**. Suitability visible in both. One Explain run (or a truthful unavailable state).
4. **Keyboard:** the Tab order list from the skip link to the footer, with the focus ring visible on every stop including SVG nodes.
5. **Contrast:** a list of every new text/ground pair with its ratio; each must be ≥4.5:1 (serif titles on `--water-surface` included).
6. **Tests:** `npm test`, `npm run typecheck`, `npm run build` outputs. Building overwrites `.next`, so restart `npm start -p 3001` afterwards.
7. **Report:** four lines — DONE / TESTED / BLOCKED / NEXT — plus deviations and any uncovered decision, marked `PROPOSED` for Lucho.

**Next gates:** Director inspection (Claude) → Lucho taste review → Glyph cross-assay. Claude authored v2 and cannot certify it (AssayHall Rule 9).
