# nodal_scene.glb — export notes

**Conceptual architecture, not a validated engineering model.** Forms, sizes and the coolant/solar/wind elements are visual storytelling. No structural, hydrodynamic, thermal, mooring or ecological claim is made or implied.

| | |
|---|---|
| File | `visualization/exports/nodal_scene.glb` |
| Size / tris | 4.87 MB · ~270k triangles · 32 meshes · no textures, no UVs |
| Compression | none (no Draco / meshopt) → plain `GLTFLoader`, no decoder needed |
| Extensions | `KHR_materials_emissive_strength` (three.js r150+) |
| Units | metres, 1:1 with `shared/network.json` |
| Axis | glTF +Y up. NODE translations equal network.json `position` exactly; Y-rotation equals `rotationYDeg` |
| Built | Blender 5.1.2, headless, 2026-10-10 |
| Regenerate | `Blender -b --factory-startup -P visualization/scripts/nodal_generate.py -- --stage network` (~12 s) |
| Validate | `python3 visualization/scripts/validate_glb.py` → `ALL CHECKS PASSED` |

## Scene graph (selection contract)

Every selectable unit is an empty parent named `NODE__<id>` with child meshes `<id>__<part>`. **Raycast any mesh → walk `.parent` until `name.startsWith("NODE__")`.**

| Parent | Children | `userData` (glTF extras) |
|---|---|---|
| `NODE__RIDGE_01`, `NODE__RIDGE_02` | `__shell`, `__core`, `__coolant` | `nodeId`, `nodeType`, `label`, `provenance`, `simulatedWorkloadPct`, `networkPosition` |
| `NODE__CANYON_01`, `NODE__CANYON_02` | `__shell`, `__core`, `__coolant` | same |
| `NODE__CONNECTOR_01`, `NODE__CONNECTOR_02` | `__shell`, `__conduit` (no compute; per network.json notes) | same |
| `NODE__ATOL_01` | `__shell`, `__solar`, `__tech`, `__wind_blades`, `__beacon` | same, minus workload |
| `NODE__JUNCTION_01` | `__shell`, `__core`, `__status` | same, minus workload |
| `GROUP__LINKS` | `LINK__<source>__<target>` × 7 | `source`, `target`, `kind` (`UMBILICAL` / `POWER_DATA`), `provenance` |
| `GROUP__ENV` | `ENV__SEABED` (optional, illustrative, **not bathymetry**) | `note` |

Names contain only `[A-Z0-9_]` → unchanged by three.js `sanitizeNodeName`.

```js
// three.js picking sketch
const hit = raycaster.intersectObjects(scene.children, true)[0];
let o = hit?.object; while (o && !o.name.startsWith('NODE__')) o = o.parent;
if (o) select(o.userData.nodeId);          // e.g. "RIDGE_01"
scene.getObjectByName('ENV__SEABED').visible = false;   // if the app has its own floor
```

Exclude `ENV__SEABED` (and optionally `LINK__*`) from the raycast list so clicks land on nodes.

## Materials (flat PBR, all double-sided)
`NODAL_Bone` #E6DDC8 shells/blades · `NODAL_CoreMetal` #2A3036 cores/mast/keel · `NODAL_Coolant` emissive #4FD1D9 (matches UI cyan token) · `NODAL_Cable` dark + dim cyan emission · `NODAL_Solar` #14243A · `NODAL_Beacon` emissive · `NODAL_Seabed` #4C5A5C. Retint in-app freely; nothing is baked.

## Scene layout
Seabed plane at y = −12 (node ground contact). ATOL waterline at y = 0; keel to y ≈ −1.85, mast top ≈ +7.3. Measured shell AABBs (L × W × H): RIDGE 7.5 × 4.2 × 2.7 m · CANYON 7.8 × 5.5 × 8.35 m (CANYON_02 0.86-height variant, 7.2 m) · CONNECTOR 11.0 × 4.8 × 3.1 m incl. arms · ATOL 12.3 × 12.8 m plan incl. tendrils.

## Known issues
- `JUNCTION_01` sits 2 m from `CANYON_01` (frozen positions), inside the canyon's root spread. Both remain individually pickable; a CANYON root passes close to the junction.
- RIDGE_02 / CONNECTOR_02 are mirrored, re-seeded variants of RIDGE_01 / CONNECTOR_01 — deliberately not identical.
- Shells are decimated voxel remeshes: occasional faceting on thin tendril tips at very close zoom.
- No lights, cameras, animation or water surface in the GLB — the app owns those.
- Coral / biofilm intentionally omitted (would read as a restoration claim).
- Exterior silhouettes are **PROPOSED** pending the designer's approval (see `visualization/BRIEF.md`).

Claude Code does not copy this file into `web/`; the web owner copies it to `web/public/models/nodal_scene.glb` when ready and keeps the fallback until picking is verified.
