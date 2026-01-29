import React from "react";
import { BlackHole } from "./BlackHole";
import { BlackHoleLensingPass } from "../fx/BlackHoleLensingPass";

/**
 * BlackHoleHost
 *
 * NOTE:
 * - Kita sengaja **tidak** memuat model GLB (hasil Blender) di runtime.
 * - Di versi sebelumnya, GLB black hole membawa elemen/particles sendiri, sementara scene kita
 *   juga membangkitkan starfield dari code. Hasilnya kedouble dan bisa bikin glitch/lag saat boot.
 *
 * File asset 3D tetap disimpan di:
 *   apps/web/public/models/blackhole/
 * tapi sekarang tidak terhubung (tidak di-fetch / tidak di-render).
 */
export function BlackHoleHost() {
  return (
    <>
      <BlackHole />
      <BlackHoleLensingPass />
    </>
  );
}
