import React from "react";
import { BlackHoleModel } from "./BlackHoleModel";

/**
 * BlackHoleHost (GLB-only, no HEAD check)
 *
 * Tujuan: hilangkan jeda "black screen" yang terjadi karena Suspense bubble + extra request HEAD.
 * - Kita langsung load model GLB canonical (yang memang ada di /public).
 * - Kalau file hilang, error akan ditangani oleh ErrorBoundary milik Canvas (dev akan kelihatan jelas).
 *
 * File asset:
 *   apps/web/public/models/blackhole/blackhole.glb
 */
export function BlackHoleHost() {
  return (
    <BlackHoleModel
      url={"/models/blackhole/blackhole.glb"}
      rotation={[0, 0.12, 0.0]}
      scale={1}
      position={[-5.6, 0.18, 0.25]}
    />
  );
}
