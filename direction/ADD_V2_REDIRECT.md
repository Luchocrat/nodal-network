---
title: NODAL — ADD v2 Redirect and proposed Amendment (skin)
type: artsonist-design-direction-amendment
project_key: NODALHackathon-2026
run-id: no-tf-baseline
status: locked
amends: direction/ADD_REPORT.md (locked v1, Lucho 2026-10-10)
lock_version: 2
execution_phase: blueprint
mode: Redirect → Amend (Amend only on Lucho's explicit approval)
director: Don Claude (Claude Code) running Artsonist Design Director
approved_by: Lucho
approved_at: 2026-10-10
approval_source: "AskUserQuestion answers, 2026-10-10 ~16:15 EDT — Type: A · Aspekta + Nyght Serif; Liquid: Water-column continuity; Lock v2: Lock v2 + send to Cursor"
created_at: 2026-10-10
---

# NODAL / ADD v2 — Redirect + Amendment (LOCKED v2)

**LOCKED v2 — approved by Lucho on 2026-10-10.** Choices: type system A (Aspekta + Nyght Serif + IBM Plex Mono); "liquid" = water-column continuity (liquid glass stays refused); proposition moves to the header. All `PROPOSED` items below are now `LOCKED`. The Thesis and Signature Move rule stay unchanged from v1.

**Scope (GIVEN, Lucho, 2026-10-10):** "Assess the design … use the Artsonist Design Director … base your font choices on all the Font Pantry … functionalities are the same, just skin it differently." Earlier the same day Lucho asked for "more of a touch of the ADD, more liquid design, a better layout and plainer language from Gemma", and for the currents card to be removed.

**What does not change (LOCKED v1, carried forward):** the Creative Thesis, the Signature Move rule, every claim and evidence limit, the OBSERVED / SIMULATED / CONCEPTUAL / UNKNOWN semantics, the color tokens and their contrast values, the human-owned logo and silhouettes, and all application behavior.

**What this amends (PROPOSED until Lucho approves):** DD-02 typography, DD-03 composition, DD-04 material (additive tokens only), a new production rule for the Signature Move (the tether), and Forbidden Gravity (adds an explicit refusal of glass).

---

## 1. Redirect diagnosis

The diagnosis follows the protocol order. Evidence comes from the running build `c1uHR9rT5e6N7brumfesk` (15:25 EDT) at 1440×900, inspected 15:46 EDT.

| # | Layer | Verdict | Evidence | Correction |
|---|---|---|---|---|
| 1 | Messaging | HOLDS | Audience, Miami and the "accountability precedes deployment" line are now in the header (`Dashboard.tsx:78`) | — |
| 2 | Creative Thesis | DRIFTS | The thesis lives in the copy but not in the form. Nothing visible holds "speculative organic architecture" in tension with "precise evidence" | Fixed by rows 3–7 |
| **3** | **Productive tension** | **CONTRADICTS (earliest failing layer)** | The precision force governs every surface: identical 1px boxes, the same gradient panel, the same 4px radius, and mono labels everywhere. The organic force is confined to one framed 777×314 SVG thumbnail with its own border. The two forces were averaged into a "safe dashboard" | Give the organic force structural territory: the water-column ground, a borderless network hero, and organic line work. Keep precision in controls, values and conclusions |
| 5 | Signature Move | DRIFTS | Boundaries exist (R-11 MET), but they render as uniform tag chips scattered across boxes. Nothing visually binds a boundary to its claim, so the move reads as decoration | **Tether** production rule (§4) |
| 6 | Typography | DRIFTS | System Avenir Next / Segoe UI plus system mono. It renders differently on a Windows projector. Mono is used for prose-like labels and the slogan. No face voices the speculative architecture, so the page reads as a generic console | Pantry trio (§3) |
| 7 | Composition | DRIFTS | Template grammar: cards inside cards (5 NOAA cards inside a panel; action and suitability boxes inside a panel). Each NOAA card repeats the same four metadata lines. Everything has equal weight. The page is about 2,450px long, with the result below the fold at demo resolutions | Strata, hero, sticky decision rail, evidence ledger (§5) |
| 8 | Forbidden Gravity | DRIFTS toward the one the lock predicted | ADD v1 named option A's weakness: "conventional scientific portal if the network and evidence relationships lack authorship." That is the current state. Not neon, not glass | Rows 3–7. More decoration would not fix it |
| — | Replacement proof | **FAILS** on the current skin | Swap NODAL for any coastal-data dashboard: navy cards, cyan numerals and a pill stepper fit unchanged | Must pass after v2 (§7) |

---

## 2. What "liquid" means in this system (decision for Lucho)

`PROPOSED` **Liquid = continuity, not effects.** In this system, the water is the page:

1. **Water-column ground.** One continuous vertical field runs from surface water (#0B3340) at the top, through the existing abyss (#061B24), to a seabed tone (#04121A) at the bottom. Scrolling reads as a descent: header and NOAA surface observations at the top, the network and scenario in the water column, the evidence ledger near the seabed.
2. **Strata, not boxes.** Sections are separated by full-bleed hairline **isobaths** (decorative contour lines), not bordered cards. Only two things are contained plates: the decision rail and the selected-node plate.
3. **The network melts into the page.** The SVG loses its border and radius, and its water gradient matches the page ground. The architecture becomes the water the interface sits in, not a framed picture.
4. **The waterline is structural.** NOAA surface observations ride a full-bleed cyan meniscus line under the header.
5. **The decision rail floats.** At ≥1180px, the scenario → result → action → suitability plate is `position: sticky`. The page flows past it while it stays put; this is also the R-12 co-visibility fix.

`PROPOSED` **Refused reading: "liquid glass"** (frosted or translucent panels, `backdrop-filter` blur, refraction, glow). It is already on the v1 Forbidden Gravity list ("glass panels, neon bloom"). It would lower text contrast over the network, make evidence feel like a lifestyle product, and date the work with the 2025 interface trend. Choosing it requires an explicit Amend of Forbidden Gravity by Lucho. Not recommended.

Organic curves stay out of controls, values, charts and conclusions (v1 rule "remove tension from button affordances … assessment conclusions" stands). The one permitted UI-level organic gesture is the **shell corner** on the two plates (`border-radius: 3px 3px 3px 22px`). It echoes the bone shells and the ATOL canopy, and appears nowhere else.

---

## 3. Typography — from the whole Font Pantry

Full record: [font-pairing-decision.md](font-pairing-decision.md). Summary:

**Method (evidence):**
1. Pantry health check `verify-font-pantry.mjs`: PASSED. The repo's only change is a pre-existing, unattributed modification to `manifests/font-usage-ledger.json`, left untouched.
2. Hard gates on all 64 faces: 22 blocked by license, asset, registration, purchase or taste gates (13 Envato, 4 PP, 2 GPL, Getai, Mattone, Le Patin Helvète). The remaining 42 local-ready faces were run against real NODAL copy (431-character carrier text with ° · − “ ” ¿ é ñ ó, and the closing line). Faces lacking the true minus **−**, which every dashboard number needs, were removed: Rag, Frick, Sunday Masthead, Alfphabet, BackOut, Erbarre, Format 1452. Single-weight carriers were removed (Tanklager, LT Institute, Gambarino).
3. Deterministic `query-font-pantry.mjs` with `--carrier-min-weights 3 --max-initial-web-kb 120`: the carrier converges on **Aspekta** for every expressive voice. Expressive faces surviving by voice: sharp → Nyght Serif / Boska; editorial → Sprat / Redaction (with Spline Sans); technical and space-age → Excon; soft → Coconat; rounded → Apfel Grotezk.
4. Content proof: three systems rendered on real dashboard copy in the proposed skin. The specimen is at `scratchpad/fonts/specimen/index.html`, served locally during this session.

**Roles (`PROPOSED`, amends DD-02):**

| Role | Face | Job | Never |
|---|---|---|---|
| Carrier | **Aspekta** (VF, OFL-1.1) | Body, labels, controls, task line, action text, suitability statement, **Gemma explanation text** | Hero proposition |
| Expressive | **Nyght Serif** Regular/Medium (OFL-1.1) | Proposition line, stratum and plate titles, family name in "NODAL / RIDGE" (exact DD-08 notation), footer closing line | Values, units, labels, controls, conclusions, body, AI text |
| Utility | **IBM Plex Mono** Regular/SemiBold (OFL-1.1) | Every number with its unit, timestamps, IDs, station number, rule IDs, assessment ID, badges, freshness labels | Sentences, the slogan |

**Why Nyght Serif:**
- Its blade serifs and spurs echo the thorn tendrils on the RIDGE, CANYON and ATOL bone shells. The speculative architecture gets a typographic voice that stays *sharp*: elegance with danger, a compelling proposition that still demands scrutiny.
- A serif against a grotesk is a productive difference in construction.
- It sits against the human logo's thin geometric caps without imitating them.

**Content-proof finding:** Nyght Serif **italic at 17px body on dark is too sharp and cramped for plain-language reading**. That is why Gemma's text is assigned to Aspekta, and why the serif stops at heading sizes (≥20px).

**Rejected:**
- **Coconat** (the literal "liquid" option). Its soft, warm curves read as reassurance, which works against accountability.
- **Sprat Condensed.** Strong verticality, but it reads as newspaper; the replacement proof fails.
- **Boska.** Fashion.
- **Excon.** Its space-age voice tips into sci-fi spectacle (Forbidden Gravity).
- **Apfel Grotezk.** Friendly and rounded, too casual.
- **Redaction.** A strong evidence-erosion concept, but degraded letters on "undetermined" would harm comprehension of the most important statement.
- **Spline Sans / Instrument Sans.** Valid carriers. Aspekta's 20-weight variable family gives the finest hierarchy for the rail.

**Production state:** all three are `local-ready` + `ready` in the Pantry. Payload is about 30 KB (Aspekta VF) + 72 KB (Nyght Serif 2 cuts) + 100 KB (Plex Mono 2 cuts) ≈ 200 KB before subsetting; subset Plex Mono to Latin + symbols. Nyght Serif's foundry (Tunera, Maksym Kobuzan) requests design credit, so add it to the footer and README.

**Ledger:** nothing gets recorded until Lucho approves the decision manifest, the WOFF2 and license files are in `web/public/fonts`, **and** the pre-existing unattributed ledger change is resolved by Lucho. Recording on top of an unexplained diff would mix provenance.

---

## 4. Signature Move — new production rule: the Tether

The Signature Move stays `LOCKED` as in v1: "Pair every compelling proposition with its evidence boundary in the same reading area."

`PROPOSED` **Production rule v2 — Tether.** A boundary is physically tied to its claim. The claim, a 1px hairline 14–20px long in the boundary's semantic color, and the badge sit on one baseline: `claim ── ◐ SIMULATED`.

Applied in at least six states:

| Claim | Boundary |
|---|---|
| Waterline reading | ● OBSERVED |
| Network title | ◇ CONCEPTUAL |
| Net result | ◐ SIMULATED |
| Suitability | ? UNKNOWN |
| Selected family | ◇ CONCEPTUAL |
| Gemma heading | AI EXPLANATION |

- **Failure condition:** a badge floating alone (a tag chip), or a tether linking a claim to the wrong class.
- **Deletion proof:** remove the tethers and the badges fall back into scattered chips, the current drift. That shows the tether carries meaning.

---

## 5. Composition grammar (amends DD-03; behavior unchanged)

Desktop ≥1180px, 12 columns, 32px gutter:

```text
HEADER         logo + proposition (Nyght 32/1.1, ≤22ch) + audience        | task line (Aspekta 600 22) + not-claims + slogan
WATERLINE      station meta · two readings tethered to OBSERVED · freshness   (full-bleed cyan meniscus hairline)
               guided path 01–06 as inline numbered text links (no pills), ≥44px tall targets
WATER COLUMN   [8] Network stratum: title ── CONCEPTUAL · NET pill · suitability pill · SECTION/PLAN   | [4] DECISION RAIL (sticky, shell-corner plate)
               [8] borderless SVG hero, full 8-col width                                                |     Network scenario: sliders, battery, Reset
               [8] Selected-node plate (shell corner) + node selector 3×2 quiet rows                    |     ─ isobath ─
               [8] AI explanation stratum: Explain button, output in Aspekta 17/1.55                     |     result ── SIMULATED · action
                                                                                                         |     Suitability ── UNKNOWN (dotted block)
                                                                                                         |     links ↓ evidence ledger
SEABED         EVIDENCE LEDGER (serif title): [7] NOAA observations as a table (Product · Reading · Observed UTC/EDT · State · Source)
               + Refresh, banners, scope sentence | [5] Missing local evidence · Rules · Assumptions (<details>, unchanged)
FOOTER         closing line (Nyght 28) · legend · sources · font credits
```

- **DOM order** = header → waterline → network → selection → rail → AI → ledger → footer, placed with `grid-template-areas`. Keyboard and screen-reader order stays logical.
- **<1180px:** single column in DOM order. The rail is not sticky. Plates go full width, with 16px gutters at ≤600px.
- **NOAA ledger table** keeps every field and state the cards had: value+unit, observed UTC+EDT, live age, CACHED / OLD / "— unavailable", quality q=p, caveat, source link, diagnostics `<details>`. At ≤600px each row becomes a two-line block.

---

## 6. Channel Expression Map deltas

| ID | v1 | v2 change (PROPOSED) |
|---|---|---|
| CH-01 Dashboard first view | Short task sentence beside NODAL | Proposition in serif + task line. Waterline readings tethered. Network hero dominant |
| CH-02 Telemetry | Two priority values + cards | Two tethered values on the waterline. All products in the ledger table |
| CH-03 Scenario/assessment | Rail order | Same order, sticky plate, tethered result and suitability |
| CH-04 Gemma | AI explanation panel | AI stratum beside the sticky deterministic rail (explanation physically adjacent to what it explains). Plain-language prompt already shipped |
| CH-05 Architecture | Framed SVG | Borderless hero in the water column. Glyph geometry untouched |
| CH-06/07 | — | Unchanged. Logo slot human-owned |

---

## 7. Direction proofs (v2)

| Proof | Evidence | Verdict |
|---|---|---|
| Message | No new claim. Proposition and audience lines are GIVEN (HANDOFF §1, §7) | HOLDS |
| Replacement | Water-column descent, tethered evidence, a serif with thorn-like spurs from the bone architecture, and the network as ground are NODAL-specific | HOLDS as design rationale. Recognition is UNVERIFIABLE until built |
| Deletion | Without tethers, boundaries revert to scattered chips | HOLDS |
| System | Tether applies across 6 states; strata grammar across header, stage and ledger | HOLDS on paper. Build evidence required |
| Channel translation | Accountability line moves from footer to hero (UI) and stays the spoken close (DEMO_STORY) | HOLDS |
| Refusal | Liquid glass and Coconat's soft reassurance rejected with reasons (§2, §3) | HOLDS |
| Content | Specimen with real copy, °, −, accents, Spanish, IDs; Nyght italic body rejected from evidence | PARTIAL: specimen only, not the full app |
| Production | Contrast tokens unchanged. Payload ~200 KB. Sticky rail height must fit 720px | UNVERIFIABLE until built |
| Reference distance | Restated from project logic (depth, provenance, architecture) with no external references | HOLDS |

---

## 8. Decisions — resolved by Lucho 2026-10-10

1. **Type system:** A — **LOCKED** (Lucho: "A · Aspekta + Nyght Serif").
2. **"Liquid":** water-column continuity — **LOCKED**. Liquid glass remains refused under Forbidden Gravity.
3. **Proposition as hero:** **LOCKED** — moves to the header; the footer keeps the spoken-close echo.
4. **Build window:** the hackathon build window closed at 3:30 PM ET. Any v2 work should go on a separate branch unless organizers allow post-window changes.

## 9. Authorship and review

The v1 direction was authored by Glyph; this v2 amendment is authored by Don Claude. Under AssayHall Rule 9, Don Claude **cannot** certify the v2 concept criteria (tether, liquid grammar, typography). Cross-assay by Glyph is required for any Hallmark on the reskinned build. Cursor owns implementation; Lucho owns approval, the logo and silhouettes.

## Amendments (to be appended to ADD_REPORT.md on approval)

| Date | Event | Previous state | Recorded state | Approval source | Scope |
|---|---|---|---|---|---|
| 2026-10-10 | v2 skin amendment | locked v1 | locked v2 | Lucho, explicit answers (Type A; Water-column; Lock v2 + send) | DD-02 type, DD-03 composition, DD-04 additive tokens, Signature Move tether rule, Forbidden Gravity glass refusal |

---

## v2.1 addition — concept film (2026-10-10)

- `GIVEN` Lucho: "add this video somewhere in the site as the potential architecture of the marine NODAL network." The source is `output/NODAL_FINAL_v3.mp4`.
- `OBSERVED` The film is 46.8 s, 1080p, edited in Remotion from **AI-generated Seedance clips** with generated ambience audio (`NODAL_REMOTION_PROJECT.zip` → `nodal-film/README.md`). Its content includes coral colonizing the shells, ATOL at sea, a network sited on a reef, and a lit network across Florida/Atlantic from orbit.
- `LOCKED v2.1` (placement delegated by Lucho's "somewhere"; Lucho may veto) — new channel row **CH-08 Concept film**:
  - Placement: the stage's left column after the AI explanation, beside the sticky decision rail, so the vision sits next to "suitability undetermined". Not in the hero, not a background video, not a SECTION/PLAN view.
  - Tethered ◇ CONCEPTUAL title and a provenance line.
  - A verbatim boundary caption: coral is illustration, not an outcome; reef siting is unsurveyed habitat; orbital scale is imagined; nothing changes the assessment.
  - A text-description chapter list (media alternative; no speech, so no captions needed).
  - Click-to-play only (`preload="none"`), poster at 27.5 s, 1080p and 720p sources.
- Refusal: autoplay or muted-loop hero film. That is the v1 Forbidden Gravity "cinematic reef imagery inside a generic glowing AI dashboard."
- Executor brief: [CURSOR_FILM_ADDENDUM.md](CURSOR_FILM_ADDENDUM.md).
- Open for Lucho: the Seedance platform and terms for the README; his authorship credit wording; organizer clearance for an AI-generated film produced after the 3:30 PM build window.

---

## Build checkpoints

**2026-10-10 16:31 EDT: Slices 1–2 (commit `3fa5e22`, branch `add-v2-reskin`, BUILD_ID `p7Cc90aQR_66m41YXaO0_`). Director inspection: HOLDS, with 2 DRIFTS corrected in Slice 3.**

| Decision | Verdict | Evidence |
|---|---|---|
| DD-02 v2 type roles | HOLDS | Computed fonts: h2 and family name in Nyght Serif 22px; body, task and path in Aspekta; values, badges and waterline in IBM Plex Mono. 164 KB of fonts loaded; Nyght Medium not requested yet (unused). License files byte-match the Pantry sources |
| DD-04 v2 tokens / water column | HOLDS | Tokens as specified; body gradient from surface to seabed; no glass, blur or glow |
| DD-03 strata | HOLDS (partial by design) | Network, NOAA and Gemma sections unboxed with isobath hairlines; rail and assessment plates follow in Slice 3 |
| Waterline | HOLDS | Full-bleed meniscus; readings in utility 28px; freshness and CACHED/OLD flags kept; the link now reads its content to screen readers (fixes audit B-05) |
| Borderless network | HOLDS | Border removed; top mask fade; node IDs 20 viewBox units (≈15.5px at 1440, was 11.7px); glyph paths untouched |
| Guided path | DRIFTS (mobile) | At 390px the "·" separators strand at line starts |
| Responsive | DRIFTS (mobile) | No overflow at 1440/1280/768/720/390, but the ≤600px side gutter is ≈52px (shell 16 + band 36) against the 16px rule |
| Behavior invariants | HOLDS | Assessment IDs `f24c5e8e` (+20) and `54b0d579` (−40) unchanged; src/lib, api, tests and network.json untouched since the brief; vitest 19/19 and tsc clean (isolated copy); keyboard focus ring visible on every stop |
| Film assets (Step 1) | HOLDS | 1080p 27.6 MB, 720p 12.7 MB, poster at 27.5 s; nothing fetched by the page yet |

Next: Slice 3 + film Steps 2–5, then Director checkpoint.
