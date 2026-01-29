@echo off
setlocal

rem Exports the included Blender asset to the location expected by the web app.
rem Requires Blender installed. If blender.exe is not in PATH, set BLENDER_EXE below.

set "BLENDER_EXE=blender"
set "BLEND_FILE=_assets\realistic-black-hole\black_hole_project.blend"
set "OUT_FILE=apps\web\public\models\blackhole\blackhole.glb"

"%BLENDER_EXE%" -b "%BLEND_FILE%" -P tools\blender\export_blackhole_glb.py -- --out "%OUT_FILE%"
if errorlevel 1 (
  echo Failed exporting GLB.
  exit /b 1
)

echo Done. Now run: pnpm dev
endlocal
