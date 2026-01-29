import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { NebulaDome } from "./NebulaDome";

type TwinkleLayerProps = {
  count: number;
  radius: number;
  depth: number;
  baseSize: number;
  spin: number;
  opacity: number;
};

function TwinkleLayer({ count, radius, depth, baseSize, spin, opacity }: TwinkleLayerProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const geom = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const speeds = new Float32Array(count);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    const dir = new THREE.Vector3();
    const c = new THREE.Color();

    for (let i = 0; i < count; i++) {
      // Arah acak di bola (uniform)
      dir.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
      if (dir.lengthSq() < 1e-6) dir.set(0, 1, 0);
      dir.normalize();

      // Shell: radius sampai radius - depth
      const r = radius - Math.random() * depth;
      const x = dir.x * r;
      const y = dir.y * r;
      const z = dir.z * r;

      positions[i * 3 + 0] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      phases[i] = Math.random() * Math.PI * 2;
      // Kecepatan twinkle beda-beda biar nggak serempak
      speeds[i] = 0.7 + Math.random() * 1.8;
      // Ukuran bintang bervariasi
      sizes[i] = baseSize * (0.55 + Math.random() * 0.9);

      // Warna dominan putih-kebiruan + sedikit variasi hangat
      const h = 0.55 + (Math.random() - 0.5) * 0.08; // sekitar biru
      const s = 0.05 + Math.random() * 0.25;
      const l = 0.72 + Math.random() * 0.25;
      c.setHSL(h, s, l);

      // Sesekali bintang agak hangat
      if (Math.random() < 0.08) {
        c.setHSL(0.08 + Math.random() * 0.04, 0.25 + Math.random() * 0.25, 0.75 + Math.random() * 0.2);
      }

      colors[i * 3 + 0] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    g.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    g.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    g.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    return g;
  }, [count, radius, depth, baseSize]);

  const mat = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: opacity },
      },
      vertexShader: `
        uniform float uTime;
        attribute float aPhase;
        attribute float aSpeed;
        attribute float aSize;
        attribute vec3 aColor;
        varying float vTw;
        varying vec3 vColor;
        void main() {
          vColor = aColor;
          // 0..1 twinkle
          vTw = 0.55 + 0.45 * sin(uTime * aSpeed + aPhase);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          // point size (perspective)
          // Jangan terlalu "bokeh" saat dekat kamera (biar nggak jadi badai salju)
          float size = aSize * (240.0 / max(1.0, -mvPosition.z));
          gl_PointSize = size;
        }
      `,
      fragmentShader: `
        uniform float uOpacity;
        varying float vTw;
        varying vec3 vColor;
        void main() {
          vec2 uv = gl_PointCoord - vec2(0.5);
          float d = length(uv);
          // core + halo
          float core = smoothstep(0.28, 0.0, d);
          // Halo diperkecil lagi supaya glow lebih elegan (nggak over)
          float halo = smoothstep(0.52, 0.16, d) * 0.14;
          float a = (core + halo) * vTw * uOpacity;
          if (a < 0.01) discard;
          gl_FragColor = vec4(vColor, a);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [opacity]);

  useFrame((state, dt) => {
    if (materialRef.current) materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    if (pointsRef.current) pointsRef.current.rotation.y += dt * spin;
  });

  return (
    <points ref={pointsRef} geometry={geom}>
      <primitive ref={materialRef} object={mat} attach="material" />
    </points>
  );
}

export function Starfield() {
  return (
    <group>

      {/* Nebula / milky way procedural dome */}
      <NebulaDome radius={240} />

      {/* Lapisan bintang jauh: banyak, kecil, drift pelan */}
      <Stars radius={230} depth={200} count={18000} factor={1.0} fade speed={0.02} />

      {/* Lapisan sparkle: twinkle yang kebaca */}
      <TwinkleLayer count={1800} radius={140} depth={95} baseSize={2.2} spin={0.006} opacity={0.26} />
      <TwinkleLayer count={1400} radius={120} depth={80} baseSize={2.5} spin={0.01} opacity={0.42} />
      <TwinkleLayer count={700} radius={70} depth={45} baseSize={3.4} spin={0.015} opacity={0.38} />

      {/* Sedikit bintang terang besar (sparkle jarang) */}
      <TwinkleLayer count={120} radius={175} depth={140} baseSize={7.0} spin={0.003} opacity={0.12} />
    </group>
  );
}

