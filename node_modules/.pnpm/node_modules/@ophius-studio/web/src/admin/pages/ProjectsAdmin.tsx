import { useEffect, useMemo, useRef, useState } from "react";
import { adminClient, type ProjectRecord } from "@/admin/api/adminClient";

type Mode = "idle" | "creating" | "editing";

type DraftInput = {
  title: string;
  slug: string;
  summary: string;
  body: string;
  coverUrl: string;
};

function toDraft(p?: ProjectRecord | null): DraftInput {
  return {
    title: p?.title ?? "",
    slug: p?.slug ?? "",
    summary: p?.summary ?? "",
    body: p?.body ?? "",
    coverUrl: p?.coverUrl ?? ""
  };
}

export function ProjectsAdmin() {
  const [items, setItems] = useState<ProjectRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<Mode>("idle");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<DraftInput>(() => toDraft(null));
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "draft" | "published">("all");
  const coverFileRef = useRef<HTMLInputElement | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverUploadErr, setCoverUploadErr] = useState<string | null>(null);
  const firstLoadRef = useRef(true);

  const selected = useMemo(() => items?.find((x) => x.id === selectedId) ?? null, [items, selectedId]);

  async function refresh() {
    setError(null);
    const res = await adminClient.projects.list({
      status: filter === "all" ? undefined : filter,
      q: query.trim() ? query.trim() : undefined
    });
    setItems(res.items);
  }

  async function uploadCover(file: File) {
    setCoverUploading(true);
    setCoverUploadErr(null);
    try {
      const res = await adminClient.assets.upload(file);
      setForm((f) => ({ ...f, coverUrl: res.url }));
    } catch (e: any) {
      setCoverUploadErr(e.message || String(e));
    } finally {
      setCoverUploading(false);
    }
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

  function openEdit(p: ProjectRecord) {
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
        await adminClient.projects.create({
          title: form.title,
          slug: form.slug,
          summary: form.summary || undefined,
          body: form.body || undefined,
          coverUrl: form.coverUrl || undefined
        });
      } else if (mode === "editing" && selectedId) {
        await adminClient.projects.update(selectedId, {
          title: form.title,
          slug: form.slug,
          summary: form.summary,
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
    if (!confirm("Delete this project?")) return;
    setBusy(true);
    setError(null);
    try {
      await adminClient.projects.remove(id);
      await refresh();
      if (selectedId === id) closeEditor();
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  async function togglePublish(p: ProjectRecord) {
    setBusy(true);
    setError(null);
    try {
      if (p.status === "PUBLISHED") {
        await adminClient.projects.unpublish(p.id);
      } else {
        await adminClient.projects.publish(p.id);
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
          <div style={{ fontSize: 22, fontWeight: 900 }}>Projects</div>
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
          New Project
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
            <div style={{ color: "var(--muted)", lineHeight: 1.45 }}>Belum ada data. Klik “New Project”.</div>
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
              Pilih item untuk edit, atau klik “New Project”.
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
                value={form.summary}
                onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                placeholder="Summary"
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

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <input
                  ref={coverFileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadCover(file);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  disabled={busy || coverUploading}
                  onClick={() => coverFileRef.current?.click()}
                  style={{
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.16)",
                    background: "rgba(255,255,255,0.06)",
                    color: "var(--text)",
                    padding: "10px 12px",
                    cursor: busy || coverUploading ? "not-allowed" : "pointer",
                    opacity: busy || coverUploading ? 0.6 : 1
                  }}
                >
                  {coverUploading ? "Uploading cover…" : "Upload cover"}
                </button>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>Hasil upload akan mengisi field Cover URL.</div>
              </div>

              {coverUploadErr ? (
                <div style={{ marginTop: 4, fontSize: 12, color: "rgba(255,120,120,0.95)" }}>{coverUploadErr}</div>
              ) : null}

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
