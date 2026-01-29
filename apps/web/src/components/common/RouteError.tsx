import { isRouteErrorResponse, useRouteError, Link } from "react-router-dom";
import { Header } from "@/components/ui/Header";
import { Surface } from "@/components/ui/Surface";

export function RouteError() {
  const err = useRouteError();

  let title = "Terjadi error";
  let detail = "Sistem gagal memuat halaman ini.";
  let code: string | null = null;

  if (isRouteErrorResponse(err)) {
    code = String(err.status);
    title = err.status === 404 ? "Halaman tidak ditemukan" : `Error ${err.status}`;
    detail = err.statusText || detail;
  } else if (err instanceof Error) {
    detail = err.message;
  } else if (typeof err === "string") {
    detail = err;
  }

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
            {code ? `ROUTE ${code}` : "ROUTE ERROR"}
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>{title}</div>
          <div style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.55, marginBottom: 16 }}>{detail}</div>

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
            <button
              onClick={() => window.location.reload()}
              style={{
                cursor: "pointer",
                borderRadius: 12,
                padding: "10px 14px",
                border: "1px solid rgba(255,255,255,0.16)",
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.92)",
                fontWeight: 800
              }}
            >
              Reload
            </button>
          </div>
        </div>
      </Surface>
    </div>
  );
}
