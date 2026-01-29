import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { portal } from "@/portal/portalSingleton";
import { navigateWithPortal, originRectFromElement } from "@/portal/navigateWithPortal";
import { useAuth } from "@/admin/auth/useAuth";

export function AdminLogin() {
  const loc = useLocation();
  const fromPath = (loc.state as any)?.from as string | undefined;
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const { login, status } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const canSubmit = useMemo(() => !busy && password.trim().length > 0 && status !== "loading", [busy, password, status]);

  useEffect(() => {
    portal.markDestinationReady();
  }, []);

  async function onSubmit() {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      await login(password);
      const origin = originRectFromElement(btnRef.current);
      navigateWithPortal(fromPath ?? "/admin", origin);
    } catch (e: any) {
      setError(String(e?.message ?? "Login failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: 24 }}>
      <div
        style={{
          width: "min(520px, 100%)",
          borderRadius: 22,
          border: "1px solid var(--glass-border)",
          background: "var(--glass)",
          backdropFilter: "blur(12px)",
          padding: 22
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 900 }}>Admin Login</div>
        <div style={{ marginTop: 10, color: "var(--muted)", lineHeight: 1.45 }}>
          Login ini pakai session cookie httpOnly dari backend (bukan localStorage/sessionStorage). Default password dev adalah <span style={{ color: "var(--text)" }}>admin</span>.
        </div>

        <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
          <label style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="admin"
            style={{
              width: "100%",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(0,0,0,0.28)",
              color: "var(--text)",
              padding: "10px 12px",
              outline: "none"
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmit();
            }}
          />

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              ref={btnRef}
              disabled={!canSubmit}
              onClick={onSubmit}
              style={{
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.16)",
                background: "rgba(0,0,0,0.28)",
                color: "var(--text)",
                padding: "10px 12px",
                cursor: canSubmit ? "pointer" : "not-allowed",
                fontWeight: 800,
                opacity: canSubmit ? 1 : 0.55
              }}
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>return: {fromPath ?? "/admin"}</div>
          </div>

          {error ? (
            <div style={{ fontSize: 12, color: "rgba(255,160,160,0.95)" }}>{error}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
