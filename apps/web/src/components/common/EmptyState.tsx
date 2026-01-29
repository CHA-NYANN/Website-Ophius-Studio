export function EmptyState(props: { title?: string; detail?: string; hint?: string }) {
  return (
    <div style={{ padding: 14, display: "grid", gap: 8 }}>
      <div style={{ fontSize: 14, letterSpacing: 2, color: "rgba(160,200,255,0.75)" }}>
        {props.title ?? "EMPTY"}
      </div>
      <div style={{ fontSize: 18, fontWeight: 900 }}>{props.detail ?? "Belum ada data."}</div>
      {props.hint ? <div style={{ color: "rgba(255,255,255,0.70)", lineHeight: 1.5 }}>{props.hint}</div> : null}
    </div>
  );
}
