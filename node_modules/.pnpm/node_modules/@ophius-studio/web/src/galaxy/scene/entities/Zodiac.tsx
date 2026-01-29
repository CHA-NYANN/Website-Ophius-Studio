import { useFrame, useThree } from "@react-three/fiber";
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { TOKENS } from "@/theme/tokens";

/**
 * Zodiac: 12 rasi bintang jauh (outer ring).
 *
 * Target visual:
 * - Garis + bintang seperti "peta rasi" (flat / ilustratif).
 * - Menghadap POV (kamera di center) supaya selalu kebaca dari mana pun kamu puter.
 * - Ukuran bintang konsisten dengan starfield (bukan bola 3D besar).
 */
type ConstellationDef = {
  id: string;
  name: string;
  // posisi dalam bidang XY (flat)
  stars: Array<[number, number]>;
  edges: Array<[number, number]>;
};

const ZODIAC: ConstellationDef[] = [
  {
    id: "aries",
    name: "Aries",
    stars: [[-0.7, -0.1], [-0.3, 0.15], [0.05, 0.05], [0.4, 0.25], [0.1, -0.25]],
    edges: [[0, 1], [1, 2], [2, 3], [2, 4]],
  },
  {
    id: "taurus",
    name: "Taurus",
    stars: [[-0.8, 0.0], [-0.45, 0.2], [-0.1, 0.15], [0.25, 0.0], [0.55, 0.2], [0.25, -0.25], [-0.1, -0.15]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [3, 5], [5, 6], [6, 2]],
  },
  {
    id: "gemini",
    name: "Gemini",
    stars: [[-0.55, 0.35], [-0.55, 0.05], [-0.55, -0.25], [0.55, 0.35], [0.55, 0.05], [0.55, -0.25], [0.0, 0.15]],
    edges: [[0, 1], [1, 2], [3, 4], [4, 5], [0, 6], [3, 6]],
  },
  {
    id: "cancer",
    name: "Cancer",
    stars: [[-0.55, 0.15], [-0.2, 0.3], [0.2, 0.25], [0.55, 0.05], [0.25, -0.2], [-0.15, -0.15]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]],
  },
  {
    id: "leo",
    name: "Leo",
    stars: [[-0.65, 0.1], [-0.35, 0.28], [-0.05, 0.33], [0.2, 0.15], [0.05, -0.05], [-0.25, -0.1], [0.45, -0.05], [0.7, 0.15]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [3, 6], [6, 7]],
  },
  {
    id: "virgo",
    name: "Virgo",
    stars: [[-0.7, 0.25], [-0.4, 0.1], [-0.1, 0.0], [0.2, -0.1], [0.55, -0.05], [0.75, 0.2], [0.1, 0.25]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [2, 6], [6, 0]],
  },
  {
    id: "libra",
    name: "Libra",
    stars: [[-0.6, 0.25], [0.6, 0.25], [0.75, -0.05], [-0.75, -0.05], [0.0, -0.25]],
    edges: [[0, 1], [1, 2], [2, 4], [4, 3], [3, 0]],
  },
  {
    id: "scorpio",
    name: "Scorpio",
    stars: [[-0.75, 0.2], [-0.45, 0.15], [-0.2, 0.05], [0.05, -0.05], [0.35, -0.15], [0.55, -0.05], [0.4, 0.15], [0.65, 0.28]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]],
  },
  {
    id: "sagittarius",
    name: "Sagittarius",
    stars: [[-0.55, 0.2], [-0.25, 0.3], [0.05, 0.2], [0.3, 0.05], [0.05, -0.05], [-0.2, -0.1], [-0.35, 0.05], [0.55, -0.1]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0], [4, 7]],
  },
  {
    id: "capricorn",
    name: "Capricorn",
    stars: [[-0.7, 0.05], [-0.35, 0.25], [0.0, 0.15], [0.35, 0.3], [0.7, 0.1], [0.35, -0.15], [-0.05, -0.25], [-0.45, -0.1]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0]],
  },
  {
    id: "aquarius",
    name: "Aquarius",
    stars: [[-0.75, 0.2], [-0.45, 0.25], [-0.15, 0.15], [0.15, 0.25], [0.45, 0.15], [0.75, 0.2], [-0.25, -0.05], [0.05, -0.15], [0.35, -0.05]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [2, 6], [6, 7], [7, 8], [8, 4]],
  },
  {
    id: "pisces",
    name: "Pisces",
    stars: [[-0.7, 0.05], [-0.45, 0.25], [-0.2, 0.05], [-0.45, -0.15], [0.2, 0.05], [0.45, 0.25], [0.7, 0.05], [0.45, -0.15]],
    edges: [[0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [6, 7], [2, 4]],
  },
];

