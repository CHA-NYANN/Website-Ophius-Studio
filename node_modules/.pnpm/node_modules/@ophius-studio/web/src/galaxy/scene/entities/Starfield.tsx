import React from "react";
import { Stars } from "@react-three/drei";

/**
 * Starfield
 *
 * User request:
 * - Jangan render "langit ungu" (NebulaDome)
 * - Jangan render bintang custom (TwinkleLayer)
 * - Tetap ada bintang 3D yang ringan dan langsung kelihatan
 */
export function Starfield() {
  return (
    <group>
      {/*
        Drei <Stars> adalah bintang 3D berbasis Points yang ringan.
        Setting di bawah dibuat lebih "nampak" (factor lebih besar) supaya tidak terasa kosong.
      */}
      <Stars radius={260} depth={220} count={12000} factor={2.8} saturation={0} fade speed={0.12} />
    </group>
  );
}
