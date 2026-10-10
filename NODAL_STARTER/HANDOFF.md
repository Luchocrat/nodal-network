# NODAL | Hack for Humanity Miami 2026
**Canonical handoff v1.0 · Saturday, October 10, 2026 · Miami ET**

> **Read this first.** This document is the single source of truth for parallel implementation in Cursor and Claude Code. The `references/` boards are an artistic/architectural brief, **not** verified engineering drawings. `shared/network.json` is the frozen initial data contract.

## 1. Mission and positioning

**NODAL** explores a proposed network of modular underwater computing infrastructure, habitat-oriented external structures, an offshore surface hub called **ATOL**, and an **environmental decision-support interface** for Miami. Our founding principle: **environmental accountability precedes deployment**. The product must be able to say “do not deploy yet.”

**Today's demonstrated product is NOT an operating underwater data center and NOT a validated reef-restoration technology.** It is a functional data-to-decision prototype that combines verified source observations, explicit simulations of hypothetical infrastructure, reproducible assessment logic, and an AI explanation.

- **Primary Build for Miami track:** Data to Action.
- **Optional partner challenges:** Best Open-Source AI Project and Best Use of Gemma 4, *only if all criteria are actually met*.
- **People served:** Miami-area marine researchers, coastal resilience teams, and environmental/infrastructure planners screening proposed interventions.
- **Decision at center of demo:** “Given recent Miami-area observations and an illustrative energy-demand scenario, what can we responsibly conclude about a proposed underwater network, and what evidence/action is required next?”
- **Core slogan for presentation:** **COMPUTE / CLEAN / RESTORE / CONNECT** is an aspiration, not proof of ecological restoration.

### Hackathon rules and deadline

Official rules: <https://github.com/AI-Collective-Hackathons/hack-for-humanity-miami> and `Challenge Guide.md` in that repository. The published build window ends **3:30 PM ET**, submission closes **3:45 PM ET**, and the live demo is **2 minutes + 1 minute Q&A**. All submitted project implementation must comply with the event’s same-day build restrictions. Pre-event ideas/research/sketches may guide new work; clarify with organizers before submitting any older generated image as an original same-day deliverable. A public repository and appropriate open-source license are required. Cite third-party assets, tools, datasets, and model terms in README.

**Rubric:** Community impact **30%**, working build **25%**, AI/data **20%**, originality/craft **15%**, demo clarity **10%**. Organizer materials and the photographed slide disagree on the point scale (1–5 versus 1–10); weights are the same. Do not let that discrepancy delay development.

## 2. Approved design system: four architectural families

| Family | Function | Signature silhouette | Main reference |
| --- | --- | --- | --- |
| **RIDGE** | Low-profile protected computing, exterior habitat geometry | Broad, sloping, asymmetric, arched, branching with sheltered compute core | `references/ridge_connector_master.png` and `references/modular_compute_reef.png` |
| **CANYON** | Tall vertical habitat and serviceable computing spine | Tall multi-level open lattice with differentiated zones | `references/canyon_node.png` |
| **CONNECTOR** | Network integration, protected cable/service passages | Long, tapered branching arms, elevated/curved spans | `references/ridge_connector_master.png` and `references/ridge_connector_overview.png` |
| **ATOL** | Proposed surface solar, communications, power management, anchoring/umbilical | Low wide floating form with ivory sigil-like canopy and technical mast | `references/atol_surface_hub_v1.png` and `references/atol_surface_hub_v2.png` |

Additional system references: `ecosystem_overview.png`, `network_system_blueprint.png`, `underwater_reef_network.png`. All nine images are included in this starter package.

**Form DNA:** asymmetric neo-tribal/cybersigilism curves; bone-white porous branching shells; expressive negative space; sheltered dark-metal cartridge structures; terrain-adaptive posture; some coral/biofilm imagery **only as conceptual visualization**. Avoid generic spheres, domes, repetitive cylinders as *external pod forms*, arbitrary spikes, or decorative cables without functional meaning. Internal compute cylinders are acceptable.

**Scientific and engineering guardrails:** Illustrated dimensions, loads, hydrodynamics, mooring details, structure strength, cooling effects, coral settlement over 6 months/5 years, carbon sequestration, biodiversity benefits, and “storm ready” labels are *hypotheses or visual storytelling*, not substantiated. Do not echo any board caption as a verified claim. No passive-cooling-benefit assertion without a local thermal model. Any lifecycle states must read “conceptual; unvalidated.”

## 3. Frozen minimal demo scope

The live demo has one path that must work end-to-end:

