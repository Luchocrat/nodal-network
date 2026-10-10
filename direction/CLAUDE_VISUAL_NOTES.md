---
project: NODALHackathon-2026
run-id: no-tf-baseline
status: approved
date: 2026-10-10
direction_lock_version: 1
approved_by: Lucho
approved_at: 2026-10-10
---

# NODAL / Architectural visual consistency

**Status: APPROVED · Direction lock v1 · October 10, 2026 · For Claude Code**

Governed by [ADD_REPORT](ADD_REPORT.md), locked v1. Lucho approved the A-led Marine Observatory direction, selective Oceanic Research Console behavior, restrained organic influence, and the evidence-boundary Signature Move: pair each proposition with its evidence boundary. Approval applies to this creative direction. Final logo, exterior silhouettes and ATOL reference choice remain human approval gates; hardware remains conceptual. The Director remains limited to direction/**; Cursor and Claude continue within their established ownership and authorized scope.

Creative handoff only. Claude owns `NODAL_STARTER/visualization/**`; the human owns final exterior silhouettes. These notes do not authorize redesign or geometry changes. Canonical inputs: [HANDOFF](../NODAL_STARTER/HANDOFF.md), [frozen network](../NODAL_STARTER/shared/network.json), [maquette brief](../NODAL_STARTER/visualization/BRIEF.md). Interface direction: [DESIGN_SYSTEM](DESIGN_SYSTEM.md). No Thought Foundry baseline was supplied; no baseline regression score is claimed.

## Direction

Preserve the tension between speculative organic architecture and a precise research instrument. Ivory porous shells, branching members, protected dark technical cores, asymmetry and sculptural negative spaces connect all four families. The interface may identify and inspect this architecture; it should not ornament or reshape it.

The nine boards support a coherent family language. Their cooling, storm resilience, dimensional, coral-growth and ecological-benefit captions remain unvalidated. No preview render or browser GLB was verified during this review; conformance of the current Blender execution is **UNVERIFIABLE**. The observations below concern the reference boards and construction brief.

## Family checks

| Family | Preserve | Readability check |
|---|---|---|
| NODAL / RIDGE | Broad, low asymmetric arch; branching feet; sheltered compute core | Low profile and open core window remain recognizable from side and oblique views. |
| NODAL / CANYON | Vertical open lattice; layered negative space; protected computing spine | Tall silhouette remains distinct from RIDGE even at network overview size. |
| NODAL / CONNECTOR | Elongated tapered span; branching endpoints; protected service/conduit route | Reads as connection architecture, with an open longitudinal passage. |
| NODAL / ATOL | Low wide surface canopy; organic branching continuity; technical mast | Waterline, surface position and umbilical read before small equipment details. |

ATOL v2 has stronger continuity with the porous organic family than v1. Treat that as a review observation; the human selects the reference and approves the resulting silhouette. Preserve the existing construction method and proportions pending that review.

**Reference conflict:** Some boards illustrate computing equipment in CONNECTOR. The frozen network and maquette brief explicitly assume no CONNECTOR compute cartridges. Keep the contract's conduit/service interpretation. If existing geometry conflicts, report it to the human; these notes do not authorize deletion or replacement.

## Material and light consistency

- Keep the existing `NODAL_Bone` material (#E6DDC8, roughness 0.62, dielectric) shared across shells. It is architecture material, distinct from UI bone-white text.
- Keep `NODAL_CoreMetal` dark enough to distinguish technical inserts; use enough neutral fill to reveal their shape through shell openings.
- Existing cyan coolant/cable emission may identify technical detail. It must not imply measured temperature, flow, energy output or active connectivity.
- Retain coral/biofilm omission from the maquette brief. Do not add vegetation or time-lapse growth as a polish shortcut.
- Use the brief's naturalistic key and navy ambient for previews. Avoid heavy underwater fog or crushed shadows that hide openings. The GLB remains ambient-neutral; Cursor owns application lights.
- Do not vary material color by alleged environmental health. Selection belongs to a clear interface marker plus label.

## Camera and labels

Start with a stable elevated three-quarter network view that includes ATOL and all six underwater units. Keep shell silhouettes separated in projection; preserve space for the assessment panel. Adjust the camera before proposing changes to shared positions. Offer one closer inspection view for selected RIDGE/CANYON, with a visible return to network view. Automatic orbit is unnecessary.

Preview review can use the existing front/side/top black-on-white silhouette strip plus one neutral material view. Check at the approximate browser display size. If a silhouette or core disappears at that size, resolve with framing/light first and report any geometry concern for human approval.

Display exact IDs with human-readable family names: `RIDGE_01 · NODAL / RIDGE`. Do not substitute display nicknames for IDs in selection, export or debugging. Mesh parents use `NODE__<id>`; selectable child meshes resolve to that parent. Provide a DOM list in the app so selection remains usable without a GLB or mouse picking.

## Frozen scene contract

Coordinates are hypothetical meters, Y-up in the shared contract; Blender's Z-up conversion must preserve the exported scene. Negative Y represents an arbitrary underwater plane, with no surveyed Miami location. Preserve node IDs, types, positions and endpoints.

| Entity | Position [X, Y, Z] | Export parent |
|---|---|---|
| ATOL_01 | [0, 0, 0] | NODE__ATOL_01 |
| JUNCTION_01 | [0, −12, 0] | NODE__JUNCTION_01 |
| RIDGE_01 | [−18, −12, 4] | NODE__RIDGE_01 |
| CONNECTOR_01 | [−9, −12, 2] | NODE__CONNECTOR_01 |
| CANYON_01 | [0, −12, −2] | NODE__CANYON_01 |
| CONNECTOR_02 | [10, −12, −1] | NODE__CONNECTOR_02 |
| RIDGE_02 | [20, −12, 2] | NODE__RIDGE_02 |
| CANYON_02 | [4, −12, 15] | NODE__CANYON_02 |

The six underwater units are two RIDGE, two CANYON and two CONNECTOR. JUNCTION is supporting infrastructure, separate from that six-unit count.

Exact links: `ATOL_01 → JUNCTION_01` (UMBILICAL); `JUNCTION_01 → CANYON_01`; `RIDGE_01 → CONNECTOR_01`; `CONNECTOR_01 → CANYON_01`; `CANYON_01 → CONNECTOR_02`; `CONNECTOR_02 → RIDGE_02`; `CANYON_01 → CANYON_02` (all remaining links POWER_DATA). Link visibility conveys the conceptual topology, not measured transmission.

## Smallest useful delivery

Continue the existing export to `visualization/exports/nodal_scene.glb`, with units/axis, IDs, size/polycount and issues in `EXPORT_NOTES.md`. Cursor handles copying and app integration. Preserve fallback network selection until GLB loading and picking work. If time is short, prioritize recognizable family silhouettes and correct IDs over fine surface detail.

**Human creative approval:** final exterior silhouettes; ATOL reference preference; any proposed divergence from the four family signatures. Readability, lighting and export checks can proceed within Claude's existing scope.
