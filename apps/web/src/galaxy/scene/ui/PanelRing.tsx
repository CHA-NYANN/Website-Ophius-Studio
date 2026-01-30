import { Text, useCursor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useEffect, useLayoutEffect, useMemo, useRef, useSyncExternalStore } from "react";
import {
  DoubleSide,
  Euler,
  MathUtils,
  MeshStandardMaterial,
  Group,
  Quaternion,
  Vector3,
  type PerspectiveCamera
} from "three";
import { buildPanelRing } from "@/galaxy/panels/panelRegistry";
import { originRectFromPointerEvent, navigateWithPortal } from "@/portal/navigateWithPortal";
import { usePanelPointer } from "@/galaxy/interactions/usePanelPointer";
import { computePanelMotion } from "@/galaxy/interactions/panelMotion";
import { panelFilterStore } from "@/galaxy/interactions/panelFilterStore";
import { portal } from "@/portal/portalSingleton";
import { cameraStore } from "@/galaxy/scene/rigs/cameraStore";
import { TOKENS } from "@/theme/tokens";
import { focusStore } from "@/galaxy/focus/focusStore";
import { navStore } from "@/galaxy/nav/navStore";

function usePanelQuery() {
  return useSyncExternalStore(
    (cb) => panelFilterStore.subscribe(cb),
    () => panelFilterStore.getState().query,
    () => panelFilterStore.getState().query
  );
}

function usePortalState() {
  return useSyncExternalStore(
    (cb) => portal.subscribe(cb),
    () => portal.getState(),
    () => portal.getState()
  );
}

function useNavOpen() {
  return useSyncExternalStore(
    (cb) => navStore.subscribe(cb),
    () => navStore.getState().open,
    () => navStore.getState().open
  );
}

function useFocusState() {
  return useSyncExternalStore(
    (cb) => focusStore.subscribe(cb),
    () => focusStore.getState(),
    () => focusStore.getState()
  );
}

type PanelNode = ReturnType<typeof buildPanelRing>[number];

