import { NavLink, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { portal } from "@/portal/portalSingleton";
import { Header } from "@/components/ui/Header";
import { Surface } from "@/components/ui/Surface";
import { SpaceBackdrop } from "@/components/ui/SpaceBackdrop";

export function AdminLayout() {
  useEffect(() => {
    portal.markDestinationReady();
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <SpaceBackdrop variant="admin" />
      <div style={{ position: "relative", zIndex: 1, padding: 24, display: "grid", gridTemplateRows: "auto 1fr", gap: 14, height: "100%" }}>
      <Header />
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 14, width: "min(980px, 100%)", margin: "0 auto" }}>
        <div
          style={{
            borderRadius: 22,
            border: "1px solid var(--glass-border)",
            background: "rgba(0,0,0,0.18)",
            padding: 14,
            height: "fit-content"
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 10 }}>CMS</div>
          <div style={{ display: "grid", gap: 8 }}>
            <NavLink
              to="/admin"
              end
              style={({ isActive }) => ({
                textDecoration: "none",
                color: isActive ? "var(--text)" : "rgba(255,255,255,0.72)",
                fontWeight: 900,
                padding: "10px 12px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.10)",
                background: isActive ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.14)"
              })}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/projects"
              style={({ isActive }) => ({
                textDecoration: "none",
                color: isActive ? "var(--text)" : "rgba(255,255,255,0.72)",
                fontWeight: 900,
                padding: "10px 12px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.10)",
                background: isActive ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.14)"
              })}
            >
              Projects
            </NavLink>

            <NavLink
              to="/admin/news"
              style={({ isActive }) => ({
                textDecoration: "none",
                color: isActive ? "var(--text)" : "rgba(255,255,255,0.72)",
                fontWeight: 900,
                padding: "10px 12px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.10)",
                background: isActive ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.14)"
              })}
            >
              News
            </NavLink>

            <NavLink
              to="/admin/gallery"
              style={({ isActive }) => ({
                textDecoration: "none",
                color: isActive ? "var(--text)" : "rgba(255,255,255,0.72)",
                fontWeight: 900,
                padding: "10px 12px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.10)",
                background: isActive ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.14)"
              })}
            >
              Gallery
            </NavLink>

            <NavLink
              to="/admin/media"
              style={({ isActive }) => ({
                textDecoration: "none",
                color: isActive ? "var(--text)" : "rgba(255,255,255,0.72)",
                fontWeight: 900,
                padding: "10px 12px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.10)",
                background: isActive ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.14)"
              })}
            >
              Media
            </NavLink>

            <NavLink
              to="/admin/team"
              style={({ isActive }) => ({
                textDecoration: "none",
                color: isActive ? "var(--text)" : "rgba(255,255,255,0.75)",
                background: isActive ? "rgba(34,160,255,0.14)" : "transparent",
                border: "1px solid rgba(255,255,255,0.10)",
                padding: "10px 12px",
                borderRadius: 12
              })}
            >
              Team
            </NavLink>

            <NavLink
              to="/admin/docs"
              style={({ isActive }) => ({
                textDecoration: "none",
                color: isActive ? "var(--text)" : "rgba(255,255,255,0.75)",
                background: isActive ? "rgba(34,160,255,0.14)" : "transparent",
                border: "1px solid rgba(255,255,255,0.10)",
                padding: "10px 12px",
                borderRadius: 12
              })}
            >
              Docs
            </NavLink>
          </div>
        </div>
        <Surface>
          <Outlet />
        </Surface>
      </div>
      </div>
    </div>
  );
}
