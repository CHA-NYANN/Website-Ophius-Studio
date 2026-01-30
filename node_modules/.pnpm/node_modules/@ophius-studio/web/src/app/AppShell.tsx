import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { GalaxyLoadingOverlay } from "@/components/common/GalaxyLoadingOverlay";
import { GalaxyCanvas } from "@/galaxy/GalaxyCanvas";
import { GalaxyHud } from "@/galaxy/hud/GalaxyHud";
import { FocusPanelMode } from "@/galaxy/scene/ui/FocusPanelMode";
import { PortalOverlay } from "@/portal/PortalOverlay";
import { portal } from "@/portal/portalSingleton";
import { useRaf } from "@/app/hooks/useRaf";

export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const isGalaxy = location.pathname === "/";

  useRaf((dt) => portal.tick(dt));

  useEffect(() => {
    const unsub = portal.subscribe(() => {
      const s = portal.getState();
      if (!s.shouldSwap || !s.target) return;

      if (s.target.kind === "internal") {
        portal.confirmSwapHandled();
        navigate(s.target.toPath);
        return;
      }

      if (s.target.kind === "external") {
        portal.confirmSwapHandled();
        window.open(s.target.url, "_blank", "noopener,noreferrer");
        portal.markDestinationReady();
      }
    });
    return () => {
      unsub();
    };
  }, [navigate]);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <GalaxyLoadingOverlay pathname={location.pathname} />
      <GalaxyCanvas />
      <GalaxyHud />
      <FocusPanelMode />
      {/*
        NOTE:
        The Galaxy 3D canvas must receive pointer events for drag/orbit + panel clicking.
        The Outlet wrapper was previously blocking the canvas because it's a full-screen div.
        On the galaxy route ("/"), we disable pointer events so the canvas stays interactive.
        On normal 2D routes, we re-enable pointer events.
      */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          height: "100%",
          pointerEvents: isGalaxy ? "none" : "auto",
        }}
      >
        <Outlet />
      </div>
      <PortalOverlay />
    </div>
  );
}
