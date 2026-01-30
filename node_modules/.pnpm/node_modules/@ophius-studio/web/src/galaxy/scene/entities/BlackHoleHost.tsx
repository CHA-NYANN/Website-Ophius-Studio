import React, { Suspense } from "react";
import { BlackHoleModel } from "./BlackHoleModel";

/**
 * BlackHoleHost
 *
 * Kamu minta: **hapus blackhole dari coding** dan **pakai blackhole dari GLB Blender** saja.
 * Jadi component ini SELALU load GLB, tanpa fallback procedural/lensing.
 *
 * Kenapa sebelumnya terasa "GLB nggak kebaca"?
 * 1) Posisi default lama ada di Z positif, sementara kamera awal menghadap -Z → objek berada "di belakang" kamera.
 * 2) Pemilihan model pakai HEAD + content-type kadang false-negative → model tidak pernah di-mount.
 *
 * Fix di sini:
 * - Langsung mount GLB (tanpa HEAD check)
 * - Dibungkus Suspense supaya scene lain tetap render dulu (ngurangin black screen)
 * - Posisi dipindah ke Z negatif supaya langsung keliatan dari POV awal.
 */
export function BlackHoleHost() {
  // IMPORTANT: pakai BASE_URL biar aman kalau app dipublish di sub-path (mis. GitHub Pages).
  const url = `${import.meta.env.BASE_URL}models/blackhole/blackhole.glb`;

  return (
    <Suspense fallback={null}>
      <BlackHoleModel
        url={url}
        // Tuning: taruh di kiri & di depan (Z negatif) supaya langsung terlihat dari kamera awal.
        position={[-7.8, 0.15, -14.5]}
        rotation={[0, 0.12, 0.0]}
        // Asset GLB kamu besar (bounding box ~80an unit), jadi kita kecilkan.
        scale={0.22}
      />
    </Suspense>
  );
}
