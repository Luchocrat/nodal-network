# NODAL — Marine Observatory

**Live demo:** https://nodal-network.vercel.app

NODAL is a decision-support prototype for screening a *proposed* underwater computing network off Miami. It pairs every claim with its evidence boundary: what is **observed**, what is **simulated**, what is **conceptual**, and what is **unknown**. It does not claim the network is safe, restorative, or ready to deploy. Site suitability is always *undetermined*.

Built for Hack for Humanity Miami, Oct 10, 2026. Track: *Build for Miami — Data to Action*.

## What it does

1. Shows a six-node underwater network plus the ATOL surface hub, in a 2D SVG section and plan view. Nodes are selectable by mouse, touch or keyboard.
2. Shows live NOAA CO-OPS observations from Virginia Key (station 8723214), each with source, UTC time, units and retrieval state. Failures show as explicit `CACHED`, `REFRESH FAILED` or `UNAVAILABLE` states. Missing values are never filled in.
3. Lets you change simulated compute demand and generation. A deterministic rule engine recomputes net power, the selected node's illustrative allocation, battery runtime and one recommended action, with stable rule IDs and a list of missing local evidence.
4. Asks Gemma 4 to explain the assessment in plain language. If Gemma is unavailable, the app says so and shows a deterministic explanation built from the same assessment.

| Label | Meaning |
|---|---|
| OBSERVED | Measured at a NOAA shore station. Regional context only, not a NODAL site reading. |
| SIMULATED | A user scenario input or a value computed from one. |
| CONCEPTUAL | Architecture concept, unvalidated. |
| UNKNOWN | Evidence we do not have: local thermal, current, bathymetry, habitat, permitting. |

## Repository layout

```
NODAL_STARTER/
  web/             Next.js 16 / React 19 / TypeScript dashboard (the deployed app)
  shared/          network.json, the frozen network contract (read-only source of truth)
  visualization/   Blender scene, GLB export, previews, generation scripts
  references/      concept reference boards (art, not engineering drawings)
  prompts/         agent prompts used during the build
  HANDOFF.md       build contract between the web and visualization work
direction/         creative direction, design system, demo story, audit reports
```

Start with [`NODAL_STARTER/web/README.md`](NODAL_STARTER/web/README.md) for the app's architecture, data sources, Gemma notes and the 60-second demo script.

## Run locally

```sh
cd NODAL_STARTER/web
npm ci
cp .env.example .env.local   # then set GEMINI_API_KEY (server-side only)
npm run dev                  # http://localhost:3000
npm test && npm run typecheck && npm run build
```

Without a Gemini key the app still works: the Gemma panel reports "unavailable" and shows the deterministic explanation.

## Data and AI

- **NOAA CO-OPS** Tides & Currents, station [8723214 Virginia Key](https://tidesandcurrents.noaa.gov/stationhome.html?id=8723214), via the [CO-OPS Data API](https://api.tidesandcurrents.noaa.gov/api/prod/). The currents product is not offered for this station, so it is recorded as an unknown gap, not shown as a value.
- **AI:** Gemma 4 (`gemma-4-26b-a4b-it`) through the Gemini API, called only from the server. It explains the deterministic assessment and does not calculate or certify anything.

## Limitations

- Concept art, not engineering drawings. Node coordinates are hypothetical.
- No ocean sensor, thermal, current, bathymetry, habitat or permitting evidence exists in this prototype.
- NOAA data is from a shore station, not the NODAL site.
- No ecological scoring. Gemma explains; it does not certify.
- The 3D GLB scene in `visualization/` is not wired into the app; the SVG view is the shipped visualization.

## Disclosure

- The reference boards in `NODAL_STARTER/references/` and the Blender/GLB assets were produced with generative and 3D tools and are concept art. Confirm with the organizers how pre-event or externally generated assets should be presented.
- The app was built with AI coding agents under Lucho Escobar's direction.

## Credits

Next.js and React (MIT). Gemma 4 and the Gemini API (Google). NOAA CO-OPS data (US Government work, cite NOAA). NODAL logo by Lucho Escobar Studio.

## License

No license has been chosen yet. Until a `LICENSE` file is added, all rights are reserved.
