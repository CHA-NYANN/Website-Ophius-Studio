import { useEffect, useMemo, useRef, useState } from "react";
import { adminClient, type TeamRecord } from "@/admin/api/adminClient";

type Mode = "idle" | "creating" | "editing";

type DraftInput = {
  name: string;
  title: string;
  bio: string;
  avatarUrl: string;
};

function toDraft(p?: TeamRecord | null): DraftInput {
  return {
    name: p?.name ?? "",
    title: p?.title ?? "",
    bio: p?.bio ?? "",
    avatarUrl: p?.avatarUrl ?? ""
  };
}

function labelStatus(s: TeamRecord["status"]) {
  return s === "PUBLISHED" ? "Published" : "Draft";
}

export function TeamAdmin() {
  const [items, setItems] = useState<TeamRecord[]>([]);
  const [status, setStatus] = useState<"all" | "draft" | "published">("all");
  const [q, setQ] = useState("");
  const [active, setActive] = useState<TeamRecord | null>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [form, setForm] = useState<DraftInput>(() => toDraft(null));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items
      .filter((it) => {
        if (status === "draft" && it.status !== "DRAFT") return false;
        if (status === "published" && it.status !== "PUBLISHED") return false;
        if (!needle) return true;
        return `${it.name} ${it.title ?? ""}`.toLowerCase().includes(needle);
      })
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }, [items, q, status]);

  async function refresh() {
    const res = await adminClient.team.list({
      q: q.trim() ? q.trim() : undefined,
      status: status === "all" ? undefined : status
    });
    setItems(res.items);
  }

  useEffect(() => {
    refresh().catch((e) => setErr(e.message || String(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startCreate() {
    setErr(null);
    setActive(null);
    setForm(toDraft(null));
    setMode("creating");
  }

  function startEdit(item: TeamRecord) {
    setErr(null);
    setActive(item);
    setForm(toDraft(item));
    setMode("editing");
  }

  async function save() {
    setBusy(true);
    setErr(null);
    try {
      if (mode === "creating") {
        await adminClient.team.create({
          name: form.name,
          title: form.title || undefined,
          bio: form.bio || undefined,
          avatarUrl: form.avatarUrl || undefined
        });
      } else if (mode === "editing" && active) {
        await adminClient.team.update(active.id, {
          name: form.name,
          title: form.title || undefined,
          bio: form.bio || undefined,
          avatarUrl: form.avatarUrl || undefined
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

  async function remove(item: TeamRecord) {
    if (!confirm(`Delete team member “${item.name}”?`)) return;
    setBusy(true);
    setErr(null);
    try {
      await adminClient.team.remove(item.id);
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

  async function togglePublish(item: TeamRecord) {
    setBusy(true);
    setErr(null);
    try {
      if (item.status === "PUBLISHED") await adminClient.team.unpublish(item.id);
      else await adminClient.team.publish(item.id);
      await refresh();
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  async function uploadAvatar(file: File) {
    setUploading(true);
    setErr(null);
    try {
      const res = await adminClient.assets.upload(file);
      setForm((f) => ({ ...f, avatarUrl: res.url }));
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setUploading(false);
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
          <div style={{ fontSize: 14, opacity: 0.9 }}>Team (CMS)</div>
          <button onClick={startCreate} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(34,160,255,0.18)", color: "white", cursor: "pointer" }}>
            + New
          </button>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name/title…"
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
                <div style={{ fontWeight: 800 }}>{it.name}</div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>{labelStatus(it.status)}</div>
              </div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>{it.title ?? ""}</div>
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
          {!filtered.length ? <div style={{ opacity: 0.75, padding: 12 }}>No team members yet.</div> : null}
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
          {mode === "creating" ? "Create Team Member" : mode === "editing" ? "Edit Team Member" : "Select a member"}
        </div>

        {mode === "idle" ? (
          <div style={{ opacity: 0.75, padding: 12 }}>Pick a member from the left, or create a new one.</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontSize: 12, opacity: 0.8 }}>Name</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.25)", color: "white" }} />
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontSize: 12, opacity: 0.8 }}>Title / Role</label>
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.25)", color: "white" }} />
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontSize: 12, opacity: 0.8 }}>Bio</label>
              <textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} rows={6} style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.25)", color: "white", resize: "vertical" }} />
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontSize: 12, opacity: 0.8 }}>Avatar URL</label>
              <input value={form.avatarUrl} onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))} placeholder="/uploads/..." style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.25)", color: "white" }} />
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadAvatar(file);
                    e.target.value = "";
                  }}
                />
                <button type="button" disabled={busy || uploading} onClick={() => fileRef.current?.click()} style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "white", cursor: "pointer", opacity: busy || uploading ? 0.6 : 1 }}>
                  {uploading ? "Uploading avatar…" : "Upload avatar"}
                </button>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Hasil upload akan mengisi Avatar URL.</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button disabled={busy} onClick={save} style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(80,255,160,0.12)", color: "white", cursor: "pointer" }}>
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
