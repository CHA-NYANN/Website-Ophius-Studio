# Black Hole 3D Asset

Taruh file model black hole hasil export di folder ini.

## Target file

Export ke:

- `apps/web/public/models/blackhole/blackhole.glb`

Aplikasi web akan otomatis pakai model ini bila file-nya ada.
Kalau file belum ada, web akan fallback ke black hole procedural (shader + FBO).

## Cara export dari Blender (.blend -> .glb)

1. Install Blender (versi terbaru aman).
2. Buka file:
   - `_assets/realistic-black-hole/black_hole_project.blend`
3. (Opsional tapi disarankan) `File > External Data > Pack Resources` supaya texture ikut terbawa.
4. `File > Export > glTF 2.0`.
5. Pengaturan yang aman:
   - Format: **glTF Binary (.glb)**
   - Include: **All** (atau Selected Objects kalau kamu seleksi)
   - Geometry: centang **Apply Modifiers**, **Normals**, **UVs**
   - Materials: **Export**
   - Images: **Automatic**
6. Simpan hasil export sebagai:
   - `apps/web/public/models/blackhole/blackhole.glb`
7. Jalankan web:

```bash
pnpm dev
```

## Catatan

Kalau hasilnya terlalu gelap/kurang glow, itu normal: material Blender kadang perlu dibake atau disesuaikan supaya cocok di real-time.
Kode sudah set `toneMapped=false` dan boost emissive untuk membantu.
