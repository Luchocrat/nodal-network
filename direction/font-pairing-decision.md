---
title: Font Pairing Decision — NODAL
date: 2026-10-10
type: font-pairing-decision
status: approved
pantry_schema: 1
project_key: NODALHackathon-2026
approved_by: Lucho
approved_at: 2026-10-10
carrier: Aspekta
expressive: Nyght Serif
utility: IBM Plex Mono
---

# Font Pairing Decision — NODAL

> [!warning] Approval gate
> **Pairing approved by Lucho on 2026-10-10** (explicit answer: "A · Aspekta + Nyght Serif"). The production gates are **still open**: the WOFF2 and license files are not yet in `web/public/fonts`, the Nyght Serif credit is not yet in place, and the build has not been verified. The usage ledger stays untouched until those close and Lucho resolves the pre-existing unattributed ledger change.

## Project requirement

- Creative Brief / Execution Doctrine: `NODAL_STARTER/HANDOFF.md`; `direction/ADD_REPORT.md` (locked v1); `direction/ADD_V2_REDIRECT.md` (proposed v2)
- Audience and reading conditions: Miami marine researchers, coastal-resilience teams and planners; judges on a projector (1280×720 to 1920×1080), dark UI, 2-minute demo; laptop and phone secondary
- Distribution: web
- Languages and required glyph coverage: English UI; Spanish proof string for future outreach; ° · − (U+2212) “ ” ’ ¿ é ñ ó á í ú; arrows/≈ may fall back to mono
- Representative carrier text: "For Miami marine researchers, coastal-resilience teams and planners screening proposed ocean infrastructure. Environmental accountability precedes deployment. Virginia Key, Miami · 8723214 · regional shore station. Water temperature 30.5 °C · observed Oct 10, 19:42 UTC. NET −40 kW · SIMULATED. Site ecological suitability: undetermined. RIDGE_01 = 35% (120 kW). “Do not deploy yet.” ¿Qué sabemos del océano? Acción, niño, también."
- Exact expressive/headline text: "Computing shouldn’t simply move into the ocean. It should be accountable to the ocean." + plate titles ("Network scenario", "Evidence ledger") + "NODAL / RIDGE"
- Required carrier weights, widths, and true italics: ≥3 weights (400/500/600 used); no italic required
- Required carrier voice from the brief: precise, measured, accountable instrument; "utilitarian" (Pantry voice token)
- Required expressive voice from the brief: speculative organic architecture that stays sharp; "sharp" (Pantry voice token)
- Initial webfont budget: ≤120 KB smallest-WOFF2 lower bound (query gate); ~200 KB total before subsetting
- Primary project tension: speculative organic architecture vs precise, inspectable evidence
- Authentic lettering or brand assets: human NODAL logo (`web/public/brand/nodal-white.svg`); type must not imitate it

## Approved roles

| Role | Face / asset | Why this role belongs to the project |
|---|---|---|
| Carrier | Aspekta (variable, wght 50–1000) | A broad utility family whose fine weight steps give the decision rail hierarchy without Inter-like anonymity. It carries plain-language Gemma text legibly at 17px |
| Expressive / eruption | Nyght Serif (Regular, Medium) | Blade serifs and spurs echo the thorn tendrils of the bone-shell architecture: elegance with danger, a proposition that invites scrutiny |
| Utility / mono | IBM Plex Mono (Regular, SemiBold) | Evidence, IDs and operating metadata that feel engineered rather than hacker costume. Inherently tabular for values |
| Authentic lettering | NODAL logo (Lucho) | Owns brand expression; type supports it |

## Pairing rationale

- **Productive difference:** a humanist-sharp serif against a neutral grotesk, with an engineered mono for numbers. The three differ in construction and history.
- **How it expresses the tension:** the serif voices the speculative vision (proposition, titles, family names). The grotesk and the mono voice the evidence and the decision.
- **Why it is specific to this project:** the spurs map to the architecture's tendrils, and the mono maps to the provenance system (every measured or simulated number reads as an instrument value).
- **What each face must refuse:**
  - Nyght Serif never sets values, labels, controls, conclusions or AI text.
  - Aspekta never takes the hero proposition.
  - Plex Mono never sets sentences.
