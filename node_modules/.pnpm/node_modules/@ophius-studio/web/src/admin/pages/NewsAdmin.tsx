import { useEffect, useMemo, useRef, useState } from "react";
import { adminClient, type NewsRecord } from "@/admin/api/adminClient";

type Mode = "idle" | "creating" | "editing";

type DraftInput = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverUrl: string;
};

function toDraft(p?: NewsRecord | null): DraftInput {
  return {
    title: p?.title ?? "",
    slug: p?.slug ?? "",
    excerpt: p?.excerpt ?? "",
    body: p?.body ?? "",
    coverUrl: p?.coverUrl ?? ""
  };
}

export function NewsAdmin() {
  const [items, setItems] = useState<NewsRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<Mode>("idle");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<DraftInput>(() => toDraft(null));
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "draft" | "published">("all");
  const firstLoadRef = useRef(true);

  const selected = useMemo(() => items?.find((x) => x.id === selectedId) ?? null, [items, selectedId]);

  async function refresh() {
    setError(null);
    const res = await adminClient.news.list({
      status: filter === "all" ? undefined : filter,
      q: query.trim() ? query.trim() : undefined
    });
    setItems(res.items);
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await refresh();
      } catch (e: any) {
        if (!alive) return;
        setItems([]);
        setError(String(e?.message ?? e));
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      return;
    }
    refresh().catch((e: any) => setError(String(e?.message ?? e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  function openCreate() {
    setMode("creating");
    setSelectedId(null);
    setForm(toDraft(null));
  }

  function openEdit(p: NewsRecord) {
    setMode("editing");
    setSelectedId(p.id);
    setForm(toDraft(p));
  }

  function closeEditor() {
    setMode("idle");
    setSelectedId(null);
    setForm(toDraft(null));
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      if (mode === "creating") {
        await adminClient.news.create({
          title: form.title,
          slug: form.slug,
          excerpt: form.excerpt || undefined,
          body: form.body || undefined,
          coverUrl: form.coverUrl || undefined
        });
      } else if (mode === "editing" && selectedId) {
        await adminClient.news.update(selectedId, {
          title: form.title,
          slug: form.slug,
          excerpt: form.excerpt,
          body: form.body,
          coverUrl: form.coverUrl
        });
      }
      await refresh();
      closeEditor();
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this news item?")) return;
    setBusy(true);
    setError(null);
    try {
      await adminClient.news.remove(id);
      await refresh();
      if (selectedId === id) closeEditor();
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  async function togglePublish(p: NewsRecord) {
    setBusy(true);
    setError(null);
    try {
      if (p.status === "PUBLISHED") {
        await adminClient.news.unpublish(p.id);
      } else {
        await adminClient.news.publish(p.id);
      }
      await refresh();
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>News</div>
          <div style={{ marginTop: 6, color: "var(--muted)", lineHeight: 1.45 }}>
            CRUD minimal untuk menguji alur CMS → publish → tampil di halaman public.
          </div>
        </div>

        <button
          disabled={busy}
          onClick={openCreate}
          style={{
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.16)",
            background: "rgba(0,0,0,0.28)",
            color: "var(--text)",
            padding: "10px 12px",
            cursor: busy ? "not-allowed" : "pointer",
            fontWeight: 900,
            opacity: busy ? 0.6 : 1
          }}
        >
          New News
        </button>
      </div>

      {error ? (
        <div style={{ color: "rgba(255,120,120,0.92)", lineHeight: 1.45 }}>Error: {error}</div>
      ) : null}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title / slug…"
          style={{
            flex: "1 1 260px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(0,0,0,0.22)",
            color: "var(--text)",
            padding: "10px 12px",
            outline: "none"
          }}
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          style={{
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(0,0,0,0.22)",
            color: "var(--text)",
            padding: "10px 12px"
          }}
        >
          <option value="all">All</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <button
          disabled={busy}
          onClick={() => refresh().catch((e: any) => setError(String(e?.message ?? e)))}
          style={{
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.16)",
            background: "rgba(0,0,0,0.28)",
            color: "var(--text)",
            padding: "10px 12px",
            cursor: busy ? "not-allowed" : "pointer",
            fontWeight: 800,
            opacity: busy ? 0.6 : 1
          }}
        >
          Apply
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ border: "1px solid rgba(255,255,255,0.10)", borderRadius: 18, padding: 12 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>List</div>
          {items === null ? (
            <div style={{ color: "var(--muted)" }}>Loading…</div>
          ) : items.length === 0 ? (
            <div style={{ color: "var(--muted)", lineHeight: 1.45 }}>Belum ada data. Klik “New News”.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {items.map((p) => (
                <div
                  key={p.id}
                  style={{
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: selectedId === p.id ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.18)",
                    padding: 12
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ fontWeight: 900 }}>{p.title}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>{p.status}</div>
                  </div>
                  <div style={{ marginTop: 4, fontSize: 12, color: "var(--muted)" }}>{p.slug}</div>
                  <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      disabled={busy}
                      onClick={() => openEdit(p)}
                      style={{
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.14)",
                        background: "rgba(0,0,0,0.22)",
                        color: "var(--text)",
                        padding: "8px 10px",
                        cursor: busy ? "not-allowed" : "pointer",
                        fontWeight: 800,
                        opacity: busy ? 0.6 : 1
                      }}
                    >
                      Edit
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => togglePublish(p)}
                      style={{
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.14)",
                        background: "rgba(0,0,0,0.22)",
                        color: "var(--text)",
                        padding: "8px 10px",
                        cursor: busy ? "not-allowed" : "pointer",
                        fontWeight: 800,
                        opacity: busy ? 0.6 : 1
                      }}
                    >
                      {p.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => remove(p.id)}
                      style={{
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.14)",
                        background: "rgba(120,0,0,0.22)",
                        color: "var(--text)",
                        padding: "8px 10px",
                        cursor: busy ? "not-allowed" : "pointer",
                        fontWeight: 800,
                        opacity: busy ? 0.6 : 1
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ border: "1px solid rgba(255,255,255,0.10)", borderRadius: 18, padding: 12 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Editor</div>
          {mode === "idle" ? (
            <div style={{ color: "var(--muted)", lineHeight: 1.45 }}>
              Pilih item untuk edit, atau klik “New News”.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Title"
                style={{
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(0,0,0,0.22)",
                  color: "var(--text)",
                  padding: "10px 12px",
                  outline: "none"
                }}
              />
              <input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="Slug"
                style={{
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(0,0,0,0.22)",
                  color: "var(--text)",
                  padding: "10px 12px",
                  outline: "none"
                }}
              />
              <input
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                placeholder="Excerpt"
                style={{
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(0,0,0,0.22)",
                  color: "var(--text)",
                  padding: "10px 12px",
                  outline: "none"
                }}
              />
              <textarea
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                placeholder="Body"
                rows={8}
                style={{
                  resize: "vertical",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(0,0,0,0.22)",
                  color: "var(--text)",
                  padding: "10px 12px",
                  outline: "none",
                  lineHeight: 1.45
                }}
              />
              <input
                value={form.coverUrl}
                onChange={(e) => setForm((f) => ({ ...f, coverUrl: e.target.value }))}
                placeholder="Cover URL (optional)"
                style={{
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(0,0,0,0.22)",
                  color: "var(--text)",
                  padding: "10px 12px",
                  outline: "none"
                }}
              />

              {selected ? (
                <div style={{ marginTop: 4, fontSize: 12, color: "var(--muted)" }}>
                  Status sekarang: <span style={{ color: "var(--text)", fontWeight: 900 }}>{selected.status}</span>
                </div>
              ) : null}

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
                <button
                  disabled={busy}
                  onClick={() => save()}
                  style={{
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.16)",
                    background: "rgba(0,0,0,0.28)",
                    color: "var(--text)",
                    padding: "10px 12px",
                    cursor: busy ? "not-allowed" : "pointer",
                    fontWeight: 900,
                    opacity: busy ? 0.6 : 1
                  }}
                >
                  {busy ? "Saving…" : "Save"}
                </button>
                <button
                  disabled={busy}
                  onClick={closeEditor}
                  style={{
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.16)",
                    background: "rgba(0,0,0,0.18)",
                    color: "var(--text)",
                    padding: "10px 12px",
                    cursor: busy ? "not-allowed" : "pointer",
                    fontWeight: 800,
                    opacity: busy ? 0.6 : 1
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
