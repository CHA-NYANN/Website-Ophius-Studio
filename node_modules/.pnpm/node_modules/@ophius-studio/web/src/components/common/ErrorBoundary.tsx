import React from "react";
import { Link } from "react-router-dom";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; message: string };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(err: unknown): State {
    const message = err instanceof Error ? err.message : String(err);
    return { hasError: true, message };
  }

  componentDidCatch(err: unknown) {
    // Keep it simple: console + allow browser to collect stack traces
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", err);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 50,
          display: "grid",
          placeItems: "center",
          padding: 24,
          pointerEvents: "auto",
          background: "radial-gradient(1200px 800px at 50% 40%, rgba(120,160,255,0.14), rgba(0,0,0,0.92))"
        }}
      >
        <div
          style={{
            width: "min(920px, 100%)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 16,
            padding: 18,
            background: "rgba(0,0,0,0.42)",
            boxShadow: "0 18px 70px rgba(0,0,0,0.55)"
          }}
        >
          <div style={{ fontSize: 14, letterSpacing: 2, color: "rgba(160,200,255,0.75)", marginBottom: 8 }}>
            SYSTEM ERROR
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Terjadi error di halaman.</div>
          <div style={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.5, marginBottom: 14 }}>
            Kamu masih bisa balik ke Galaxy atau reload halaman. Detail error (untuk debug):
          </div>
          <pre
            style={{
              margin: 0,
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(0,0,0,0.45)",
              color: "rgba(255,180,180,0.90)",
              overflow: "auto",
              maxHeight: 200,
              fontSize: 12
            }}
          >
            {this.state.message}
          </pre>

          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
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
          </div>
        </div>
      </div>
    );
  }
}