// RNG deterministik biar posisi rasi "acak" tapi stabil (nggak berubah tiap reload).
function hash32(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildLineGeometry(stars: Array<[number, number]>, edges: Array<[number, number]>, scale = 1) {
  const positions: number[] = [];
  for (const [a, b] of edges) {
    const A = stars[a];
    const B = stars[b];
    positions.push(A[0] * scale, A[1] * scale, 0, B[0] * scale, B[1] * scale, 0);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return g;
}

function buildStarGeometry(stars: Array<[number, number]>, scale = 1) {
  const positions = new Float32Array(stars.length * 3);
  const phases = new Float32Array(stars.length);
  const speeds = new Float32Array(stars.length);
  const sizes = new Float32Array(stars.length);
  const colors = new Float32Array(stars.length * 3);

  const c = new THREE.Color();
  for (let i = 0; i < stars.length; i++) {
    const [x, y] = stars[i];
    positions[i * 3 + 0] = x * scale;
    positions[i * 3 + 1] = y * scale;
    positions[i * 3 + 2] = 0;

    phases[i] = Math.random() * Math.PI * 2;
    speeds[i] = 0.6 + Math.random() * 1.1;

    // Base size disetel supaya tampak seukuran starfield (walau jaraknya lebih dekat).
    // (lihat Starfield.tsx: layer dekat radius ~70 pakai baseSize ~4.6)
    sizes[i] = 1.15 + Math.random() * 0.35;

    // putih kebiruan
    const h = 0.55 + (Math.random() - 0.5) * 0.06;
    const s = 0.05 + Math.random() * 0.18;
    const l = 0.8 + Math.random() * 0.18;
    c.setHSL(h, s, l);

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
}

function ConstellationBillboard({
  lineGeo,
  starGeo,
  opacity,
}: {
  lineGeo: THREE.BufferGeometry;
  starGeo: THREE.BufferGeometry;
  opacity: number;
}) {
  const root = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { camera } = useThree();

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
          float tw = 0.65 + 0.35 * (0.5 + 0.5 * sin(uTime * aSpeed + aPhase));
          vTw = tw;

          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          // Ukuran point disamakan dengan starfield (lihat kalibrasi aSize di atas)
          float size = aSize * (280.0 / max(1.0, -mvPosition.z));
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

          float core = smoothstep(0.28, 0.0, d);
          // Halo dibuat sedikit lebih "nyala" supaya rasi tetap kebaca,
          // tapi jangan sampai jadi efek "salju".
          float halo = smoothstep(0.56, 0.16, d) * 0.24;
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

  useFrame((state) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime;

    // billboard: selalu menghadap kamera (kamera ada di center).
    if (root.current) root.current.lookAt(camera.position);
  });

  return (
    <group ref={root}>
      {/* Garis rasi dibuat sedikit lebih terang supaya kebaca, tanpa bikin scene jadi rame */}
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial transparent opacity={opacity * 0.82} color={"#e8fbff"} depthWrite={false} />
      </lineSegments>
      {/* Lapisan glow tipis */}
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial
          transparent
          opacity={opacity * 0.18}
          color={"#86dbff"}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      <points geometry={starGeo}>
        <primitive ref={matRef} object={mat} attach="material" />
      </points>
    </group>
  );
}

export function Zodiac() {
  const lookAtY = TOKENS.camera.targetY;

  const defs = useMemo(() => ZODIAC, []);
  const ringRadius = 18.8;
  // Membesarkan rasi bukan dengan memperbesar bintangnya,
  // tapi dengan memperlebar jarak antar bintang (garis jadi lebih panjang).
  // Dibuat lebih besar biar garis rasi terasa panjang dan gampang kebaca.
  const constellationScale = 5.35;

  const lineGeos = useMemo(() => defs.map((d) => buildLineGeometry(d.stars, d.edges, constellationScale)), [defs]);
  const starGeos = useMemo(() => defs.map((d) => buildStarGeometry(d.stars, constellationScale)), [defs]);

  // pelan banget, biar terasa "distant sky" bukan UI ring
  const root = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (root.current) root.current.rotation.y += dt * 0.006;
  });

  // start offset supaya komposisi "black hole di kiri" lebih enak
  const start = Math.PI / 2 - 0.12;

  return (
    <group ref={root} position={[0, lookAtY, 0]}>
      {defs.map((d, i) => {
        // Sebelumnya rapi sejajar (equal spacing). Sekarang dibuat acak tapi stabil.
        const rand = mulberry32(hash32(d.id));

        // Masih berada di "outer sky" tapi tidak sejajar: angle/radius/tinggi di-jitter.
        const base = start + (i / defs.length) * Math.PI * 2;
        const a = base + (rand() - 0.5) * 1.25; // jitter lebih besar biar nggak kelihatan sejajar
        const r = ringRadius + (rand() - 0.5) * 6.0; // +/- 3 units
        // Tinggi dibuat lebih menyebar (atas-tengah-bawah) supaya area atas/bawah nggak kosong.
        // Dipakai kurva (pow < 1) biar lebih sering "ke atas" / "ke bawah", bukan ngumpul di tengah.
        const yN = rand() * 2.0 - 1.0;
        const y = Math.sign(yN) * Math.pow(Math.abs(yN), 0.65) * 10.0; // ~ +/- 10 units
        const x = Math.cos(a) * r;
        const z = Math.sin(a) * r;

        // dibuat lebih kebaca + sedikit lebih bercahaya
        const opacity = 0.48;

        return (
          <group key={d.id} position={[x, y, z]}>
            <ConstellationBillboard lineGeo={lineGeos[i]} starGeo={starGeos[i]} opacity={opacity} />
          </group>
        );
      })}
    </group>
  );
}
