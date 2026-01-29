import React from "react";
import { Stars } from "@react-three/drei";

/**
 * Starfield
 *
 * Keputusan desain terbaru:
 * - Tidak pakai generator bintang custom (TwinkleLayer) supaya tidak double / berat di awal.
 * - Tidak pakai NebulaDome (langit ungu).
 * - Tetap ada bintang 3D sederhana (drei <Stars>) sebagai background.
 */
export function Starfield() {
  return (
    <group>
      <Stars radius={230} depth={200} count={18000} factor={1.0} fade speed={0.02} />
    </group>
  );
}