function PanelCard({
  p,
  dimAmount,
  locked
}: {
  p: PanelNode;
  dimAmount: number;
  locked: boolean;
}) {
  const portalState = usePortalState();
  const query = usePanelQuery();
  const { isHover, isPressed, onEnter, onLeave, onDown, onUp } = usePanelPointer(p.id);

  const q = query.trim().toLowerCase();
  const isMatch = q.length === 0 ? true : (p.label + " " + p.to).toLowerCase().includes(q);
  const preview =
    portalState.phase === "focusPreview" && portalState.target?.kind === "internal" && portalState.target.toPath === p.to;

  useCursor(!locked && isHover && isMatch);

  const cardRef = useRef<Group | null>(null);
  const liftRef = useRef<Group | null>(null);
  const matRef = useRef<MeshStandardMaterial | null>(null);
  const outlineRef = useRef<any>(null);

  useFrame((_, dt) => {
    if (!cardRef.current || !liftRef.current || !matRef.current) return;

    const m = computePanelMotion({
      hover: !locked && isHover,
      pressed: !locked && isPressed,
      preview,
      dimmed: !isMatch,
      dimAmount
    });

    const curScale = liftRef.current.scale.x;
    const nextScale = MathUtils.damp(curScale, m.scale, 14, dt);
    liftRef.current.scale.setScalar(nextScale);

    const curLift = liftRef.current.position.y;
    const nextLift = MathUtils.damp(curLift, m.lift, 14, dt);
    liftRef.current.position.y = nextLift;

    // "Zoom" terasa seperti panel mendekat ke POV.
    const curDepth = liftRef.current.position.z;
    const nextDepth = MathUtils.damp(curDepth, m.depth, 14, dt);
    liftRef.current.position.z = nextDepth;

    const glowBias = p.featured ? 0.18 : 0;
    const targetGlow = m.glow + glowBias;
    const targetOpacity = p.featured ? Math.min(0.98, m.opacity + 0.06) : m.opacity;
    matRef.current.emissiveIntensity = MathUtils.damp(matRef.current.emissiveIntensity, targetGlow, 16, dt);
    matRef.current.opacity = MathUtils.damp(matRef.current.opacity, targetOpacity, 16, dt);

    if (outlineRef.current) {
      outlineRef.current.outlineWidth = isHover && isMatch ? 0.01 : 0;
    }
  });

  return (
    // Transform (pos/rot/scale) di-handle oleh slot di PanelRing supaya bisa dianimasi.
    <group ref={cardRef}>
      <group ref={liftRef}>
        {p.featured && (
          <mesh position={[0, 0, -0.02]}>
            <planeGeometry args={[3.55, 1.72, 1, 1]} />
            <meshStandardMaterial
              color={"#0a1020"}
              emissive={"#2c6cff"}
              emissiveIntensity={0.35}
              transparent
              opacity={0.22}
              side={DoubleSide}
              depthWrite={false}
              depthTest={false}
            />
          </mesh>
        )}
        <mesh
          onPointerEnter={() => onEnter()}
          onPointerLeave={() => onLeave()}
          onPointerDown={(e) => {
            if (locked || !isMatch) return;
            e.stopPropagation();
            onDown();
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
            if (locked) return;
            onUp();
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (locked || !isMatch) return;
            const origin = originRectFromPointerEvent(e);
            if (p.id === "games") {
              focusStore.open("games", { x: origin.x, y: origin.y, w: origin.width, h: origin.height });
              return;
            }
            navigateWithPortal(p.to, origin);
          }}
        >
          <planeGeometry args={[p.featured ? 3.2 : 2.3, p.featured ? 1.45 : 1.1, 1, 1]} />
          <meshStandardMaterial
            ref={matRef}
            color={"#0a1020"}
            emissive={p.featured ? "#2c6cff" : "#1b2b55"}
            emissiveIntensity={0.55}
            transparent
            opacity={0.86}
            side={DoubleSide}
            depthWrite={false}
            depthTest={false}
          />
        </mesh>
        {p.featured && (
          <Text
            position={[0, 0.58, 0.01]}
            fontSize={0.14}
            letterSpacing={0.14}
            anchorX="center"
            anchorY="middle"
            color={"#d2f0ff"}
            fillOpacity={0.9}
            outlineWidth={0}
          >
            FEATURED
          </Text>
        )}
        <Text
          ref={outlineRef}
          position={[0, 0, 0.01]}
          fontSize={p.featured ? 0.26 : 0.22}
          maxWidth={p.featured ? 2.9 : 2.1}
          anchorX="center"
          anchorY="middle"
          color={"white"}
          fillOpacity={isMatch ? 1 : 0.55}
          outlineWidth={0}
          outlineColor={"#4aa3ff"}
        >
          {p.label}
        </Text>
      </group>
    </group>
  );
}

