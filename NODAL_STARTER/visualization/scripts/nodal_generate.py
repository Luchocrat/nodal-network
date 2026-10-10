"""
NODAL procedural generator — CONCEPTUAL ARCHITECTURE, not a validated engineering model.

Method (all families):
  controlled branching curves (Catmull-Rom) -> tapered tube members
  + Voronoi-dual strut web sampled on a parametric shell surface (Poisson darts + Delaunay)
  -> joined -> voxel remesh (fuses members) -> smooth (bone fillets) -> decimate to budget.
Internal compute cores are primitive cylinders (allowed internally per HANDOFF §2).

Run from NODAL_STARTER/:
  /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup \
      -P visualization/scripts/nodal_generate.py -- --stage ridge
  /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup \
      -P visualization/scripts/nodal_generate.py -- --stage network

Coordinates: shared/network.json is Y-up [x, y, z] metres. Blender is Z-up:
  blender = (x, -z, y);  glTF exporter (+Y up) maps it back to (x, y, z) exactly.
  rotationYDeg -> Blender rotation_euler.z (same sign after export).
"""
import bpy, bmesh, math, random, sys, os, json, time
from mathutils import Vector, Matrix, noise
from mathutils.geometry import delaunay_2d_cdt


# ----------------------------------------------------------------------------- paths / args
def _script_path():
    try:
        return os.path.abspath(__file__)
    except NameError:
        for flag in ("-P", "--python"):
            if flag in sys.argv:
                return os.path.abspath(sys.argv[sys.argv.index(flag) + 1])
    raise RuntimeError("cannot resolve script path")


SCRIPT = _script_path()
VIS = os.path.dirname(os.path.dirname(SCRIPT))
ROOT = os.path.dirname(VIS)
NETWORK_JSON = os.path.join(ROOT, "shared", "network.json")
OUT_BLEND = os.path.join(VIS, "blender")
OUT_PREV = os.path.join(VIS, "previews")
OUT_EXP = os.path.join(VIS, "exports")
for d in (OUT_BLEND, OUT_PREV, OUT_EXP):
    os.makedirs(d, exist_ok=True)

ARGV = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
STAGE = ARGV[ARGV.index("--stage") + 1] if "--stage" in ARGV else "network"
NO_RENDER = "--no-render" in ARGV

T0 = time.time()


def log(*a):
    print(f"[nodal {time.time() - T0:6.1f}s]", *a, flush=True)


# ----------------------------------------------------------------------------- math helpers
def keyed(keys, t):
    """Smoothstep interpolation through sorted (t, value) keys."""
    if t <= keys[0][0]:
        return keys[0][1]
    for (t0, v0), (t1, v1) in zip(keys, keys[1:]):
        if t <= t1:
            f = (t - t0) / (t1 - t0) if t1 > t0 else 0.0
            f = f * f * (3 - 2 * f)
            return v0 + (v1 - v0) * f
    return keys[-1][1]


def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def wrap_pi(a):
    return (a + math.pi) % (2 * math.pi) - math.pi


def _cr(p0, p1, p2, p3, t):
    t2, t3 = t * t, t * t * t
    return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2
                  + (-p0 + 3 * p1 - 3 * p2 + p3) * t3)


def catmull(ctrl, per=12, closed=False):
    P = [Vector(p) for p in ctrl]
    if len(P) == 2 and not closed:
        return [P[0].lerp(P[1], i / per) for i in range(per + 1)]
    out = []
    if closed:
        E = [P[-1]] + P + [P[0], P[1]]
        for i in range(1, len(P) + 1):
            for k in range(per):
                out.append(_cr(E[i - 1], E[i], E[i + 1], E[i + 2], k / per))
        out.append(P[0].copy())
    else:
        E = [P[0] * 2 - P[1]] + P + [P[-1] * 2 - P[-2]]
        for i in range(1, len(E) - 2):
            for k in range(per):
                out.append(_cr(E[i - 1], E[i], E[i + 1], E[i + 2], k / per))
        out.append(P[-1].copy())
    return out


def resample(pts, step):
    L = [0.0]
    for a, b in zip(pts, pts[1:]):
        L.append(L[-1] + (b - a).length)
    total = L[-1]
    n = max(2, int(math.ceil(total / step)) + 1)
    out, j = [], 0
    for i in range(n):
        s = total * i / (n - 1)
        while j < len(L) - 2 and L[j + 1] < s:
            j += 1
        seg = L[j + 1] - L[j]
        f = (s - L[j]) / seg if seg > 1e-9 else 0.0
        out.append(pts[j].lerp(pts[j + 1], f))
    return out


def path(ctrl, step=0.07, closed=False):
    pts = resample(catmull(ctrl, 12, closed), step)
    if closed:
        pts = pts[:-1]
    return pts


def nz(p, s=1.0, off=0.0):
    return noise.noise(Vector((p[0] * s + off, p[1] * s - off, p[2] * s + 0.37 * off)))


# ----------------------------------------------------------------------------- mesh builder
class MB:
    def __init__(self):
        self.bm = bmesh.new()

    def tube(self, pts, radii, sides=8, cap=True, closed=False, flat=(1.0, 1.0), hint=None):
        n = len(pts)
        if n < 2:
            return
        bm = self.bm
        T = []
        for i in range(n):
            if closed:
                t = pts[(i + 1) % n] - pts[(i - 1) % n]
            elif i == 0:
                t = pts[1] - pts[0]
            elif i == n - 1:
                t = pts[-1] - pts[-2]
            else:
                t = pts[i + 1] - pts[i - 1]
            T.append(t.normalized() if t.length > 1e-9 else Vector((1, 0, 0)))
        ref = Vector(hint) if hint is not None else Vector((0, 0, 1))
        if abs(ref.normalized().dot(T[0])) > 0.95:
            ref = Vector((1, 0, 0)) if abs(T[0].x) < 0.9 else Vector((0, 1, 0))
        N = (ref - T[0] * ref.dot(T[0])).normalized()
        angs = [2 * math.pi * k / sides for k in range(sides)]
        rings = []
        for i in range(n):
            if i > 0:
                ax = T[i - 1].cross(T[i])
                if ax.length > 1e-9:
                    N = Matrix.Rotation(T[i - 1].angle(T[i]), 3, ax.normalized()) @ N
                N = (N - T[i] * N.dot(T[i])).normalized()
            B = T[i].cross(N)
            r = max(radii[i], 0.003)
            rings.append([bm.verts.new(pts[i] + N * (math.cos(a) * r * flat[0])
                                       + B * (math.sin(a) * r * flat[1])) for a in angs])
        segs = n if closed else n - 1
        for i in range(segs):
            r0, r1 = rings[i], rings[(i + 1) % n]
            for k in range(sides):
                k2 = (k + 1) % sides
                bm.faces.new((r0[k], r0[k2], r1[k2], r1[k]))
        if cap and not closed:
            bm.faces.new(list(reversed(rings[0])))
            bm.faces.new(rings[-1])

    def member(self, ctrl, rkeys, step=0.06, sides=8, closed=False, flat=(1.0, 1.0), hint=None):
        pts = path(ctrl, step, closed)
        n = len(pts)
        if isinstance(rkeys, (int, float)):
            radii = [float(rkeys)] * n
        else:
            radii = [keyed(rkeys, i / (n - 1)) for i in range(n)]
        self.tube(pts, radii, sides, True, closed, flat, hint)
        return pts

    def ico(self, p, r, subdiv=1):
        bmesh.ops.create_icosphere(self.bm, subdivisions=subdiv, radius=r,
                                   matrix=Matrix.Translation(p))

    def cyl(self, p0, p1, r0, r1=None, segs=20):
        p0, p1 = Vector(p0), Vector(p1)
        ax = p1 - p0
        rot = ax.normalized().to_track_quat('Z', 'Y').to_matrix().to_4x4()
        M = Matrix.Translation((p0 + p1) / 2) @ rot
        bmesh.ops.create_cone(self.bm, cap_ends=True, cap_tris=False, segments=segs,
                              radius1=r0, radius2=r0 if r1 is None else r1,
                              depth=ax.length, matrix=M)

    def box(self, c, size, rotz=0.0):
        M = (Matrix.Translation(Vector(c)) @ Matrix.Rotation(rotz, 4, 'Z')
             @ Matrix.Diagonal((size[0], size[1], size[2], 1.0)))
        bmesh.ops.create_cube(self.bm, size=1.0, matrix=M)

    def transform(self, M, flips_handedness=False):
        bmesh.ops.transform(self.bm, matrix=M, verts=self.bm.verts[:])
        if flips_handedness:
            bmesh.ops.reverse_faces(self.bm, faces=self.bm.faces[:])


