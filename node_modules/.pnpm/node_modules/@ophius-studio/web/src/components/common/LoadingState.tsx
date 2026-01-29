export function LoadingState(props: { title?: string; detail?: string }) {
  return (
    <div style={{ padding: 14, display: "grid", gap: 8 }}>
      <div style={{ fontSize: 14, letterSpacing: 2, color: "rgba(160,200,255,0.75)" }}>
        {props.title ?? "LOADING"}
      </div>
      <div style={{ color: "rgba(255,255,255,0.70)", lineHeight: 1.5 }}>
        {props.detail ?? "Sedang memuat data…"}
      </div>
      <div
        aria-label="loading"
        style={{
          marginTop: 6,
          width: 36,
          height: 36,
          borderRadius: 999,
          border: "3px solid rgba(255,255,255,0.16)",
          borderTopColor: "rgba(140,220,255,0.65)",
          animation: "spin 0.9s linear infinite"
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