- **Failure condition:** serif used for evidence or conclusions (the vision would dress up the data), or mono used for prose (console costume).

## Alternatives rejected

| Candidate | Reason rejected | Evidence |
|---|---|---|
| Aspekta + Coconat | Soft, warm display serif reads as reassurance; "liquid" letterforms soften the accountability voice | Specimen column B |
| Aspekta + Sprat Condensed | Strong vertical tension, but reads as newspaper; replacement proof fails | Specimen column C |
| Aspekta + Boska | Fashion voice ("elegance needs a blade") points at luxury, not research | Query: sharp/elegant |
| Aspekta + Excon | Space-age technical voice drifts to sci-fi spectacle (v1 Forbidden Gravity) | Query: technical |
| Aspekta + Apfel Grotezk | Friendly, rounded, too casual for accountability | Query: rounded |
| Spline Sans + Redaction | Degraded letters on "undetermined" harm comprehension of the key statement | Query: editorial |
| Nyght Serif italic as AI body | Too sharp and cramped at 17px on dark | Specimen column A, AI block |
| Rag, Frick, Alfphabet, Format 1452, Erbarre, BackOut, Sunday Masthead | Missing true minus (U+2212) required for every value | Whole-Pantry gate script |
| Tanklager, LT Institute, Gambarino | Single weight; cannot carry rail hierarchy | Capability manifest |

## Real-content proof

- [x] Longest headline (closing line, 3 lines at a 1/3 column)
- [x] Shortest label ("120 kW", "▼ SHORTFALL")
- [x] Body paragraph at target size and measure (Gemma sample text at 17px; serif italic rejected)
- [x] Uppercase and lowercase
- [x] Punctuation and quotation marks (’ “ ”)
- [x] Accented and bilingual text (Spanish line)
- [x] Numerals (−40, 30.5 °C, 3.75 h, 8723214, 35%)
- [x] Tabular numbers (Plex Mono)
- [ ] Mobile hierarchy (build evidence required)
- [ ] Large-display hierarchy (projector, build evidence required)
- [ ] Hover/focus/active states (build evidence required)
- [ ] Print proof (N/A)

Evidence: specimen `…/scratchpad/fonts/specimen/index.html`, rendered 2026-10-10 ~15:55 EDT in the Claude browser pane at 1440×900. All `@font-face` declarations reported `loaded`.

## Accessibility and performance

- Capability manifest path / schema: `~/Documents/studio/_fonts/manifests/font-capabilities.json`, schema 1
- Capability scan command and result: `node tools/verify-font-pantry.mjs` PASSED (2026-10-10)
- Pantry query JSON / normalized content hashes: carrier text sha256_nfc `431a368e8a7af6adaddb92baa0fadb300e0210aac1c1279ab9e68f0c18a06a57`; expressive `43a7120920f07eed04e0d8ac420d09e9a4cb1be0d6686f58a2feda7994eaf8f2`
- Carrier text coverage result: Aspekta full (≈ only missing; not in UI copy)
- Expressive text coverage result: Nyght Serif full
- Required styles present: yes
- Minimum tested size: carrier 12.5px (mono meta), serif 20px
- Body line height and measure: 17/1.55, ≤70ch
- Critical legibility risks: serif below 20px; serif italic body (rejected)
- Font files loaded: AspektaVF, NyghtSerif-Regular, NyghtSerif-Medium, IBMPlexMono-Regular, IBMPlexMono-SemiBold
- Minimum initial WOFF2 lower bound from Pantry manifest: within the 120 KB gate
- Total compressed font weight: ≈ 30 + 72 + 100 KB ≈ 202 KB before subsetting
- Subsetting decision: subset Plex Mono to Latin + General Punctuation + Arrows + Math Operators + Geometric Shapes if budget is exceeded
- `font-display` strategy: `swap`; preload AspektaVF only
- Fallback stack: carrier `"Aspekta", "Segoe UI", system-ui, sans-serif`; expressive `"Nyght Serif", Georgia, serif`; utility `"IBM Plex Mono", ui-monospace, Menlo, Consolas, monospace`
- CLS/layout-shift check: required on build return

