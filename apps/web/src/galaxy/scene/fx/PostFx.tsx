import React, { useMemo } from "react";
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette, ToneMapping } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import * as THREE from "three";

/**
 * PostFx: cinematic "wah" layer.
 * Notes:
 * - Bloom: glow bintang + highlight panel
 * - ToneMapping: ACES-ish via postprocessing (plus renderer ACES as baseline)
 * - Vignette + Noise + ChromAb: filmic feel
 */
export function PostFx() {
  // Multisampling: keep it moderate (postprocessing MSAA can be expensive)
  const msaa = useMemo(() => {
    // WebGL2 => allow multisampling
    // If device is weak, user can still reduce DPR via TOKENS or reduced motion
    return 4;
  }, []);

  // Chromatic offset in screen space (very subtle)
  const chromaOffset = useMemo(() => new THREE.Vector2(0.00045, 0.00065), []);

  return (
    <EffectComposer multisampling={msaa} disableNormalPass>
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />

      <Bloom
        // Naikkin threshold + turunin intensity biar glow cinematic tapi nggak jadi "salju"/bokeh kepenuhan
        luminanceThreshold={0.18}
        luminanceSmoothing={0.45}
        intensity={0.85}
        mipmapBlur
      />

      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={chromaOffset}
        radialModulation
        modulationOffset={0.55}
      />

      <Vignette eskil={false} offset={0.28} darkness={0.68} />

      <Noise blendFunction={BlendFunction.SCREEN} opacity={0.018} />
    </EffectComposer>
  );
}
