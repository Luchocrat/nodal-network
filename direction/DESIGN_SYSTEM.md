---
project: NODALHackathon-2026
run-id: no-tf-baseline
status: approved
direction_lock_version: 1
approved_by: Lucho
approved_at: 2026-10-10
date: 2026-10-10
---

# NODAL / DESIGN SYSTEM

Use [ADD_REPORT.md](ADD_REPORT.md), locked v1, as the direction authority. Lucho approved the direction and expression system on 2026-10-10. New UI expression choices below are **LOCKED**; claims, ownership, names and shared network constraints remain **GIVEN**. Existing implementation values retain **OBSERVED** provenance. Cursor applies incremental changes; the optional custom-font candidates and human-owned final assets retain separate review.

## Governing Rules

Precise carrier system, organic architecture, accountable explanation. Pair propositions with evidence boundaries in the same reading area. Reserve decorative complexity for the existing structures. Use plain controls, measured grid lines and generous image space. No neon HUD, glass blur, decorative sigils, endless pulse, or new logo.

## Color

| Token | Value | Purpose / status |
|---|---|---|
| `--bg` | `#061B24` | Marine navy page ground; OBSERVED |
| `--surface` | `#0B2A36` | Main panels; OBSERVED |
| `--surface-raised` | `#103945` | Hover/selected surface; LOCKED |
| `--text` | `#F1F1E9` | Bone-white primary text; OBSERVED |
| `--muted` | `#B4B9AE` | Secondary reading text; OBSERVED |
| `--cyan` | `#4FD1D9` | Observed accents, focus, selected outlines; OBSERVED |
| `--amber` | `#E7A477` | Simulated badge text and operational shortfall; OBSERVED |
| `--unknown` | `#C9C4D8` | Missing evidence/uncertainty; OBSERVED |
| `--line` | `#294854` | Quiet decorative divisions only; LOCKED |
| `--control-line` | `#688792` | Essential control outlines against dark surfaces; LOCKED |

Use roughly 80% dark ground/surfaces, 15% ivory/text/image, 5% semantic accents as a visual budget, not an engineering rule. Preserve the warm ivory structural material in Claude's brief (`#E6DDC8`); UI text is deliberately brighter for legibility. No additional coral token needed today: existing amber serves the warning role. No green deployment state.

Provenance and operating state are separate. SIMULATED uses amber text/outline, not warning-filled cards. SHORTFALL uses a stronger amber edge plus an explicit action. SURPLUS uses neutral bone numerals and the word “Surplus,” not a success/checkmark that implies ecological approval. UNKNOWN is a missing-evidence category, not a measured danger level.

Local sRGB contrast calculations (2026-10-10):

| Foreground | On background | On surface | On raised surface |
|---|---:|---:|---:|
| Primary text | 15.55:1 | 13.23:1 | 10.93:1 |
| Secondary text | 8.82:1 | 7.50:1 | 6.20:1 |
| Cyan | 9.63:1 | 8.19:1 | 6.76:1 |
| Amber | 8.38:1 | 7.13:1 | 5.89:1 |
| Unknown | 10.40:1 | 8.84:1 | 7.31:1 |
| Essential control outline | 4.60:1 | 3.91:1 | 3.23:1 |

