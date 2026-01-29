import { useLocation } from "react-router-dom";
import { useMemo, useRef } from "react";
import { navigateWithPortal, originRectFromElement } from "@/portal/navigateWithPortal";

function titleFromPath(path: string) {
  if (path.startsWith("/docs")) return "Docs";
  if (path.startsWith("/projects")) return "Projects";
  if (path.startsWith("/team")) return "Team";
  if (path.startsWith("/gallery")) return "Gallery";
  if (path.startsWith("/media")) return "Media";
  if (path.startsWith("/news")) return "News";
  if (path.startsWith("/contact")) return "Contact";
  if (path.startsWith("/admin")) return "Admin";
  return "Ophius";
}

export function Header() {
  const loc = useLocation();
  const backRef = useRef<HTMLButtonElement | null>(null);

  const title = useMemo(() => titleFromPath(loc.pathname), [loc.pathname]);

  return (
    <div
      style={{
        width: "min(980px, 100%)",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12
      }}
    >
      <div style={{ display: "grid", gap: 4 }}>
        <div style={{ fontWeight: 900, letterSpacing: 0.2 }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>{loc.pathname}</div>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button
          ref={backRef}
          onClick={() => {
            const origin = originRectFromElement(backRef.current);
            navigateWithPortal("/", origin);
          }}
          style={{
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.16)",
            background: "rgba(0,0,0,0.25)",
            color: "var(--text)",
            padding: "10px 14px",
            cursor: "pointer"
          }}
        >
          Back to Galaxy
        </button>
      </div>
    </div>
  );
}
