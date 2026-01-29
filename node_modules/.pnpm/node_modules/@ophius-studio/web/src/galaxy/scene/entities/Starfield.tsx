import React from "react";
import { Stars } from "@react-three/drei";

/**
 * Starfield (3D-only)
 *
 * - Pakai starfield dari Drei (3D) saja.
 * - Hilangkan "langit ungu" (NebulaDome) dan custom TwinkleLayer (bintang buatan sendiri),
 *   sesuai permintaan: tidak ada layer bintang dobel + tidak ada dome ungu.
 *
 * Zodiac tetap di EnvironmentFx.tsx (jangan dihapus).
 */
export function Starfield() {
  return (
    <group>
      {/* Distant stars (3D) */}
      <Stars radius={230} depth={200} count={20000} factor={1.05} fade speed={0.02} />
    </group>
  );
}
