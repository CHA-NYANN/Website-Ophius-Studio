import React from "react";
import { PanelRing } from "./PanelRing";
import { NavPlanet } from "./NavPlanet";

/**
 * RingScene: layer UI 3D (panel navigasi).
 * Ring/disk biru dekorasi sengaja dihapus supaya pusat POV terasa "ruang kosong"
 * sesuai desain.
 */
export function RingScene() {
  return (
    <group name="RingScene">
      {/* Tombol navigasi "planet" (HUD). */}
      <NavPlanet />

      {/* Panel-panel navigasi (muncul saat planet dibuka) */}
      <PanelRing />
    </group>
  );
}
