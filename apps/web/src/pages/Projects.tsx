import { useEffect, useState } from "react";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";

type ProjectPublic = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  coverUrl: string | null;
  publishedAt: string | null;
};

async function fetchProjects(): Promise<ProjectPublic[]> {
  const res = await fetch("/api/public/projects", { method: "GET" });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  const data = (await res.json()) as { items: ProjectPublic[] };
  return data.items ?? [];
}

export function Projects() {
  const [items, setItems] = useState<ProjectPublic[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await fetchProjects();
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
      <div style={{ fontSize: 22, fontWeight: 900 }}>Projects</div>
      <div style={{ marginTop: 10, color: "var(--muted)", lineHeight: 1.45 }}>
        Halaman ini menampilkan project yang statusnya{" "}
        <span style={{ color: "var(--text)", fontWeight: 800 }}>PUBLISHED</span> dari CMS.
      </div>

      <div style={{ marginTop: 18 }}>
        {items === null ? (
          <LoadingState title="LOADING PROJECTS" detail="Mengambil daftar project dari public API…" />
        ) : error ? (
          <ErrorState detail={`Gagal memuat data: ${error}`} />
        ) : items.length === 0 ? (
          <EmptyState
            title="NO PROJECTS"
            detail="Belum ada project published."
            hint="Buka /admin untuk membuat & publish."
          />
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {items.map((p) => (
              <div
                key={p.id}
                style={{
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(0,0,0,0.22)",
                  padding: 14
                }}
              >
                <div style={{ fontWeight: 900 }}>{p.title}</div>
                <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 12 }}>/projects/{p.slug}</div>
                {p.summary ? (
                  <div style={{ marginTop: 10, color: "rgba(255,255,255,0.78)", lineHeight: 1.45 }}>{p.summary}</div>
                ) : null}
                {p.coverUrl ? (
                  <div style={{ marginTop: 12 }}>
                    <img
                      src={p.coverUrl}
                      alt={p.title}
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
