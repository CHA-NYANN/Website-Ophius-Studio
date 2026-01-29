import { Link } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { Surface } from "@/components/ui/Surface";

export function NotFound() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 12,
        padding: 24,
        display: "grid",
        gridTemplateRows: "auto 1fr",
        gap: 14,
        pointerEvents: "auto"
      }}
    >
      <Header />
      <Surface>
        <div style={{ padding: 14 }}>
          <div style={{ fontSize: 14, letterSpacing: 2, color: "rgba(160,200,255,0.75)", marginBottom: 8 }}>
            404 NOT FOUND
          </div>
          <div style={{ fontSize: 26, fontWeight: 950, marginBottom: 10 }}>Halaman tidak ditemukan.</div>
          <div style={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.55, marginBottom: 16 }}>
            URL ini tidak punya route. Kalau kamu masuk dari portal, kemungkinan kontennya belum disiapkan atau route-nya salah.
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link
              to="/"
              style={{
                borderRadius: 12,
                padding: "10px 14px",
                border: "1px solid rgba(140,220,255,0.24)",
                background: "rgba(40,140,255,0.12)",
                color: "rgba(200,235,255,0.92)",
                fontWeight: 800,
                textDecoration: "none"
              }}
            >
              Back to Galaxy
            </Link>
            <Link
              to="/docs"
              style={{
                borderRadius: 12,
                padding: "10px 14px",
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.88)",
                fontWeight: 800,
                textDecoration: "none"
              }}
            >
              Open Docs
            </Link>
          </div>
        </div>
      </Surface>
    </div>
  );
}
