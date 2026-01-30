import React, { useEffect, useMemo, useRef, useState } from "react";
import { useProgress } from "@react-three/drei";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

type Phase = "visible" | "fading" | "hidden";

/**
 * GalaxyLoadingOverlay
 *
 * Goals:
 * - No black screen: show instantly, even while GLB/shaders are loading.
 * - Minimum display time: avoid flicker on fast loads.
 * - Smooth fade-out + slight blur: no "pop" disappearance.
 *
 * Notes:
 * - Uses drei's useProgress() which tracks assets loaded via useLoader/useGLTF inside the Canvas.
 */
export function GalaxyLoadingOverlay() {
  const { active, progress } = useProgress();

  // Tunables
  const MIN_SHOW_MS = 650;   // minimum time overlay stays visible
  const FADE_MS = 550;       // fade-out duration (400–700ms range)

  const startRef = useRef<number>(typeof performance !== "undefined" ? performance.now() : Date.now());
  const [phase, setPhase] = useState<Phase>("visible");

  const pct = useMemo(() => Math.max(0, Math.min(100, progress)), [progress]);

  useEffect(() => {
    const done = !active && pct >= 100;

    if (!done) {
      // If loading starts again (route changes / new assets), ensure overlay returns.
      setPhase("visible");
      return;
    }

    // done: honor minimum display time, then fade-out.
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    const elapsed = now - startRef.current;
    const delay = Math.max(0, MIN_SHOW_MS - elapsed);

    let t1: any;
    let t2: any;

    t1 = setTimeout(() => {
      setPhase("fading");
      t2 = setTimeout(() => setPhase("hidden"), FADE_MS);
    }, delay);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [active, pct]);

  if (phase === "hidden") return null;

  const isFading = phase === "fading";

  return (
    <div
      aria-label="Loading"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "grid",
        placeItems: "center",
        pointerEvents: "auto",
        background: "radial-gradient(circle at 50% 40%, rgba(8,26,61,0.92) 0%, rgba(0,0,0,0.92) 70%)",
        backdropFilter: isFading ? "blur(6px)" : "blur(2px)",
        WebkitBackdropFilter: isFading ? "blur(6px)" : "blur(2px)",
        opacity: isFading ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease, backdrop-filter ${FADE_MS}ms ease`,
      }}
    >
      <div style={{ width: 380, maxWidth: "86vw", textAlign: "center", color: "white" }}>
        <DotLottieReact
          src="/lottie/sci-fi-machine.lottie"
          autoplay
          loop
          style={{
            width: "100%",
            height: 260,
            margin: "0 auto",
            filter: isFading ? "blur(4px)" : "blur(0px)",
            opacity: isFading ? 0.85 : 1,
            transition: `filter ${FADE_MS}ms ease, opacity ${FADE_MS}ms ease`,
          }}
        />
        <div
          style={{
            marginTop: 10,
            fontSize: 13,
            letterSpacing: 0.8,
            opacity: 0.78,
            userSelect: "none",
            filter: isFading ? "blur(2px)" : "blur(0px)",
            transition: `filter ${FADE_MS}ms ease, opacity ${FADE_MS}ms ease`,
          }}
        >
          ENTERING OPHIUS…
        </div>

        <div style={{ height: 6, background: "rgba(255,255,255,.14)", borderRadius: 999, marginTop: 12 }}>
          <div
            style={{
              height: 6,
              width: `${pct}%`,
              background: "rgba(255,255,255,.88)",
              borderRadius: 999,
              transition: "width 120ms linear",
            }}
          />
        </div>
        <div style={{ fontSize: 12, opacity: 0.62, marginTop: 8, userSelect: "none" }}>
          {Math.round(pct)}%
        </div>
      </div>
    </div>
  );
}
