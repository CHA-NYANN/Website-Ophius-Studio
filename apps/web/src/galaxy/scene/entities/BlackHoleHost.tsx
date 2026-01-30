import React, { useEffect, useMemo, useState } from "react";
import { BlackHoleModel } from "./BlackHoleModel";

// Prefer a clean canonical name, but also support the exported Blender file name.
const MODEL_URLS = [
  "/models/blackhole/blackhole.glb",
  "/models/blackhole/black_hole_project.glb",
];

async function isLikelyBinaryAsset(url: string): Promise<boolean> {
  try {
    // HEAD is cheap; in SPA dev servers, missing files sometimes fall back to index.html (200 + text/html).
    const r = await fetch(url, { method: "HEAD", cache: "no-store" });
    if (!r.ok) return false;

    const ct = (r.headers.get("content-type") || "").toLowerCase();
    if (ct.includes("text/html")) return false;

    // If the server doesn't provide content-type, assume false to avoid false-positives.
    if (!ct) return false;

    return true;
  } catch {
    return false;
  }
}

/**
 * BlackHoleHost (GLB-only)
 *
 * User request:
 * - Hapus blackhole + cincin yang dibuat dari kode (procedural).
 * - Fokus pakai blackhole dari GLB Blender saja.
 *
 * Jadi: kalau GLB ada -> render GLB. Kalau tidak ada -> render nothing (tanpa fallback procedural).
 */
export function BlackHoleHost() {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const urls = useMemo(() => MODEL_URLS, []);

  useEffect(() => {
    let alive = true;

    (async () => {
      for (const url of urls) {
        const ok = await isLikelyBinaryAsset(url);
        if (ok) {
          if (alive) setModelUrl(url);
          return;
        }
      }
      if (alive) setModelUrl(null);
    })();

    return () => {
      alive = false;
    };
  }, [urls]);

  if (!modelUrl) return null;

  return (
    <BlackHoleModel
      url={modelUrl}
      // Slight tilt helps match the cinematic reference angle.
      rotation={[0, 0.12, 0.0]}
      scale={1}
      position={[-5.6, 0.18, 0.25]}
    />
  );
}
