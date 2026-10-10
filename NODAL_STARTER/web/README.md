# NODAL Marine Observatory — web app

Hack for Humanity Miami 2026 · Primary track: **Data to Action** · Build date: **Saturday, October 10, 2026**

An environmental decision-support **prototype** for screening a *proposed* underwater computing network. It is **not** an operating underwater data center, **not** a validated reef-restoration technology, and **not** a deployment certification. It can — and by design always does today — say **DO NOT DEPLOY YET**.

Label vocabulary used everywhere in the UI:

| Label | Meaning |
| --- | --- |
| `OBSERVED` | Measured by an external source (NOAA shore station). Never from a NODAL sensor — none exists. |
| `SIMULATED` | Scenario value the user sets (kW, kWh). Not a measurement. |
| `CONCEPTUAL` | Architecture concept art / layout. Unvalidated, not engineering-approved. |
| `UNKNOWN` | Evidence we do not have (local thermal, currents, bathymetry, habitat, permitting). |

## Run locally

Requires Node ≥ 20 (developed on Node 24 / npm 11).

```bash
cd web
npm install
cp .env.example .env.local        # then add GEMINI_API_KEY (optional; see below)
npm run dev                       # http://localhost:3000
```

Production check (what to run before submitting):

```bash
npm test            # 17 unit tests: scenario engine, shared-schema contract, NOAA adapter failure modes
npm run typecheck
npm run build && npm start        # http://localhost:3000
```

`predev`/`prebuild` run `scripts/sync-network.mjs`, which **copies** `../shared/network.json` to `src/data/network.json` (read-only on the shared file; IDs/positions are never altered). A test fails if the copy ever diverges from the shared file.

## Gemma 4 (server-side only)

