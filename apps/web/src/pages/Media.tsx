import { useEffect, useState } from "react";

type MediaPublic = {
  id: string;
  title: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  thumbnailUrl: string | null;
  publishedAt: string | null;
};

async function fetchMedia(): Promise<MediaPublic[]> {
  const res = await fetch("/api/public/media", { method: "GET" });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  const data = (await res.json()) as { items: MediaPublic[] };
  return data.items ?? [];
}

export function Media() {
  const [items, setItems] = useState<MediaPublic[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchMedia()
      .then((v) => {
        if (!alive) return;
        setItems(v);
      })
      .catch((e) => {
        if (!alive) return;
        setError(String(e?.message ?? e));
        setItems([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 900 }}>Media</div>
      <div style={{ marginTop: 10, color: "var(--muted)", lineHeight: 1.45 }}>
        Halaman ini menampilkan media yang statusnya <span style={{ color: "var(--text)", fontWeight: 800 }}>PUBLISHED</span> dari CMS.
      </div>

      {items === null ? (
        <div style={{ marginTop: 18, color: "var(--muted)" }}>Loading…</div>
      ) : error ? (
        <div style={{ marginTop: 18, color: "rgba(255,120,120,0.9)", lineHeight: 1.45 }}>Gagal memuat data: {error}</div>
      ) : items.length === 0 ? (
        <div style={{ marginTop: 18, color: "var(--muted)", lineHeight: 1.45 }}>
          Belum ada media published. Buka <span style={{ color: "var(--text)", fontWeight: 800 }}>/admin</span> untuk membuat & publish.
        </div>
      ) : (
        <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
          {items.map((m) => (
            <div
              key={m.id}
              style={{
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(0,0,0,0.22)",
                padding: 14
              }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {m.thumbnailUrl ? (
                  <div style={{ width: 120, aspectRatio: "16/10", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)" }}>
                    <img src={m.thumbnailUrl} alt={m.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                ) : null}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 900 }}>{m.title}</div>
                  <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)" }}>{m.type}</div>
                  <div style={{ marginTop: 8, color: "rgba(255,255,255,0.78)", lineHeight: 1.45, wordBreak: "break-word" }}>
                    <a href={m.url} target="_blank" rel="noreferrer" style={{ color: "var(--text)", fontWeight: 900, textDecoration: "none" }}>
                      {m.url}
                    </a>
                  </div>
                </div>
              </div>

              {m.type === "IMAGE" && !m.thumbnailUrl ? (
                <div style={{ marginTop: 12, borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)" }}>
                  <img src={m.url} alt={m.title} style={{ width: "100%", display: "block" }} />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
