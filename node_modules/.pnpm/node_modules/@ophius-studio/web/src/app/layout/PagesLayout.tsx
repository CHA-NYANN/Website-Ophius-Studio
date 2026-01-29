import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { portal } from "@/portal/portalSingleton";
import { Header } from "@/components/ui/Header";
import { Surface } from "@/components/ui/Surface";
import { SpaceBackdrop } from "@/components/ui/SpaceBackdrop";

export function PagesLayout() {
  const loc = useLocation();

  useEffect(() => {
    portal.markDestinationReady();
  }, [loc.pathname]);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "auto" }}>
      <SpaceBackdrop variant="public" />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          inset: 0,
          height: "100%",
          padding: 24,
          display: "grid",
          gridTemplateRows: "auto 1fr",
          gap: 14
        }}
      >
        <Header />
        <Surface>
          <Outlet />
        </Surface>
      </div>
    </div>
  );
}
