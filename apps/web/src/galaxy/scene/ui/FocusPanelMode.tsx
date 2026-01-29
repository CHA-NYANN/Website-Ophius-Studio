import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useLocation } from "react-router-dom";
import { focusStore } from "@/galaxy/focus/focusStore";
import { portal } from "@/portal/portalSingleton";
import { navigateWithPortal } from "@/portal/navigateWithPortal";
import { TOKENS } from "@/theme/tokens";
import { GamePanel } from "@/galaxy/scene/ui/GamePanel";

function useFocusState() {
  return useSyncExternalStore(
    (cb) => focusStore.subscribe(cb),
    () => focusStore.getState(),
    () => focusStore.getState()
  );
}

function usePortalState() {
  return useSyncExternalStore(
    (cb) => portal.subscribe(cb),
    () => portal.getState(),
    () => portal.getState()
  );
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function FocusPanelMode() {
  const loc = useLocation();
  const focus = useFocusState();
  const portalState = usePortalState();
  const [enter, setEnter] = useState(false);

  const active = useMemo(() => {
    return loc.pathname === "/" && portalState.phase === "idle" && focus.open && focus.panelId === "games";
  }, [loc.pathname, portalState.phase, focus.open, focus.panelId]);

  useEffect(() => {
    if (!active) {
      setEnter(false);
      return;
    }
    const id = requestAnimationFrame(() => setEnter(true));
    return () => cancelAnimationFrame(id);
  }, [active]);

  useEffect(() => {
    if (!focus.open) return;
    if (portalState.phase !== "idle") focusStore.close();
  }, [portalState.phase, focus.open]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") focusStore.close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  if (!active) return null;

  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

  const targetW = clamp(vw * 0.72, 520, 860);
  const targetH = clamp(vh * 0.74, 520, 720);
  const targetX = (vw - targetW) / 2;
  const targetY = (vh - targetH) / 2;

  const o = focus.origin ?? { x: vw / 2 - 14, y: vh / 2 - 14, w: 28, h: 28 };
  const sx = o.w / targetW;
  const sy = o.h / targetH;
  const tx = o.x - targetX;
  const ty = o.y - targetY;

  const storeUrl = "https://example.com";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 40,
        pointerEvents: "auto"
      }}
    >
      <div
        onClick={() => focusStore.close()}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(10px)"
        }}
      />

      <div
        style={{
          position: "absolute",
          left: targetX,
          top: targetY,
          width: targetW,
          height: targetH,
          borderRadius: 26,
          overflow: "hidden",
          border: "1px solid rgba(120,200,255,0.22)",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.35) inset, 0 30px 120px rgba(0,0,0,0.75)",
          background: "rgba(0,0,0,0.24)",
          transformOrigin: "top left",
          transform: enter ? "translate3d(0,0,0) scale3d(1,1,1)" : `translate3d(${tx}px, ${ty}px, 0) scale3d(${sx}, ${sy}, 1)`,
          transition: `transform ${TOKENS.portal.focusPreviewMs}ms cubic-bezier(0.18, 0.9, 0.12, 1)`,
          backdropFilter: "blur(14px)",
          pointerEvents: "auto"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ height: "100%", padding: 18, color: "white", display: "grid" }}>
          <GamePanel
            onClose={() => focusStore.close()}
            onEnter={() => {
              const origin = new DOMRect(o.x, o.y, o.w, o.h);
              focusStore.close();
              navigateWithPortal("/games", origin);
            }}
            onStore={() => {
              const origin = new DOMRect(o.x, o.y, o.w, o.h);
              focusStore.close();
              portal.startExternal(storeUrl, origin);
            }}
          />
        </div>
      </div>
    </div>
  );
}
