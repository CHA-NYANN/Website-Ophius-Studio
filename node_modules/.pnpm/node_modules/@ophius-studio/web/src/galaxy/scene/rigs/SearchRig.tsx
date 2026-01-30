import { Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Suspense, useMemo, useRef, useSyncExternalStore } from "react";
import { Group, MathUtils, Vector3 } from "three";
import { TOKENS } from "@/theme/tokens";
import { cameraStore } from "@/galaxy/scene/rigs/cameraStore";

function useCameraState() {
  return useSyncExternalStore(
    (cb) => cameraStore.subscribe(cb),
    () => cameraStore.getState(),
    () => cameraStore.getState()
  );
}

const tmpDir = new Vector3();
const tmpRight = new Vector3();
const tmpUp = new Vector3();
const tmpPos = new Vector3();

export function SearchRig() {
  const { camera } = useThree();
  const s = useCameraState();
  const g = useRef<Group | null>(null);
  const visRef = useRef(0);

  const dims = useMemo(() => ({ w: 2.55, h: 0.72, kbw: 2.8, kbh: 1.25 }), []);

  useFrame((_, dt) => {
    const pitchStart = TOKENS.search.pitchStart;
    const pitchFull = TOKENS.search.pitchFull;
    const raw = (s.pitch - pitchStart) / (pitchFull - pitchStart);
    const vis = MathUtils.clamp(raw, 0, 1);
    visRef.current = MathUtils.damp(visRef.current, vis, 10.5, dt);

    if (!g.current) return;
    g.current.visible = visRef.current > 0.01;
    g.current.scale.setScalar(0.9 + visRef.current * 0.15);
    g.current.children.forEach((c) => {
      // @ts-expect-error - r3f runtime
      if (c.material) c.material.opacity = 0.05 + visRef.current * 0.42;
    });

    camera.getWorldDirection(tmpDir).normalize();
    tmpUp.copy(camera.up).normalize();
    tmpRight.crossVectors(tmpDir, tmpUp).normalize();

    tmpPos
      .copy(camera.position)
      .add(tmpDir.multiplyScalar(4.0))
      .add(tmpRight.multiplyScalar(-1.65))
      .add(tmpUp.multiplyScalar(-1.05));

    g.current.position.copy(tmpPos);
    g.current.quaternion.copy(camera.quaternion);
  });

  return (
    <group ref={g}>
      <mesh raycast={() => null as any} position={[0, 0.45, 0]}>
        <planeGeometry args={[dims.w, dims.h]} />
        <meshStandardMaterial
          color={"#0a1020"}
          emissive={"#66ccff"}
          emissiveIntensity={0.85}
          transparent
          opacity={0.12}
        />
      </mesh>
      <Suspense fallback={null}>
        <Text
          position={[-dims.w / 2 + 0.12, 0.45, 0.01]}
        fontSize={0.16}
        anchorX="left"
        anchorY="middle"
        color={"white"}
      >
        SEARCH
        </Text>
      </Suspense>

      <mesh raycast={() => null as any} position={[0, -0.35, 0]}>
        <planeGeometry args={[dims.kbw, dims.kbh]} />
        <meshStandardMaterial
          color={"#071020"}
          emissive={"#33a3ff"}
          emissiveIntensity={0.75}
          transparent
          opacity={0.1}
        />
      </mesh>
      <Text position={[0, -0.35, 0.01]} fontSize={0.14} anchorX="center" anchorY="middle" color={"rgba(255,255,255,0.8)"}>
        keyboard hologram
      </Text>
    </group>
  );
}