1. Open an unmistakably NODAL-branded marine observatory dashboard.
2. Show **recent NOAA observations** with timestamps, units, original source, and fetched/cached/error state.
3. Select a RIDGE or CANYON node in a six-node underwater network connected to the ATOL surface hub.
4. Change a **simulated** compute/energy scenario, e.g. compute demand rises while renewable generation is fixed.
5. Compute a **deterministic** power balance and list missing environmental evidence. Recommendation changes when the scenario changes.
6. Send the real structured assessment summary to **Gemma 4 through Gemini API**; display its grounded explanation if configured, or a clearly labeled unavailable state.
7. Conclude with a concrete next action, e.g. conduct local bathymetry/current/thermal studies before site qualification, or mitigate a simulated energy shortfall.

The dashboard must run with a lightweight network placeholder **even if Blender fails**. No live ocean sensor is installed; do not imply one. Avoid green “safe to deploy” claims when there is insufficient evidence.

### Real environmental sources

- **NOAA Tides & Currents, Virginia Key station `8723214`**: <https://tidesandcurrents.noaa.gov/>. NOAA API: <https://api.tidesandcurrents.noaa.gov/api/prod/>. Use available water temperature / water level / wind products **only if the station actually returns them**. Tidal water level **is not** current speed.
- **Optional if time allows:** NOAA Coral Reef Watch regional heat-stress data <https://coralreefwatch.noaa.gov/>; label as regional remotely sensed indicator, **not** an in-situ measurement at NODAL.
- Never fabricate observations. Preserve timestamp, units, sensor station ID, source URL, original payload where useful, and retrieval status. Fallback observations must be accurately labeled **cached** with original observation time; scenario values must say **simulated**.

### Deterministic assessment (initial version)

- UI controls: compute demand (kW, SIMULATED), renewable generation (kW, SIMULATED), optional battery charge (kWh, SIMULATED).
- Calculation: `netPowerKw = simulatedGenerationKw - simulatedDemandKw`. Any battery-runtime estimate uses `availableBatteryEnergyKWh / max(0, -netPowerKw)` and only when there is a shortfall; expose assumptions, ignore conversion losses unless modeled explicitly.
- When net power is negative, recommend mitigating shortfall/reducing compute load (a simulated operations recommendation).
- Regardless of energy result, **site ecological suitability is undetermined** without local thermal, current, habitat, benthic, and permitting evidence. Report that as an information gap, **not** a made-up pass/fail environmental score.
- Structured assessment must include rule IDs, input units, observed-vs-simulated tags, data gaps, assumptions and one action the user can take. Assessment must be repeatable when inputs repeat.

### AI responsibilities

**Gemma 4** is an explanation layer, not the calculator or ecological certifier. Call via Gemini API from the server. Verify actual supported model ID (candidate `gemma-4-26b-a4b-it`); don't assume model access or free quota. Feed it verified assessment JSON and instruct: don't invent observations or engineering thresholds, identify assumptions/data gaps, explain the recommended action. Only claim partner-track eligibility when a real request and response can be demonstrated; list model/terms in README. Missing key => truthful offline/error UI.

## 4. Parallel development contract (mandatory)

**One local hackathon folder, two independent owners, one shared schema.** Avoid two autonomous agents committing, resetting or modifying the same files. The human controls repo integration and final submission.

**Cursor owns:** `web/**`, app structure, server routes, dashboard, NOAA adapter, scenario math, Gemma, UI states, fallback network, README draft. Cursor **may read but may not write** `visualization/**`.

**Claude Code owns:** `visualization/**`, Blender Python scripts, `.blend`, preview renders, optimized browser `.glb`. Claude **may read but may not write** `web/**`.

**Shared:** `shared/network.json` is already supplied. Treat initial `node.id`, `type`, `position`, and connection endpoints as **frozen**. Neither agent edits it without notifying the human and synchronizing the other agent. Reference files are read-only. `HANDOFF.md` is read-only until human authorizes changes.

**Schema:** `shared/network.json` defines six underwater nodes (`RIDGE_01`, `CONNECTOR_01`, `CANYON_01`, `CONNECTOR_02`, `RIDGE_02`, `CANYON_02`), one `ATOL_01` surface hub, and `JUNCTION_01`. `connections` uses `source` / `target` IDs. Positions are hypothetical **meters**, with **Y up**, X east/west, Z north/south. Negative Y denotes underwater depth relative to an arbitrary water-surface plane. Blender is Z-up internally; convert correctly when importing/exporting to glTF/Three.js. No coordinates correspond to real Miami deployment sites.

