import React, { useEffect, useMemo, useState } from "react";
import { BlackHole } from "./BlackHole";
import { BlackHoleModel } from "./BlackHoleModel";
import { BlackHoleLensingPass } from "../fx/BlackHoleLensingPass";

// Canonical model name used by the scene.
// (Kalau kamu punya export Blender lain, simpan saja di folder yang sama,
// tapi jangan ikut di-check runtime biar nggak ada request/HEAD tambahan.)
const MODEL_URLS = ["/models/blackhole/blackhole.glb"];

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
 * BlackHoleHost
 *
 * - If a model exists in /public, we render the model (cheaper / more realistic art).
 * - If not, we fall back to the current procedural Level-2 black hole.
 *
 * Important: Dev servers may return index.html for unknown paths (HTTP 200). We guard against that.
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

  const useModel = modelUrl != null;

  return (
    <>
      {useModel ? (
        <BlackHoleModel
          url={modelUrl!}
          // Slight tilt helps match the cinematic reference angle.
          rotation={[0, 0.12, 0.0]}
          scale={1}
          position={[-5.6, 0.18, 0.25]}
        />
      ) : (
        <>
          <BlackHole />
          <BlackHoleLensingPass />
        </>
      )}
    </>
  );
}
