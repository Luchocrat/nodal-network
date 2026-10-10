---
project: NODALHackathon-2026
type: assay-hall-site-audit
run-id: no-tf-baseline
cycle: 1
tier: T2
verdict: HALLMARK
brief-fidelity: 87.8
snapshot: o2JM1gfWu_ve-_aF4PQZb
date: 2026-10-10
assayer: Don Claude (Claude Code) — independent of web/** (Cursor) and direction/** (Glyph)
---

# NODAL / SITE AUDIT — AssayHall cycle 1 (T2)

## Verdict

**HALLMARK — 87.8% brief fidelity, all 11 CRITICAL criteria MET, gate exit 0.**
The site works end to end and represents its evidence honestly. **No site P0 blockers.** The Hallmark covers **only** build `o2JM1gfWu_ve-_aF4PQZb` (built 14:31:00 EDT). Any later change to `web/**` needs a T1 re-assay of the touched criteria. Submission still has two human P0 items outside the site: **LICENSE** and **public repository**.

**The three most consequential findings**

1. **The Gemma explanation quotes a different NOAA reading from the one on screen (R-20, MISSED).** In both live runs Gemma said "water level 0.434 m" while the strip and panel showed **0.441 m observed 18:18 UTC**. The server fetched newer NOAA data (18:24 UTC) for the request, and the panel never refreshed. The explanation gives no observation time. Nothing is invented, but a judge comparing the two sees AI and evidence disagreeing. This is the one live accountability defect. **P1-01**, a small fix.
2. **On a projector, the demo's key moment does not fit on one screen (R-12, PARTIAL).** At 1280×720 the demand slider is at y≈530, but the result starts at y≈934 and the "site suitability undetermined" block at y≈1342. In the first viewport, only the `NET +20 kW · SIMULATED` pill changes, with no boundary next to it. The memorable event ("power changed; ecology still unknown") needs scrolling. **P1-02**: add one chip to the network header, plus 80% browser zoom (measured to fit).
3. **The page never says who it is for or that this is Miami (R-02, PARTIAL).** The first viewport has the task, the disclaimers and the motto, but not the users, "Miami" (the strip says "Virginia Key · 8723214"), or "environmental accountability precedes deployment". Community impact is 30% of the rubric and currently lives only in the spoken script. **P1-03**: one line of copy.

Preserve the current layout. Every fix below is a local copy, CSS or component change.

---

## AssayHall intake

```
AssayHall — Intake Confirmed
Brief source: NODAL_STARTER/HANDOFF.md (canonical) + direction/ADD_REPORT.md (lock v1) + DESIGN_SYSTEM.md + CURSOR_UI_BRIEF.md + DEMO_STORY.md + shared/network.json + user audit brief
Build source: http://localhost:3001/ (npm start -p 3001) — NODAL_STARTER/web
TF scorecard baseline: absent (run-id no-tf-baseline; none invented)
Cycle: 1 of max 3
Tier: T2
Authorship: none — web/** is Cursor's, direction/** is Glyph's (ADD). The Claude runtime owns visualization/** (GLB); the GLB is not in the site, and its criterion is declared UNVERIFIABLE under Rule 9
Auto-UNVERIFIABLE under Rule 9: R-30 (GLB 3D view)
Runtime: Claude
```

The skill and its references (rubric-construction, review-contract, premortem-protocol, the shared contract README and fixtures) were read and followed. Artifacts: this file and [SITE_AUDIT.assay.json](SITE_AUDIT.assay.json).

## Snapshot, method and verification limits

| Item | Record |
|---|---|
| URL | `http://localhost:3001/` — production server (`npm start -p 3001`), reused; not restarted or interrupted |
| Audit window | 2026-10-10 14:18:52 → 14:45:46 EDT |
| Revision | Not a git repository, so no commit hash. Identified by Next `BUILD_ID` and source fingerprint |
| Snapshot 1 | `9GZCV0rGmmFEHczUKh6pd`, built 14:17:54, server PID 62110. Most functional and Gemma tests ran here |
| Snapshot 2 (certified) | `o2JM1gfWu_ve-_aF4PQZb`, built 14:31:00, server PID 63335, src/tests/scripts/public fingerprint `b303eee5…`. Unchanged at 14:45:46 |
| Concurrent change | Cursor rebuilt mid-audit (14:30:43–14:31:06). The diff is limited to `Wordmark.tsx` (logo `<img>` replaces the text placeholder), one footer sentence (`Dashboard.tsx:159`), logo CSS (`globals.css:55,204`) and `public/brand/*.svg`. No logic, data or Gemma code changed. Replayed on snapshot 2: page load, +20/−40 with identical assessment IDs (`f24c5e8e`, `54b0d579`), list-Enter selection, Plan view, NOAA OLD state, all responsive checks, tests, typecheck and build |
| Tests / types / build | Ran on an **isolated copy** in the session scratchpad, so nothing was written to `web/` or `.next/`. `predev`/`prebuild` hooks run `sync-network.mjs`, so `build` was never run in place. Results: vitest 19/19, `tsc --noEmit` exit 0, `next build` passed on both snapshots. The first isolated build failed only because Turbopack rejects a symlinked `node_modules`; an APFS clone passed |
| Gemma | **Two real requests** (14:29 and 14:30 EDT, snapshot 1), each about 8.2 s. The key was never read or printed; only variable names and key length were checked. Not re-called on snapshot 2 because the Gemma code is byte-identical |
| Stubbed states | NOAA cached/old/unavailable/refresh-error and Gemma unavailable/quota/route-error were rendered by **stubbing `fetch` in the page only**. This proves the UI branches, not the server paths. Server paths are covered by `noaa.test.ts` (5 tests) and code-read |
| NOAA cross-check | The `datagetter` endpoint was queried directly for water temperature, water level and currents. Records were identical to the app (30.4 °C, 0.441 m, "Wrong Station ID") |
| Not testable | `prefers-reduced-motion` (code-read only; media emulation unavailable). Real screen reader (live regions code-read only). Physical projector. Real 200% browser zoom (proxied by a 720×450 CSS viewport) |
| Obsidian archive | **Not written.** The user restricted artifacts to `direction/`. Stage 6 archive is a pending closure step for Don Claude/Lucho |

---

## Gate output (verbatim)

`python3 ~/.agents/skills/assay-hall/scripts/gate.py direction/SITE_AUDIT.assay.json`

```
Brief Fidelity: 87.8%  (65.0 / 74)

  [PASS] 1. every CRITICAL is MET
  [PASS] 2. fidelity >= 85%
  [PASS] 3. no dimension below baseline
  [PASS] 4. no unresolved CRITICAL bias/cultural finding
  [PASS] 5. assayer did not author the build

VERDICT: HALLMARK

This is contract arithmetic over declared verdicts, populations and authorship. It certifies that the declarations are complete and consistent, not that they are true.
GATE_EXIT=0
```

Condition 3 passes vacuously: no Thought Foundry baseline exists, and none was invented.

---

## Requirement-by-requirement results

Populations were registered in the JSON before verification. Full evidence and falsifiers are in [SITE_AUDIT.assay.json](SITE_AUDIT.assay.json).

| ID | Weight | Requirement (short) | Result | Evidence |
|---|---|---|---|---|
| R-01 | CRITICAL · PROXY | Seven-step demo path runs end to end | **MET** 7/7 | Logo + task → NOAA with state → select → 60→120 kW → +20→−40 kW, 5 gaps → real Gemma ×2 → action switches |
| R-02 | HIGH · PROXY | First viewport names the users, Miami and the problem | **PARTIAL** | Task and disclaimers present. No audience, no "Miami", accountability line only in footer (`Dashboard.tsx:76-80,153`) |
| R-03 | CRITICAL | Six nodes match network.json | **MET** 6/6 | Shares 35/0/25/0/30/10% → 21/0/15/0/18/6 kW at 60 kW. Web copy is byte-identical to `shared/network.json` |
| R-04 | HIGH | ATOL, junction, 7 connections | **MET** 9/9 | Plan view: 7 lines. Section view: umbilical plus 6 power/data lines. "supporting infrastructure, not extra compute nodes" |
| R-05 | HIGH | Selection by list click/Enter and SVG click/Enter/Space | **MET** 5/5 | List, SVG `aria-pressed` and `.selected` panel stayed in sync every time |
| R-06 | CRITICAL | Positive, zero, negative and extreme balance | **MET** 4/4 | +20, 0, −40, −200 kW with Unicode minus. NET pill mirrors the result |
| R-07 | HIGH | Battery runtime only during a shortfall | **MET** 4/4 | 3.75 h; battery off → UNKNOWN; 0 kWh → 0 h; hidden in surplus |
| R-08 | HIGH | Reset | **MET** | Restores 60/80/150/on and keeps the node selected |
| R-09 | CRITICAL | Action changes with state; repeatable | **MET** | COMMISSION-LOCAL-STUDIES ↔ MITIGATE-SHORTFALL. Same IDs across reloads and both builds |
| R-10 | CRITICAL | Suitability undetermined in every energy state | **MET** 3/3 | `.suit` block is identical in surplus, zero and shortfall. No green anywhere |
| R-11 | CRITICAL · concept | Signature Move pairs | **MET** 6/6 | CONCEPTUAL, station/time, SIMULATED ×2, UNKNOWN and AI EXPLANATION labels all sit next to their claims |
| R-12 | HIGH · PROXY | Demand, result, action and suitability co-visible at demo resolution | **PARTIAL** 2/2 checked | 1280×720: slider 529, result 934, action 1077, suitability 1342. At 1440×900 the result starts at 901 |
| R-13 | CRITICAL | 4 evidence classes and states not shown by colour alone | **MET** 7/7 | Glyph + text + solid/dashed/dotted borders. States are written in words |
| R-14 | CRITICAL | NOAA provenance per product | **MET** 5/5 | Value+unit, UTC+EDT time, source link, state. Parsed values equal the raw records; two cross-checked directly with NOAA |
| R-15 | CRITICAL | Freshness and missing-data states | **MET** 6/6 | fetched and not-offered tested live. Cached, old, unavailable and fetch-error tested with page stubs. Strip and panel always agreed |
| R-16 | HIGH | Relative age stays true while the page is open | **PARTIAL** | Age is computed once on the server (`noaa.server.ts:201`). It showed "10 min old" when the reading was really 13 min old. The page never auto-refreshes |
| R-17 | CRITICAL | Regional data never presented as node sensors | **MET** 5/5 | Strip, panel, selected node, assessment and Gemma payload all say "regional" or "not a NODAL sensor" |
| R-18 | CRITICAL | Forbidden language, scores and green states absent | **MET** 8/8 | grep of the source plus the rendered text: none found. "live" appears only in failure copy |
| R-19 | HIGH | Gemma matches the current scenario | **MET** 2/2 | Numbers, allocation, action and uncertainty match the JSON. Cites real rule IDs. No safety claims |
| R-20 | HIGH | Gemma's observations match the screen or are time-stamped | **MISSED** 2/2 checked | 0.434 m (18:24Z payload) vs 0.441 m on screen (18:18Z). No time given, MLLW datum dropped |
| R-21 | HIGH | AI loading, failure, unavailable, route-error and outdated states | **MET** 5/5 | Each state is truthful. Fallback text is labelled "not AI". Copy bug B-03 |
| R-22 | HIGH | Model identity from evidence | **MET** | `GEMMA_MODEL=gemma-4-26b-a4b-it`; status route `modelAvailable:true`; two successful `models/gemma-4-26b-a4b-it:generateContent` calls. `modelVersion` not captured (B-06) |
| R-23 | HIGH | Keyboard path and visible focus | **MET** 5/5 | 44 Tab stops in reading order, all with a 2px cyan focus ring. Arrow and End keys move the slider |
| R-24 | HIGH | No overflow at desktop, projector, tablet, 390 and 200% | **MET** 5/5 | `scrollWidth` equals viewport width at every size. No clipped values or outcomes. 16px gutters and 2-column node list at 390 |
| R-25 | MEDIUM | Labels ≥14px; text ≥4.5:1 | **PARTIAL** | SVG node IDs render at 11.7px (1440), 10.2px (1280) and 4.9px (390). Not-triggered rule text is 3.63:1 |
| R-26 | HIGH | Live regions and control names | **MET** | Status/alert/live regions present and `aria-valuetext` set. Bugs B-05 and B-07 |
| R-27 | MEDIUM | Target sizes | **MET** | Primary controls are 44px. Smaller items fall under WCAG exceptions (inline links, labelled checkbox, list equivalent for SVG) |
| R-28 | MEDIUM | Reduced motion | **MET** (code-read) | `globals.css:91,161` |
| R-29 | HIGH | SVG fallback with selection | **MET** | Section and Plan views; click and keyboard. No GLB dependency |
| R-30 | MEDIUM | 3D GLB view | **UNVERIFIABLE** | No 3D view in the site (`public/models/` empty, no 3D library). The GLB has 8 `NODE__` groups, but the assayer's runtime authored it (Rule 9) |
| R-31 | MEDIUM | Tokens, type stacks and family notation | **MET** | `globals.css:5-24` matches the lock exactly. Uses "NODAL / RIDGE · RIDGE_01". No REEF NODE |
| R-32 | HIGH | Tests, typecheck and build | **MET** 3/3 | 19/19, exit 0, build passed (isolated copy, both snapshots) |
| R-33 | MEDIUM | Logo slot | **UNVERIFIABLE** | Snapshot 2 shows `public/brand/nodal-white.svg`, described as designer-supplied. No record of Lucho's approval |
| R-34 | MEDIUM · PROXY | Primary reading path uses plain language | **PARTIAL** | Rule IDs, action ID, camelCase formula and hash sit in the main path (`AssessmentPanel.tsx:15,27,35,40-44`) |
| R-35 | HIGH | README, LICENSE, repo | **PARTIAL** 3/3 checked | README is complete and honest. No LICENSE and no `.git` found |

**Totals:** 35 criteria — 26 MET, 6 PARTIAL, 1 MISSED, 2 UNVERIFIABLE. Proxies flagged for veto: R-01, R-02, R-11, R-12, R-34.

### Two-minute journey: where it stalls

| Step | Works? | Interruption (evidence) |
|---|---|---|
| Understand the problem | Partly | No audience, place or "why" in the header (R-02) |
| Inspect the network | Yes | SVG labels are small at projector width (10–12px). "Y = 0 · arbitrary water-surface plane" and "depth cue: +Z drawn higher" are technical but harmless |
| Select RIDGE/CANYON | Yes | — |
| See Miami observations | Yes | Strip times are UTC only (cards show EDT too). "MLLW" and "q=p" are unexplained, but the caveats help |
| Adjust demand | Yes | Result is off-screen at 1280×720 (R-12) |
| Understand the action | Yes | The "Rules triggered: NODAL-PWR-001 · …" line sits between action and suitability (R-34) |
| Inspect Gemma | Yes, about 8 s | Two screens below the slider. Gemma's observed numbers differ from the screen (R-20) |

---

## Bugs outside the rubric (B-XX)

| ID | Where | Reproduction | Severity |
|---|---|---|---|
| B-01 | `ScenarioPanel.tsx:56` | Type 99999 in the battery field: accepted beyond `max=2000`, giving "2499.98 h" | P2 |
| B-02 | `ScenarioPanel.tsx:56` | Clear the battery field: it becomes 0 kWh and "0 h", so missing input is shown as zero | P2 |
| B-03 | `GemmaPanel.tsx:119-129` | On a quota failure the fallback says "(see above)", but the failure banner renders **below** it | P2 |
| B-04 | `NoaaPanel.tsx:46` | OLD banner says "the newest observation … is N min old", but N is the **oldest** product's age | P2 |
| B-05 | `NoaaPanel.tsx:147` | `aria-label` on the strip link replaces its content, so screen readers never hear the values or the freshness | P2 |
| B-06 | `gemma.server.ts:174-186` | The response's `modelVersion` is not captured. "generated by" shows the requested ID | P2 |
| B-07 | `AssessmentPanel.tsx:18` | The `aria-atomic` region re-announces the whole result and action on every slider step | P2 |
| B-08 | `noaa.server.ts:71` | Wind direction reads "159° SSEfrom" in text | P2 |
| B-09 | `GemmaPanel.tsx:105-137` | After the inputs change, "Exact JSON sent to Gemma" and old failure banners are not marked as belonging to the earlier request | P2 |

No console messages on the final snapshot-2 page load (earlier loads were not captured).

---

## Fixes

### P0: blockers

**Site: none.** Nothing found blocks the demo or misrepresents evidence.

| ID | Owner | Observed failure | Smallest change | Acceptance check |
|---|---|---|---|---|
| P0-H1 | **Human** | No `LICENSE` and no `.git` anywhere in the project (R-35). Required for submission and for any partner-track claim | Create the public repo, add a LICENSE at the root, push before 3:45 PM ET. Claim Best Use of Gemma 4 only once the license is public (the README already says this) | Public repo URL resolves and shows LICENSE + README |

### P1: important (do before the 3:30 PM freeze if time allows; in this order)

| ID | Owner | File / component | Observed failure | Smallest recommended change | Acceptance check |
|---|---|---|---|---|---|
| P1-01 | Cursor | `GemmaPanel.tsx` (+ one prop in `Dashboard.tsx`), `gemma.server.ts` prompt | Gemma quoted 0.434 m (18:24Z) while the screen showed 0.441 m (18:18Z), with no observation time (R-20) | (a) After a successful explain, call the existing `loadNoaa()` from Dashboard through a new `onExplained` prop. The server's 60 s cache returns the same payload Gemma received, so the panel catches up. (b) Under the AI text, render "Regional context used: NOAA observed `<payload observedAtUtc>`" from `done.result.payload`. (c) Add to SYSTEM_INSTRUCTION rule 6: "When quoting a NOAA value, include its observation time (UTC) and datum." | Run Explain; the strip's observed time and values equal the payload's, and the explanation (or the line under it) shows the time |
| P1-02 | Cursor + Human | `Dashboard.tsx:104-107` (network header) | At 1280×720 and 1440×900 the energy result is consumable in the first viewport (NET pill) while its ecological boundary is ~1000px away (R-12) | Next to the NET pill add `<span className="state-pill">Site suitability: undetermined</span> <Badge tag="UNKNOWN" />`. One element; layout unchanged. **Demo operator:** set browser zoom to 80% on a 1280×720 projector and scroll so the scenario panel is at the top. Measured at 1600×900 CSS: slider-to-suitability span is 738px, which fits in 900 | First viewport at 1280×720 shows "NET +20 kW · SIMULATED" and "Site suitability: undetermined ? UNKNOWN" together; at 80% zoom, slider, result, action and suitability fit in one screen |
| P1-03 | Cursor (copy is GIVEN by HANDOFF §1) | `Dashboard.tsx:77-79`; strip label `NoaaPanel.tsx:148` | No users, no Miami and no accountability principle in the first viewport (R-02) | Replace the second header line with: "For Miami marine researchers, coastal-resilience teams and planners screening proposed ocean infrastructure. Environmental accountability precedes deployment." Keep the "Not an operating data center…" sentence. Change the strip prefix to "Virginia Key, Miami · 8723214 · regional shore station" | A first-time reader can answer "who is this for, where, and why" from the first viewport |
| P1-04 | Cursor + Human | `NoaaPanel.tsx:79,155`; `Dashboard.tsx:56` | "N min old" and the OLD flag freeze at retrieval time; an open page goes on saying "FETCHED FROM NOAA · 9 min old" (R-16) | Smallest: change the copy to "`{ageMinutes}` min old **at retrieval** (`{time}`)". Better (about 10 lines): recompute age and stale on the client from `observedAtUtc` with a 60 s `setInterval` tick. **Demo operator:** reload the page within 5 minutes of presenting | After 15 idle minutes the readout is either correct or explicitly "at retrieval"; an observation older than 60 min shows OLD without a manual refresh (tick version) |

### P2: polish (after the freeze, or skip)

| ID | Owner | File | Observed | Smallest change | Acceptance |
|---|---|---|---|---|---|
| P2-01 | Cursor | `AssessmentPanel.tsx:40-44` | Rule-ID line interrupts the action → suitability pairing (R-34) | Move the "Rules triggered" line into the existing "Rules evaluated" `<details>` | Action is followed directly by the suitability block |
| P2-02 | Cursor | `NetworkView.tsx:226,298` (+13px captions) | SVG node IDs at 10–12px on desktop, about 5px on mobile (R-25) | Text only: node-ID `fontSize` 15→20 and captions 13→16 in viewBox units. Glyph shapes untouched | Node IDs ≥14px rendered at 1280 width |
| P2-03 | Cursor | `globals.css:137` | Not-triggered rules at 3.63:1 | `opacity: 0.6` → `0.85`, or drop the opacity and rely on the existing "not triggered" text | ≥4.5:1 |
| P2-04 | Cursor | `GemmaPanel.tsx:119` | B-03 | Change "(see above)" to "(see below)", or render the failure banner first | Text matches the order |
| P2-05 | Cursor | `NoaaPanel.tsx:46` | B-04 | "newest observation" → "oldest displayed observation" | Copy matches the computation |
| P2-06 | Cursor | `ScenarioPanel.tsx:56` | B-01, B-02 | Clamp to `LIMITS.batteryKwh.max`; on an empty field keep the previous value | 99999 → 2000; empty never becomes 0 |
| P2-07 | Cursor | `NoaaPanel.tsx:147` | B-05 | Remove `aria-label`; add `<span className="sr-only">Jump to NOAA details.</span>` | SR reads the values and the state |
| P2-08 | Cursor | `AssessmentPanel.tsx:18` | B-07 | Put `aria-live` on a one-line summary ("Net −40 kW, shortfall; reduce demand by 40 kW") instead of the whole block | One short announcement per change |
| P2-09 | Cursor | `gemma.server.ts:174-186`, `gemma-types.ts` | B-06 | Read `json.modelVersion` and show it in "generated by" | Displayed ID comes from the response |
| P2-10 | Cursor | `NoaaPanel.tsx:155` | Strip shows UTC only | Append the local time, as the cards already do | Strip shows EDT |
| P2-11 | Cursor | `GemmaPanel.tsx:105-137`; `noaa.server.ts:71` | B-09, B-08 | Label the stale JSON/failure as "(earlier request)"; render wind as "from 159° SSE" | Copy check |
| P2-12 | Human | Logo slot (R-33) | Provenance of `nodal-white.svg` is not on record with the assayer | Lucho confirms in chat or a note that this is the approved file and proportions | Approval recorded |

### Claude (geometry): recommendation only

| ID | Observed | Recommendation | Acceptance |
|---|---|---|---|
| C-01 | `nodal_scene.glb` is exported (8 `NODE__` groups, 4.87 MB, no Draco) but not integrated; the site has no 3D dependency. Silhouettes are still PROPOSED pending Lucho | **Do not integrate before the 3:30 freeze.** The SVG fallback is verified and the demo depends on it. If the GLB is integrated later, an assayer other than Claude must verify picking and silhouettes (Rule 9). No geometry changes recommended here | SVG remains the demo view; any GLB integration gets an independent re-assay |

---

## Preserve (evidence-backed; do not touch)

| ID | Keep | Evidence |
|---|---|---|
| P-01 | Two-column shell, guided path, rail order scenario → assessment → Gemma | `Dashboard.tsx:86-149`; no overflow at 5 viewports; single column at ≤1100 |
| P-02 | Deterministic engine and rule IDs | vitest 19/19; IDs `f24c5e8e` / `54b0d579` reproduced across reloads and builds |
| P-03 | Persistent "Site ecological suitability: undetermined · Do not deploy yet" | `AssessmentPanel.tsx:46-54`; identical in all three energy states |
| P-04 | Badge system (glyph + text + border style) | `Badge.tsx:3-20`; `globals.css:75-80` |
| P-05 | NOAA adapter honesty (no back-fill, cached keeps original times, "— unavailable") | `noaa.server.ts:206-210`; 6/6 freshness states rendered correctly |
| P-06 | Outdated-explanation handling | `GemmaPanel.tsx:62,87-91`; live test after 60→120 kW |
| P-07 | "Not AI" deterministic fallback | `GemmaPanel.tsx:24-37`; rendered under 3 failure modes |
| P-08 | SVG fallback and keyboard node buttons | `NetworkView.tsx:219-229,284-301`; Enter/Space verified |
| P-09 | Focus ring | `globals.css:46`; 44 Tab stops all visible |
| P-10 | Network-wide scenario copy and CONNECTOR inspection-only | `ScenarioPanel.tsx:27-33`; `Dashboard.tsx:15-36` |

Also preserve: the absence of any green or score, the "aspiration, not proof" motto, and the restrained navy/ivory/cyan/amber palette. All match lock v1 exactly (`globals.css:5-24`).

---

## Pre-mortem (it is April 2027; NODAL's demo failed)

| ID | Lens | Root | History | Mitigation / disposition |
|---|---|---|---|---|
| PM-01 | Technical / ethical | BUILD | The laptop opened the dashboard at 3:00; at 4:10 the strip still read "FETCHED FROM NOAA · 9 min old" for a 70-minute-old reading. A judge noticed, and the "honest data" pitch collapsed | P1-04; reload before presenting |
| PM-02 | Conversion | BUILD | Gemma said 0.434 m while the strip said 0.441 m. In Q&A, "which is it?" turned the AI-accountability story into a credibility problem | P1-01 |
| PM-03 | Audience | BUILD | Judges scored community impact (30%) low: the screen never named who it serves or how affected communities participate | P1-03; BIAS-01 |
| PM-04 | Technical | BUILD | On the 1280×720 projector, the presenter dragged demand and then scrolled hunting for the action; the "+20 → still unknown" moment never appeared on one screen | P1-02 (chip + 80% zoom) |
| PM-05 | Technical | ASSUMPTION | Venue Wi-Fi or quota made Gemma take over 20 s or return 429 during the 15-second slot | **ACCEPTED RISK.** The truthful fallback is verified (R-21). Rehearse the DEMO_STORY substitution line; press Explain while narrating the NOAA step |
| PM-06 | Operational | BRIEF | Submission at 3:45 lacked a public repo and LICENSE; partner-track claims were void | P0-H1 (human) |
| PM-07 | Brand / trend | ASSUMPTION | Environmental judges read "underwater data center + organic architecture" as greenwashing despite the labels | **ACCEPTED RISK.** Mitigated by the "Do not deploy yet" verdict and the "aspiration, not proof" motto. Lead the pitch with the refusal capability |

No pre-mortem cause shows that a CRITICAL proxy was badly chosen. R-01 still serves the brief intent; the co-visibility gap is captured as HIGH (R-12).

## Bias check (T2 inline, final artifact only)

- **BIAS-01 · demographic · MEDIUM:** no affected-community or user language on screen (→ P1-03).
- **BIAS-02 · linguistic · MEDIUM:** English-only in a majority-Spanish-speaking metro. Acceptable for a researcher/planner prototype; do not claim community reach.
- **BIAS-03 · cultural · LOW:** the HANDOFF form-DNA phrase "neo-tribal/cybersigilism" is not on the site; avoid it in the spoken pitch.
- Cognitive (automation bias): mitigated. The AI comes after the deterministic result, is labelled derived, and is checked for an uncertainty section.
- No Colombian indigenous, Afro-Colombian or Raizal material, so the cultural gate does not apply. **No CRITICAL bias findings.**

## Scorecard (ProofLab dimensions; no TF baseline, so no regression mapping)

| Dimension | Build | Note |
|---|---|---|
| Specificity | 4 | Real station, exact IDs, rule IDs |
| Applicability | 4 | Planners can reuse the screening logic |
| Clarity | 3 | Audience missing; IDs in the main path; fold placement |
| Boldness | 3 | Restraint is correct for the lock; the architecture carries the boldness |
| Conversion Focus | 4 | Task line, guided path and explicit action |
| Brand Fidelity | 4 | Tokens match the lock exactly; human logo in place (approval UNVERIFIABLE) |
| Distribution Fit | 3 | Desktop is good; SVG text illegible on mobile |
| Technical Health | 4 | Tests, types and build green; no console errors; small input bugs |
| Scalability | 3 | Single station; static network |
| Spread Potential | 3 | — |

---

## ⬥ HALLMARK — NODAL (site, build `o2JM1gfWu_ve-_aF4PQZb`)

**Date:** 2026-10-10  **Cycle:** 1  **Tier:** T2
**Brief:** `NODAL_STARTER/HANDOFF.md` + `direction/ADD_REPORT.md` (lock v1)  **Build:** `http://localhost:3001/` (NODAL_STARTER/web)

| Condition | Result |
|---|---|
| All CRITICAL criteria MET | ✅ 11/11 |
| Brief Fidelity ≥ 85% | ✅ 87.8% |
| No regression vs TF baseline | ⚠️ n/a (no baseline carried) |
| No unresolved CRITICAL bias/cultural finding | ✅ |
| Assayer did not author the build | ✅ (web/** by Cursor; GLB by Claude excluded as UNVERIFIABLE) |

**Rubric summary:** 35 criteria — 26 MET, 6 PARTIAL (all non-critical), 1 MISSED (HIGH: R-20), 2 UNVERIFIABLE (R-30 GLB, R-33 logo approval).

**Proxies used (veto if wrong):**
- R-01: "responsibly conclude" → the 7 frozen demo steps run end to end.
- R-02: "problem comprehension" → the first viewport names users, place and problem.
- R-11: "same reading area" → the boundary label sits in the same component as its claim, with no hover.
- R-12: "demo clarity" → slider, result, action and suitability co-visible or one scroll apart at demo resolutions.
- R-34: "comprehension" → no machine identifiers in the primary reading path.

**Accepted risks:** PM-05 (Gemma latency/quota; truthful fallback verified). PM-07 (greenwashing reading; refusal-first pitch).

**Bias:** no critical findings; BIAS-01/02/03 noted above.

**Deploy clearance:** this exact build is certified against the brief for demo and submission. **Carried forward:** P1-01…P1-04 (recommended), P0-H1 (human submission gate), R-33 logo approval, R-30 GLB (do not integrate pre-freeze). Any edit to `web/**` voids this certificate for the touched criteria → T1 re-assay.

*Assayed by AssayHall · cycle 1 · 2026-10-10 · Obsidian archive pending (write scope restricted to direction/)*

---

## Uncovered brief elements (no criterion, with reason)

- NOAA Coral Reef Watch: optional in HANDOFF; not built, and the README says so.
- Timed two-minute rehearsal, spoken script and Q&A: human presentation, not the site.
- Same-day-build compliance of the reference boards: an organizer question (README:100 flags it); human.
- Exterior silhouettes, ATOL v1/v2 choice: human and geometry gates, not the site.
- Gemma partner-track eligibility: depends on P0-H1 and organizer criteria.

---

## Cursor handoff (concise)

```
NODAL site audit — AssayHall cycle 1 — HALLMARK 87.8% on BUILD_ID o2JM1gfWu_ve-_aF4PQZb.
Layout, palette, engine, badges, NOAA adapter and Gemma states are verified. Do not restructure.
If you change anything, keep each fix local and tell Lucho which R-IDs need a T1 re-assay.

Priority (stop at 3:30 PM ET; skip any you cannot finish cleanly):
1. P1-01 GemmaPanel/Dashboard: after Explain success call loadNoaa() via an onExplained prop;
   show "Regional context used: NOAA observed <payload observedAtUtc>" under the AI text;
   add to SYSTEM_INSTRUCTION rule 6: quote NOAA values with observation time (UTC) and datum.
   Accept: strip time/values == payload after Explain.
2. P1-02 Dashboard.tsx:104-107: add "Site suitability: undetermined" + <Badge tag="UNKNOWN"/> beside
   the NET pill. Accept: 1280x720 first viewport shows both.
3. P1-03 Dashboard.tsx:77-79: header line "For Miami marine researchers, coastal-resilience teams and
   planners screening proposed ocean infrastructure. Environmental accountability precedes deployment."
   NoaaPanel strip: "Virginia Key, Miami · 8723214 · regional shore station".
4. P1-04 NoaaPanel.tsx:79,155: "N min old at retrieval (HH:MM UTC)" — or a 60 s client tick recomputing
   age/stale from observedAtUtc.
P2 (only if trivial): move "Rules triggered" line into its <details> (AssessmentPanel:40-44);
"(see above)"→"(see below)" (GemmaPanel:119); rules.off opacity 0.6→0.85 (globals.css:137);
remove strip aria-label (NoaaPanel:147); clamp battery input (ScenarioPanel:56).
Do NOT: add the GLB, a chart, fonts or motion; touch shared/network.json; change glyph geometry.
Run: npm test && npm run typecheck && npm run build (build overwrites .next — coordinate with the running server).
```

**Human demo checklist:** reload the page within 5 minutes of presenting · browser zoom 80% on a 1280×720 projector · press Explain early (about 8 s) · if Gemma fails, use the DEMO_STORY substitution line · LICENSE and public repo before 3:45 PM ET.
