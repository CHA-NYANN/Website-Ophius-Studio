import { useLocation } from "react-router-dom";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { TOKENS } from "@/theme/tokens";
import { portal } from "@/portal/portalSingleton";
import { cameraStore } from "@/galaxy/scene/rigs/cameraStore";
import { panelFilterStore } from "@/galaxy/interactions/panelFilterStore";

function usePortalState() {
  return useSyncExternalStore(
    (cb) => portal.subscribe(cb),
    () => portal.getState(),
    () => portal.getState()
  );
}

function useCameraState() {
  return useSyncExternalStore(
    (cb) => cameraStore.subscribe(cb),
    () => cameraStore.getState(),
    () => cameraStore.getState()
  );
}

function usePanelQuery() {
  return useSyncExternalStore(
    (cb) => panelFilterStore.subscribe(cb),
    () => panelFilterStore.getState().query,
    () => panelFilterStore.getState().query
  );
}

export function GalaxyHud() {
  const loc = useLocation();
  const portalState = usePortalState();
  const cameraState = useCameraState();
  const query = usePanelQuery();

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 520px)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(max-width: 520px)");
    const onChange = () => setIsMobile(mql.matches);
    // Safari fallback
    // @ts-expect-error older Safari
    if (mql.addEventListener) mql.addEventListener("change", onChange);
    // @ts-expect-error older Safari
    else mql.addListener(onChange);
    return () => {
      // @ts-expect-error older Safari
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      // @ts-expect-error older Safari
      else mql.removeListener(onChange);
    };
  }, []);


  const show = useMemo(() => loc.pathname === "/" && portalState.phase === "idle", [loc.pathname, portalState.phase]);

  const vis = useMemo(() => {
    const p = cameraState.pitch;
    const a = TOKENS.search.pitchStart;
    const b = TOKENS.search.pitchFull;
    const raw = (p - a) / (b - a);
    return Math.max(0, Math.min(1, raw));
  }, [cameraState.pitch]);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: isMobile ? 12 : 18,
        right: isMobile ? 12 : undefined,
        bottom: isMobile ? 12 : 18,
        zIndex: 12,
        pointerEvents: "none",
        transform: `translateY(${(1 - vis) * (isMobile ? 10 : 18)}px)`,
        opacity: 0.35 + vis * 0.65,
        transition: "opacity 120ms linear"
      }}
    >
      <div
        style={{
          width: isMobile ? "min(360px, calc(100vw - 24px))" : 320,
          borderRadius: 18,
          padding: isMobile ? 10 : 12,
          background: "rgba(0,0,0,0.22)",
          border: "1px solid rgba(120,200,255,0.18)",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.2) inset, 0 14px 50px rgba(0,0,0,0.55)",
          backdropFilter: "blur(10px)",
          pointerEvents: "auto"
        }}
      >
        <div style={{ fontSize: 12, letterSpacing: 0.8, color: "rgba(255,255,255,0.78)", marginBottom: 8 }}>
          SEARCH PANELS
        </div>
        <input
          value={query}
          onChange={(e) => panelFilterStore.setQuery(e.target.value)}
          placeholder="type to filter: docs, projects, news…"
          style={{
            width: "100%",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(0,0,0,0.25)",
            color: "var(--text)",
            padding: "10px 12px",
            outline: "none"
          }}
        />
        {!isMobile && (
          <div style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
            Tip: look down to reveal the keyboard hologram.
          </div>
        )}
      </div>
    </div>
  );
}