# ----------------------------------------------------------------------------- strut web
def surface_web(mapf, urange, vrange, rfun, seed, metric=(1.0, 1.0), period=None,
                cull=None, snap=None, tries=24000, edge_factor=2.6, aniso=(1.0, 1.0, 1.0)):
    """Poisson darts on a parametric surface -> Delaunay in (u,v) -> dual graph (Voronoi-like).
    aniso < 1 on an axis stretches cells along it (flow-aligned holes).
    Returns dual vertex uv list and dual edges (index pairs)."""
    rng = random.Random(seed)
    A = Vector(aniso)

    def scaled(q):  # spacing metric only; rfun/cull always see real coordinates
        return Vector((q.x * A.x, q.y * A.y, q.z * A.z))

    rmax = 0.0
    for i in range(14):
        for j in range(14):
            u = urange[0] + (urange[1] - urange[0]) * i / 13
            v = vrange[0] + (vrange[1] - vrange[0]) * j / 13
            rmax = max(rmax, rfun(u, v, mapf(u, v)))
    cell = rmax
    grid, UV, P, R = {}, [], [], []
    for _ in range(tries):
        u, v = rng.uniform(*urange), rng.uniform(*vrange)
        q = mapf(u, v)
        r = rfun(u, v, q)
        p = scaled(q)
        k = (math.floor(p.x / cell), math.floor(p.y / cell), math.floor(p.z / cell))
        ok = True
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                for dz in (-1, 0, 1):
                    for j in grid.get((k[0] + dx, k[1] + dy, k[2] + dz), ()):
                        if (P[j] - p).length < 0.5 * (r + R[j]):
                            ok = False
                            break
                    if not ok:
                        break
                if not ok:
                    break
            if not ok:
                break
        if ok:
            grid.setdefault(k, []).append(len(P))
            UV.append((u, v)); P.append(p); R.append(r)

    coords, src = [], []
    for i, (u, v) in enumerate(UV):
        coords.append(Vector((u * metric[0], v * metric[1]))); src.append(i)
    if period:
        margin = 3.5 * rmax / metric[0]
        for i, (u, v) in enumerate(UV):
            if u < urange[0] + margin:
                coords.append(Vector(((u + period) * metric[0], v * metric[1]))); src.append(i)
            if u > urange[1] - margin:
                coords.append(Vector(((u - period) * metric[0], v * metric[1]))); src.append(i)
    res = delaunay_2d_cdt(coords, [], [], 0, 1e-7)
    ocoords, ofaces, overts = res[0], res[2], res[3]
    canon = [src[ov[0]] if len(ov) else -1 for ov in overts]

    faces = []
    for f in ofaces:
        if len(f) != 3 or any(canon[i] < 0 for i in f):
            continue
        cu = sum(ocoords[i].x for i in f) / 3 / metric[0]
        cv = sum(ocoords[i].y for i in f) / 3 / metric[1]
        if period and not (urange[0] <= cu < urange[0] + period):
            continue
        ids = [canon[i] for i in f]
        rr = sum(R[i] for i in ids) / 3
        if any((P[ids[a]] - P[ids[(a + 1) % 3]]).length > edge_factor * rr for a in range(3)):
            continue
        faces.append((ids, cu, cv))

    edge_faces = {}
    for fi, (ids, cu, cv) in enumerate(faces):
        for a in range(3):
            edge_faces.setdefault(tuple(sorted((ids[a], ids[(a + 1) % 3]))), []).append(fi)
    DV = [(cu, cv) for ids, cu, cv in faces]
    alive = [True] * len(DV)
    if cull:
        for i, (u, v) in enumerate(DV):
            if cull(u, v, mapf(u, v)):
                alive[i] = False
    DE = [tuple(fs) for fs in edge_faces.values() if len(fs) == 2]
    while True:  # prune dangling struts (no arbitrary spikes)
        deg = [0] * len(DV)
        for a, b in DE:
            if alive[a] and alive[b]:
                deg[a] += 1; deg[b] += 1
        changed = False
        for i in range(len(DV)):
            if alive[i] and deg[i] <= 1:
                alive[i] = False; changed = True
        if not changed:
            break
    if snap:
        DV = [snap(u, v) if alive[i] else (u, v) for i, (u, v) in enumerate(DV)]
    edges = [(a, b) for a, b in DE if alive[a] and alive[b]]
    log(f"  web: {len(P)} seeds, {sum(alive)} dual verts, {len(edges)} struts")
    return DV, edges


def add_web(mb, mapf, DV, edges, strut_r, period=None, knuckle=1.3):
    used = set()
    for a, b in edges:
        (u1, v1), (u2, v2) = DV[a], DV[b]
        if period and abs(u1 - u2) > period / 2:
            if u1 < u2:
                u1 += period
            else:
                u2 += period
        p1, pm, p2 = mapf(*DV[a]), mapf((u1 + u2) / 2, (v1 + v2) / 2), mapf(*DV[b])
        if (p1 - p2).length < 1e-4:
            continue
        r1, r2 = strut_r(p1), strut_r(p2)
        mb.tube([p1, pm, p2], [r1, 0.46 * (r1 + r2), r2], sides=6)
        used.add(a); used.add(b)
    placed = {}
    for i in used:  # one knuckle per location — snapped verts would otherwise stack into blobs
        p = mapf(*DV[i])
        key = (round(p.x / 0.09), round(p.y / 0.09), round(p.z / 0.09))
        if key in placed:
            continue
        placed[key] = True
        mb.ico(p, strut_r(p) * knuckle)


def ellipse_q(u, v, w):
    """w = (u0, v0, ru, rv); returns normalised radius (1.0 on the rim)."""
    return math.sqrt(((u - w[0]) / w[2]) ** 2 + ((v - w[1]) / w[3]) ** 2)


# ----------------------------------------------------------------------------- materials
def lin(h):
    h = h.lstrip('#')
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)


MATS = {
    "NODAL_Bone":      dict(base="#E6DDC8", rough=0.62, metal=0.0),
    "NODAL_CoreMetal": dict(base="#2A3036", rough=0.38, metal=0.85),
    "NODAL_Coolant":   dict(base="#0B3A40", rough=0.30, metal=0.2, emit="#4FD1D9", es=1.6),
    "NODAL_Solar":     dict(base="#14243A", rough=0.18, metal=0.3),
    "NODAL_Cable":     dict(base="#1B2124", rough=0.50, metal=0.1, emit="#4FD1D9", es=0.35),
    "NODAL_Beacon":    dict(base="#F1F1E9", rough=0.40, metal=0.0, emit="#F1F1E9", es=3.0),
    "NODAL_Seabed":    dict(base="#4C5A5C", rough=1.00, metal=0.0),
}


def mat(name):
    m = bpy.data.materials.get(name)
    if m:
        return m
    spec = MATS[name]
    m = bpy.data.materials.new(name)
    try:
        m.use_nodes = True
    except Exception:
        pass
    bsdf = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    bsdf.inputs['Base Color'].default_value = (*lin(spec["base"]), 1.0)
    bsdf.inputs['Roughness'].default_value = spec["rough"]
    bsdf.inputs['Metallic'].default_value = spec["metal"]
    if spec.get("emit"):
        bsdf.inputs['Emission Color'].default_value = (*lin(spec["emit"]), 1.0)
        bsdf.inputs['Emission Strength'].default_value = spec["es"]
    m.diffuse_color = (*lin(spec["base"]), 1.0)
    m.use_backface_culling = False
    return m


# ----------------------------------------------------------------------------- object helpers
def coll(name):
    c = bpy.data.collections.get(name)
    if not c:
        c = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(c)
    return c


def tri_count(ob):
    return sum(len(p.vertices) - 2 for p in ob.data.polygons)


