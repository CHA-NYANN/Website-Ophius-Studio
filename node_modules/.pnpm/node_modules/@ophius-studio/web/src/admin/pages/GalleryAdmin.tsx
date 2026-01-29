import { useEffect, useMemo, useRef, useState } from "react";
import { adminClient, type GalleryRecord } from "@/admin/api/adminClient";

type Mode = "idle" | "creating" | "editing";

type DraftInput = {
  title: string;
  imageUrl: string;
};

function toDraft(p?: GalleryRecord | null): DraftInput {
  return {
    title: p?.title ?? "",
    imageUrl: p?.imageUrl ?? ""
  };
}

async function uploadAndGetUrl(file: File) {
  const res = await adminClient.assets.upload(file);
  return res.url;
}

export function GalleryAdmin() {
  const [items, setItems] = useState<GalleryRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<Mode>("idle");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<DraftInput>(() => toDraft(null));
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "draft" | "published">("all");
  const firstLoadRef = useRef(true);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const selected = useMemo(() => items?.find((x) => x.id === selectedId) ?? null, [items, selectedId]);

  async function refresh() {
    setError(null);
    const res = await adminClient.gallery.list({
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

  function openEdit(p: GalleryRecord) {
    setMode("editing");
    setSelectedId(p.id);
    setForm(toDraft(p));
  }

  function closeEditor() {
    setMode("idle");
    setSelectedId(null);
    setForm(toDraft(null));
    if (fileRef.current) fileRef.current.value = "";
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      if (mode === "creating") {
        await adminClient.gallery.create({ title: form.title, imageUrl: form.imageUrl });
      } else if (mode === "editing" && selectedId) {
        await adminClient.gallery.update(selectedId, { title: form.title, imageUrl: form.imageUrl });
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
    if (!confirm("Delete this gallery item?")) return;
    setBusy(true);
    setError(null);
    try {
      await adminClient.gallery.remove(id);
      await refresh();
      if (selectedId === id) closeEditor();
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  async function togglePublish(p: GalleryRecord) {
    setBusy(true);
    setError(null);
    try {
      if (p.status === "PUBLISHED") await adminClient.gallery.unpublish(p.id);
      else await adminClient.gallery.publish(p.id);
      await refresh();
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  async function onUploadPicked(file: File | null) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const url = await uploadAndGetUrl(file);
      setForm((v) => ({ ...v, imageUrl: url }));
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
          <div style={{ fontSize: 22, fontWeight: 900 }}>Gallery</div>
          <div style={{ marginTop: 6, color: "var(--muted)", lineHeight: 1.45 }}>
            Item gallery bisa upload image → dapat URL <span style={{ color: "var(--text)", fontWeight: 900 }}>/uploads</span> → publish → tampil di halaman public.
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
          New Gallery
        </button>
      </div>

      {error ? <div style={{ color: "rgba(255,120,120,0.92)", lineHeight: 1.45 }}>Error: {error}</div> : null}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title / url…"
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
            <div style={{ color: "var(--muted)", lineHeight: 1.45 }}>Belum ada data. Klik “New Gallery”.</div>
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
                  <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
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
                        fontWeight: 900,
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
                        background: p.status === "PUBLISHED" ? "rgba(120,255,180,0.16)" : "rgba(120,180,255,0.14)",
                        color: "var(--text)",
                        padding: "8px 10px",
                        cursor: busy ? "not-allowed" : "pointer",
                        fontWeight: 900,
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
                        background: "rgba(255,80,80,0.12)",
                        color: "var(--text)",
                        padding: "8px 10px",
                        cursor: busy ? "not-allowed" : "pointer",
                        fontWeight: 900,
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
            <div style={{ color: "var(--muted)", lineHeight: 1.45 }}>Pilih item untuk edit, atau klik “New Gallery”.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 900 }}>Title</div>
                <input
                  value={form.title}
                  onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))}
                  style={{
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(0,0,0,0.22)",
                    color: "var(--text)",
                    padding: "10px 12px",
                    outline: "none"
                  }}
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 900 }}>Image URL</div>
                <input
                  value={form.imageUrl}
                  onChange={(e) => setForm((v) => ({ ...v, imageUrl: e.target.value }))}
                  placeholder="/uploads/... atau URL eksternal"
                  style={{
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(0,0,0,0.22)",
                    color: "var(--text)",
                    padding: "10px 12px",
                    outline: "none"
                  }}
                />
              </label>

              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  disabled={busy}
                  onChange={(e) => onUploadPicked(e.target.files?.[0] ?? null)}
                  style={{
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(0,0,0,0.22)",
                    color: "var(--text)",
                    padding: "10px 12px"
                  }}
                />
                <div style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.45 }}>
                  Pilih file → auto upload → mengisi Image URL.
                </div>
              </div>

              {form.imageUrl ? (
                <div style={{ borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", overflow: "hidden", background: "rgba(0,0,0,0.22)" }}>
                  <img src={form.imageUrl} alt="preview" style={{ width: "100%", display: "block" }} />
                </div>
              ) : null}

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  disabled={busy || !form.title.trim() || !form.imageUrl.trim()}
                  onClick={save}
                  style={{
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.16)",
                    background: "rgba(120,180,255,0.14)",
                    color: "var(--text)",
                    padding: "10px 12px",
                    cursor: busy ? "not-allowed" : "pointer",
                    fontWeight: 900,
                    opacity: busy ? 0.6 : 1
                  }}
                >
                  Save
                </button>
                <button
                  disabled={busy}
                  onClick={closeEditor}
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
                  Cancel
                </button>
              </div>

              {mode === "editing" && selected ? (
                <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 12 }}>
                  Status: <span style={{ color: "var(--text)", fontWeight: 900 }}>{selected.status}</span>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
