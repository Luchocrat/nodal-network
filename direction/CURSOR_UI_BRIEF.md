---
project: NODALHackathon-2026
run-id: no-tf-baseline
status: approved
direction_lock_version: 1
approved_by: Lucho
approved_at: 2026-10-10
date: 2026-10-10
owner: Cursor — web only
---

# NODAL / CURSOR UI BRIEF

**Incremental improvement of your existing dashboard.** Direction: A-led Marine Observatory with selective console behavior, locked v1 by Lucho on 2026-10-10. The UI expression choices below are approved; GIVEN evidence boundaries and ownership remain authoritative. Read [ADD_REPORT.md](ADD_REPORT.md) and [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md). Keep current architecture, source adapter, math, routes, components, fallback network and font dependencies. Glyph has made no production edits.

## Preserve and Prioritize

Observed implementation already has the correct navy/ivory foundation, organic SVG section/plan view, six node selectors, NOAA provenance, scenario → assessment → Gemma rail, keyboard support and honest failure states. Improve comprehension through local component/CSS edits. No new dashboard, chart library, navigation framework or 3D dependency.

| Priority / file under NODAL_STARTER/web/src | Minimal change | Acceptance evidence |
|---|---|---|
| P0 · components/NoaaPanel.tsx | Rename FETCHED LIVE to FETCHED FROM NOAA. Reflect old/cached/error state in top strip too. Refresh failure with retained data says previous readings remain, with original time | Fresh fetch cannot make old observation appear current; displayed error agrees with visible cards |
| P0 · components/AssessmentPanel.tsx | Keep power balance + next action + site suitability UNKNOWN visible. Compress data gaps into “5 local evidence categories unknown”; disclose details/rules/assumptions | +20 and −40 states both show suitability undetermined; action understood without expansion |
| P0 · components/Dashboard.tsx | Add selected ID/family/allocation beside network. Label demand network-wide, allocation an illustrative share; keep shared NOAA context | RIDGE_01 allocation 21 → 42 kW when demand 60 → 120 at a 35% share; no new node sensor claim |
| P1 · components/Dashboard.tsx | Plain prompt: “Select a computing node, then adjust simulated demand.” Align guided path with network → selection → observation → scenario → action → explanation | A newcomer can identify first action in first viewport |
| P1 · components/GemmaPanel.tsx + AssessmentPanel.tsx | Bring Explain action directly after compact result. Label output AI EXPLANATION, derived from assessment. Preserve outdated/unavailable/error handling | AI output never reads as observation; new scenario invalidates old explanation |
| P1 · app/globals.css | Panel titles 15–16px; meaningful labels 14px+; reduce uppercase tracking; tabular numerals; ≤600px margins 16px and 1/2-column selectors | Long IDs, labels, units and outcome fit at 390px and 200% zoom |
| P2 · NetworkView.tsx / telemetry | Move schema/axis/export detail into disclosure while retaining conceptual layout notice; preserve numeric cards rather than building charts | First view prioritizes network/task/action; source detail remains available |

P0 fixes express existing truth requirements; P1/P2 expression changes are approved within direction lock v1. If time compresses, complete P0 and rehearse. Stop feature additions at 3:30 PM ET.

## Hierarchy and Tokens

Retain two-column layout: network/evidence left, controls/result/explanation right; existing responsive collapse near 1100px. Order within rail: demand/generation → balance → action → persistent UNKNOWN suitability → Explain button → details. Source strip keeps two useful real observations when available. CONNECTOR has no assumed compute; ATOL/junction are supporting infrastructure.

```css
/* Handoff values; map into your existing tokens, do not add a second theme. */
--bg: #061B24;
--surface: #0B2A36;
--surface-raised: #103945;
--text: #F1F1E9;
--muted: #B4B9AE;
--cyan: #4FD1D9;
--amber: #E7A477;
--unknown: #C9C4D8;
--line: #294854;          /* decorative only */
--control-line: #688792;  /* essential control boundary */
```

Keep 20px gaps, 4px radius and current sans/mono stacks. SIMULATED badges retain restrained amber outlines; SHORTFALL receives stronger warning treatment and text. SURPLUS is neutral, never deployment-green. Existing Badge glyphs provide redundant meaning. Optional selection/state transition 120–180ms; no new animation required.

## Trust and Accessibility

Always separate OBSERVED/SIMULATED/CONCEPTUAL/UNKNOWN from freshness and AI authorship. Station 8723214 is regional shore-station context, shared across selected nodes. State near the result: “Power calculation uses simulated inputs; NOAA provides separate regional context.” NOAA does not supply a validated site/thermal model here. Tide height is not current speed. Missing/error values use “— / unavailable,” never zero. If raw API error is ambiguous, public copy says unavailable for this request; retain diagnostics in details rather than asserting unsupported capability facts.

Reuse existing keyboard/picking alternatives, focus, skip link and real labels. Give slider `aria-valuetext` such as “120 kilowatts, simulated network demand”; debounce announcements if necessary. Preferred 44px targets, readable wrapping and no color-only status. Honor reduced motion. Solid token contrast calculations and W3C references are in DESIGN_SYSTEM; rendered controls still need checks.

## Verified Evidence and Return Checkpoint

2026-10-10 browser check of existing app at localhost:3001: demand 60 / generation 80 displayed +20 kW; demand 120 displayed −40 kW and reduce-load action; 150 kWh displayed 3.75 h ignoring losses. Site remained undetermined. NOAA source/time values rendered. Gemma reachability text appeared; no explanation response was tested. GLB, mobile and implementation of the approved layout remain unverified.

Return one desktop and one 390px screenshot, the same scenario replay, keyboard selection/control evidence, data-refresh failure state and AI-outdated/unavailable state. List deviations and any uncovered taste decision for Lucho. Final logo belongs to Lucho; preserve placeholder identification until delivery. Human controls integration/submission. This is a direction handoff, not deployment certification.