def bake_mods(ob, mods):
    for typ, settings in mods:
        m = ob.modifiers.new(typ.lower(), typ)
        for k, v in settings.items():
            setattr(m, k, v)
    dg = bpy.context.evaluated_depsgraph_get()
    new = bpy.data.meshes.new_from_object(ob.evaluated_get(dg), depsgraph=dg)
    old = ob.data
    ob.modifiers.clear()
    ob.data = new
    new.name = ob.name
    bpy.data.meshes.remove(old)


def to_object(name, mb, material, collection, parent=None, smooth=True):
    me = bpy.data.meshes.new(name)
    bmesh.ops.remove_doubles(mb.bm, verts=mb.bm.verts[:], dist=1e-5)
    mb.bm.to_mesh(me)
    mb.bm.free()
    ob = bpy.data.objects.new(name, me)
    collection.objects.link(ob)
    if parent:
        ob.parent = parent
    me.materials.append(mat(material))
    if smooth:
        me.shade_smooth()
    return ob


def organic(name, mb, collection, parent=None, voxel=0.024, target=30000,
            smooth_iter=6, smooth_fac=0.6, material="NODAL_Bone"):
    """Fuse all members: voxel remesh -> smooth -> decimate. The core of the look."""
    me = bpy.data.meshes.new(name)
    mb.bm.to_mesh(me)
    mb.bm.free()
    ob = bpy.data.objects.new(name, me)
    collection.objects.link(ob)
    if parent:
        ob.parent = parent
    raw = len(me.polygons)
    bake_mods(ob, [('REMESH', dict(mode='VOXEL', voxel_size=voxel, adaptivity=0.0)),
                   ('SMOOTH', dict(factor=smooth_fac, iterations=smooth_iter))])
    fused = tri_count(ob)
    if fused > target:
        bake_mods(ob, [('DECIMATE', dict(decimate_type='COLLAPSE', ratio=target / fused))])
    ob.data.materials.append(mat(material))
    ob.data.shade_smooth()
    log(f"  {name}: raw {raw} faces -> remesh {fused} tris -> {tri_count(ob)} tris")
    return ob


def node_empty(node_id, ntype, label, loc, rot_deg, collection, extra=None):
    e = bpy.data.objects.new(f"NODE__{node_id}", None)
    e.empty_display_type = 'PLAIN_AXES'
    e.empty_display_size = 1.0
    e.location = loc
    e.rotation_euler = (0.0, 0.0, math.radians(rot_deg))
    e["nodeId"] = node_id
    e["nodeType"] = ntype
    e["label"] = label
    e["provenance"] = "CONCEPTUAL - illustrative architecture, not a validated engineering model"
    for k, v in (extra or {}).items():
        e[k] = v
    collection.objects.link(e)
    return e


def net_to_blender(p):
    x, y, z = p
    return Vector((x, -z, y))


# ============================================================================= RIDGE
RIDGE_HW = [(-3.1, 0.2), (-2.2, 0.75), (-1.2, 1.35), (0.2, 1.85), (1.3, 1.75), (2.2, 1.25),
            (2.8, 0.7), (3.05, 0.38)]
RIDGE_H = [(-3.1, 0.08), (-2.3, 0.3), (-1.5, 0.62), (-0.6, 1.0), (0.2, 1.35), (0.9, 1.55),
           (1.6, 1.5), (2.3, 1.15), (2.8, 0.7), (3.1, 0.35)]
RIDGE_HEM = (0.93, -0.92)
# (u0, v0, ru, rv): elongated low slits, offset in x so the plan never reads as a face
RIDGE_WIN = [(0.4, 0.66, 1.05, 0.17), (0.1, -0.6, 0.65, 0.16)]


def ridge_surface(u, v):
    hw = keyed(RIDGE_HW, u) * (1.08 if v > 0 else 0.95)
    H = keyed(RIDGE_H, u)
    z = H * max(0.0, 1.0 - abs(v) ** 2.4) ** 0.62  # fuller shoulder than a tent
    return Vector((u, 0.15 * u / 3.0 + v * hw, z))


def build_ridge(prefix, parent, collection, seed=11, mirror=False):
    """Low-profile asymmetric computing habitat. Local +X = long axis, origin at ground centre.
    Side read: long low tail -> concave ramp -> hooked fin crest (~45% L) -> lower rear hump."""
    log(f"RIDGE {prefix} seed={seed} mirror={mirror}")
    m = ridge_surface
    shell = MB()

    # -- fin leading edge: tail tendril -> concave ramp -> tip leaning back over the ramp
    shell.member([(-3.55, -0.05, 0.03), (-2.6, 0.0, 0.26), (-1.7, 0.05, 0.6), (-0.9, 0.1, 1.02),
                  (-0.3, 0.14, 1.5), (0.1, 0.16, 2.0), (0.32, 0.15, 2.4), (0.27, 0.12, 2.68)],
                 [(0, 0.025), (0.12, 0.1), (0.45, 0.2), (0.7, 0.22), (0.88, 0.14), (1, 0.012)])
    # -- fin trailing edge drops steeply into the rear hump, then the hump ridge runs out as a tendril
    shell.member([(0.33, 0.15, 2.45), (0.55, 0.18, 2.05), (0.85, 0.2, 1.74), (1.2, 0.22, 1.62),
                  (1.9, 0.25, 1.45), (2.5, 0.28, 1.02), (3.0, 0.3, 0.45), (3.45, 0.32, 0.1),
                  (3.95, 0.33, 0.02)],
                 [(0, 0.11), (0.2, 0.16), (0.5, 0.15), (0.8, 0.1), (1, 0.012)])
    # -- fin openings: braces leave two negative spaces inside the blade
    shell.member([(-0.35, 0.14, 1.48), (0.15, 0.16, 1.75), (0.62, 0.19, 1.95)], [(0, 0.1), (1, 0.09)])
    shell.member([(0.12, 0.16, 2.05), (0.2, 0.17, 1.6), (0.3, 0.17, 1.3)], [(0, 0.08), (1, 0.1)])

    # -- hem ribs: clean swept lower edges (the arch line), ending as tail tendrils
    for v_h, toe in ((RIDGE_HEM[0], (-3.15, 0.62, 0.02)), (RIDGE_HEM[1], (-3.05, -0.8, 0.02))):
        pts = [toe] + [tuple(m(u, v_h)) for u in [-2.75 + 5.6 * i / 15 for i in range(16)]]
        shell.member(pts, [(0, 0.012), (0.08, 0.08), (0.5, 0.115), (0.95, 0.1), (1, 0.08)])

    # -- rear arch closing the shell at u=2.85
    shell.member([tuple(m(2.85, RIDGE_HEM[0] - (RIDGE_HEM[0] - RIDGE_HEM[1]) * i / 8)) for i in range(9)], 0.085)

    # -- window rims (where the protected core reads through)
    for w in RIDGE_WIN:
        loop = [tuple(m(w[0] + w[2] * math.cos(a), w[1] + w[3] * math.sin(a)))
                for a in [2 * math.pi * k / 18 for k in range(18)]]
        shell.member(loop, 0.075, closed=True)

    # -- arched legs: down the flank, knee bowed out, short pointed foot (2 + 2, staggered)
    legs = [(+1, -1.5, -0.4), (+1, 1.7, 0.3), (-1, -0.9, -0.35), (-1, 1.2, 0.35)]
    for side, x0, sweep in legs:
        pts = [m(x0 + sweep * t, side * t) for t in (0.15, 0.45, 0.72, 0.9)]
        ue = x0 + sweep
        out = Vector((sweep * 0.5, side, 0)).normalized()
        g = m(ue, side * 1.0)
        pts += [g + out * 0.22 + Vector((0, 0, 0.05)), g + out * 0.6 + Vector((0, 0, 0.015))]
        shell.member([tuple(p) for p in pts], [(0, 0.1), (0.45, 0.125), (0.75, 0.12), (1, 0.012)])

    # -- rear side branches -> star-pointed rear in plan
    for pts in ([(1.6, 0.4, 1.45), (2.3, 0.9, 1.0), (2.85, 1.3, 0.45), (3.2, 1.6, 0.08), (3.6, 1.85, 0.02)],
                [(1.5, 0.0, 1.45), (2.3, -0.6, 0.95), (2.8, -0.95, 0.4), (3.15, -1.15, 0.06), (3.55, -1.3, 0.02)]):
        shell.member(pts, [(0, 0.12), (0.6, 0.1), (0.85, 0.07), (1, 0.012)])

    # -- porous web between ribs; holes stretched along the flow axis (aniso x)
    def rfun(u, v, p):
        return 0.27 + 0.10 * clamp(p.z / 1.5) + 0.05 * nz(p, 0.9, seed)

    def cull(u, v, p):
        if v > RIDGE_HEM[0] + 0.02 or v < RIDGE_HEM[1] - 0.02 or u < -2.78 or u > 2.88:
            return True
        return any(ellipse_q(u, v, w) < 1.0 for w in RIDGE_WIN)

    def snap(u, v):
        for w in RIDGE_WIN:
            q = ellipse_q(u, v, w)
            if q < 1.35:
                return (w[0] + (u - w[0]) / q, w[1] + (v - w[1]) / q)
        if v > RIDGE_HEM[0] - 0.12:
            v = RIDGE_HEM[0]
        elif v < RIDGE_HEM[1] + 0.12:
            v = RIDGE_HEM[1]
        if u > 2.68:
            u = 2.85
        return (u, v)

    DV, E = surface_web(m, (-3.0, 3.0), (-1.0, 1.0), rfun, seed, metric=(0.62, 2.3),
                        cull=cull, snap=snap, tries=30000, aniso=(0.62, 1.0, 1.0), edge_factor=2.9)
    add_web(shell, m, DV, E, lambda p: 0.064 + 0.014 * nz(p, 1.4, seed + 3), knuckle=1.25)

    # -- protected compute core (internal; cylinders allowed) on a low service sled
    core, cool = MB(), MB()
    cy, cz, r = 0.1, 0.74, 0.40
    core.cyl((-0.75, cy, cz), (1.65, cy, cz), r, segs=24)
    for x in (-0.75, -0.15, 0.45, 1.05, 1.65):
        core.cyl((x - 0.035, cy, cz), (x + 0.035, cy, cz), 0.46, segs=24)
    for x in (-0.95, 1.85):
        core.cyl((x - 0.1, cy, cz), (x + 0.1, cy, cz), 0.24, segs=16)
    core.box((0.45, cy, 0.17), (2.1, 0.62, 0.34))
    for x in (-0.45, 0.75):
        cool.cyl((x - 0.2, cy, cz), (x + 0.2, cy, cz), 0.425, segs=24)

    if mirror:
        M = Matrix.Scale(-1.0, 4, (1, 0, 0))
        shell.transform(M)
        core.transform(M, True)
        cool.transform(M, True)
    nid = prefix
    objs = [organic(f"{nid}__shell", shell, collection, parent, voxel=0.022, target=30000),
            to_object(f"{nid}__core", core, "NODAL_CoreMetal", collection, parent),
            to_object(f"{nid}__coolant", cool, "NODAL_Coolant", collection, parent)]
    return objs


