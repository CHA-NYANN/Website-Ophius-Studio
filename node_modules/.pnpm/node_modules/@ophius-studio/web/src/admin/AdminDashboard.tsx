import { useEffect, useRef, useState } from "react";
import { portal } from "@/portal/portalSingleton";
import { navigateWithPortal, originRectFromElement } from "@/portal/navigateWithPortal";
import { useAuth } from "@/admin/auth/useAuth";

export function AdminDashboard() {
  const logoutRef = useRef<HTMLButtonElement | null>(null);
  const { user, logout } = useAuth();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    portal.markDestinationReady();
  }, []);

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 900 }}>Admin Dashboard</div>
      <div style={{ marginTop: 10, color: "var(--muted)", lineHeight: 1.45 }}>
        Session aktif: <span style={{ color: "var(--text)", fontWeight: 800 }}>{user?.id ?? "?"}</span> ({user?.role ?? "?"}).
      </div>
      <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
        <button
          ref={logoutRef}
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await logout();
            } finally {
              const origin = originRectFromElement(logoutRef.current);
              navigateWithPortal("/", origin);
              setBusy(false);
            }
          }}
          style={{
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.16)",
            background: "rgba(0,0,0,0.28)",
            color: "var(--text)",
            padding: "10px 12px",
            cursor: busy ? "not-allowed" : "pointer",
            fontWeight: 800,
            opacity: busy ? 0.6 : 1
          }}
        >
          {busy ? "Logging out…" : "Logout"}
        </button>
      </div>
    </div>
  );
}
