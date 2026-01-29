#!/usr/bin/env bash
set -euo pipefail

# Exports the included Blender asset to the location expected by the web app.
# Requires `blender` to be installed and available in PATH.

BLEND_FILE="_assets/realistic-black-hole/black_hole_project.blend"
OUT_FILE="apps/web/public/models/blackhole/blackhole.glb"

if ! command -v blender >/dev/null 2>&1; then
  echo "blender not found in PATH. Install Blender and ensure 'blender' is available." >&2
  exit 1
fi

blender -b "$BLEND_FILE" -P tools/blender/export_blackhole_glb.py -- --out "$OUT_FILE"

echo "Done. Now run: pnpm dev"