# ============================================================================= CANYON
CANYON_R = [(0.0, 2.2), (0.9, 1.8), (2.0, 1.35), (3.2, 1.3), (4.6, 1.65),
            (5.6, 1.45), (6.4, 1.0), (7.0, 0.75)]
CANYON_WIN = [(0.35, 2.4, 1.15), (2.6, 4.4, 1.0), (4.5, 2.9, 0.9), (1.4, 5.6, 0.7), (5.6, 5.1, 0.75)]


def canyon_axis(z):
    return Vector((0.35 * math.sin(z * 0.4), 0.2 * z / 7.0, z))


def canyon_surface(th, z):
    R = keyed(CANYON_R, z) * (1 + 0.16 * math.cos(th - 0.6) * min(1.0, z / 3.0)
                              + 0.10 * math.cos(2 * th + 1.1 + 0.4 * z))
    tw = th + 0.35 * z / 7.0
    c = canyon_axis(z)
    return Vector((c.x + 1.10 * R * math.cos(tw), c.y + 0.92 * R * math.sin(tw), z))


def build_canyon(prefix, parent, collection, seed=23, zscale=1.0):
    """Tall vertical habitat with a serviceable compute spine. Origin at ground centre."""
    log(f"CANYON {prefix} seed={seed} zscale={zscale}")
    m = canyon_surface
    shell = MB()
    TWO_PI = 2 * math.pi

    def outward(p, k):
        c = canyon_axis(p.z)
        return Vector((c.x + (p.x - c.x) * k, c.y + (p.y - c.y) * k, p.z))

    # base + crown rings
    for zr, rr in ((1.0, 0.1), (6.6, 0.085)):
        shell.member([tuple(m(TWO_PI * k / 28, zr)) for k in range(28)], rr, closed=True)

    # window rings (multiple ring openings)
    for th0, z0, rad in CANYON_WIN:
        Rl = keyed(CANYON_R, z0)
        loop = [tuple(m(th0 + rad * math.cos(a) / Rl, z0 + rad * math.sin(a)))
                for a in [TWO_PI * k / 18 for k in range(18)]]
        shell.member(loop, 0.08, closed=True)

    # buttress roots (5), leaving a gap toward local -Y for the seafloor junction
    legs = [(0.15, 3.0), (1.4, 2.6), (2.7, 3.3), (3.75, 2.4), (5.45, 2.8)]
    for thk, zs in legs:
        p0 = m(thk, zs)
        p1 = outward(m(thk + 0.12, zs * 0.62), 1.08)
        p2 = outward(m(thk + 0.2, 1.0), 1.25); p2.z = 0.75
        p3 = outward(m(thk + 0.25, 0.3), 1.5); p3.z = 0.16
        p4 = outward(m(thk + 0.3, 0.1), 1.62); p4.z = 0.03
        shell.member([tuple(p) for p in (p0, p1, p2, p3, p4)],
                     [(0, 0.12), (0.45, 0.16), (0.78, 0.12), (1, 0.015)])
        # meridional rib up to the crown
        rib = [tuple(m(thk + 0.55 * (z - zs) / (6.6 - zs), z)) for z in
               [zs + (6.6 - zs) * i / 8 for i in range(9)]]
        shell.member(rib, [(0, 0.12), (0.6, 0.1), (1, 0.085)])

    # crown spires (4, unequal)
    for ths, h in ((0.6, 7.6), (2.1, 8.4), (3.5, 7.2), (5.0, 6.95)):
        s0, s1 = m(ths, 6.1), m(ths, 6.6)
        s2 = outward(m(ths, 6.9), 1.12); s2.z = (6.9 + h) / 2
        s3 = outward(m(ths, 6.9), 1.32); s3.z = h
        shell.member([tuple(p) for p in (s0, s1, s2, s3)], [(0, 0.13), (0.4, 0.12), (1, 0.012)])

    def rfun(u, v, p):
        return 0.44 + 0.14 * clamp(p.z / 7) + 0.08 * nz(p, 0.8, seed)

    def win_q(u, v):
        best = (9.0, None)
        for w in CANYON_WIN:
            Rl = keyed(CANYON_R, w[1])
            q = math.hypot(wrap_pi(u - w[0]) * Rl, v - w[1]) / w[2]
            if q < best[0]:
                best = (q, w)
        return best

    def cull(u, v, p):
        return v < 0.97 or v > 6.63 or win_q(u, v)[0] < 1.0

    def snap(u, v):
        q, w = win_q(u, v)
        if q < 1.32:
            return (w[0] + wrap_pi(u - w[0]) / q, w[1] + (v - w[1]) / q)
        if v < 1.25:
            v = 1.0
        elif v > 6.35:
            v = 6.6
        return (u, v)

    DV, E = surface_web(m, (0.0, TWO_PI), (0.8, 6.9), rfun, seed, metric=(1.45, 0.72),
                        period=TWO_PI, cull=cull, snap=snap, tries=30000, aniso=(1.0, 1.0, 0.72),
                        edge_factor=3.0)
    add_web(shell, m, DV, E, lambda p: 0.072 + 0.016 * nz(p, 1.4, seed + 3), period=TWO_PI, knuckle=1.25)

    # vertical compute stack (internal)
    core, cool = MB(), MB()
    cx, cy = 0.08, 0.05
    core.cyl((cx, cy, 0.0), (cx, cy, 0.42), 0.85, segs=20)
    for z0 in (0.45, 1.75, 3.05):
        core.cyl((cx, cy, z0), (cx, cy, z0 + 1.2), 0.5, segs=24)
        cool.cyl((cx, cy, z0 + 0.44), (cx, cy, z0 + 0.76), 0.525, segs=24)
    for zf in (0.45, 1.7, 3.0, 4.3):
        core.cyl((cx, cy, zf - 0.035), (cx, cy, zf + 0.035), 0.57, segs=24)
    core.cyl((cx, cy, 4.3), (cx, cy, 4.65), 0.36, segs=16)
    core.cyl((cx, cy, 4.65), (cx, cy, 6.4), 0.07, segs=8)

    if zscale != 1.0:
        M = Matrix.Diagonal((1.0, 1.0, zscale, 1.0))
        for b in (shell, core, cool):
            b.transform(M)
    return [organic(f"{prefix}__shell", shell, collection, parent, voxel=0.024, target=40000),
            to_object(f"{prefix}__core", core, "NODAL_CoreMetal", collection, parent),
            to_object(f"{prefix}__coolant", cool, "NODAL_Coolant", collection, parent)]


