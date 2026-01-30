import { Canvas } from "@react-three/fiber";
import { useLocation } from "react-router-dom";
import { useMemo, useSyncExternalStore } from "react";
import { GalaxyScene } from "@/galaxy/scene/GalaxyScene";
import { portal } from "@/portal/portalSingleton";
import { useReducedMotion } from "@/utils/motion";
import { TOKENS } from "@/theme/tokens";
import { InteractionRig } from "@/galaxy/interactions/InteractionRig";

function usePortalPhase() {
  return useSyncExternalStore(
    (cb) => portal.subscribe(cb),
    () => portal.getState().phase,
    () => portal.getState().phase
  );
}

export function GalaxyCanvas() {
  const loc = useLocation();
  const phase = usePortalPhase();
  const reduceMotion = useReducedMotion();

  const isGalaxy = loc.pathname === "/";
  const portalIdle = phase === "idle";

  const pointerEvents = useMemo(() => {
    return isGalaxy ? "auto" : "none";
  }, [isGalaxy]);

  const frameloop = isGalaxy ? "always" : "never";

  const dpr = useMemo<[number, number]>(() => {
    // keep it light on weaker devices and for reduced motion users
    return reduceMotion ? [1, 1.25] : [1, 1.5];
  }, [reduceMotion]);

  // IMPORTANT:
  // Kita set posisi kamera awal dekat pusat juga, supaya tidak ada 1-frame "kamera dari luar"
  // yang bikin terasa seperti orbit.
  const initialCamera = useMemo(
    () => ({
      // z kecil aja agar kamera tidak degenerate (pos == target) sebelum CameraRig memegang penuh.
      position: [0, TOKENS.camera.targetY, 0.01] as [number, number, number],
      fov: 58,
      near: 0.1,
      far: 250
    }),
    []
  );

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents,
        // Prevent browser gestures from stealing pointer events
        touchAction: "none",
        opacity: isGalaxy ? 1 : 0,
        transition: "opacity 180ms ease",
        background: "radial-gradient(1200px 600px at 50% 40%, rgba(29,78,216,0.18), rgba(0,0,0,1) 60%)"
      }}
    >
      <Canvas dpr={dpr} frameloop={frameloop} camera={initialCamera} gl={{ antialias: !reduceMotion, alpha: true }}>
        {/* Failsafe: bersihin state hover/pressed kalau pointerup terjadi di luar mesh UI */}
        <InteractionRig />

        <GalaxyScene interactive={isGalaxy && portalIdle} />
      </Canvas>
    </div>
  );
}
