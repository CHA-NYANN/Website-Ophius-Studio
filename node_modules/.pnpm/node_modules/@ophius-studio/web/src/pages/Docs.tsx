import { useEffect, useMemo, useState } from "react";

type DocPublic = {
  id: string;
  title: string;
  slug: string;
  markdown: string | null;
};

async function fetchDocs(): Promise<DocPublic[]> {
  const res = await fetch("/api/public/docs?includeMarkdown=1", { method: "GET" });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  const json = (await res.json()) as { items: DocPublic[] };
  return json.items;
}

export function Docs() {
  const [items, setItems] = useState<DocPublic[]>([]);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetchDocs()
      .then((x) => {
        setItems(x);
        setActiveSlug((prev) => prev ?? (x[0]?.slug ?? null));
      })
      .catch((e) => setErr(e.message || String(e)));
  }, []);

  const active = useMemo(() => {
    if (!items.length) return null;
    if (!activeSlug) return items[0];
    return items.find((x) => x.slug === activeSlug) ?? items[0];
  }, [items, activeSlug]);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0, fontSize: 28 }}>Docs</h1>

      {err ? (
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 14,
            border: "1px solid rgba(255,80,80,0.24)",
            background: "rgba(255,80,80,0.10)",
            color: "rgba(255,255,255,0.95)"
          }}
        >
          {err}
        </div>
      ) : null}

      <div style={{ opacity: 0.85, maxWidth: 980 }}>
        Dokumen di bawah ini diambil dari CMS (published only). Kalau kosong, buat &amp; publish doc di Admin.
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: 14,
          alignItems: "start"
        }}
      >
        <aside
          style={{
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(0,0,0,0.22)",
            padding: 12,
            display: "grid",
            gap: 8
          }}
        >
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => setActiveSlug(it.slug)}
              style={{
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.10)",
                background: active?.slug === it.slug ? "rgba(34,160,255,0.10)" : "rgba(255,255,255,0.04)",
                color: "white",
                cursor: "pointer",
                display: "grid",
                gap: 2
              }}
            >
              <div style={{ fontWeight: 800 }}>{it.title}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>/{it.slug}</div>
            </button>
          ))}

          {!items.length ? <div style={{ opacity: 0.75, padding: 10 }}>No docs.</div> : null}
        </aside>

        <section
          style={{
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(0,0,0,0.22)",
            padding: 14,
            minHeight: 260,
            display: "grid",
            gap: 10
          }}
        >
          {active ? (
            <>
              <div style={{ fontSize: 20, fontWeight: 900 }}>{active.title}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>/{active.slug}</div>
              <pre
                style={{
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                  padding: 12,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(0,0,0,0.25)",
                  lineHeight: 1.45,
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  fontSize: 13
                }}
              >
                {active.markdown ?? "(No markdown content)"}
              </pre>
            </>
          ) : (
            <div style={{ opacity: 0.75, padding: 12 }}>Select a doc.</div>
          )}
        </section>
      </div>
    </div>
  );
}
