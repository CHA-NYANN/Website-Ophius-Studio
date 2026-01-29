# Blender script: export a .blend file to GLB.
#
# Usage (example):
#   blender -b _assets/realistic-black-hole/black_hole_project.blend \
#     -P tools/blender/export_blackhole_glb.py -- \
#     --out apps/web/public/models/blackhole/blackhole.glb
#
# Notes:
# - This is a convenience script. You still need Blender installed locally.
# - Some Cycles-only materials might not export perfectly; you may need to bake.

import bpy
import os
import sys

def _arg_value(name: str, default: str | None = None):
    argv = sys.argv
    if "--" not in argv:
        return default
    args = argv[argv.index("--") + 1 :]
    if name in args:
        i = args.index(name)
        if i + 1 < len(args):
            return args[i + 1]
    return default

out_path = _arg_value("--out", None)
if not out_path:
    raise SystemExit("Missing --out <path> argument")

out_path = bpy.path.abspath(out_path)
os.makedirs(os.path.dirname(out_path), exist_ok=True)

# Ensure we are in object mode
try:
    bpy.ops.object.mode_set(mode="OBJECT")
except Exception:
    pass

# Export GLB
bpy.ops.export_scene.gltf(
    filepath=out_path,
    export_format="GLB",
    export_apply=True,
    export_yup=True,
    export_texcoords=True,
    export_normals=True,
    export_tangents=True,
    export_materials="EXPORT",
    export_images="AUTO",
)

print(f"Exported GLB to: {out_path}")
