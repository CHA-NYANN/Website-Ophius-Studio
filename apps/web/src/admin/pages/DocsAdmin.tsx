import { useEffect, useMemo, useState } from "react";
import { adminClient, type DocRecord } from "@/admin/api/adminClient";

type Mode = "idle" | "creating" | "editing";

type DraftInput = {
  title: string;
  slug: string;
  markdown: string;
};

function toDraft(p?: DocRecord | null): DraftInput {
  return {
    title: p?.title ?? "",
    slug: p?.slug ?? "",
    markdown: p?.markdown ?? ""
  };
}

function labelStatus(s: DocRecord["status"]) {
  return s === "PUBLISHED" ? "Published" : "Draft";
}

export function DocsAdmin() {
  const [items, setItems] = useState<DocRecord[]>([]);
  const [status, setStatus] = useState<"all" | "draft" | "published">("all");
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<Mode>("idle");
  const [active, setActive] = useState<DocRecord | null>(null);
  const [form, setForm] = useState<DraftInput>(() => toDraft(null));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    const st = status === "all" ? undefined : status;
    const res = await adminClient.docs.list({ status: st, q: q || undefined, limit: 200 });
    setItems(res.items);
  }

  useEffect(() => {
    refresh().catch((e) => setErr(e.message));
  }, []);

  const filtered = useMemo(() => {
    const qn = q.trim().toLowerCase();
    return items.filter((it) => {
      const okStatus = status === "all" ? true : status === "published" ? it.status === "PUBLISHED" : it.status === "DRAFT";
      const okQ = !qn
        ? true
        : (it.title ?? "").toLowerCase().includes(qn) || (it.slug ?? "").toLowerCase().includes(qn);
      return okStatus && okQ;
    });
  }, [items, status, q]);

  function startCreate() {
    setErr(null);
    setMode("creating");
    setActive(null);
    setForm({ title: "", slug: "", markdown: "" });
  }

  function startEdit(item: DocRecord) {
    setErr(null);
    setMode("editing");
    setActive(item);
    setForm(toDraft(item));
  }

  async function save() {
    setBusy(true);
    setErr(null);
    try {
      if (mode === "creating") {
        await adminClient.docs.create({ title: form.title, slug: form.slug || undefined, markdown: form.markdown || undefined });
      } else if (mode === "editing" && active) {
        await adminClient.docs.update(active.id, {
          title: form.title,
          slug: form.slug,
          markdown: form.markdown
        });
      }
      await refresh();
      setMode("idle");
      setActive(null);
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: DocRecord) {
    if (!confirm(`Delete doc “${item.title}”?`)) return;
    setBusy(true);
    setErr(null);
    try {
      await adminClient.docs.remove(item.id);
      await refresh();
      if (active?.id === item.id) {
        setActive(null);
        setMode("idle");
      }
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  async function togglePublish(item: DocRecord) {
    setBusy(true);
    setErr(null);
    try {
      if (item.status === "PUBLISHED") await adminClient.docs.unpublish(item.id);
      else await adminClient.docs.publish(item.id);
      await refresh();
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <section
        style={{
          background: "rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14,
          padding: 14
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ fontSize: 14, opacity: 0.9 }}>Docs (CMS)</div>
          <button onClick={startCreate} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(34,160,255,0.18)", color: "white", cursor: "pointer" }}>
            + New
          </button>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title or slug…"
            style={{ flex: "1 1 240px", padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.25)", color: "white" }}
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.25)", color: "white" }}
          >
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <button
            disabled={busy}
            onClick={() => refresh().catch((e) => setErr(e.message))}
            style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "white", cursor: "pointer" }}
          >
            Refresh
          </button>
        </div>

        {err ? (
          <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 12, background: "rgba(255,80,80,0.12)", border: "1px solid rgba(255,80,80,0.22)", color: "rgba(255,255,255,0.95)", fontSize: 13 }}>
            {err}
          </div>
        ) : null}

        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {filtered.map((it) => (
            <div
              key={it.id}
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                padding: 12,
                background: active?.id === it.id ? "rgba(34,160,255,0.10)" : "rgba(0,0,0,0.18)",
                display: "grid",
                gap: 8
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontWeight: 700 }}>{it.title}</div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>{labelStatus(it.status)}</div>
              </div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>/{it.slug}</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => startEdit(it)} style={{ padding: "8px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "white", cursor: "pointer" }}>
                  Edit
                </button>
                <button onClick={() => togglePublish(it)} style={{ padding: "8px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: it.status === "PUBLISHED" ? "rgba(255,170,0,0.14)" : "rgba(80,255,160,0.12)", color: "white", cursor: "pointer" }}>
                  {it.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                </button>
                <button onClick={() => remove(it)} style={{ padding: "8px 12px", borderRadius: 12, border: "1px solid rgba(255,120,120,0.18)", background: "rgba(255,80,80,0.12)", color: "white", cursor: "pointer" }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
          {!filtered.length ? <div style={{ opacity: 0.75, padding: 12 }}>No docs yet.</div> : null}
        </div>
      </section>

      <section
        style={{
          background: "rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14,
          padding: 14
        }}
      >
        <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 12 }}>
          {mode === "creating" ? "Create Doc" : mode === "editing" ? "Edit Doc" : "Select a doc"}
        </div>

        {mode === "idle" ? (
          <div style={{ opacity: 0.75, padding: 12 }}>
            Pick a doc from the left, or create a new one.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontSize: 12, opacity: 0.8 }}>Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.25)", color: "white" }}
              />
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontSize: 12, opacity: 0.8 }}>Slug (URL)</label>
              <input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="getting-started"
                style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.25)", color: "white" }}
              />
              <div style={{ fontSize: 12, opacity: 0.65 }}>Public URL will be /docs (this is the identifier inside CMS).</div>
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontSize: 12, opacity: 0.8 }}>Markdown</label>
              <textarea
                value={form.markdown}
                onChange={(e) => setForm((f) => ({ ...f, markdown: e.target.value }))}
                rows={14}
                style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.25)", color: "white", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}
              />
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                disabled={busy}
                onClick={save}
                style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(80,255,160,0.12)", color: "white", cursor: "pointer" }}
              >
                Save
              </button>
              <button
                disabled={busy}
                onClick={() => {
                  setMode("idle");
                  setActive(null);
                  setErr(null);
                }}
                style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "white", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