export function PanelRing() {
  const nodes = useMemo(() => buildPanelRing(), []);
  const navOpen = useNavOpen();
  const focus = useFocusState();

  // simpan yaw kamera tanpa re-render tiap frame
  const yawRef = useRef(cameraStore.getState().yaw);
  useEffect(() => {
    return cameraStore.subscribe(() => {
      yawRef.current = cameraStore.getState().yaw;
    });
  }, []);

  // Panel + nav planet diberi layer UI supaya CameraRig bisa nge-raycast UI dan tidak mulai drag.
  const UI_LAYER = 31;
  const rootRef = useRef<Group>(null!);
  const slotsRef = useRef<Array<Group | null>>([]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.traverse((o: any) => {
      if (o?.layers?.enable) o.layers.enable(UI_LAYER);
    });
  }, [nodes.length]);

  // animasi open/close mengikuti NavPlanet
  const tRef = useRef(0);
  const orbitRef = useRef(0);
  const vClosed = useRef(new Vector3());
  const vOpenLocal = useRef(new Vector3());
  const vOpenWorld = useRef(new Vector3());
  const qClosed = useRef(new Quaternion());
  const qTmp = useRef(new Quaternion());
  const eTmp = useRef(new Euler());

  const smooth01 = (x: number) => {
    const t = MathUtils.clamp(x, 0, 1);
    return t * t * (3 - 2 * t);
  };

  const safe = TOKENS.blackHole;
  const locked = focus.open;
  // Start sedikit ke kiri supaya panel featured (“Games”) jatuh di kiri-depan saat load, mirip desain.
  const startAngle = Math.PI / 2 + 0.32;

  useFrame((state, dt) => {
    const cam = state.camera as PerspectiveCamera;

    // progress nav-open
    const target = navOpen ? 1 : 0;
    tRef.current = MathUtils.damp(tRef.current, target, 9.0, dt);
    const vis = smooth01(tRef.current);

    // orbit pelan hanya saat menu terbuka
    orbitRef.current += dt * 0.32 * (0.1 + 0.9 * vis);

    // viewport size at depth (kita samakan dengan NavPlanet)
// Mobile/portrait butuh orbit lebih "tinggi" dan panel sedikit lebih kecil supaya tidak tabrakan.
const isMobile = state.size.width < 520 || cam.aspect < 0.9;

// Dorong panel sedikit lebih jauh saat mobile supaya kelihatan lebih kecil (tanpa mengubah ukuran mesh).
const depthOpen = isMobile ? 5.25 : 4.6;
const depthPanels = depthOpen + 0.75; // sedikit di belakang planet
const fov = MathUtils.degToRad(cam.fov);
const h = 2 * depthPanels * Math.tan(fov / 2);
const w = h * cam.aspect;
const minWH = Math.min(w, h);

// Orbit radius & scale (mobile: lebih kecil + lebih rapat di X, lebih tinggi di Y).
const radiusHUD = minWH * (isMobile ? 0.44 : 0.38);
const scaleHUD = MathUtils.clamp(
  minWH * (isMobile ? 0.145 : 0.18),
  isMobile ? 0.26 : 0.32,
  isMobile ? 0.44 : 0.52
);

// Ellipse shaping untuk mobile (portrait): lebih tinggi, sedikit lebih sempit.
const xMul = isMobile ? 0.86 : 1.0;
const yMul = isMobile ? 0.78 : 0.42;
const yOffset = isMobile ? 0.18 : 0.0;

    // safe-cone factor (hanya relevan saat menu tertutup)
    const denom = Math.max(0.0001, safe.safeConeStartYaw - safe.safeConeFullYaw);
    const safeFactor = MathUtils.clamp((safe.safeConeStartYaw - yawRef.current) / denom, 0, 1) * (1 - vis);

    const N = nodes.length;
    const orbit = orbitRef.current;
    const baseStart = -Math.PI / 2 - 0.28;

    for (let i = 0; i < N; i++) {
      const slot = slotsRef.current[i];
      if (!slot) continue;
      const p = nodes[i];

      // CLOSED target (ring world seperti fixed26)
      const angle = startAngle + (i / N) * Math.PI * 2;
      const baseX = Math.cos(angle) * p.radius;
      const baseZ = Math.sin(angle) * p.radius;
      const push = safeFactor * safe.safeConePush * Math.max(0, -baseX);
      const x = baseX + push;
      const z = baseZ * (1 - safeFactor * 0.08);
      vClosed.current.set(x, p.y, z);

      const yaw = Math.atan2(-x, -z);
      eTmp.current.set(0, yaw, 0);
      qClosed.current.setFromEuler(eTmp.current);

      // OPEN target (HUD orbit mengelilingi planet di tengah)
      const a = baseStart + (i / N) * Math.PI * 2 + orbit;
      const rr = radiusHUD * (p.featured ? (isMobile ? 1.03 : 1.08) : 1.0);
const ox = Math.cos(a) * rr * xMul;
const oy = Math.sin(a) * rr * yMul + yOffset + (p.featured ? rr * (isMobile ? 0.07 : 0.1) : 0);
      const oz = Math.sin(a * 1.25 + i * 0.7) * 0.08;

      // posisi dalam camera-space, lalu jadi world.
      vOpenLocal.current.set(ox, oy, -depthPanels + oz);
      vOpenWorld.current.copy(vOpenLocal.current).applyMatrix4(cam.matrixWorld);

      // Blend
      const k = vis;
      slot.position.lerpVectors(vClosed.current, vOpenWorld.current, k);

      // Quaternion blend: closed yaw -> full billboard (camera quaternion)
      qTmp.current.copy(qClosed.current).slerp(cam.quaternion, k);
      slot.quaternion.copy(qTmp.current);

      // Scale blend: normal -> kecil untuk mode menu
      const s = MathUtils.lerp(1.0, scaleHUD, k);
      slot.scale.setScalar(s);
    }
  });

  return (
    <group ref={rootRef} frustumCulled={false}>
      {nodes.map((p, i) => (
        <group
          key={p.id}
          ref={(el) => {
            slotsRef.current[i] = el;
          }}
          frustumCulled={false}
        >
          {/* dimAmount tetap dipakai untuk efek safe-cone saat menu tertutup */}
          <PanelCard p={p} dimAmount={0} locked={locked} />
        </group>
      ))}
    </group>
  );
}