# ============================================================================= CONNECTOR
CONN_SPINE = [(-4.3, 0.1, 0.04), (-3.5, 0.0, 0.5), (-2.4, -0.05, 1.2), (-1.3, 0.05, 1.32),
              (-0.25, 0.15, 0.82), (0.8, 0.1, 0.92), (1.95, -0.05, 1.5), (2.95, -0.1, 1.4),
              (3.75, 0.0, 0.65), (4.35, 0.1, 0.04)]
CONN_R = [(0, 0.2), (0.1, 0.55), (0.25, 0.8), (0.45, 0.5), (0.62, 0.85), (0.85, 0.6), (1, 0.2)]
CONN_HEM = math.asin(-0.04)  # hem just below the equator: arched half-shell, open beneath
CONN_WIN = [(0.6, 0.3, 0.45), (2.5, 0.7, 0.42), (1.6, 0.52, 0.3)]


def build_connector(prefix, parent, collection, seed=37, mirror=False):
    """Elongated branching network structure; protected cable passage, no compute cartridges."""
    log(f"CONNECTOR {prefix} seed={seed} mirror={mirror}")
    S = path(CONN_SPINE, 0.05)
    n = len(S)
    Z = Vector((0, 0, 1))
    L = sum((b - a).length for a, b in zip(S, S[1:]))

    def frame(s):
        f = clamp(s) * (n - 1)
        i = min(int(f), n - 2)
        a = f - i
        C = S[i].lerp(S[i + 1], a)
        T = (S[i + 1] - S[i]).normalized()
        Nh = T.cross(Z)
        Nh = Nh.normalized() if Nh.length > 1e-6 else Vector((0, 1, 0))
        return C, Nh, Nh.cross(T).normalized()

    def m(phi, s):
        C, Nh, U = frame(s)
        R = keyed(CONN_R, s)
        return C + Nh * (math.cos(phi) * R) + U * (math.sin(phi) * R * 0.78)

    TWO_PI = 2 * math.pi
    h1, h2 = math.pi + CONN_HEM, TWO_PI - CONN_HEM
    shell = MB()
    for ph in (h1, h2, 1.2, 1.95):
        shell.member([tuple(m(ph, 0.11 + 0.78 * i / 24)) for i in range(25)], 0.075 if ph in (h1, h2) else 0.065)
    for s_end in (0.11, 0.89):
        shell.member([tuple(m(-CONN_HEM + (h1 + CONN_HEM) * i / 12, s_end)) for i in range(13)], 0.08)
    for ph0, s0, rad in CONN_WIN:
        Rl = keyed(CONN_R, s0)
        loop = [tuple(m(ph0 + rad * math.cos(a) / Rl, s0 + rad * math.sin(a) / L))
                for a in [TWO_PI * k / 16 for k in range(16)]]
        shell.member(loop, 0.065, closed=True)

    arms = [
        [(-3.4, -0.45, 0.4), (-4.0, -1.1, 0.15), (-4.8, -1.7, 0.02), (-5.3, -1.95, 0.02)],
        [(-3.4, 0.45, 0.4), (-4.1, 1.05, 0.12), (-4.9, 1.5, 0.02), (-5.4, 1.65, 0.02)],
        [(3.7, -0.45, 0.45), (4.3, -1.15, 0.15), (5.0, -1.75, 0.02), (5.5, -2.0, 0.02)],
        [(3.7, 0.4, 0.45), (4.35, 1.0, 0.12), (5.1, 1.45, 0.02), (5.6, 1.6, 0.02)],
        [(-0.3, -0.45, 0.6), (-0.7, -1.1, 0.3), (-1.2, -1.8, 0.05), (-1.6, -2.3, 0.02)],
        [(0.0, 0.5, 0.6), (0.5, 1.15, 0.3), (1.0, 1.85, 0.05), (1.4, 2.35, 0.02)],
        [(-2.6, -0.55, 0.85), (-2.2, -1.2, 0.4), (-1.9, -1.9, 0.04), (-1.7, -2.4, 0.02)],
        [(3.2, 0.55, 0.9), (2.8, 1.2, 0.4), (2.5, 1.9, 0.04), (2.3, 2.4, 0.02)],
    ]
    for a in arms:
        shell.member(a, [(0, 0.12), (0.5, 0.115), (0.8, 0.08), (1, 0.012)])
    shell.member([(1.6, 0.0, 1.95), (2.25, 0.05, 2.3), (2.85, 0.1, 2.7), (3.25, 0.12, 3.1)],
                 [(0, 0.17), (0.5, 0.11), (1, 0.012)])
    shell.member([(-1.6, 0.05, 1.75), (-2.0, 0.0, 2.02), (-2.3, -0.05, 2.15)],
                 [(0, 0.1), (1, 0.012)])

    def rfun(u, v, p):
        return 0.38 + 0.07 * nz(p, 0.9, seed)

    def win_q(u, v):
        best = (9.0, None)
        for w in CONN_WIN:
            Rl = keyed(CONN_R, w[1])
            q = math.hypot(wrap_pi(u - w[0]) * Rl, (v - w[1]) * L) / w[2]
            if q < best[0]:
                best = (q, w)
        return best

    def cull(u, v, p):
        return math.sin(u) < 0.02 or v < 0.1 or v > 0.9 or p.z < 0.1 or win_q(u, v)[0] < 1.0

    def snap(u, v):
        q, w = win_q(u, v)
        if q < 1.32:
            return (w[0] + wrap_pi(u - w[0]) / q, w[1] + (v - w[1]) / q)
        if math.sin(u) < 0.3:
            u = h1 if math.cos(u) < 0 else h2
        if v < 0.15:
            v = 0.11
        elif v > 0.85:
            v = 0.89
        return (u, v)

    DV, E = surface_web(m, (0.0, TWO_PI), (0.05, 0.95), rfun, seed, metric=(0.65, L * 0.7),
                        period=TWO_PI, cull=cull, snap=snap, tries=26000, aniso=(0.7, 1.0, 1.0),
                        edge_factor=3.0)
    add_web(shell, m, DV, E, lambda p: 0.062 + 0.012 * nz(p, 1.4, seed + 3), period=TWO_PI, knuckle=1.25)

    conduit = MB()
    conduit.tube(S, [0.085] * n, sides=10)

    if mirror:
        M = Matrix.Scale(-1.0, 4, (1, 0, 0))
        shell.transform(M)
        conduit.transform(M, True)
    return [organic(f"{prefix}__shell", shell, collection, parent, voxel=0.022, target=30000),
            to_object(f"{prefix}__conduit", conduit, "NODAL_Cable", collection, parent)]


# ============================================================================= ATOL
def atol_rho(th):
    return 4.7 + 0.75 * math.cos(3 * th)


def atol_surface(th, t):
    rho = t * atol_rho(th) * 0.97
    return Vector((rho * math.cos(th), rho * math.sin(th), 0.32 + 2.35 * (1 - t) ** 1.7))


LOBES = [0.0, 2 * math.pi / 3, 4 * math.pi / 3]
WAISTS = [math.pi / 3, math.pi, 5 * math.pi / 3]


def petal_q(th, t):
    a = (t - 0.30) / 0.56
    best = 9.0
    if 0.0 < a < 1.0:
        hw = 1.24 * math.sqrt(a * (1 - a))
        for c in LOBES:
            best = min(best, abs(wrap_pi(th - c)) / max(hw, 1e-4))
    return best


