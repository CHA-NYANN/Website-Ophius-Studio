import React, { Suspense } from "react";
import { BlackHoleModel } from "./BlackHoleModel";

/**
 * BlackHoleHost
 *
 * Kamu minta: **hapus blackhole dari coding** dan **pakai blackhole dari GLB Blender** saja.
 * Jadi component ini SELALU load GLB, tanpa fallback procedural/lensing.
 *
 * Kenapa sebelumnya terasa "GLB nggak kebaca"?
 * 1) Kamera awal menghadap +Z (karena yaw awal = PI), jadi kalau blackhole ditempatkan di Z negatif
 *    dia berada "di belakang" kamera dan terlihat seperti tidak ke-load.
 * 2) Pemilihan model pakai HEAD + content-type kadang false-negative → model tidak pernah di-mount.
 *
 * Fix di sini:
 * - Langsung mount GLB (tanpa HEAD check)
 * - Dibungkus Suspense supaya scene lain tetap render dulu (ngurangin black screen)
 * - Posisi dipindah ke Z positif (di depan kamera) supaya langsung keliatan dari POV awal.
 */
export function BlackHoleHost() {
  // IMPORTANT: pakai BASE_URL biar aman kalau app dipublish di sub-path (mis. GitHub Pages).
  const url = `${import.meta.env.BASE_URL}models/blackhole/blackhole.glb`;

  return (
    <Suspense fallback={null}>
      <BlackHoleModel
        url={url}
        /**
         * IMPORTANT:
         * Kamera POV berada di (0,0,0) dan menghadap +Z.
         * Jadi blackhole harus punya Z positif agar masuk frustum saat load.
         */
        position={[-7.2, 0.0, 18.0]}
        rotation={[0, 0.12, 0]}
        // Asset GLB punya mesh "environment" besar (~86 units), jadi scale kecil biar enak komposisinya.
        scale={0.22}
      />
    </Suspense>
  );
}
