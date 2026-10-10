# NODAL — Maquette construction brief (run one)

Status: PROPOSED · Owner: Claude Code (visualization/**) · 2026-10-10
Conceptual architecture — not a validated engineering model.

## Intake
- **Still or motion:** motion. Interactive browser GLB, orbiting camera → silhouette tiering collapses; every part is read from every side. Preview renders are frames of that.
- **Baseline:** run one. Baseline = reference boards in `references/` (dims read off the boards, themselves illustrative). Every proportion below is `PROPOSED` until Lucho approves silhouettes.
- **Shape line vs do-not:** no split. "Organic cybersigilism, porous bone shell" vs "no domes / spheres / pod cylinders as exterior". Internal compute cylinders are allowed (HANDOFF §2).

## Axes
```
SHAPE:   proportional (faithful to board silhouettes)
SURFACE: real-PBR, flat-valued (no textures — browser budget)
LIGHT:   ambient-neutral in GLB (app owns lights); preview = naturalistic key + navy ambient
SCALE:   real-world, 1 BU = 1 m, positions from shared/network.json
```
Pipeline: EEVEE previews, AgX; silhouette check = Workbench black-on-white ortho. No outlines. No `edges` masks → no Cycles requirement.

## Construction method (all families)
`skeleton curves (Catmull-Rom) + tapered tube members` + `Voronoi-dual strut web on a parametric shell surface` → joined → **voxel remesh (fuse)** → smooth (bone fillets) → decimate to budget. Windows = culled web cells framed by rim loops. Internal cores = primitive cylinders (rigid, separate objects).

| part | method | dims L×W×H m (±10%) | tri budget | tier |
|---|---|---|---|---|
| RIDGE shell | skeleton + web + remesh | 6.5 × 4.2 × 2.4 (horn tip) | 30k | hero |
| RIDGE core | primitives | 2.4 × Ø0.92 horizontal | 3k | support |
| CANYON shell | skeleton + cylindrical web + remesh | 6.0 × 5.0 × 8.4 | 40k | hero |
| CANYON core | primitives, vertical stack | Ø1.16 × 4.4 | 4k | support |
| CONNECTOR shell | spine tube-web + arms + remesh | 9.0 × 3.6 × 2.7 (horn) | 30k | hero |
| CONNECTOR conduit | curve tube | along spine | 1.5k | support |
| ATOL shell | hull ring + polar canopy web + sigil arms | Ø ~14 (arms) × 2.7 canopy | 40k | hero |
| ATOL tech (mast, VAWT, solar, keel) | primitives + curve tubes | mast top +6.8 m | 8k | support |
| JUNCTION | plinth + bone roots | Ø3.2 × 1.0 | 4k | support |
| LINKS | curve tubes on seabed / umbilical | per network.json | 1k each | support |
| ENV__SEABED | displaced grid | 64 × 48 | 5k | texture |

Silhouette signatures (the checks):
- **RIDGE** — side: long low tail (−X) rising along a concave sweep to an asymmetric crest at ~+0.25L with a free horn tip overhanging; steeper rear with splayed feet. Top: elongated pointed star, 3 vs 2 side legs (asymmetric). Front: tent with splayed toes. Core visible through side window.
- **CANYON** — tall lattice tower, waist + upper bulge, helical twist, 4 ring windows, 5 sweeping buttress roots, 4 unequal crown spires.
- **CONNECTOR** — two arches + valley, Y-branching arms at both ends, centre legs, one raised horn; lattice tube enclosing a cable conduit (no compute — per network.json notes).
- **ATOL** — trilobed buoyancy ring at waterline, concave (tent, not dome) canopy, 3 solar petals on lobes, 3 sigil tendrils at waists, 3 vertical-axis turbines (optional wind), technical mast, keel + umbilical.

## Materials (Patina table — flat PBR, no masks)
| name | objects | substrate | values | note |
|---|---|---|---|---|
| NODAL_Bone | *__shell, turbine blades, junction roots | conceptual marine composite (dielectric) | base #E6DDC8, rough 0.62, metal 0 | "bone-white" from boards |
| NODAL_CoreMetal | *__core, mast, keel, plinth | dark coated metal | base #2A3036, rough 0.38, metal 0.85 | |
| NODAL_Coolant | coolant bands | emissive accent | base #0B3A40, emit #4FD1D9 ×1.6 | reads through holes; matches UI cyan |
| NODAL_Solar | ATOL petals | glass-on-cell | base #14243A, rough 0.18, metal 0.3 | |
| NODAL_Cable | LINK__*, conduit | polymer jacket | base #1B2124, rough 0.5, emit #4FD1D9 ×0.35 | data/power links legible in dark |
| NODAL_Beacon | ATOL beacon | emissive | emit #F1F1E9 ×3 | |
| NODAL_Seabed | ENV__SEABED | sediment | base #4C5A5C, rough 1.0 | optional, hideable |

Coral/biofilm: **omitted** (texture tier; would read as a restoration claim).

## Gate
Ridge silhouette strip (front/side/top) compared to `ridge_connector_master.png`, `modular_compute_reef.png`, `ecosystem_overview.png` before network expansion. Final exterior silhouette approval = Lucho.