def build_atol(prefix, parent, collection, seed=51):
    """Floating surface hub: trilobed buoyancy ring, concave canopy, solar petals, sigil arms,
    vertical-axis wind modules (optional), technical mast, keel + umbilical interface.
    Origin = waterline centre."""
    log(f"ATOL {prefix}")
    m = atol_surface
    TWO_PI = 2 * math.pi
    shell = MB()
    # buoyancy ring (half submerged)
    shell.member([(atol_rho(a) * math.cos(a), atol_rho(a) * math.sin(a), -0.08)
                  for a in [TWO_PI * k / 48 for k in range(48)]], 0.62, sides=10, closed=True, flat=(0.62, 1.0))
    # hub ring, canopy edge ring
    for t, r in ((0.14, 0.1), (0.97, 0.09)):
        shell.member([tuple(m(TWO_PI * k / 40, t)) for k in range(40)], r, closed=True)
    # petal rims
    for c in LOBES:
        loop = []
        for k in range(24):
            ph = TWO_PI * k / 24
            loop.append(tuple(m(c + 0.62 * math.sin(ph), 0.30 + 0.56 * (1 - math.cos(ph)) / 2)))
        shell.member(loop, 0.085, closed=True)
        shell.member([tuple(m(c, t)) for t in (0.14, 0.22, 0.30)], 0.1)
        for sgn in (-1, 1):  # lobe claws
            th0 = c + sgn * 0.38
            r0 = atol_rho(th0)
            shell.member([(r0 * math.cos(th0), r0 * math.sin(th0), 0.05),
                          ((r0 + 0.6) * math.cos(th0 + sgn * 0.06), (r0 + 0.6) * math.sin(th0 + sgn * 0.06), 0.06),
                          ((r0 + 1.2) * math.cos(th0 + sgn * 0.12), (r0 + 1.2) * math.sin(th0 + sgn * 0.12), 0.18)],
                         [(0, 0.13), (1, 0.012)])
    # sigil arms at the waists: hub -> canopy -> past the hull as sweeping tendrils
    for w in WAISTS:
        pts = [tuple(m(w + 0.18 * t * t, t)) for t in (0.14, 0.35, 0.6, 0.85)]
        for dr, dth, z in ((0.0, 0.2, 0.25), (0.9, 0.24, 0.12), (1.7, 0.3, 0.06), (2.4, 0.38, 0.32)):
            rr = atol_rho(w + dth) + dr
            pts.append((rr * math.cos(w + dth), rr * math.sin(w + dth), z))
        shell.member(pts, [(0, 0.2), (0.55, 0.18), (0.75, 0.14), (1, 0.015)])
    # mast sleeve
    shell.member([(0, 0, 2.1), (0, 0, 2.9), (0, 0, 3.7)], [(0, 0.62), (0.5, 0.4), (1, 0.22)], sides=12)

    def rfun(u, v, p):
        return 0.40 + 0.08 * nz(p, 0.5, seed)

    def cull(u, v, p):
        return petal_q(u, v) < 1.0

    def snap(u, v):
        q = petal_q(u, v)
        if q < 1.35:
            a = (v - 0.30) / 0.56
            hw = 1.24 * math.sqrt(a * (1 - a))
            for c in LOBES:
                d = wrap_pi(u - c)
                if abs(d) <= hw * 1.36:
                    return (c + math.copysign(hw, d), v)
        if v > 0.86:
            v = 0.97
        elif v < 0.2:
            v = 0.14
        return (u, v)

    DV, E = surface_web(m, (0.0, TWO_PI), (0.14, 0.97), rfun, seed, metric=(2.8, 4.7),
                        period=TWO_PI, cull=cull, snap=snap, tries=26000)
    add_web(shell, m, DV, E, lambda p: 0.065 + 0.012 * nz(p, 1.1, seed + 3), period=TWO_PI)

    # solar petals
    solar = MB()
    I, J = 14, 9
    for c in LOBES:
        grid = []
        for i in range(I):
            a = 0.03 + 0.94 * i / (I - 1)
            hw = 1.24 * math.sqrt(a * (1 - a)) * 0.93
            row = []
            for j in range(J):
                th = c + hw * (2 * j / (J - 1) - 1)
                p = m(th, 0.30 + 0.56 * a) + Vector((0, 0, 0.07))
                row.append(solar.bm.verts.new(p))
            grid.append(row)
        for i in range(I - 1):
            for j in range(J - 1):
                solar.bm.faces.new((grid[i][j], grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1]))

    # technical: mast, comms, keel, wind module rods/hubs/generators
    tech, blades, beacon = MB(), MB(), MB()
    tech.cyl((0, 0, 2.5), (0, 0, 6.6), 0.12, segs=12)
    tech.box((0.22, 0, 4.3), (0.32, 0.32, 0.5))
    tech.box((-0.2, 0.1, 5.1), (0.26, 0.26, 0.36))
    tech.cyl((-0.7, 0, 5.55), (0.7, 0, 5.55), 0.04, segs=8)
    for x in (-0.7, 0.7):
        tech.cyl((x, 0, 5.5), (x, 0, 6.15), 0.03, segs=6)
    tech.ico(Vector((0.0, 0.32, 6.0)), 0.2, subdiv=2)
    tech.cyl((0, 0, 6.78), (0, 0, 7.3), 0.022, segs=6)
    tech.cyl((0, 0, -1.2), (0, 0, 0.2), 0.42, segs=20)
    tech.cyl((0, 0, -1.85), (0, 0, -1.2), 0.15, 0.42, segs=20)
    beacon.cyl((0, 0, 6.62), (0, 0, 6.78), 0.09, segs=12)
    for c in LOBES:
        rr = atol_rho(c) - 0.15
        base = Vector((rr * math.cos(c), rr * math.sin(c), 0.25))
        radial = Vector((math.cos(c), math.sin(c), 0))
        tang = Vector((-math.sin(c), math.cos(c), 0))
        tech.cyl(base, base + Vector((0, 0, 0.45)), 0.22, segs=14)
        tech.cyl(base, base + Vector((0, 0, 4.7)), 0.055, segs=8)
        for zh in (0.9, 4.5):
            tech.cyl(base + Vector((0, 0, zh - 0.08)), base + Vector((0, 0, zh + 0.08)), 0.1, segs=10)
        for sgn in (-1, 1):
            pts = [base + tang * (sgn * 0.85 * math.sin(math.pi * k / 10)) + Vector((0, 0, 0.9 + 3.6 * k / 10))
                   for k in range(11)]
            bp = resample(catmull(pts, 6), 0.12)
            br = [0.06 + 0.07 * math.sin(math.pi * i / (len(bp) - 1)) for i in range(len(bp))]
            blades.tube(bp, br, sides=8, flat=(1.0, 0.25), hint=radial)

    objs = [organic(f"{prefix}__shell", shell, collection, parent, voxel=0.032, target=40000),
            to_object(f"{prefix}__solar", solar, "NODAL_Solar", collection, parent),
            to_object(f"{prefix}__tech", tech, "NODAL_CoreMetal", collection, parent),
            to_object(f"{prefix}__wind_blades", blades, "NODAL_Bone", collection, parent),
            to_object(f"{prefix}__beacon", beacon, "NODAL_Beacon", collection, parent)]
    return objs


# ============================================================================= JUNCTION
def build_junction(prefix, parent, collection):
    log(f"JUNCTION {prefix}")
    roots = MB()
    for a in (0.4, 1.9, 3.3, 4.9):
        pts = []
        for k, (rr, z) in enumerate(((0.3, 0.32), (0.75, 0.22), (1.25, 0.06), (1.7, 0.02))):
            aa = a + 0.08 * k
            pts.append((rr * math.cos(aa), rr * math.sin(aa), z))
        roots.member(pts, [(0, 0.12), (0.6, 0.09), (1, 0.012)])
    roots.member([(0.8 * math.cos(a), 0.8 * math.sin(a), 0.3) for a in [2 * math.pi * k / 20 for k in range(20)]],
                 0.07, closed=True)
    core, cool = MB(), MB()
    core.cyl((0, 0, 0), (0, 0, 0.3), 0.78, segs=6)
    core.cyl((0, 0, 0.3), (0, 0, 0.95), 0.33, 0.16, segs=16)
    cool.cyl((0, 0, 0.38), (0, 0, 0.46), 0.345, segs=16)
    return [organic(f"{prefix}__shell", roots, collection, parent, voxel=0.02, target=4000),
            to_object(f"{prefix}__core", core, "NODAL_CoreMetal", collection, parent, smooth=False),
            to_object(f"{prefix}__status", cool, "NODAL_Coolant", collection, parent)]


