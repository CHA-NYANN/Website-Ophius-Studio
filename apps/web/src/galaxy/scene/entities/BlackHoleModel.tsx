import { useGLTF } from "@react-three/drei";
import React, { useEffect, useMemo } from "react";
import * as THREE from "three";

type Props = {
  /** URL served by Vite (from /public). */
  url: string;
  /** World position (defaults tuned for the current Galaxy composition). */
  position?: [number, number, number];
  /** Extra scaling multiplier. */
  scale?: number;
  /** Rotation in Euler radians. */
  rotation?: [number, number, number];
};

/**
 * BlackHoleModel
 *
 * Loads a glTF/GLB black hole asset (artist-made) and places it in the Galaxy scene.
 *
 * Place the exported asset here:
 *   apps/web/public/models/blackhole/blackhole.glb
 *
 * Why we do this:
 * - A baked/model-based black hole is generally cheaper than FBO+lensing shaders.
 * - Exporting from Blender is required because Three.js can't load .blend directly.
 */
export function BlackHoleModel({
  url,
  position = [-5.6, 0.18, 0.25],
  scale = 1,
  rotation = [0, 0, 0]
}: Props) {
  // drei caches by URL.
  const gltf = useGLTF(url) as unknown as { scene: THREE.Group };

  const model = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  useEffect(() => {
    // Make materials look good under our simple lighting.
    model.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;

      mesh.castShadow = false;
      mesh.receiveShadow = false;

      const mat = mesh.material as THREE.Material | THREE.Material[];
      const mats = Array.isArray(mat) ? mat : [mat];
      mats.forEach((m: any) => {
        if (!m) return;
        // If the asset uses emissive textures, keep it punchy.
        if ("emissiveIntensity" in m) {
          m.emissiveIntensity = Math.max(m.emissiveIntensity ?? 1, 1.25);
        }
        // Prevent tone mapping from dulling the glow.
        if ("toneMapped" in m) {
          m.toneMapped = false;
        }
        // Many black hole assets rely on additive/transparency.
        if (m.transparent) {
          m.depthWrite = false;
          m.side = THREE.DoubleSide;
        }
      });
    });
  }, [model]);

  return (
    <group name="BlackHole" position={position} rotation={rotation} scale={scale}>
      <primitive object={model} />
    </group>
  );
}

// Optional preload for smoother first render when asset exists.
useGLTF.preload("/models/blackhole/blackhole.glb");
useGLTF.preload("/models/blackhole/black_hole_project.glb");
