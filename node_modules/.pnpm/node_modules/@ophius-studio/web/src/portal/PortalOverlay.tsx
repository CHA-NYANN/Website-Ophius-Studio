import { useMemo, useSyncExternalStore } from "react";
import { portal } from "@/portal/portalSingleton";
import { TOKENS } from "@/theme/tokens";
import { useReducedMotion } from "@/utils/motion";
import "@/portal/portalOverlay.css";

function usePortalState() {
  return useSyncExternalStore(
    (cb) => portal.subscribe(cb),
    () => portal.getState(),
    () => portal.getState()
  );
}

export function PortalOverlay() {
  const s = usePortalState();
  const reduceMotion = useReducedMotion();

  const view = useMemo(() => {
    if (s.phase === "idle") return { show: false } as const;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const maxR = Math.ceil(Math.sqrt(w * w + h * h));
    const ox = s.origin ? s.origin.x + s.origin.width / 2 : w / 2;
    const oy = s.origin ? s.origin.y + s.origin.height / 2 : h / 2;

    const profile = TOKENS.profiles[s.profile];

    const opacity = s.phase === "portalFade" ? 1 - s.t : 1;

    const r =
      s.phase === "focusPreview"
        ? Math.max(18, 18 + 46 * s.t)
        : s.phase === "portalOut"
          ? Math.max(64, 64 + (maxR - 64) * s.t)
          : maxR;

    const clipPath = reduceMotion ? "none" : `circle(${r}px at ${ox}px ${oy}px)`;

    return {
      show: true,
      phase: s.phase,
      style: {
        opacity,
        clipPath,
        background: `radial-gradient(circle at ${ox}px ${oy}px, rgb(${profile.core} / 0.52) 0%, ${profile.tint} 18%, rgba(0,0,0,0.88) 55%, rgba(0,0,0,0.97) 100%)`,
        // CSS vars for pseudo-elements
        "--ox": `${ox}px`,
        "--oy": `${oy}px`,
        "--core": profile.core
      } as React.CSSProperties
    } as const;
  }, [s, reduceMotion]);

  if (!view.show) return null;

  return <div className="portalOverlay" data-phase={view.phase} style={view.style} />;
}
