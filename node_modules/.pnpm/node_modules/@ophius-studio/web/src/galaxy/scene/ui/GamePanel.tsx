import { useMemo } from "react";

export function GamePanel(props: {
  onEnter: () => void;
  onStore: () => void;
  onClose: () => void;
}) {
  const data = useMemo(
    () => ({
      title: "OPHIUS",
      subtitle: "A narrative sci‑fantasy prototype",
      description:
        "A focused slice from the Ophius universe. Explore the first playable beat, learn the movement grammar, and dive into the lore layers that connect the galaxy hub to the pages portal.",
      tags: "Prototype · Story · Exploration",
      storeLabel: "Open Store",
      enterLabel: "Enter",
      closeLabel: "Close"
    }),
    []
  );

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: 2.2, color: "rgba(255,255,255,0.72)" }}>{data.tags}</div>
          <div style={{ fontSize: 34, lineHeight: 1.05, marginTop: 6, fontWeight: 700 }}>{data.title}</div>
          <div style={{ fontSize: 14, marginTop: 6, color: "rgba(255,255,255,0.78)" }}>{data.subtitle}</div>
        </div>

        <button
          onClick={props.onClose}
          style={{
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(0,0,0,0.25)",
            padding: "8px 12px",
            color: "rgba(255,255,255,0.8)",
            cursor: "pointer"
          }}
        >
          {data.closeLabel}
        </button>
      </div>

      <div
        style={{
          borderRadius: 18,
          overflow: "hidden",
          border: "1px solid rgba(120,200,255,0.18)",
          background: "rgba(0,0,0,0.25)",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.25) inset"
        }}
      >
        <div
          style={{
            aspectRatio: "16 / 9",
            display: "grid",
            placeItems: "center",
            background:
              "radial-gradient(circle at 30% 30%, rgba(120,200,255,0.22), rgba(0,0,0,0.0) 55%), radial-gradient(circle at 70% 60%, rgba(255,170,120,0.18), rgba(0,0,0,0.0) 60%), rgba(0,0,0,0.22)",
            color: "rgba(255,255,255,0.78)"
          }}
        >
          <div style={{ textAlign: "center", padding: 18 }}>
            <div style={{ fontSize: 12, letterSpacing: 1.6, opacity: 0.8 }}>VIDEO PREVIEW</div>
            <div style={{ fontSize: 12, marginTop: 8, opacity: 0.65 }}>
              (placeholder — swap with real trailer later)
            </div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.78)", lineHeight: 1.55 }}>{data.description}</div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          onClick={props.onEnter}
          style={{
            borderRadius: 14,
            border: "1px solid rgba(120,200,255,0.25)",
            background: "rgba(120,200,255,0.14)",
            padding: "10px 14px",
            color: "white",
            cursor: "pointer"
          }}
        >
          {data.enterLabel}
        </button>
        <button
          onClick={props.onStore}
          style={{
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(0,0,0,0.22)",
            padding: "10px 14px",
            color: "rgba(255,255,255,0.88)",
            cursor: "pointer"
          }}
        >
          {data.storeLabel}
        </button>
      </div>
    </div>
  );
}
