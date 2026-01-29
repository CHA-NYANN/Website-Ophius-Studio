import { useEffect, useMemo, useRef, useState } from "react";
import { adminClient, type MediaRecord } from "@/admin/api/adminClient";

type Mode = "idle" | "creating" | "editing";

type DraftInput = {
  title: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  thumbnailUrl: string;
};

function toDraft(p?: MediaRecord | null): DraftInput {
  return {
    title: p?.title ?? "",
    type: p?.type ?? "IMAGE",
    url: p?.url ?? "",
    thumbnailUrl: p?.thumbnailUrl ?? ""
  };
}

async function uploadAndGetUrl(file: File) {
  const res = await adminClient.assets.upload(file);
  return res.url;
}

export function MediaAdmin() {
  const [items, setItems] = useState<MediaRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<Mode>("idle");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<DraftInput>(() => toDraft(null));
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "draft" | "published">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "IMAGE" | "VIDEO">("all");
  const firstLoadRef = useRef(true);
  const urlFileRef = useRef<HTMLInputElement | null>(null);
  const thumbFileRef = useRef<HTMLInputElement | null>(null);

  const selected = useMemo(() => items?.find((x) => x.id === selectedId) ?? null, [items, selectedId]);

  async function refresh() {
    setError(null);
    const res = await adminClient.media.list({
      status: filter === "all" ? undefined : filter,
      q: query.trim() ? query.trim() : undefined,
      type: typeFilter === "all" ? undefined : typeFilter
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
  }, [filter, typeFilter]);

  function openCreate() {
    setMode("creating");
    setSelectedId(null);
    setForm(toDraft(null));
  }

  function openEdit(p: MediaRecord) {
    setMode("editing");
    setSelectedId(p.id);
    setForm(toDraft(p));
  }

  function closeEditor() {
    setMode("idle");
    setSelectedId(null);
    setForm(toDraft(null));
    if (urlFileRef.current) urlFileRef.current.value = "";
    if (thumbFileRef.current) thumbFileRef.current.value = "";
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      if (mode === "creating") {
        await adminClient.media.create({
          title: form.title,
          type: form.type,
          url: form.url,
          thumbnailUrl: form.thumbnailUrl || undefined
        });
      } else if (mode === "editing" && selectedId) {
        await adminClient.media.update(selectedId, {
          title: form.title,
          type: form.type,
          url: form.url,
          thumbnailUrl: form.thumbnailUrl
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
    if (!confirm("Delete this media item?")) return;
    setBusy(true);
    setError(null);
    try {
      await adminClient.media.remove(id);
      await refresh();
      if (selectedId === id) closeEditor();
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  async function togglePublish(p: MediaRecord) {
    setBusy(true);
    setError(null);
    try {
      if (p.status === "PUBLISHED") await adminClient.media.unpublish(p.id);
      else await adminClient.media.publish(p.id);
      await refresh();
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  async function onUploadUrlPicked(file: File | null) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const url = await uploadAndGetUrl(file);
      setForm((v) => ({ ...v, url }));
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  async function onUploadThumbPicked(file: File | null) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const url = await uploadAndGetUrl(file);
      setForm((v) => ({ ...v, thumbnailUrl: url }));
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
          <div style={{ fontSize: 22, fontWeight: 900 }}>Media</div>
          <div style={{ marginTop: 6, color: "var(--muted)", lineHeight: 1.45 }}>
            Media bisa berupa <span style={{ color: "var(--text)", fontWeight: 900 }}>IMAGE</span> atau <span style={{ color: "var(--text)", fontWeight: 900 }}>VIDEO</span>. Thumbnail bisa upload untuk card public.
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
          New Media
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
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          style={{
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(0,0,0,0.22)",
            color: "var(--text)",
            padding: "10px 12px"
          }}
        >
          <option value="all">All Types</option>
          <option value="IMAGE">IMAGE</option>
          <option value="VIDEO">VIDEO</option>
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
            <div style={{ color: "var(--muted)", lineHeight: 1.45 }}>Belum ada data. Klik “New Media”.</div>
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
                  <div style={{ marginTop: 4, fontSize: 12, color: "var(--muted)" }}>{p.type}</div>
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
            <div style={{ color: "var(--muted)", lineHeight: 1.45 }}>Pilih item untuk edit, atau klik “New Media”.</div>
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
                <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 900 }}>Type</div>
                <select
                  value={form.type}
                  onChange={(e) => setForm((v) => ({ ...v, type: e.target.value as any }))}
                  style={{
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(0,0,0,0.22)",
                    color: "var(--text)",
                    padding: "10px 12px"
                  }}
                >
                  <option value="IMAGE">IMAGE</option>
                  <option value="VIDEO">VIDEO</option>
                </select>
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 900 }}>URL</div>
                <input
                  value={form.url}
                  onChange={(e) => setForm((v) => ({ ...v, url: e.target.value }))}
                  placeholder={form.type === "VIDEO" ? "https://..." : "/uploads/... atau URL eksternal"}
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
                  ref={urlFileRef}
                  type="file"
                  accept={form.type === "IMAGE" ? "image/*" : "video/*"}
                  disabled={busy}
                  onChange={(e) => onUploadUrlPicked(e.target.files?.[0] ?? null)}
                  style={{
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(0,0,0,0.22)",
                    color: "var(--text)",
                    padding: "10px 12px"
                  }}
                />
                <div style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.45 }}>
                  Pilih file → auto upload → mengisi URL.
                </div>
              </div>

              <label style={{ display: "grid", gap: 6 }}>
                <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 900 }}>Thumbnail URL (optional)</div>
                <input
                  value={form.thumbnailUrl}
                  onChange={(e) => setForm((v) => ({ ...v, thumbnailUrl: e.target.value }))}
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
                  ref={thumbFileRef}
                  type="file"
                  accept="image/*"
                  disabled={busy}
                  onChange={(e) => onUploadThumbPicked(e.target.files?.[0] ?? null)}
                  style={{
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(0,0,0,0.22)",
                    color: "var(--text)",
                    padding: "10px 12px"
                  }}
                />
                <div style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.45 }}>
                  Upload thumbnail (optional).
                </div>
              </div>

              {form.thumbnailUrl ? (
                <div style={{ borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", overflow: "hidden", background: "rgba(0,0,0,0.22)" }}>
                  <img src={form.thumbnailUrl} alt="thumb" style={{ width: "100%", display: "block" }} />
                </div>
              ) : null}

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  disabled={busy || !form.title.trim() || !form.url.trim()}
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
