"""Validate visualization/exports/nodal_scene.glb against shared/network.json.
Pure Python (no deps). Run from NODAL_STARTER/:  python3 visualization/scripts/validate_glb.py
Checks: GLB header, NODE__<id> parents present for every id, parent translations == network.json
positions (Y-up metres), Y-rotation == rotationYDeg, LINK__ objects for every connection,
no '.' in names (three.js sanitises them), triangle counts, size budget."""
import json, math, os, struct, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
GLB = os.path.join(ROOT, "visualization", "exports", "nodal_scene.glb")
NET = os.path.join(ROOT, "shared", "network.json")

fails = []


def check(cond, msg):
    print(("  PASS " if cond else "  FAIL ") + msg)
    if not cond:
        fails.append(msg)


data = open(GLB, "rb").read()
magic, version, length = struct.unpack_from("<4sII", data, 0)
check(magic == b"glTF" and version == 2 and length == len(data), f"GLB header (v{version}, {length} bytes)")
jlen, jtype = struct.unpack_from("<I4s", data, 12)
gltf = json.loads(data[20:20 + jlen])
net = json.load(open(NET))

nodes = gltf["nodes"]
by_name = {n.get("name", ""): n for n in nodes}
size_mb = len(data) / 1e6
check(size_mb < 15, f"file size {size_mb:.2f} MB < 15 MB")

expected = {n["id"]: n for n in net["nodes"]}
expected[net["surfaceHub"]["id"]] = net["surfaceHub"]
expected[net["seafloorJunction"]["id"]] = net["seafloorJunction"]
print("\nNODE parents (translation vs network.json, Y-up m):")
for nid, spec in expected.items():
    n = by_name.get(f"NODE__{nid}")
    check(n is not None, f"NODE__{nid} present")
    if n is None:
        continue
    t = n.get("translation", [0, 0, 0])
    d = max(abs(a - b) for a, b in zip(t, spec["position"]))
    check(d < 1e-4, f"NODE__{nid} translation {[round(x, 4) for x in t]} == {spec['position']}")
    q = n.get("rotation", [0, 0, 0, 1])
    ydeg = math.degrees(2 * math.atan2(q[1], q[3]))
    want = spec.get("rotationYDeg", 0.0)
    check(abs(q[0]) < 1e-5 and abs(q[2]) < 1e-5 and abs(ydeg - want) < 0.01,
          f"NODE__{nid} rotation Y {ydeg:.2f} deg == {want}")
    kids = [nodes[i].get("name") for i in n.get("children", [])]
    check(len(kids) > 0, f"NODE__{nid} children: {kids}")
    ex = n.get("extras", {})
    check(ex.get("nodeId") == nid, f"NODE__{nid} extras.nodeId / nodeType={ex.get('nodeType')}")

print("\nLinks:")
for c in net["connections"]:
    name = f"LINK__{c['source']}__{c['target']}"
    check(name in by_name, f"{name} ({c['kind']})")

print("\nNaming:")
bad = [n.get("name") for n in nodes if "." in n.get("name", "")]
check(not bad, f"no '.' in node names {bad if bad else ''}")

# triangle count per mesh
acc = gltf["accessors"]
tri = {}
for mi, mesh in enumerate(gltf["meshes"]):
    t = 0
    for p in mesh["primitives"]:
        if "indices" in p:
            t += acc[p["indices"]]["count"] // 3
        else:
            t += acc[p["attributes"]["POSITION"]]["count"] // 3
    tri[mi] = t
total = 0
print("\nMeshes:")
for n in nodes:
    if "mesh" in n:
        total += tri[n["mesh"]]
        print(f"  {n['name']:34s} {tri[n['mesh']]:7d} tris")
check(total < 400000, f"total triangles {total} < 400k")
print("\nMaterials:", [m["name"] for m in gltf.get("materials", [])])
print("Extensions used:", gltf.get("extensionsUsed", []))
print(f"\n{'ALL CHECKS PASSED' if not fails else str(len(fails)) + ' FAILURES'}")
sys.exit(1 if fails else 0)