# ============================================================================= links / env
SEABED_Z = -12.0


def build_link(name, a, b, collection, parent, seed, radius=0.05):
    rng = random.Random(seed)
    a, b = Vector(a), Vector(b)
    d = b - a
    lat = Vector((-d.y, d.x, 0)).normalized() if d.length > 1e-6 else Vector((1, 0, 0))
    bow = rng.uniform(-0.6, 0.6)
    ctrl = []
    for i in range(6):
        t = i / 5
        p = a.lerp(b, t) + lat * (bow * math.sin(math.pi * t))
        ctrl.append(p)
    mb = MB()
    pts = path(ctrl, 0.25)
    mb.tube(pts, [radius] * len(pts), sides=8)
    return to_object(name, mb, "NODAL_Cable", collection, parent)


def build_umbilical(name, atol_loc, junction_top, collection, parent):
    a, b = Vector(atol_loc), Vector(junction_top)
    ctrl = [a, a + Vector((0.25, -0.8, -2.45)), a + Vector((-0.15, -1.25, -5.35)),
            a + Vector((0.1, -0.7, -8.05)), b + Vector((0, -0.05, 0.1)), b]
    mb = MB()
    pts = path(ctrl, 0.2)
    mb.tube(pts, [0.09] * len(pts), sides=10)
    return to_object(name, mb, "NODAL_Cable", collection, parent)


def build_seabed(name, nodes_xy, collection, parent):
    mb = MB()
    X0, X1, Y0, Y1, NX, NY = -32.0, 34.0, -27.0, 13.0, 60, 36
    vs = []
    for j in range(NY + 1):
        row = []
        for i in range(NX + 1):
            x, y = X0 + (X1 - X0) * i / NX, Y0 + (Y1 - Y0) * j / NY
            dmin = min(math.hypot(x - nx, y - ny) for nx, ny in nodes_xy)
            w = clamp((dmin - 4.5) / 6.0)
            w = w * w * (3 - 2 * w)
            z = SEABED_Z - 0.04 + w * (0.35 * nz((x, y, 0), 0.07, 3.0) + 0.08 * nz((x, y, 0), 0.5, 7.0))
            row.append(mb.bm.verts.new((x, y, z)))
        vs.append(row)
    for j in range(NY):
        for i in range(NX):
            mb.bm.faces.new((vs[j][i], vs[j][i + 1], vs[j + 1][i + 1], vs[j + 1][i]))
    return to_object(name, mb, "NODAL_Seabed", collection, parent)


# ============================================================================= scene / render
def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.preferences.filepaths.save_version = 0  # no .blend1 backups
    sc = bpy.context.scene
    sc.unit_settings.system = 'METRIC'
    sc.unit_settings.scale_length = 1.0
    return sc


def setup_preview_env(sc, world_hex="#0E2E3A", strength=1.0):
    pc = coll("PREVIEW_ONLY")
    w = bpy.data.worlds.new("NODAL_World")
    sc.world = w
    try:
        w.use_nodes = True
    except Exception:
        pass
    bg = next((n for n in w.node_tree.nodes if n.type == 'BACKGROUND'), None)
    if bg:
        bg.inputs['Color'].default_value = (*lin(world_hex), 1.0)
        bg.inputs['Strength'].default_value = strength
    w.color = lin(world_hex)
    sun_d = bpy.data.lights.new("KeySun", 'SUN')
    sun_d.energy = 3.6
    sun_d.angle = math.radians(8)
    sun = bpy.data.objects.new("KeySun", sun_d)
    sun.rotation_euler = (math.radians(42), math.radians(8), math.radians(32))
    pc.objects.link(sun)
    fill_d = bpy.data.lights.new("FillSun", 'SUN')
    fill_d.energy = 0.9
    fill_d.color = lin("#7FC8D6")
    fill = bpy.data.objects.new("FillSun", fill_d)
    fill.rotation_euler = (math.radians(70), 0, math.radians(-150))
    pc.objects.link(fill)
    for e in ('BLENDER_EEVEE', 'BLENDER_EEVEE_NEXT'):
        try:
            sc.render.engine = e
            break
        except TypeError:
            continue
    try:
        sc.eevee.taa_render_samples = 48
    except Exception:
        pass
    sc.view_settings.view_transform = 'AgX'
    sc.render.image_settings.file_format = 'PNG'
    return pc


def camera(name, loc, target=None, rot=None, ortho=None, lens=40, collection=None):
    cd = bpy.data.cameras.new(name)
    if ortho:
        cd.type = 'ORTHO'
        cd.ortho_scale = ortho
    else:
        cd.lens = lens
    cd.clip_start, cd.clip_end = 0.05, 600
    ob = bpy.data.objects.new(name, cd)
    (collection or bpy.context.scene.collection).objects.link(ob)
    ob.location = loc
    if target is not None:
        ob.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    elif rot is not None:
        ob.rotation_euler = rot
    return ob


def render(sc, cam, path_png, res=(1600, 1000)):
    sc.camera = cam
    sc.render.resolution_x, sc.render.resolution_y = res
    sc.render.resolution_percentage = 100
    sc.render.filepath = path_png
    bpy.ops.render.render(write_still=True)
    log(f"  rendered {os.path.relpath(path_png, ROOT)}")


def render_silhouettes(sc, cams, out_png, hide=()):
    """Workbench black-on-white strip (Maquette §7): no shading, nothing to hide behind."""
    import numpy as np
    prev = (sc.render.engine, sc.view_settings.view_transform, sc.world.color[:])
    for o in hide:
        o.hide_render = True
    sc.render.engine = 'BLENDER_WORKBENCH'
    d = sc.display.shading
    d.light = 'FLAT'
    d.color_type = 'SINGLE'
    d.single_color = (0, 0, 0)
    d.show_shadows = False
    d.show_cavity = False
    d.show_object_outline = False
    try:
        d.background_type = 'VIEWPORT'
        d.background_color = (1, 1, 1)
    except Exception:
        pass
    sc.world.color = (1, 1, 1)
    sc.view_settings.view_transform = 'Standard'
    files = []
    for cam in cams:
        p = out_png.replace(".png", f"__{cam.name}.png")
        render(sc, cam, p, res=(640, 640))
        files.append(p)
    imgs = [bpy.data.images.load(p) for p in files]
    w, h = imgs[0].size
    buf = np.zeros((h, w * len(imgs), 4), dtype=np.float32)
    for i, im in enumerate(imgs):
        buf[:, i * w:(i + 1) * w, :] = np.array(im.pixels[:], dtype=np.float32).reshape(h, w, 4)
    strip = bpy.data.images.new("__strip__", width=w * len(imgs), height=h, alpha=False)
    strip.pixels = buf.ravel()
    strip.filepath_raw = out_png
    strip.file_format = 'PNG'
    strip.save()
    for im in imgs + [strip]:
        bpy.data.images.remove(im)
    for p in files:
        os.remove(p)
    sc.render.engine, sc.view_settings.view_transform = prev[0], prev[1]
    sc.world.color = prev[2]
    for o in hide:
        o.hide_render = False
    log(f"  silhouette strip {os.path.relpath(out_png, ROOT)}")


# ============================================================================= stages
def stage_ridge():
    sc = reset_scene()
    pc = setup_preview_env(sc)
    nc = coll("NODAL_EXPORT")
    e = node_empty("RIDGE_01", "RIDGE", "Ridge West (preview)", (0, 0, 0), 0, nc)
    build_ridge("RIDGE_01", e, nc, seed=11)
    ground = to_object("PREVIEW_ground", _ground_mb(), "NODAL_Seabed", pc)
    if not NO_RENDER:
        cams = [camera("persp", (7.2, -7.8, 3.6), (0.3, 0, 0.85), lens=38, collection=pc),
                camera("side", (0.2, -30, 1.15), rot=(math.radians(90), 0, 0), ortho=8.6, collection=pc),
                camera("top", (0.2, 0, 30), rot=(0, 0, 0), ortho=8.6, collection=pc),
                camera("front", (30, 0, 1.15), rot=(math.radians(90), 0, math.radians(90)), ortho=8.6, collection=pc)]
        render(sc, cams[0], os.path.join(OUT_PREV, "ridge_perspective.png"))
        render(sc, cams[1], os.path.join(OUT_PREV, "ridge_side.png"), res=(1600, 800))
        render(sc, cams[2], os.path.join(OUT_PREV, "ridge_top.png"), res=(1600, 1100))
        render_silhouettes(sc, [cams[1], cams[2], cams[3]],
                           os.path.join(OUT_PREV, "ridge_silhouette_side_top_front.png"), hide=[ground])
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT_BLEND, "ridge_gate.blend"), compress=True)
    report_tris(nc)


