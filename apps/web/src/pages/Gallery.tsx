import { useEffect, useState } from "react";

type GalleryPublic = {
  id: string;
  title: string;
  imageUrl: string;
  publishedAt: string | null;
};

async function fetchGallery(): Promise<GalleryPublic[]> {
  const res = await fetch("/api/public/gallery", { method: "GET" });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  const data = (await res.json()) as { items: GalleryPublic[] };
  return data.items ?? [];
}

export function Gallery() {
  const [items, setItems] = useState<GalleryPublic[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchGallery()
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
      <div style={{ fontSize: 22, fontWeight: 900 }}>Gallery</div>
      <div style={{ marginTop: 10, color: "var(--muted)", lineHeight: 1.45 }}>
        Halaman ini menampilkan gallery yang statusnya <span style={{ color: "var(--text)", fontWeight: 800 }}>PUBLISHED</span> dari CMS.
      </div>

      {items === null ? (
        <div style={{ marginTop: 18, color: "var(--muted)" }}>Loading…</div>
      ) : error ? (
        <div style={{ marginTop: 18, color: "rgba(255,120,120,0.9)", lineHeight: 1.45 }}>Gagal memuat data: {error}</div>
      ) : items.length === 0 ? (
        <div style={{ marginTop: 18, color: "var(--muted)", lineHeight: 1.45 }}>
          Belum ada gallery published. Buka <span style={{ color: "var(--text)", fontWeight: 800 }}>/admin</span> untuk membuat & publish.
        </div>
      ) : (
        <div
          style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12
          }}
        >
          {items.map((g) => (
            <div
              key={g.id}
              style={{
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(0,0,0,0.22)",
                overflow: "hidden"
              }}
            >
              <div style={{ aspectRatio: "16/10", background: "rgba(0,0,0,0.25)" }}>
                <img src={g.imageUrl} alt={g.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ fontWeight: 900 }}>{g.title}</div>
                <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 12 }}>{g.imageUrl}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
