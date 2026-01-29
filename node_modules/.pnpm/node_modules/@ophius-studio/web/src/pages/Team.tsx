import { useEffect, useState } from "react";

type TeamPublic = {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  avatarUrl: string | null;
};

async function fetchTeam(): Promise<TeamPublic[]> {
  const res = await fetch("/api/public/team", { method: "GET" });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  const json = (await res.json()) as { items: TeamPublic[] };
  return json.items;
}

export function Team() {
  const [items, setItems] = useState<TeamPublic[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetchTeam()
      .then((x) => setItems(x))
      .catch((e) => setErr(e.message || String(e)));
  }, []);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0, fontSize: 28 }}>Team</h1>

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

      <div style={{ opacity: 0.85, maxWidth: 860 }}>
        Profiles below are pulled from CMS (published only). If it’s empty, create &amp; publish team members in Admin.
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14
        }}
      >
        {items.map((it) => (
          <article
            key={it.id}
            style={{
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(0,0,0,0.26)",
              padding: 14,
              display: "grid",
              gap: 10
            }}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {it.avatarUrl ? (
                <img
                  src={it.avatarUrl}
                  alt={it.name}
                  style={{ width: 46, height: 46, borderRadius: 14, objectFit: "cover", border: "1px solid rgba(255,255,255,0.10)" }}
                />
              ) : (
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.06)"
                  }}
                />
              )}
              <div style={{ display: "grid", gap: 2 }}>
                <div style={{ fontWeight: 800 }}>{it.name}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{it.title ?? ""}</div>
              </div>
            </div>
            {it.bio ? <div style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.45 }}>{it.bio}</div> : null}
          </article>
        ))}

        {!items.length ? (
          <div style={{ opacity: 0.75, padding: 12 }}>No published team members yet.</div>
        ) : null}
      </div>
    </div>
  );
}
