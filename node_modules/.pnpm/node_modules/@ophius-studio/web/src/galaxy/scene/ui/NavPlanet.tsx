import { useCursor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React from "react";
import * as THREE from "three";
import { navStore } from "@/galaxy/nav/navStore";
import { pointerStore } from "@/galaxy/interactions/pointerStore";

function useNavOpen() {
  return React.useSyncExternalStore(
    (cb) => navStore.subscribe(cb),
    () => navStore.getState().open,
    () => navStore.getState().open
  );
}

/**
 * NavPlanet
 * - Closed: kecil di kanan bawah layar (HUD) dan selalu nempel kamera.
 * - Open: membesar dan pindah ke tengah layar, sekaligus jadi toggle menu.
 */
export function NavPlanet() {
  const open = useNavOpen();

  const UI_LAYER = 31;

  const root = React.useRef<THREE.Group>(null!);
  const planet = React.useRef<THREE.Mesh>(null!);
  const ring = React.useRef<THREE.Mesh>(null!);

  const [hovered, setHovered] = React.useState(false);
  useCursor(hovered);

  const tRef = React.useRef(0);
  const vLocal = React.useMemo(() => new THREE.Vector3(), []);
  const vWorld = React.useMemo(() => new THREE.Vector3(), []);

  // Tandai sebagai UI untuk raycast CameraRig (biar klik ga ketarik drag kamera).
  React.useLayoutEffect(() => {
    const g = root.current;
    if (!g) return;
    g.traverse((o: any) => {
      if (o?.layers?.enable) o.layers.enable(UI_LAYER);
    });
  }, []);

  useFrame((state, dt) => {
    const g = root.current;
    if (!g) return;

    // Smooth open progress.
    const targetT = open ? 1 : 0;
    tRef.current = THREE.MathUtils.damp(tRef.current, targetT, 8.5, dt);
    const t = tRef.current;

    // Compute viewport size at a fixed depth in camera local space.
    const cam = state.camera as THREE.PerspectiveCamera;
    const depthClosed = 3.25;
    const depthOpen = 4.6;
    const depth = THREE.MathUtils.lerp(depthClosed, depthOpen, t);

    const fov = THREE.MathUtils.degToRad(cam.fov);
    const h = 2 * depth * Math.tan(fov / 2);
    const w = h * cam.aspect;

    // Bottom-right (closed) -> center (open)
    // Margin berbasis viewport (lebih konsisten di portrait/mobile).
    const marginX = w * 0.12;
    const marginY = h * 0.12;
    const xClosed = w / 2 - marginX;
    const yClosed = -h / 2 + marginY;

    const x = THREE.MathUtils.lerp(xClosed, 0, t);
    const y = THREE.MathUtils.lerp(yClosed, 0, t);
    const z = -depth;

    // Keep it in the main scene graph (so it always renders), but move it as-if
    // it were in camera space.
    vLocal.set(x, y, z);
    vWorld.copy(vLocal).applyMatrix4(cam.matrixWorld);
    g.position.copy(vWorld);
    g.quaternion.copy(cam.quaternion);

    // Scale: small in corner, bigger in center.
    const baseScale = THREE.MathUtils.lerp(0.22, 0.6, t);
    const hoverBoost = hovered ? 0.06 : 0;
    g.scale.setScalar(baseScale + hoverBoost);

    // Subtle self-rotation so it feels alive.
    if (planet.current) planet.current.rotation.y += dt * 0.55;
    if (ring.current) ring.current.rotation.z += dt * 0.18;
  });

  return (
    <group ref={root} renderOrder={5} frustumCulled={false}>
      <group
        onPointerEnter={(e) => {
          e.stopPropagation();
          setHovered(true);
          pointerStore.setHover("navplanet");
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          setHovered(false);
          if (pointerStore.getState().hoverId === "navplanet") pointerStore.setHover(null);
          if (pointerStore.getState().pressedId === "navplanet") pointerStore.setPressed(null);
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          // Touch tidak punya konsep hover yang stabil.
          // Kita cukup tandai pressed supaya CameraRig tidak mulai drag.
          pointerStore.setPressed("navplanet");
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          if (pointerStore.getState().pressedId === "navplanet") pointerStore.setPressed(null);
          // Failsafe: di touch/pen, pointerleave sering tidak terpanggil → hover bisa nyangkut.
          if (e.pointerType !== "mouse" && pointerStore.getState().hoverId === "navplanet") {
            pointerStore.setHover(null);
            setHovered(false);
          }
        }}
        onClick={(e) => {
          e.stopPropagation();
          navStore.toggle();
          // Setelah klik/tap, jangan biarkan hover nyangkut di mobile.
          if (e.pointerType !== "mouse" && pointerStore.getState().hoverId === "navplanet") {
            pointerStore.setHover(null);
            setHovered(false);
          }
        }}
      >
        <mesh ref={planet} castShadow renderOrder={5}>
          <sphereGeometry args={[0.6, 48, 48]} />
          <meshStandardMaterial
            color={new THREE.Color("#f7ae2c")}
            metalness={0.1}
            roughness={0.22}
            depthWrite={false}
            depthTest={false}
          />
        </mesh>

        <mesh ref={ring} renderOrder={5} rotation={[THREE.MathUtils.degToRad(65), 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[0.75, 1.35, 64]} />
          <meshStandardMaterial
            color={new THREE.Color("#f7d386")}
            metalness={0.15}
            roughness={0.55}
            transparent
            opacity={0.68}
            depthWrite={false}
            depthTest={false}
          />
        </mesh>

        {/* Soft halo */}
        <mesh renderOrder={5}>
          <sphereGeometry args={[1.1, 24, 24]} />
          <meshBasicMaterial
            color={new THREE.Color("#f7ae2c")}
            transparent
            opacity={0.05}
            depthWrite={false}
            depthTest={false}
          />
        </mesh>
      </group>
    </group>
  );
}