**3D naming contract:** Every selectable mesh/group should be named `NODE__<id>` (example `NODE__RIDGE_01`) inside GLB. Prefer one main named parent per node with child meshes. Export to `visualization/exports/nodal_scene.glb` and create `visualization/exports/EXPORT_NOTES.md` stating units, axis, IDs, polygon count/file size, how to import and known issues. The app may copy this GLB into `web/public/models/nodal_scene.glb`; Claude does not copy it. Cursor must keep a fallback visualization until GLB is verified and should not silently lose click-to-select.

**Do not turn the whole plan into separate agent swarms.** We have two builders and a human design/research lead. No database, login, complex multi-agent framework, CFD, or high-detail photorealistic render on critical path.

## 5. UI art direction and branding

Today’s baseline style: **NODAL / Marine Observatory**, blending precise oceanographic instrumentation with research-console typography. The 3D object is organic; the interface stays measured. Deep abyssal navy backgrounds (`#061B24`), bone-white text (`#F1F1E9`), cyan observations (`#4FD1D9`), warm amber/coral scenario warnings (`#E7A477`), high contrast and restrained panels. **These are provisional UI tokens**; human designer will supply the final NODAL identity. Use a **temporary typographic wordmark only**. Do not invent an alternative permanent brand. ADA/legible text matters more than tiny techno labels.

The human designer and Glyph will review visual direction and logo independently while builders work. Cursor should build an accessible baseline now, with configurable design tokens so later choices do not require structural rework.

## 6. Build order and gates

**Gate 1: Functional proof.** Cursor displays a real NOAA measurement or honest unavailable state; scenario changes yield reproducible power-balance results. Claude renders one RIDGE silhouette and validates geometry. **No waiting on the other agent.**

**Gate 2: Explainability + image.** Cursor connects Gemma if real credentials available, handles failure correctly, and completes end-to-end demo. Claude exports one browser-viewable GLB with recognizable RIDGE/CONNECTOR/CANYON forms and stable IDs, expanding ATOL if time permits.

**Gate 3: Integration.** Cursor optionally imports GLB; use placeholder if export/model loading/picking unstable. Human reviews claims and logo consistency.

**Gate 4: Submission.** Run production build, verify flow manually, finish README/license, public repo and submission details; **stop feature changes at 3:30 PM** and submit **before 3:45 PM ET**. Preserve a working demo over fidelity.

If an agent's feature is blocked for 15+ minutes, reduce scope. If 3D is blocked for 45–60 minutes, send a usable preview/render and keep web placeholder. Never miss submission for polish.

## 7. Demo script (2 minutes)

**0:00–0:20**: Miami environmental accountability problem, intended researchers/planners, why underwater computing proposals require scrutiny.

**0:20–0:40**: NODAL concept: ATOL + six underwater RIDGE / CANYON / CONNECTOR units. Architecture is concept art, not approved hardware.

**0:40–1:05**: Show timestamped NOAA Virginia Key observation and explain observed vs simulated.

**1:05–1:30**: Change compute demand; show calculated power balance and action. Emphasize unresolved local ocean/ecology evidence.

**1:30–1:45**: Ask Gemma to interpret real assessment JSON; if API unavailable, disclose it rather than pretend.

**1:45–2:00**: Next action: targeted site sampling and thermal/ecological feasibility studies, not deployment certification. Close: **“Computing shouldn't simply move into the ocean. It should be accountable to the ocean.”**

## 8. Definition of done and disclosure

- [ ] App starts and shows a visible network (placeholder acceptable).
- [ ] Live or honestly cached/unavailable NOAA observations, with units, station/source, timestamps.
- [ ] Selectable node and scenario control.
- [ ] Reproducible deterministic assessment and actionable next step.
- [ ] Gemma 4 real API call *if claiming partner-track eligibility*.
- [ ] Proper distinction: **OBSERVED / SIMULATED / CONCEPTUAL / UNKNOWN**.
- [ ] At least one usable GLB/preview if Blender work completed.
- [ ] Working two-minute demo, documented and tested.
- [ ] README with team, build date, how to run, exact data URLs and AI model ID/terms, limitations, tech stack, track.
- [ ] Public GitHub repo and suitable license; confirm hackathon rules and submit before deadline.

## 9. Communication protocol

Each agent reports at milestones in **four lines**: `DONE`, `TESTED`, `BLOCKED`, `NEXT`. No fabricated success reports. Any schema or contract-breaking change goes to human approval first. Do not make concurrent modifications outside your owned directory. The user (graphic designer) has final say on exterior silhouette, art direction and logo.
