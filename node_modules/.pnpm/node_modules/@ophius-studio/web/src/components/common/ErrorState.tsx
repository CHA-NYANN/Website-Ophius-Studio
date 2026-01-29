export function ErrorState(props: { title?: string; detail?: string }) {
  return (
    <div style={{ padding: 14, display: "grid", gap: 8 }}>
      <div style={{ fontSize: 14, letterSpacing: 2, color: "rgba(255,140,140,0.75)" }}>
        {props.title ?? "ERROR"}
      </div>
      <div style={{ fontSize: 18, fontWeight: 900 }}>Gagal memuat.</div>
      <div style={{ color: "rgba(255,255,255,0.70)", lineHeight: 1.5 }}>
        {props.detail ?? "Silakan coba refresh atau cek koneksi/server."}
      </div>
    </div>
  );
}
