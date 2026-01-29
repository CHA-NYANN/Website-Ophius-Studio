import { useFrame } from "@react-three/fiber";
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { AdditiveBlending, DoubleSide } from "three";

/**
 * BlackHole (Level-2 ready)
 *
 * - Lens mesh (billboard) samples the background FBO in BlackHoleLensingPass
 *   and applies screen-space UV warping to mimic gravitational lensing.
 * - Disk mesh is a tilted ring shader (emissive/additive) for accretion disk.
 */
export function BlackHole() {
  // Posisi dibuat lebih "tengah" agar tidak terasa ke-crop di layar lebar.
  // (Masih sedikit offset supaya panel ring tetap terbaca.)
  // Tuned so it sits more centered and doesn't get visually "cropped" by the viewport.
  const pos = useMemo(() => [-5.6, 0.18, 0.25] as const, []);

  // World radii (dipakai BlackHoleLensingPass untuk hitung radius screen-space).
  // Tuned to feel closer to cinematic references (thin bright ring + larger lens).
  // Sedikit diperbesar supaya batas lens "hilang" (fade-nya lebih jauh).
  const horizonRadius = 1.15;
  const lensRadius = 3.35;

  // Disk dibuat terpisah dari radius lens (biar disk tidak ikut membengkak berlebihan)
  // dan lebih mirip referensi: disk panjang, tipis, dan sangat terang di inner edge.
  const diskOuterRadius = 4.6;

  const root = useRef<THREE.Group>(null!);
  const lens = useRef<THREE.Mesh>(null!);
  const disk = useRef<THREE.Mesh>(null!);

  const lensUniforms = useMemo(
    () => ({
      uScene: { value: null as THREE.Texture | null },
      uRes: { value: new THREE.Vector2(1, 1) },
      uCenter: { value: new THREE.Vector2(0.5, 0.5) },
      uHorizonR: { value: 0.06 },
      uLensR: { value: 0.24 },
      // Higher = stronger warping (updated in pass based on real screen radius)
      uStrength: { value: 0.34 },
      // Subtle cinematic touches
      uChromatic: { value: 0.0009 },
      uBlur: { value: 0.0 },
      uRingBoost: { value: 1.55 },
      uTime: { value: 0 }
    }),
    []
  );

  const diskUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: 1.75 }
    }),
    []
  );

  // Billboard lens mesh to always face camera.
  useFrame((state, dt) => {
    if (lens.current) {
      lens.current.quaternion.copy(state.camera.quaternion);
    }
    if (disk.current) {
      // slow rotation to give "living" feel (disk shader also animates)
      disk.current.rotation.z += dt * 0.08;
    }
  });

  return (
    <group
      ref={root}
      name="BlackHole"
      position={pos}
      userData={{ horizonRadius, lensRadius }}
    >
      {/*
        Lens mesh (billboard)
        - renders the warped background + event horizon + subtle photon ring
        - uScene is injected by BlackHoleLensingPass
      */}
      <mesh ref={lens} name="BlackHoleLens" frustumCulled={false}>
        <circleGeometry args={[lensRadius, 128]} />
        <shaderMaterial
          uniforms={lensUniforms}
          transparent
          depthWrite={false}
          side={DoubleSide}
          vertexShader={
            /* glsl */ `
            varying vec2 vUv;
            void main(){
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `
          }
          fragmentShader={
            /* glsl */ `
            uniform sampler2D uScene;
            uniform vec2 uRes;
            uniform vec2 uCenter;
            uniform float uHorizonR;
            uniform float uLensR;
            uniform float uStrength;
            uniform float uChromatic;
            uniform float uBlur;
            uniform float uRingBoost;
            uniform float uTime;

            varying vec2 vUv;

            float sat(float x){ return clamp(x, 0.0, 1.0); }

            void main(){
              // Screen uv for sampling the captured scene
              vec2 suv = gl_FragCoord.xy / uRes;
              float aspect = uRes.x / max(uRes.y, 1.0);
              // aspect-correct so the lens stays perfectly circular on widescreen
              vec2 d = (suv - uCenter) * vec2(aspect, 1.0);
              float r = length(d);

              // Soft mask: fade out lensing gently (avoid visible "crop" circle)
              // NOTE: pakai urutan smoothstep yang benar (edge0 < edge1)
              // Wider fade so the lens edge never feels "cut" by the viewport.
              float mask = 1.0 - smoothstep(uLensR * 0.60, uLensR, r);

              vec2 dir = d / max(r, 1e-4);
              vec2 dirUv = vec2(dir.x / aspect, dir.y);

              // Lensing falloff: strongest near horizon, fades outward
              float t = sat((uLensR - r) / max(uLensR - uHorizonR, 1e-4));
              float rs = max(r, 1e-4);
              float k = uStrength * uHorizonR * uHorizonR;
              float warp = k / (rs*rs + uHorizonR*uHorizonR*0.35);
              warp *= (0.35 + 0.65 * t*t);

              // Clamp warp to avoid the "hyperdrive streak" look.
              warp = clamp(warp, -0.04, 0.04);
              vec2 warped = suv + dirUv * warp;
              warped = clamp(warped, vec2(0.002), vec2(0.998));

              // Chromatic aberration (very subtle)
              float ca = uChromatic * t;
              vec3 col;
              col.r = texture2D(uScene, warped + dirUv*ca).r;
              col.g = texture2D(uScene, warped).g;
              col.b = texture2D(uScene, warped - dirUv*ca).b;

              // Radial streaks (stronger, closer to cinematic reference)
              if (uBlur > 0.001) {
                vec3 acc = col;
                float wsum = 1.0;
                for (int i = 1; i <= 9; i++) {
                  float fi = float(i);
                  float w = exp(-fi*0.55);
                  // radial streaking like cinematic references
                  vec2 off = dirUv * (fi*fi) * (uBlur * 0.0062) * (0.20 + 0.80*t);
                  acc += texture2D(uScene, warped + off).rgb * w;
                  wsum += w;
                }
                col = acc / wsum;
              }

              // Event horizon: pure black, with a soft shadow edge
              float hole = 1.0 - smoothstep(uHorizonR * 0.98, uHorizonR * 1.06, r);
              col *= (1.0 - hole);

              // Photon ring + subtle outer ring
              float ringW = max(uHorizonR * 0.10, 1e-4);
              float photon = exp(-pow((r - uHorizonR * 1.06) / ringW, 2.0));
              float einW = max(uHorizonR * 0.18, 1e-4);
              float ein = exp(-pow((r - uHorizonR * 1.62) / einW, 2.0));

              // Tiny flicker to avoid static look
              float flicker = 0.90 + 0.10 * sin(uTime * 2.3 + r*40.0);

              // Brighter + whiter rings (photon ring + Einstein ring)
              col += vec3(1.95, 1.95, 2.05) * photon * 0.92 * uRingBoost * flicker;
              col += vec3(1.45, 1.5, 1.68) * ein * 0.28 * uRingBoost;

              // subtle glow fog (soft halo)
              col += vec3(0.65, 0.7, 0.78) * pow(t, 2.6) * 0.16;

              // Darken around the hole (shadow)
              float shadow = smoothstep(uHorizonR * 1.2, uLensR, r);
              col *= mix(0.62, 1.0, shadow);

              if (mask <= 0.0005) discard;
              gl_FragColor = vec4(col, mask);
            }
          `
          }
        />
      </mesh>

      {/* Accretion disk (tilted) */}
      <mesh
        ref={disk}
        name="BlackHoleDisk"
        // Tilted/diagonal like the cinematic reference
        rotation={[Math.PI / 2.2, 0.12, 0.78]}
        position={[0, 0.08, 0.0]}
        frustumCulled={false}
      >
        <ringGeometry args={[horizonRadius * 1.01, diskOuterRadius, 512]} />
        <shaderMaterial
          uniforms={diskUniforms}
          transparent
          blending={AdditiveBlending}
          depthWrite={false}
          side={DoubleSide}
          vertexShader={
            /* glsl */ `
            varying vec2 vUv;
            void main(){
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `
          }
          fragmentShader={
            /* glsl */ `
            uniform float uTime;
            uniform float uIntensity;
            varying vec2 vUv;

            float sat(float x){ return clamp(x, 0.0, 1.0); }

            // --- lightweight value noise / fbm (no textures) ---
            float hash(vec2 p){
              return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
            }
            float noise(vec2 p){
              vec2 i = floor(p);
              vec2 f = fract(p);
              float a = hash(i);
              float b = hash(i + vec2(1.0, 0.0));
              float c = hash(i + vec2(0.0, 1.0));
              float d = hash(i + vec2(1.0, 1.0));
              vec2 u = f*f*(3.0-2.0*f);
              return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }
            float fbm(vec2 p){
              float v = 0.0;
              float a = 0.55;
              for (int i = 0; i < 5; i++) {
                v += a * noise(p);
                p *= 2.0;
                a *= 0.5;
              }
              return v;
            }

            void main(){
              // RingGeometry uv: x ~ angle [0..1], y ~ radius [0..1]
              float a = vUv.x * 6.2831853;
              float r = vUv.y;

              // Soft edges
              float edge = smoothstep(0.0, 0.02, r) * (1.0 - smoothstep(0.86, 1.0, r));

              // Bright near inner edge, fades outward
              float base = pow(1.0 - r, 1.95);

              // Turbulent filaments (organic, avoids zebra stripes)
              vec2 dir = vec2(cos(a), sin(a));
              float swirl = (1.0 - r) * 3.8;
              vec2 p = dir * (4.0 + r * 12.0);
              p += vec2(uTime * 0.12, -uTime * 0.08);
              p += vec2(-dir.y, dir.x) * swirl;

              float n1 = fbm(p * 1.6);
              float n2 = fbm(p * 4.2 + vec2(0.0, uTime * 0.28));
              float streak1 = pow(smoothstep(0.45, 0.95, n1), 2.2);
              float streak2 = pow(smoothstep(0.25, 0.85, n2), 3.0);
              float structure = mix(streak1, streak2, 0.55);

              // Relativistic-ish beaming: brighter on one side
              float beam = 0.65 + 0.55 * pow(0.5 + 0.5 * sin(a + 0.55), 2.0);

              float intensity = uIntensity * base * beam * (0.40 + 1.55 * structure);
              intensity *= edge;

              // Temperature gradient: inner white/blue, outer slightly warm
              float temp = pow(1.0 - r, 0.6);
              // Reference look: mostly white with slight blue/cool tint
              vec3 hot = vec3(1.7, 1.7, 1.82);
              vec3 warm = vec3(1.45, 1.28, 1.18);
              vec3 col = mix(warm, hot, temp);

              // Doppler-ish tint shift (very subtle, keep it mostly white)
              float dop = 0.5 + 0.5 * sin(a + 0.55);
              col = mix(col, col * vec3(0.92, 0.98, 1.08), dop * 0.35);

              // Extra inner glow / "white-hot" core
              float innerGlow = exp(-pow((r - 0.04) / 0.03, 2.0));
              col += vec3(2.2, 2.15, 2.05) * innerGlow * 0.85 * uIntensity;

              vec3 outCol = col * intensity;
              float alpha = sat(intensity * 0.85);
              if (alpha <= 0.002) discard;
              gl_FragColor = vec4(outCol, alpha);
            }
          `
          }
        />
      </mesh>
    </group>
  );
}
