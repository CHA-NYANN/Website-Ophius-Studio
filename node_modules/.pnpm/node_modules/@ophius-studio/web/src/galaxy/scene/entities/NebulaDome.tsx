import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/**
 * NebulaDome: "milky way / nebula" procedural background.
 * Tidak pakai texture (biar aman & ringan). Cuma shader noise + band.
 */
export function NebulaDome({ radius = 240 }: { radius?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const geo = useMemo(() => new THREE.SphereGeometry(radius, 48, 32), [radius]);

  const mat = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 1.0 },
      },
      vertexShader: `
        varying vec3 vDir;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vDir = normalize(worldPos.xyz);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        precision highp float;
        uniform float uTime;
        uniform float uIntensity;
        varying vec3 vDir;

        float hash(vec3 p){
          return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
        }

        float noise(vec3 p){
          vec3 i = floor(p);
          vec3 f = fract(p);
          vec3 u = f*f*(3.0-2.0*f);

          float n000 = hash(i + vec3(0,0,0));
          float n100 = hash(i + vec3(1,0,0));
          float n010 = hash(i + vec3(0,1,0));
          float n110 = hash(i + vec3(1,1,0));
          float n001 = hash(i + vec3(0,0,1));
          float n101 = hash(i + vec3(1,0,1));
          float n011 = hash(i + vec3(0,1,1));
          float n111 = hash(i + vec3(1,1,1));

          float nx00 = mix(n000, n100, u.x);
          float nx10 = mix(n010, n110, u.x);
          float nx01 = mix(n001, n101, u.x);
          float nx11 = mix(n011, n111, u.x);

          float nxy0 = mix(nx00, nx10, u.y);
          float nxy1 = mix(nx01, nx11, u.y);

          return mix(nxy0, nxy1, u.z);
        }

        float fbm(vec3 p){
          float v = 0.0;
          float a = 0.55;
          for(int i=0;i<5;i++){
            v += a * noise(p);
            p = p * 2.03 + 17.0;
            a *= 0.52;
          }
          return v;
        }

        void main(){
          vec3 d = normalize(vDir);

          // "Milky Way band" miring sedikit (biar dramatis seperti referensi)
          vec3 axis = normalize(vec3(0.25, 0.92, 0.3));
          float band = 1.0 - abs(dot(d, axis));   // 0..1
          band = pow(clamp(band, 0.0, 1.0), 4.2); // makin tipis

          // Noise clouds di sepanjang band
          float t = uTime * 0.02;
          float n1 = fbm(d * 3.8 + vec3(0.0, t, 0.0));
          float n2 = fbm(d * 8.5 + vec3(13.0, -t*1.3, 7.0));
          float clouds = smoothstep(0.35, 0.95, (n1 * 0.75 + n2 * 0.55)) * band;

          // Dust halus menyebar lebih lebar
          float dust = smoothstep(0.25, 0.95, fbm(d * 14.0 + vec3(9.0, 4.0, t*2.0))) * (band * 0.55 + 0.12);

          // Highlight "nebula knots"
          float knots = smoothstep(0.85, 1.0, fbm(d * 10.0 + vec3(20.0, 3.0, -t)));

          vec3 base = vec3(0.01, 0.01, 0.02);
          vec3 c1 = vec3(0.12, 0.22, 0.55); // blue
          vec3 c2 = vec3(0.55, 0.18, 0.62); // purple
          vec3 c3 = vec3(0.18, 0.65, 0.85); // cyan

          vec3 col = base;

          // campuran warna awan
          col += mix(c1, c2, n1) * clouds * (0.9 + n2 * 0.6);
          col += c3 * dust * 0.35;

          // knots lebih terang
          col += (c3 * 0.8 + c2 * 0.6) * knots * band * 0.35;

          // vignette biar pinggir gelap (seperti foto galaxy)
          float v = pow(1.0 - clamp(abs(d.y) * 0.9, 0.0, 1.0), 1.6);
          col *= (0.72 + 0.28 * v);

          // gamma-ish
          col = pow(col, vec3(0.95));

          gl_FragColor = vec4(col * uIntensity, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
      toneMapped: false,
    });
  }, []);

  useFrame((state, dt) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    if (meshRef.current) {
      // rotasi halus supaya awan terasa hidup, tapi tidak bikin mual
      meshRef.current.rotation.y += dt * 0.004;
      meshRef.current.rotation.x += dt * 0.0015;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geo}>
      <primitive ref={matRef} object={mat} attach="material" />
    </mesh>
  );
}
