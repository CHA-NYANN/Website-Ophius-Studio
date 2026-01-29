import { useFBO } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";

/**
 * BlackHoleLensingPass
 *
 * Level-2 effect (stable):
 * - Capture the scene BACKGROUND into an FBO (black hole + HUD hidden)
 * - Inject that FBO texture into the black hole lens shader as uScene
 * - Let R3F render normally (we do NOT take over the main render)
 */
export function BlackHoleLensingPass() {
  const { gl, scene, camera, size } = useThree();
  const fbo = useFBO(size.width, size.height, { depth: true, samples: 0 });

  const vCenterWorld = useMemo(() => new THREE.Vector3(), []);
  const vTmp = useMemo(() => new THREE.Vector3(), []);
  const vRight = useMemo(() => new THREE.Vector3(), []);

  // Run BEFORE default render so the lens gets uScene on the same frame.
  useFrame((state) => {
    const bhRoot = scene.getObjectByName("BlackHole") as THREE.Object3D | null;
    if (!bhRoot) return;

    const ringScene = scene.getObjectByName("RingScene") as THREE.Object3D | null;

    // Hide BH + UI while capturing the background
    const bhPrev = bhRoot.visible;
    const uiPrev = ringScene?.visible ?? true;
    bhRoot.visible = false;
    if (ringScene) ringScene.visible = false;

    gl.setRenderTarget(fbo);
    gl.clear(true, true, true);
    gl.render(scene, camera);
    gl.setRenderTarget(null);

    // Restore
    bhRoot.visible = bhPrev;
    if (ringScene) ringScene.visible = uiPrev;

    // Project BH center to screen UV
    bhRoot.getWorldPosition(vCenterWorld);
    const p = vTmp.copy(vCenterWorld).project(camera);
    const centerUv = new THREE.Vector2(p.x * 0.5 + 0.5, p.y * 0.5 + 0.5);

    // Aspect-corrected UV distance so lens stays circular on wide screens
    const aspect = size.width / Math.max(size.height, 1);
    const distUv = (a: THREE.Vector2, b: THREE.Vector2) => {
      const dx = (a.x - b.x) * aspect;
      const dy = (a.y - b.y);
      return Math.hypot(dx, dy);
    };

    // World radii -> screen-space radii in UV (derived from a rightward offset)
    const horizonWorld = (bhRoot.userData?.horizonRadius as number | undefined) ?? 1.15;
    const lensWorld = (bhRoot.userData?.lensRadius as number | undefined) ?? 3.35;

    vRight.set(1, 0, 0).applyQuaternion(camera.quaternion);
    const pH = vTmp.copy(vCenterWorld).addScaledVector(vRight, horizonWorld).project(camera);
    const pL = vTmp.copy(vCenterWorld).addScaledVector(vRight, lensWorld).project(camera);

    const horizonUv = distUv(new THREE.Vector2(pH.x * 0.5 + 0.5, pH.y * 0.5 + 0.5), centerUv);
    const lensUv = distUv(new THREE.Vector2(pL.x * 0.5 + 0.5, pL.y * 0.5 + 0.5), centerUv);

    const lensMesh = scene.getObjectByName("BlackHoleLens") as THREE.Mesh | null;
    const diskMesh = scene.getObjectByName("BlackHoleDisk") as THREE.Mesh | null;

    if (lensMesh && (lensMesh.material as any)?.uniforms) {
      const m = lensMesh.material as THREE.ShaderMaterial;
      m.uniforms.uScene.value = fbo.texture;
      m.uniforms.uRes.value.set(size.width, size.height);
      m.uniforms.uCenter.value.copy(centerUv);
      m.uniforms.uHorizonR.value = Math.max(0.0001, horizonUv);
      m.uniforms.uLensR.value = Math.max(m.uniforms.uHorizonR.value * 1.5, lensUv);
      m.uniforms.uTime.value = state.clock.elapsedTime;
    }

    if (diskMesh && (diskMesh.material as any)?.uniforms) {
      const m = diskMesh.material as THREE.ShaderMaterial;
      m.uniforms.uTime.value = state.clock.elapsedTime;
    }
  }, -1);

  return null;
}