def stage_families():
    """Inspection only: CANYON, CONNECTOR, ATOL side by side + silhouettes. No export."""
    sc = reset_scene()
    pc = setup_preview_env(sc)
    nc = coll("FAMILIES")
    for nid, fn, x in (("CANYON_T", lambda e: build_canyon("CANYON_T", e, nc), -9.0),
                       ("CONNECTOR_T", lambda e: build_connector("CONNECTOR_T", e, nc), 0.0),
                       ("RIDGE_T", lambda e: build_ridge("RIDGE_T", e, nc), 10.0)):
        e = node_empty(nid, nid, nid, (x, 0, 0), 0, nc)
        fn(e)
    ground = to_object("PREVIEW_ground", _ground_mb(60.0), "NODAL_Seabed", pc)
    cam = camera("fam_persp", (4.0, -21.0, 7.0), (0.5, 0, 2.2), lens=32, collection=pc)
    render(sc, cam, os.path.join(OUT_PREV, "families_perspective.png"), res=(1920, 900))
    cams = [camera("fam_side", (0.5, -60, 3.0), rot=(math.radians(90), 0, 0), ortho=27, collection=pc),
            camera("fam_top", (0.5, 0, 60), rot=(0, 0, 0), ortho=27, collection=pc)]
    render_silhouettes(sc, cams, os.path.join(OUT_PREV, "families_silhouette_side_top.png"), hide=[ground])
    sc2 = reset_scene()
    pc2 = setup_preview_env(sc2)
    nc2 = coll("ATOL")
    e = node_empty("ATOL_T", "ATOL", "ATOL", (0, 0, 0), 0, nc2)
    build_atol("ATOL_T", e, nc2)
    cam = camera("atol_persp", (13.0, -15.0, 9.0), (0, 0, 1.5), lens=35, collection=pc2)
    render(sc2, cam, os.path.join(OUT_PREV, "atol_perspective.png"), res=(1600, 1000))
    cams = [camera("atol_side", (0, -60, 2.5), rot=(math.radians(90), 0, 0), ortho=17, collection=pc2),
            camera("atol_top", (0, 0, 60), rot=(0, 0, 0), ortho=17, collection=pc2)]
    render_silhouettes(sc2, cams, os.path.join(OUT_PREV, "atol_silhouette_side_top.png"))


def _ground_mb(size=24.0, z=0.0):
    mb = MB()
    s = size / 2
    v = [mb.bm.verts.new(p) for p in ((-s, -s, z), (s, -s, z), (s, s, z), (-s, s, z))]
    mb.bm.faces.new(v)
    return mb


def report_tris(collection):
    total = 0
    for ob in sorted(collection.objects, key=lambda o: o.name):
        if ob.type == 'MESH':
            n = tri_count(ob)
            total += n
            dims = ob.dimensions
            log(f"  {ob.name:34s} {n:7d} tris  dims {dims.x:5.2f} x {dims.y:5.2f} x {dims.z:5.2f} m")
    log(f"  TOTAL {total} tris")
    return total


def stage_network():
    net = json.load(open(NETWORK_JSON))
    sc = reset_scene()
    pc = setup_preview_env(sc)
    nc = coll("NODAL_EXPORT")
    builders = {
        "RIDGE": lambda i, e, k: build_ridge(i, e, nc, seed=11 + 17 * k, mirror=(k % 2 == 1)),
        "CANYON": lambda i, e, k: build_canyon(i, e, nc, seed=23 + 13 * k, zscale=1.0 if k == 0 else 0.86),
        "CONNECTOR": lambda i, e, k: build_connector(i, e, nc, seed=37 + 19 * k, mirror=(k % 2 == 1)),
    }
    counts = {}
    locs = {}
    for nd in net["nodes"]:
        k = counts.get(nd["type"], 0)
        counts[nd["type"]] = k + 1
        loc = net_to_blender(nd["position"])
        locs[nd["id"]] = loc
        e = node_empty(nd["id"], nd["type"], nd["label"], loc, nd.get("rotationYDeg", 0.0), nc,
                       {"simulatedWorkloadPct": nd.get("simulatedWorkloadPct", 0),
                        "networkPosition": list(nd["position"])})
        builders[nd["type"]](nd["id"], e, k)

    hub = net["surfaceHub"]
    loc = net_to_blender(hub["position"])
    locs[hub["id"]] = loc
    e = node_empty(hub["id"], hub["type"], hub["label"], loc, 0.0, nc,
                   {"networkPosition": list(hub["position"])})
    build_atol(hub["id"], e, nc)

    jn = net["seafloorJunction"]
    loc = net_to_blender(jn["position"])
    locs[jn["id"]] = loc
    e = node_empty(jn["id"], jn["type"], "Seafloor Junction", loc, 0.0, nc,
                   {"networkPosition": list(jn["position"])})
    build_junction(jn["id"], e, nc)

    lg = bpy.data.objects.new("GROUP__LINKS", None)
    nc.objects.link(lg)
    for i, c in enumerate(net["connections"]):
        s, t = c["source"], c["target"]
        name = f"LINK__{s}__{t}"
        if c["kind"] == "UMBILICAL":
            ob = build_umbilical(name, locs[s] + Vector((0, 0, -1.85)), locs[t] + Vector((0, 0, 0.95)), nc, lg)
        else:
            a = locs[s].copy(); a.z = SEABED_Z + 0.07
            b = locs[t].copy(); b.z = SEABED_Z + 0.07
            ob = build_link(name, a, b, nc, lg, seed=100 + i)
        ob["source"], ob["target"], ob["kind"] = s, t, c["kind"]
        ob["provenance"] = "CONCEPTUAL"

    eg = bpy.data.objects.new("GROUP__ENV", None)
    nc.objects.link(eg)
    sb = build_seabed("ENV__SEABED", [(v.x, v.y) for v in locs.values()], nc, eg)
    sb["note"] = "Optional illustrative seabed; hide or replace in app. Not bathymetry."

    total = report_tris(nc)

    if not NO_RENDER:
        cam = camera("net_persp", (-27.0, -44.0, 6.0), (2.0, -4.5, -8.5), lens=30, collection=pc)
        render(sc, cam, os.path.join(OUT_PREV, "network_preview.png"), res=(1920, 1080))
        cam2 = camera("net_close", (-13.5, -19.0, -7.2), (-4.0, -1.0, -11.2), lens=34, collection=pc)
        render(sc, cam2, os.path.join(OUT_PREV, "network_closeup.png"), res=(1920, 1080))

    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT_BLEND, "nodal.blend"), compress=True)
    export_glb(nc, os.path.join(OUT_EXP, "nodal_scene.glb"))


def export_glb(collection, out):
    bpy.ops.object.select_all(action='DESELECT')
    for ob in collection.objects:
        ob.select_set(True)
    kw = dict(filepath=out, export_format='GLB', use_selection=True, export_apply=True,
              export_yup=True, export_extras=True, export_texcoords=False, export_normals=True,
              export_cameras=False, export_lights=False, export_animations=False,
              export_materials='EXPORT')
    try:
        bpy.ops.export_scene.gltf(**kw)
    except TypeError as ex:
        log("exporter kwarg mismatch, retrying minimal:", ex)
        bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', use_selection=True,
                                  export_apply=True, export_yup=True, export_extras=True)
    log(f"EXPORTED {os.path.relpath(out, ROOT)}  {os.path.getsize(out) / 1e6:.2f} MB")


if __name__ == "__main__":
    log(f"stage={STAGE}  root={ROOT}")
    if STAGE == "ridge":
        stage_ridge()
    elif STAGE == "families":
        stage_families()
    else:
        stage_network()
    log("done")