- Variable: `GEMINI_API_KEY` in `web/.env.local` (git-ignored). Optional `GEMMA_MODEL`.
- **Model ID:** `gemma-4-26b-a4b-it` (default). Google's Gemma-on-Gemini-API page (<https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api>, read 2026-10-10) lists exactly two Gemma 4 IDs for the Gemini API: `gemma-4-26b-a4b-it` and `gemma-4-31b-it`.
- Access is **not assumed**: `GET /api/explain` calls `models/<id>` with your key to confirm the model is reachable, and a 404 on generation lists the Gemma models your key can actually see.
- The server (not the browser) recomputes the assessment from raw scenario inputs, attaches the current NOAA context, and sends that JSON. The UI shows the exact JSON sent.
- Gemma is an **explanation layer only**. A system prompt forbids invented observations/thresholds and any "safe/suitable/ready" claim, and requires an uncertainty section; the UI warns if the response lacks one.
- No key → the panel says **UNAVAILABLE — Gemma 4 was not called** with setup steps. No text is ever fabricated.
- Gemma 4 model card lists license **Apache 2.0** (<https://ai.google.dev/gemma/docs/core/model_card_4>); API usage is additionally subject to the Gemini API terms.

## Data sources

| Source | Use | URL |
| --- | --- | --- |
| NOAA CO-OPS Tides & Currents, Virginia Key **8723214** | `water_temperature`, `water_level` (MLLW), `wind`, `air_temperature`, `air_pressure` | <https://tidesandcurrents.noaa.gov/stationhome.html?id=8723214> · API <https://api.tidesandcurrents.noaa.gov/api/prod/> |

Verified on 2026-10-10 against this station (`date=latest`): the five products above return data; `currents` returns *"Wrong Station ID"* and `conductivity`/`salinity` return *"No data was found"* — i.e. **no current-speed product exists here**, and tide height is never presented as current velocity. The adapter probes `currents` on every refresh so the UI shows NOAA's own answer.

Adapter behaviour (`src/lib/noaa.server.ts`): 8 s timeout; 60 s server cache; products NOAA does not offer are reported `UNKNOWN`, never back-filled; HTTP 429 / outage / timeout / malformed payload fall back to the **last good** record labelled `CACHED — original retrieval <time>`, keeping the original observation time; observations older than 60 min are flagged `OLD OBSERVATION` (an app freshness notice, not a science threshold). The original NOAA record and exact request URL are preserved per product.

Not integrated: NOAA Coral Reef Watch (optional in the handoff) — not built.

## Deterministic scenario engine (`src/lib/scenario.ts`)

`netPowerKw = simulatedGenerationKw − simulatedDemandKw`; battery runtime `= batteryKWh / max(0, −netPowerKw)` only on shortfall (no losses modeled). Per-node demand = total × `simulatedWorkloadPct` from the shared schema (illustrative; connectors carry 0). Stable rule IDs: `NODAL-PWR-001/010/020/030/040`, `NODAL-NODE-001`, `NODAL-OBS-001`, `NODAL-ENV-001`, `NODAL-ENV-000`; actions `NODAL-ACT-MITIGATE-SHORTFALL` and `NODAL-ACT-COMMISSION-LOCAL-STUDIES`. Same inputs ⇒ identical JSON and `assessmentId`. **No ecological score or threshold exists**; an energy surplus never changes the `DO NOT DEPLOY YET` verdict (`NODAL-VERDICT-001`).

## Demo flow (60 seconds)

Open http://localhost:3001 (production build: `npm run build && npm start -- -p 3001`).

1. **0:00** Header + strip: station Virginia Key 8723214, NOAA water temperature and tide height with UTC time and `FETCHED FROM NOAA` (OBSERVED, regional, not the NODAL site).
2. **0:10** Network: six underwater nodes + ATOL, RIDGE_01 selected. Click another node, then RIDGE_01 again; the card shows its illustrative share (`CONCEPTUAL`).
3. **0:20** Drag **Compute demand** from 60 to 120 kW (keyboard: focus slider, arrows). Net flips +20 → −40 kW `SIMULATED` SHORTFALL, cables amber, RIDGE_01 21 → 42 kW, battery ≈ 3.75 h.
4. **0:35** Assessment: action ID, "Rules triggered" IDs, **Site ecological suitability: undetermined**, five `UNKNOWN` evidence categories.
5. **0:45** **Explain this assessment** → Gemma 4 (≈ 9 s), labelled AI EXPLANATION. If Gemma is down the panel says so and shows a deterministic explanation built from the same assessment.
6. **0:55** Reset scenario. Close on the footer line.

Fallbacks: NOAA down → `UNAVAILABLE` / `CACHED` / `REFRESH FAILED` states, no invented values; Gemma down → deterministic explanation; plan view is a second 2D view.

## Status (updated by the app lead)

- [x] Next.js 16 / React 19 / TypeScript scaffold, runnable (`npm run dev`, `npm run build`)
- [x] `shared/network.json` loaded read-only (copy + contract test); six nodes, ATOL, junction rendered
- [x] SVG fallback network: section + plan views, click **and** keyboard selection, text node list alternative
- [x] NOAA adapter + `/api/noaa`: live data verified for 5 products; `currents` honestly UNKNOWN
- [x] NOAA failure paths unit-tested with mocked fetch (429 → cached, outage → unavailable, malformed, not offered)
- [x] Deterministic scenario engine + 10 tests; rule IDs, assumptions, data gaps, one action
- [x] `/api/explain` route (server-only key, structured JSON in, uncertainty-aware prompt, typed failure states)
- [x] Gemma panel loading / success / unavailable / failed states
- [x] Conceptual / simulated / observed / unknown badges; NODAL logo (`public/brand/`, supplied by the designer; white variant in the header); provisional tokens in `globals.css`
- [x] Production build passes
- [x] **Gemma 4 real request/response demonstrated** (2026-10-10, `gemma-4-26b-a4b-it` via Gemini API, ~8 s; the response cited rule IDs and had an uncertainty section; its numbers were cross-checked against the assessment JSON). Uses `thinkingLevel: minimal` because default Gemma 4 reasoning tokens exhausted the output budget (`MAX_TOKENS`, no text).
- [ ] Confirm partner-track criteria (open-source license in the public repo, README model/terms) before claiming Best Use of Gemma 4 / Best Open-Source AI.
- [x] Direction-lock v1 pass (P0 + most P1): freshness axis separate from provenance (FETCHED FROM NOAA / CACHED / OLD / REFRESH FAILED / UNAVAILABLE, strip and cards agree); site suitability block always "undetermined" with UNKNOWN evidence count; "AI EXPLANATION" authorship label; explanation marked OUTDATED (and hidden) when scenario or node changes, no auto-spend; missing values shown as "— unavailable", Unicode minus; 44 px targets; 390 px layout verified (no horizontal overflow).
- [ ] GLB viewer — `visualization/exports/nodal_scene.glb` now exists (4.87 MB, ~270k triangles, `NODE__<id>` parents). Deliberately NOT integrated: CURSOR_UI_BRIEF forbids a new 3D dependency without approval and the feature freeze is near. Plan if approved: copy to `web/public/models/`, add `three`, `GLTFLoader`, select by `NODE__<id>`; keep SVG as fallback.
- [ ] NOAA Coral Reef Watch (optional) — not built
- [x] Designer-supplied logos in `public/brand/` (white used on the dark UI; teal/coral/black variants available). Final identity system still human-owned.
- [ ] Manual presenter rehearsal on the actual projector/screen
- [ ] Public repo, license, root README, submission (human)

## What belongs in the final root README (human to assemble)

- Project name, one-paragraph positioning (copy the first paragraph above), track: *Build for Miami — Data to Action* (+ optional partner tracks **only if** the Gemma checkbox above is truly ticked and the open-source license is in place).
- Team, build date (Oct 10, 2026), and the 3:30 PM ET build-window / same-day-work disclosure; **flag that the nine reference boards in `references/` pre-date or are generated outside the app and must be cleared with organizers before being presented as same-day originals** (HANDOFF §1).
- How to run: copy the **Run locally** block above.
- Exact data URLs and AI model: NOAA station URL + API URL (table above); model `gemma-4-26b-a4b-it` via Gemini API, Gemma 4 Apache-2.0 per model card, Gemini API terms.
- Third-party credits: Next.js, React (MIT); Gemma 4 / Gemini API (Google); NOAA CO-OPS data (US Government work; cite NOAA). Check `npm ls` licenses before finalizing.
- Limitations (must be stated): concept art not engineering; no ocean sensor; coordinates hypothetical; NOAA station is a shore station; no thermal/current/bathymetry/habitat/permitting evidence; no ecological scoring; Gemma explains but does not certify.
- Choose and add a `LICENSE` (e.g. MIT or Apache-2.0) at repo root — not drafted here to avoid colliding with your decision. `web/package.json` intentionally has no `license` field yet.
- `.gitignore`: `web/.env.local`, `web/.cache`, `web/.next`, `web/node_modules` are already ignored by `web/.gitignore`. **Do not commit any API key.**

## Layout

```
web/
  src/app/            layout, page, /api/noaa, /api/explain
  src/components/     Dashboard, NetworkView (SVG), NoaaPanel, ScenarioPanel, AssessmentPanel, GemmaPanel, Badge, Wordmark
  src/lib/            network (typed shared schema), scenario (engine), noaa.server, gemma.server, shared types
  src/data/           network.json (synced copy of ../shared/network.json)
  tests/              vitest: scenario, shared contract, NOAA adapter
```
