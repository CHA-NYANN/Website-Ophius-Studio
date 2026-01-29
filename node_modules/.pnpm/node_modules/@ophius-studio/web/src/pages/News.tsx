import { useEffect, useState } from "react";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";

type NewsPublic = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverUrl: string | null;
  publishedAt: string | null;
};

async function fetchNews(): Promise<NewsPublic[]> {
  const res = await fetch("/api/public/news", { method: "GET" });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  const data = (await res.json()) as { items: NewsPublic[] };
  return data.items ?? [];
}

export function News() {
  const [items, setItems] = useState<NewsPublic[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await fetchNews();
        if (!alive) return;
        setItems(data);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || String(e));
        setItems([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 900 }}>News</div>
      <div style={{ marginTop: 10, color: "var(--muted)", lineHeight: 1.45 }}>
        Halaman ini menampilkan news yang statusnya{" "}
        <span style={{ color: "var(--text)", fontWeight: 800 }}>PUBLISHED</span> dari CMS.
      </div>

      <div style={{ marginTop: 18 }}>
        {items === null ? (
          <LoadingState title="LOADING NEWS" detail="Mengambil daftar news dari public API…" />
        ) : error ? (
          <ErrorState detail={`Gagal memuat data: ${error}`} />
        ) : items.length === 0 ? (
          <EmptyState title="NO NEWS" detail="Belum ada news published." hint="Buka /admin untuk membuat & publish." />
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {items.map((n) => (
              <div
                key={n.id}
                style={{
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(0,0,0,0.22)",
                  padding: 14
                }}
              >
                <div style={{ fontWeight: 900 }}>{n.title}</div>
                <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 12 }}>/news/{n.slug}</div>
                {n.excerpt ? (
                  <div style={{ marginTop: 10, color: "rgba(255,255,255,0.78)", lineHeight: 1.45 }}>{n.excerpt}</div>
                ) : null}
                {n.coverUrl ? (
                  <div style={{ marginTop: 12 }}>
                    <img
                      src={n.coverUrl}
                      alt={n.title}
                      style={{
                        width: "100%",
                        maxHeight: 220,
                        objectFit: "cover",
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.10)"
                      }}
                      loading="lazy"
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