These are solid-token pairs, not whole-app accessibility certification. Opacity, images, browser states and thin strokes need rendered checks. The quiet line is below 3:1 and must not identify an essential control by itself. Target at least 4.5:1 for normal text and 3:1 for essential component/graphic indicators. [W3C text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [W3C non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

## Typography

**Recommendation today: retain the existing practical pair.**

```css
--font-sans: "Avenir Next", "Segoe UI", Helvetica, Arial, sans-serif;
--font-mono: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
```

Carrier: sans for panel titles, controls, narrative and AI explanation. Editorial role: larger semibold sans with short lines; no extra display dependency. Utility: mono for IDs, times, units and compact numeric readouts. Authentic expression: human NODAL logo and architectural imagery. Avoid all-mono body copy and widely tracked paragraphs.

| Role | Size / leading | Weight / behavior |
|---|---|---|
| Product/page headline | 28–32 / 1.15 | 500–600; avoid imitating final logo |
| Assessment primary number | 36–44 / 1.05 | Mono or sans tabular; unit 16–18px |
| Priority observation | 26–32 / 1.1 | Tabular numerals; unit adjacent |
| Panel title | 15–16 / 1.35 | 600; normal/small tracking, plain words |
| Body/explanation | 16–18 / 1.5 | 400; 45–70 characters per line |
| Controls/meaningful labels | 14–16 / 1.4 | 500; never reduced to tiny techno labels |
| Secondary source metadata | 12–14 / 1.45 | 400; 14px preferred in projected demo |
| IDs/technical notation | 13–14 / 1.4 | Mono; exact spelling, optional wrap |

Apply `font-variant-numeric: tabular-nums` to values. Use Unicode minus for displayed negative values; preserve correct numeric data internally. Do not animate counting. Never truncate source time, units or outcome; allow descriptive titles to wrap.

Optional later pair: Aspekta + existing system mono. Pantry query also returned Spline Sans; it is a compact-UI alternative. Both passed archived content/asset gates; neither was rendered in the app or approved. Keep custom adoption off today's critical path; carry the archived license with any eventual asset. The 80 KB query ceiling is a smallest-WOFF2 lower bound, not a complete font-family payload. No new usage-ledger entry is authorized.

Content proof strings: “Site suitability: undetermined”; “Renewable generation (simulated)”; “NODAL / CONNECTOR · CONNECTOR_02”; “Virginia Key · 8723214 · observed 13:00 EDT”; “−40 kW · Shortfall”; “Qué sabemos del océano?” Example time/numerals are proof content, not live readings.

## Spacing and Layout

Use a 4px base: 4, 8, 12, 16, 20, 24, 32, 40. Retain existing 20px panel gaps and 4px radii. Main panels 20–24px padding; compact rows 12–16px. Left alignment governs content; numbers align by row. Keep one border and a solid surface; no stacked shadows.

Retain the current two-column shell rather than rewriting it. On wide screens its approximate 12-column logic is 7 columns network/evidence + 5 columns scenario/action/explanation. Preserve the observed collapse near 1100px; below 600px use the approved 16px outside margins, full-width panels and one/two-column node buttons.

Reading hierarchy:

```text
NODAL / Marine Observatory           concept + task sentence
NOAA context strip                   two values; station, time, state
Explore → Select → Observe → Simulate → Assess → Explain

NETWORK / CONCEPTUAL                  NETWORK SCENARIO / SIMULATED
six units + ATOL + junction           demand; generation; optional battery
selected ID + simulated allocation    power balance → operational action
node selectors                       site suitability / UNKNOWN (persistent)
regional observation detail           Explain this assessment
                                     evidence/rules/assumptions disclosure
```

The top context strip may precede selection physically; the guided task still follows network → selected computing node → observation scope → scenario → assessment → explanation. Source details can sit below the network. Do not move every metric above the architecture or create a separate navigation framework.

Opening task: “Select a computing node, then adjust simulated demand.” Default focus may remain RIDGE_01. Give selected ID/family/allocation immediately below the view. Scenario controls change network totals; selected node only displays its illustrative share. CONNECTOR selection is inspection-only, with no compute capacity claim. ATOL and the junction have supporting roles; they are not extra underwater compute nodes.

## Component Rules

| Component | Always visible | Secondary / state behavior |
|---|---|---|
| Node selector/card | Exact ID, family, readable name, selected text or outline | `aria-pressed`; matches SVG/GLB selection; no fake node-local sensor data |
| Data readout | Product, value, unit, OBSERVED, observation time, station context | Source link, retrieval time, quality flag; missing value `—` + reason, never zero |
| Observation strip | Water temperature and tide height if available, freshness/source state | Do not fill unavailable product slots with simulation; datum retained for tide |
| Chart | Product/unit/time axis/source; values from an actual retrieved series | No new chart library today. Single observation is a readout, not a fabricated trend |
| Status indicator | Written state + glyph/shape/line pattern | Color supports meaning; keep provenance distinct from warning state |
| Assessment card | Net power/unit/SIMULATED; next action; persistent UNKNOWN site statement | Missing categories, rule IDs and assumptions disclose; no risk score |
| Network view selector | Section/Plan labels, selected state | Preserve present behavior; keep reset view if GLB already supplies it |
| Range control | Visible label, network scope, current value/unit/SIMULATED | Native keyboard control; sensible existing step/range; numeric field only if already cheap |
| Source label | NOAA, station 8723214, actual observation time | Label regional shore-station scope; accessible descriptive link |
| Gemma panel | “AI explanation”; grounded scope; request button | Loading, unavailable, error, complete, outdated. AI text never gets OBSERVED |
| Loading | Product/region identity + “Fetching NOAA” or “Explaining assessment” | Stable panel height; preserve prior values with old/cached state if retained |
| Error | What failed, what remains available, one retry action | Prior observations stay labeled with their times; no invented fallback explanation |

## Evidence and Data Semantics

| Category | Treatment | Meaning |
|---|---|---|
| OBSERVED | Cyan text + filled dot + solid rule | External measurement with source/station/time |
| SIMULATED | Amber text + distinct glyph + outline | Hypothetical input or deterministic derived result |
| CONCEPTUAL | Bone text + diamond + dashed rule | Architecture/layout not surveyed or engineered |
| UNKNOWN | Lavender text + question mark + dotted/hatched marker | Evidence missing; absence is not a zero or numeric risk |

Reuse Badge.tsx's existing distinct glyphs instead of changing them for cosmetic consistency. Above are meaning rules, not a replacement icon set.

Freshness is an additional axis: FETCHED FROM NOAA / CACHED / OLD / UNAVAILABLE / FETCH ERROR, using the adapter's existing definitions and actual timestamps. Retrieval now does not mean observation now. Do not invent a new stale threshold in the design layer. Do not reinterpret ambiguous raw API errors as definitive station capability facts without verification.

AI EXPLANATION is an authorship label alongside the assessment's evidence tags. It is derived text, not a fifth measurement class. After inputs change, mark the previous explanation outdated and offer regeneration; do not automatically spend requests on each slider tick.

Separate results:

1. **Simulated operations:** generation minus demand; surplus/shortfall and the appropriate next action.
2. **Site qualification:** undetermined because local thermal/current/bathymetry/habitat/permitting evidence is missing. This statement survives every power state.

NOAA context does not establish local current velocity or thermal response and does not currently drive a calibrated ecological decision rule. Say this clearly. Battery runtime is optional, loss-free scenario arithmetic in kWh/kW; hide it in surplus rather than showing infinity.

## Interaction and Motion

- Selection: update outline, ID/family text and simulated allocation together. Keep keyboard/button selection available alongside 3D picking.
- Sliders: deterministic balance/action update immediately. Screen-reader announcement may be debounced/on change completion to avoid chatter; visible math remains responsive.
- Focus: 2px cyan outline with offset; never remove the browser focus affordance without an equivalent.
- Transitions: 120–180ms color/opacity for selection and panel state; 180–240ms optional disclosure. No layout shift of key action.
- Environmental movement: optional slow, low-contrast atmosphere only if already present and cheap. Static first view is sufficient. Avoid auto-orbit, flashing warnings, predictive water-flow arrows and moving biomass.
- Core glow/cable color: if retained, caption explicitly as simulated allocation/energy state. It is neither heat modeling nor actual physical telemetry.
- `prefers-reduced-motion`: remove atmosphere, camera interpolation and decorative transitions; preserve direct state updates. All tasks must work with no advanced motion.

## Brand Surround and Diagrams

One parent brand: NODAL. Family notation: **NODAL / RIDGE**, **NODAL / CANYON**, **NODAL / CONNECTOR**, **NODAL / ATOL**. Exact IDs use underscores (`RIDGE_01`) for technical continuity; readable family labels may accompany them. Do not use board-only “REEF NODE” as a fifth family.

Human logo slot: retain placeholder until delivery; preserve approved proportions/colors, add no sigil. Family descriptors use carrier type, not separate marks. Presentation composition: one dominant architecture/network image, one decision or claim, one adjacent boundary/source. Caption existing concept images instead of removing their scientific context.

Diagram lines represent frozen connection endpoints. Use solid power/data paths and distinguish umbilical by label; any curved path is illustrative routing. Leader lines identify anatomy, not flow performance. No geographic Miami map pin for hypothetical coordinates. Use spatial scale only with “hypothetical scene units” and no surveyed-site implication.

## Accessibility and Owner QA

Preferred targets 44×44 CSS px for demo/touch comfort. WCAG 2.2 AA minimum is 24×24 with specified exceptions, not a blanket 44px requirement. [W3C target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

Keep existing skip link, labels, focus, live announcements, disclosure semantics and reduced-motion support. Verify node selection without mouse; demand with arrow keys; source and Gemma actions in predictable tab order. At 200% zoom and narrow widths, wrap IDs/labels without hiding units or outcomes. Supply readable text equivalent to network and any chart; uncertainty must survive grayscale. Test selected, hover, error, disabled and focus treatments against actual surfaces.

Before 3:30 PM ET, owner checks: first-view readability on projector, demand 60 / generation 80 → +20 then demand 120 → −40, site unknown in both, correct old/cached/unavailable display, outdated AI state, 390px/768px/desktop layout and fallback selection. No new chart/motion/font system is required for this pass.
