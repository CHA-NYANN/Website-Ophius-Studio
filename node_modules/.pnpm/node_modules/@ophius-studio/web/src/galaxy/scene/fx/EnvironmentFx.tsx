import React, { useMemo } from "react";
import * as THREE from "three";
import { Zodiac } from "../entities/Zodiac";

/**
 * Efek lingkungan/props.
 *
 * Catatan desain:
 * - POV (kamera) harus berada di pusat ruang (center).
 * - Jadi kita TIDAK menaruh benda solid besar di pusat (0,0,0),
 *   karena itu membuat kamera terasa "di luar" / mengorbit.
 * - Aksen (ring glow tipis) kita taruh sebagai "ground haze" jauh di bawah,
 *   supaya dari POV terlihat seperti busur di bawah layar.
 */
export function EnvironmentFx() {
  const glowGeo = useMemo(() => new THREE.CircleGeometry(14.5, 128), []);

  return (
    <group>
      {/* Soft ground haze (jauh di bawah) */}
      <mesh geometry={glowGeo} rotation={[-Math.PI / 2, 0, 0]} position={[0, -8.8, 0]}>
        <meshBasicMaterial color="#1d4ed8" transparent opacity={0.012} />
      </mesh>

      {/* Distant constellations + accents */}
      <Zodiac />
    </group>
  );
}