## Asset provenance

| Face | Exact file | SHA-256 (prefix) | Source | Archived location |
|---|---|---|---|---|
| Aspekta | AspektaVF.woff2 | 373dc70ab4a17123… | github.com/ivodolenc/aspekta | `_fonts/open-source/aspekta/release` |
| Nyght Serif | NyghtSerif-Regular.woff2 | d00230a4a6d365a3… | gitlab.com/mkobuzan/nyght-serif (Tunera) | `_fonts/open-source/nyght-serif/release` |
| Nyght Serif | NyghtSerif-Medium.woff2 | 5a1be7e32406cf76… | same | same |
| IBM Plex Mono | IBMPlexMono-Regular.woff2 | ba204497f16b6d33… | github.com/IBM/plex | `_fonts/open-source/ibm-plex-mono/release` |
| IBM Plex Mono | IBMPlexMono-SemiBold.woff2 | 6a825b4824c01cbb… | same | same |

## License clearance

| Face | License class | Intended use | Evidence | Cleared by | Status |
|---|---|---|---|---|---|
| Aspekta | OFL-1.1 | web self-host | `release/OFL.txt` | — | pending approval |
| Nyght Serif | OFL-1.1 (foundry requests design credit) | web self-host | `release/LICENSE.txt` | — | pending approval + credit |
| IBM Plex Mono | OFL-1.1 | web self-host | `release/LICENSE.txt` | — | pending approval |

## Implementation

```css
@font-face { font-family: "Aspekta"; src: url("/fonts/AspektaVF.woff2") format("woff2"); font-weight: 50 1000; font-display: swap; }
@font-face { font-family: "Nyght Serif"; src: url("/fonts/NyghtSerif-Regular.woff2") format("woff2"); font-weight: 400; font-display: swap; }
@font-face { font-family: "Nyght Serif"; src: url("/fonts/NyghtSerif-Medium.woff2") format("woff2"); font-weight: 500; font-display: swap; }
@font-face { font-family: "IBM Plex Mono"; src: url("/fonts/IBMPlexMono-Regular.woff2") format("woff2"); font-weight: 400; font-display: swap; }
@font-face { font-family: "IBM Plex Mono"; src: url("/fonts/IBMPlexMono-SemiBold.woff2") format("woff2"); font-weight: 600; font-display: swap; }
```

```css
:root {
  --font-carrier: "Aspekta", "Segoe UI", system-ui, sans-serif;
  --font-expressive: "Nyght Serif", Georgia, serif;
  --font-utility: "IBM Plex Mono", ui-monospace, Menlo, Consolas, monospace;
}
```

## Approval

- Direction territory: ADD v2 (`direction/ADD_V2_REDIRECT.md`)
- Pantry query project key: NODALHackathon-2026
- Recommended by: Don Claude (Artsonist Design Director)
- Reviewed by Glyph: pending
- Verified by Don Claude Van Dam: content proof only (specimen)
- Approved by Lucho: yes (pairing) — AskUserQuestion answer, 2026-10-10
- Approval date: 2026-10-10
- Usage ledger record command: `node ~/Documents/studio/_fonts/tools/record-font-usage.mjs --project NODALHackathon-2026 --carrier "Aspekta" --expressive "Nyght Serif" --approved-at <date> --approved-by Lucho --decision /Users/luchoescobar/Documents/studio/NODALHackathon-2026/direction/font-pairing-decision.md`
- Usage ledger recorded after approval: no (also blocked until the pre-existing unattributed ledger change is resolved)

## Amendments

- 2026-10-10 — proposed (supersedes v1 DD-02 "retain system sans + system mono").
- 2026-10-10 — pairing approved by Lucho; production gates open (assets, licenses, credit, build evidence).
