Iya, **perlu dibedain** kalau kamu memang punya fitur yang “mengubah isi” (upload news, edit projects, upload gallery/media, manage team, docs, dsb). Kalau web ini murni showcase yang isinya statis, login admin itu opsional (bisa kamu kelola via Git/MDX). Tapi dari konsep kamu—banyak halaman, News, Media, Gallery—paling masuk akal: **public site tetap bisa diakses semua orang tanpa login**, dan **login hanya untuk admin/staff** yang mengelola konten.

Jadi bukan “setiap user harus login”, tapi “login itu untuk dashboard/authoring”.

Kalau kamu mau dua jenis akun (“admin” dan “user biasa”), kamu bisa, tapi biasanya tidak dibutuhkan untuk website studio. Yang kamu butuhkan minimal itu:

* **Public Visitor**: bebas melihat semua konten.
* **Admin/Editor**: bisa CRUD konten (Projects, News, Gallery, Media, Docs, Team).

Kalau kamu memang mau “user biasa” bisa punya fitur komunitas (komen, like, bookmark, newsletter, submit fanart), baru user login jadi relevan.

## Arsitektur login yang paling cocok untuk rancangan kamu

Karena kamu punya “Galaxy 3D realm” sebagai experience utama, login tidak boleh merusak flow. Praktik yang paling bersih:

* **Portal/Link Start tetap jadi transisi** menuju halaman login/admin (2D).
* Setelah admin login, kamu masuk ke **Admin Dashboard (2D)**, bukan mengedit langsung di 3D (kecuali kamu mau fitur futuristik belakangan).

### Rekomendasi minimum (paling realistis dan cepat jadi)

* `/admin/login` (2D) → form login
* `/admin` (2D) → dashboard home
* `/admin/projects`, `/admin/news`, `/admin/media`, `/admin/gallery`, `/admin/docs`, `/admin/team` → panel CRUD

Public routes tetap:

* `/` galaxy
* `/docs`, `/projects`, `/news`, dll

## Role & permission (kontrak yang jelas)

Paling simpel:

* **admin**: full access
* **editor**: bisa create/edit content, tapi tidak bisa manage user/role
* **viewer** (opsional): hanya melihat dashboard/preview konten draft

Kalau kamu mau “user biasa”:

* **user**: punya profile, bisa bookmark/like/submit, tapi tidak bisa edit konten global.

Tapi kalau tujuanmu “studio showcase + update konten”, cukup admin/editor saja.

## Keamanan implementasi (yang benar, biar nggak jadi “fake login”)

Jangan pakai “admin login cuma localStorage” untuk web publik, karena gampang dibypass. Yang aman:

* session cookie (httpOnly) dari backend, atau JWT yang disimpan aman (idealnya cookie).
* middleware/guard di backend untuk route admin.
* di frontend, ProtectedRoute hanya untuk UX, bukan keamanan utama.

## Integrasi dengan blueprint portal kamu

Login/Admin tetap menggunakan portal style:

* Klik “Admin” (link kecil di footer atau hidden gesture) → FocusPreview → portal profile `utility` atau `docs` → `/admin/login`.
* Setelah berhasil login, redirect ke `/admin` dengan portal ringan (opsional) supaya tetap “nyambung”.

Admin pages tidak perlu background black hole sliver kalau kamu ingin lebih fokus kerja, tapi kamu bisa tetap pakai versi yang lebih tenang (starfield minimal) agar tetap satu brand.

## Dampak ke konten (kalau kamu pakai CMS internal)

Kalau admin bisa edit konten, berarti konten tidak hanya MDX statis. Kamu butuh:

* database (untuk projects/news/media/gallery)
* uploader (gambar/video)
* draft/publish state (opsional tapi bagus)
* cache/prefetch agar public site cepat

Kalau kamu ingin cepat jadi tanpa backend rumit, alternatifnya:

* Admin bukan “edit di web”, tapi “commit content ke repo” (MDX/JSON) dan deploy. Ini paling simpel dan aman, tapi bukan login.

## Keputusan yang paling tepat untuk kasus kamu

Melihat panel kamu: Game (external store), Project, Team, Docs, Gallery, Media, News, Contact — semuanya bisa public. Yang butuh admin adalah supaya kamu bisa:

* nambah News tanpa ngoding
* upload Gallery/Media
* update Projects & Team

Jadi: **public tanpa login, admin khusus dashboard**.

Kalau kamu setuju model ini, aku bisa susun blueprint admin-nya yang nyambung dengan struktur folder yang tadi: route, layout, halaman CRUD per section, dan integrasi portal + permission guard (frontend + backend).

---

Sip, berarti kita kunci modelnya begini: **public site tetap 100% bisa diakses tanpa login**, dan **login hanya untuk area `/admin`** yang isinya dashboard + CRUD konten. Ini paling cocok dengan konsep galaxy kamu karena experience 3D-nya tidak pernah “terhalang login”, tapi kamu tetap punya mesin produksi konten (News/Projects/Gallery/Media/Docs/Team) yang rapi dan aman.

Di bawah ini blueprint implementasi admin yang nyambung dengan rancangan portal + struktur folder yang tadi.

---

## Bentuk pengalaman admin yang nyambung dengan semesta

Admin itu “mode kerja”, bukan “mode pamer”. Jadi dia tetap terasa Ophius (gelap, starfield halus, glass surface), tapi lebih tenang daripada Pages publik. Portal tetap dipakai supaya bahasa navigasinya konsisten: ketika admin membuka `/admin/login` atau pindah dari public ke admin, tetap ada FocusPreview 0.28 detik lalu portal profile `utility` (lebih rapi, tidak terlalu agresif). Back to Galaxy tetap ada (biar kamu bisa cepat balik ke semesta), tapi di admin UI fokus utamanya adalah workflow konten.

---

## Route admin yang paling rapi dan scalable

Secara URL, kamu cukup punya satu “ruang admin” yang semuanya berada di bawah `/admin`. Login dan semua halaman manajemen di situ, misalnya `/admin/login` untuk autentikasi, `/admin` untuk dashboard ringkas, lalu `/admin/projects`, `/admin/news`, `/admin/media`, `/admin/gallery`, `/admin/docs`, `/admin/team` untuk list, dan detail editnya di `/admin/projects/:id`, `/admin/news/:id`, dan seterusnya. Ini bikin struktur mudah dipahami dan gampang diproteksi secara akses.

Portal profile mapping-nya simpel: semua route yang mulai dengan `/admin` kamu map ke profile `utility`, jadi transisi admin terasa “masuk sistem” tetapi tidak meniru Docs cyan (karena admin bukan docs publik).

---

## Login: aman beneran, bukan “fake login localStorage”

Karena ini web publik yang nanti bisa diakses orang, login admin sebaiknya tidak pakai “token palsu di localStorage” sebagai satu-satunya pengaman. Yang paling aman dan paling stabil adalah **session cookie httpOnly** dari backend. Artinya, setelah login sukses, backend meng-set cookie yang tidak bisa dibaca JS, sehingga lebih aman dari XSS, dan semua request admin ke API divalidasi dari cookie itu.

Di frontend, kamu tetap boleh punya “ProtectedRoute” untuk UX (biar tidak flicker), tapi keamanan utama harus tetap di server: kalau user tidak punya session valid atau role tidak sesuai, API menolak.

Kalau stack kamu sudah pakai Prisma (kamu sempat pakai Prisma db push/seed), ini nyambung banget: user admin disimpan di database, password di-hash (bcrypt/argon2), lalu session disimpan (bisa di tabel session atau pakai JWT cookie dengan rotasi). Untuk awal, session tabel itu paling gampang dan jelas.

---

## Role dan permission yang cukup (tanpa bikin rumit)

Supaya tim kamu nanti bisa kolaborasi, kamu bikin role minimal: `admin` dan `editor`. Admin bisa semua hal termasuk mengelola akun, editor bisa CRUD konten tapi tidak bisa manage user. Kalau kamu ingin sangat sederhana dulu, kamu bisa mulai dari admin saja, dan struktur role tetap disiapkan agar nanti gampang ditambah.

Di backend, tiap endpoint admin punya guard: minimal role editor untuk create/edit/publish, admin untuk user management. Di frontend, UI juga menyesuaikan: kalau editor, menu “Users” tidak tampil.

---

## Data model konten supaya bisa draft/publish dan tidak merusak public site

Konten seperti News, Projects, Media, Gallery, Docs, Team sebaiknya punya status `draft` dan `published`. Ini penting karena kamu pasti mau nulis dulu, preview dulu, baru publish. Jadi setiap item minimal punya `title`, `slug`, `status`, `content/body`, `createdAt`, `updatedAt`, `publishedAt`, dan `authorId`. Untuk Projects dan Games, kamu tambahkan `platformLinks` (Steam/itch/Play Store), `tags`, `cover`, dan `gallery`.

Public pages hanya menampilkan yang `published`. Admin bisa melihat semua, termasuk draft.

Untuk Docs, kamu bisa tetap pakai MDX statis kalau mau super simpel, tapi kalau kamu ingin admin edit lewat dashboard, Docs perlu masuk database juga (atau minimal tersimpan sebagai file via API). Biasanya yang paling enak: News/Projects/Gallery/Media masuk DB dulu, Docs belakangan karena docs panjang dan enak dikelola via repo. Tapi karena kamu sudah setuju admin untuk produksi konten, kamu bisa tetap siapkan kedua jalur: Docs bisa “hybrid” (static untuk versi awal, CMS untuk versi pro).

---

## Upload asset (gambar/video) tanpa menyiksa performa

Gallery, Media, dan Project cover butuh upload. Kamu perlu “Asset pipeline” yang rapi: admin upload file, backend menyimpan file, lalu mengembalikan URL + metadata (width/height, size, mime). Untuk development kamu bisa simpan di `public/uploads` atau folder server, tapi untuk production paling aman pakai object storage (S3 compatible seperti Cloudflare R2, AWS S3, dll). Yang penting bukan providernya dulu, tapi kontrak: admin dapat URL stabil, public bisa load cepat, dan kamu bisa generate thumbnail untuk gambar agar halaman tidak berat.

Di admin UI, setelah upload sukses, kamu langsung bisa preview asset pada card/list, sehingga workflow-nya enak.

---

## Struktur folder tambahan yang nyambung dengan kerangka sebelumnya

Di folder `src/pages/` kamu tambah `admin/` berisi `AdminLogin.tsx`, `AdminLayout.tsx`, `AdminDashboard.tsx`, dan modul per konten seperti `admin/projects/ProjectsAdminList.tsx`, `admin/projects/ProjectsAdminEdit.tsx`, seterusnya untuk news/media/gallery/docs/team. Ini bikin public pages dan admin pages tidak campur aduk.

Di `src/components/` kamu tambah komponen admin yang reusable seperti table list, editor surface, modal confirm publish, uploader field, dan status badge. Kamu juga butuh `src/auth/` atau `src/admin/auth/` untuk hook `useAuth()` dan API client kecil untuk login/logout/me, agar semua halaman admin bisa cek sesi tanpa duplikasi.

Portal dan theme tetap memakai modul yang sudah kita kunci: `/admin` route akan memanggil `useRouteTheme` dan otomatis dapat profile `utility`, jadi aksen admin konsisten.

---

## Integrasi portal dengan login dan admin navigation (biar tetap “cinematic” tapi tidak capek)

Kamu tetap memakai portal untuk perpindahan besar: dari galaxy ke `/admin/login`, dari public page ke admin dashboard, dari admin balik ke galaxy. Tapi di dalam admin sendiri (pindah dari Admin Projects ke Admin News), kamu tidak perlu portal SAO penuh, cukup micro transition (fade/slide halus) supaya admin terasa produktif, bukan tiap klik harus “warp”.

Kuncinya: portal itu “bahasa antar realm”, sedangkan di dalam realm admin itu “workflow”.

---

## Admin UI contract: layout, breadcrumb, dan kontrol kerja

AdminLayout sebaiknya punya header sticky yang mirip public Pages (breadcrumb + Back to Galaxy) tapi ditambah elemen kerja seperti “Publish status”, “Save”, “Preview”, dan “Logout”. Breadcrumb admin harus lebih informatif, misalnya `Admin > Projects > Edit: Black Hole Environment`, sehingga kamu tidak tersesat.

Untuk editor konten, kamu pakai surface glassy yang sama, tapi di dalamnya kamu tampilkan form yang jelas dan tegas: input title, slug, tags, status, cover uploader, body editor. Untuk News dan Docs, body editor bisa markdown/MDX editor sederhana dulu; yang penting ada preview.

---

## Backend endpoints minimum agar admin jalan

Secara kontrak API, kamu butuh endpoint autentikasi `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` untuk cek sesi. Lalu endpoint CRUD per entitas, misalnya `/admin/projects`, `/admin/news`, `/admin/media`, `/admin/gallery`, `/admin/team`, `/admin/docs` dengan operasi list, create, update, delete, publish/unpublish. Upload asset punya endpoint `/admin/assets/upload`.

Public endpoints bisa terpisah (atau sama endpoint tapi filter published), misalnya `/public/news`, `/public/projects`. Kalau kamu pakai framework yang sama untuk server dan public, kamu bisa tetap membuat satu set endpoint dengan query `status=published` untuk public, tapi tetap harus server-side enforcement: public tidak boleh bisa akses draft.

---

## Kapan “user login” (akun biasa) dibutuhkan?

Untuk rancangan sekarang, tidak dibutuhkan. Kamu baru perlu login user kalau kamu menambah fitur komunitas (komentar, like, bookmark, submit fanart, newsletter profile). Kalau belum ada itu, menjaga public site tanpa login itu keputusan paling tepat karena menjaga experience galaxy tetap wow dan ringan.

---

Siap. Ini “kontrak file nyata” untuk sisi admin yang langsung nyambung dengan kerangka folder dan sistem portal kamu: `AdminLayout`, auth flow `me/login/logout`, ProtectedRoute yang minim flicker, dan Back to Galaxy yang memicu portal reverse (bukan pindah route mentah).

Aku tulis sebagai set file yang bisa kamu copy, dengan asumsi frontend React + React Router (seperti kerangka sebelumnya). Backend API endpoint cukup kamu sesuaikan nanti (`/api/auth/...`).

---

## 1) Tambahkan folder admin ke struktur

```txt
src/
  admin/
    auth/
      authClient.ts
      authStore.ts
      useAuth.ts
      AdminGuard.tsx
    layout/
      AdminLayout.tsx
      AdminHeader.tsx
      AdminSidebar.tsx
    pages/
      AdminLogin.tsx
      AdminDashboard.tsx
      projects/
        ProjectsAdminList.tsx
        ProjectsAdminEdit.tsx
      news/
        NewsAdminList.tsx
        NewsAdminEdit.tsx
      media/
        MediaAdminList.tsx
        MediaAdminEdit.tsx
      gallery/
        GalleryAdminList.tsx
        GalleryAdminEdit.tsx
      team/
        TeamAdminList.tsx
        TeamAdminEdit.tsx
      docs/
        DocsAdminList.tsx
        DocsAdminEdit.tsx
```

---

## 2) Auth client (API wrapper yang konsisten)

```ts
// src/admin/auth/authClient.ts
export type Role = "admin" | "editor";

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
};

export type MeResponse = { user: AuthUser | null };

const BASE = "/api"; // sesuaikan kalau API kamu beda

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const authClient = {
  async me(): Promise<MeResponse> {
    const res = await fetch(`${BASE}/auth/me`, {
      method: "GET",
      credentials: "include", // penting untuk cookie session
      headers: { "Accept": "application/json" },
    });
    return json<MeResponse>(res);
  },

  async login(email: string, password: string): Promise<{ user: AuthUser }> {
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return json<{ user: AuthUser }>(res);
  },

  async logout(): Promise<{ ok: true }> {
    const res = await fetch(`${BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: { "Accept": "application/json" },
    });
    return json<{ ok: true }>(res);
  },
};
```

---

## 3) Auth store (1 sumber kebenaran, minim flicker)

Konsepnya: saat app mulai, kita jalankan `me()` sekali. Sambil nunggu, status `checking`. ProtectedRoute akan render skeleton ringan, bukan “langsung redirect” yang bikin flicker.

```ts
// src/admin/auth/authStore.ts
import type { AuthUser } from "./authClient";
import { authClient } from "./authClient";

export type AuthStatus = "idle" | "checking" | "authed" | "guest";

type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;
  error?: string | null;
};

type Listener = (s: AuthState) => void;

const state: AuthState = { status: "idle", user: null, error: null };
const listeners = new Set<Listener>();

function emit() {
  for (const l of listeners) l({ ...state });
}

export const authStore = {
  get(): AuthState {
    return { ...state };
  },

  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async checkMe() {
    if (state.status === "checking" || state.status === "authed") return;
    state.status = "checking";
    state.error = null;
    emit();

    try {
      const res = await authClient.me();
      state.user = res.user;
      state.status = res.user ? "authed" : "guest";
      emit();
    } catch (e: any) {
      state.user = null;
      state.status = "guest";
      state.error = e?.message ?? "Auth check failed";
      emit();
    }
  },

  async login(email: string, password: string) {
    state.error = null;
    emit();
    const res = await authClient.login(email, password);
    state.user = res.user;
    state.status = "authed";
    emit();
    return res.user;
  },

  async logout() {
    try {
      await authClient.logout();
    } finally {
      state.user = null;
      state.status = "guest";
      emit();
    }
  },
};
```

---

## 4) Hook `useAuth()` (React-friendly)

```ts
// src/admin/auth/useAuth.ts
import { useEffect, useState } from "react";
import { authStore } from "./authStore";

export function useAuth() {
  const [auth, setAuth] = useState(authStore.get());

  useEffect(() => authStore.subscribe(setAuth), []);
  useEffect(() => {
    if (auth.status === "idle") authStore.checkMe();
  }, [auth.status]);

  return {
    ...auth,
    checkMe: () => authStore.checkMe(),
    login: (email: string, password: string) => authStore.login(email, password),
    logout: () => authStore.logout(),
  };
}
```

---

## 5) AdminGuard (ProtectedRoute yang minim flicker)

Aturannya:

* kalau masih `checking`, tampilkan loading surface (bukan redirect).
* kalau `guest`, redirect ke `/admin/login`.
* kalau role tidak cukup, tampilkan “Forbidden”.

```tsx
// src/admin/auth/AdminGuard.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";
import Surface from "@/components/ui/Surface";

export default function AdminGuard({
  minRole,
  children,
}: {
  minRole?: "admin" | "editor";
  children: React.ReactNode;
}) {
  const { status, user } = useAuth();
  const loc = useLocation();

  if (status === "idle" || status === "checking") {
    return (
      <div style={{ padding: 16 }}>
        <Surface>
          <div style={{ opacity: 0.8 }}>Checking session…</div>
        </Surface>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: loc.pathname }} />;
  }

  if (minRole === "admin" && user.role !== "admin") {
    return (
      <div style={{ padding: 16 }}>
        <Surface>
          <div style={{ fontWeight: 700 }}>Forbidden</div>
          <div style={{ opacity: 0.8, marginTop: 6 }}>
            You don’t have permission to access this area.
          </div>
        </Surface>
      </div>
    );
  }

  return <>{children}</>;
}
```

---

## 6) Admin layout + header + sidebar (masih satu semesta, tapi workflow)

Admin tetap memakai background `oph-page-bg` + surface glassy, tetapi sidebar membuat kerja cepat. Back to Galaxy tetap ada di header.

### AdminLayout

```tsx
// src/admin/layout/AdminLayout.tsx
import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { portalSingleton } from "@/singletons/portalSingleton";
import { useRouteTheme } from "@/pages/theme/useRouteTheme";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  const loc = useLocation();
  useRouteTheme("/admin"); // paksa utility profile untuk semua admin

  useEffect(() => {
    portalSingleton.markDestinationReady();
  }, [loc.pathname]);

  return (
    <div className="oph-page-bg">
      <div className="oph-bh-sliver" style={{ opacity: 0.45 }} />
      <AdminHeader />
      <div style={{ display: "flex", gap: 16, padding: 16 }}>
        <AdminSidebar />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
```

### AdminHeader (Back to Galaxy pakai portal reverse)

Kontraknya: Back to Galaxy jangan langsung `navigate("/")`. Ia harus memicu portal internal seperti biasanya. Cara termudah: gunakan navigator util yang sama (di AppShell). Kalau kamu belum expose `nav` global, versi aman dulu adalah `portalSingleton.startInternal({toPath:"/"})` lalu navigate dipicu oleh tick di AppShell.

```tsx
// src/admin/layout/AdminHeader.tsx
import React from "react";
import { useLocation } from "react-router-dom";
import { portalSingleton } from "@/singletons/portalSingleton";
import Surface from "@/components/ui/Surface";
import { useAuth } from "@/admin/auth/useAuth";

export default function AdminHeader() {
  const loc = useLocation();
  const { user, logout } = useAuth();

  const onBackToGalaxy = () => {
    // portal reverse feel will be handled by your PortalController + overlay
    portalSingleton.startInternal({ toPath: "/" });
  };

  return (
    <div className="oph-header" style={{ display: "flex", alignItems: "center", padding: "0 12px", gap: 12 }}>
      <button
        onClick={onBackToGalaxy}
        style={{
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.16)",
          color: "var(--oph-text)",
          borderRadius: 12,
          padding: "8px 12px",
          cursor: "pointer",
        }}
      >
        Back to Galaxy
      </button>

      <div style={{ opacity: 0.75, fontSize: 13 }}>
        Admin
        <span style={{ opacity: 0.65 }}> · </span>
        <span style={{ opacity: 0.9 }}>{loc.pathname}</span>
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ opacity: 0.8, fontSize: 13 }}>
          {user ? `${user.email} (${user.role})` : "—"}
        </div>
        <button
          onClick={logout}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.14)",
            color: "var(--oph-text)",
            borderRadius: 12,
            padding: "8px 12px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
```

### AdminSidebar

```tsx
// src/admin/layout/AdminSidebar.tsx
import React from "react";
import { NavLink } from "react-router-dom";

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  display: "block",
  padding: "10px 12px",
  borderRadius: 14,
  textDecoration: "none",
  color: "var(--oph-text)",
  background: isActive ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.10)",
});

export default function AdminSidebar() {
  return (
    <div style={{ width: 260, minWidth: 260, display: "flex", flexDirection: "column", gap: 10 }}>
      <NavLink to="/admin" style={linkStyle}>Dashboard</NavLink>
      <NavLink to="/admin/projects" style={linkStyle}>Projects</NavLink>
      <NavLink to="/admin/news" style={linkStyle}>News</NavLink>
      <NavLink to="/admin/media" style={linkStyle}>Media</NavLink>
      <NavLink to="/admin/gallery" style={linkStyle}>Gallery</NavLink>
      <NavLink to="/admin/team" style={linkStyle}>Team</NavLink>
      <NavLink to="/admin/docs" style={linkStyle}>Docs</NavLink>
    </div>
  );
}
```

---

## 7) Admin login page (portal-aware, redirect balik)

Login page tetap 2D. Setelah login sukses, dia masuk `/admin` (atau `state.from` kalau user sebelumnya mau akses halaman tertentu).

```tsx
// src/admin/pages/AdminLogin.tsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Surface from "@/components/ui/Surface";
import { useAuth } from "@/admin/auth/useAuth";

export default function AdminLogin() {
  const nav = useNavigate();
  const loc = useLocation() as any;
  const { status, user, login } = useAuth();

  const from = loc.state?.from ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (status === "authed" && user) {
    nav(from, { replace: true });
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(email, password);
      nav(from, { replace: true });
    } catch (e: any) {
      setErr(e?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="oph-page-bg">
      <div className="oph-bh-sliver" style={{ opacity: 0.35 }} />
      <div style={{ padding: 16, maxWidth: 520, margin: "24px auto" }}>
        <Surface>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 0.4 }}>Admin Login</div>
          <div style={{ opacity: 0.75, marginTop: 6 }}>
            Sign in to manage content.
          </div>

          <form onSubmit={submit} style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{ fontSize: 13, opacity: 0.8 }}>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              style={inputStyle}
            />
            <label style={{ fontSize: 13, opacity: 0.8, marginTop: 8 }}>Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              style={inputStyle}
            />

            {err && <div style={{ color: "rgba(255,120,120,0.92)", marginTop: 6 }}>{err}</div>}

            <button
              disabled={loading}
              style={{
                marginTop: 12,
                padding: "10px 12px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.16)",
                background: "rgba(255,255,255,0.08)",
                color: "var(--oph-text)",
                cursor: "pointer",
              }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </Surface>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(10,12,18,0.55)",
  color: "var(--oph-text)",
  outline: "none",
};
```

---

## 8) Router admin (protected, nested)

Tambahkan ke router kamu:

* `/admin/login` tidak diproteksi.
* semua `/admin/*` lain diproteksi oleh `AdminGuard`.

Contoh konsep (sesuaikan dengan file router kamu):

```tsx
// di src/app/router.tsx (bagian children)
import AdminLogin from "@/admin/pages/AdminLogin";
import AdminDashboard from "@/admin/pages/AdminDashboard";
import AdminLayout from "@/admin/layout/AdminLayout";
import AdminGuard from "@/admin/auth/AdminGuard";

import ProjectsAdminList from "@/admin/pages/projects/ProjectsAdminList";
import ProjectsAdminEdit from "@/admin/pages/projects/ProjectsAdminEdit";
// ...news/media/gallery/team/docs

{
  path: "admin/login",
  element: <AdminLogin />,
},
{
  path: "admin",
  element: (
    <AdminGuard minRole="editor">
      <AdminLayout />
    </AdminGuard>
  ),
  children: [
    { index: true, element: <AdminDashboard /> },
    { path: "projects", element: <ProjectsAdminList /> },
    { path: "projects/:id", element: <ProjectsAdminEdit /> },
    // ...news/media/gallery/team/docs
  ],
},
```

---

## 9) AdminDashboard minimal (biar langsung kepakai)

```tsx
// src/admin/pages/AdminDashboard.tsx
import React from "react";
import Surface from "@/components/ui/Surface";

export default function AdminDashboard() {
  return (
    <Surface>
      <div style={{ fontSize: 20, fontWeight: 800 }}>Dashboard</div>
      <div style={{ opacity: 0.75, marginTop: 6 }}>
        Quick shortcuts to manage content.
      </div>

      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
        <Card title="Projects" hint="Create/edit project pages." />
        <Card title="News" hint="Post devlogs & announcements." />
        <Card title="Media" hint="Manage videos & press kit." />
        <Card title="Gallery" hint="Upload screenshots & art." />
      </div>
    </Surface>
  );
}

function Card({ title, hint }: { title: string; hint: string }) {
  return (
    <div style={{
      padding: 14,
      borderRadius: 18,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.05)"
    }}>
      <div style={{ fontWeight: 800 }}>{title}</div>
      <div style={{ opacity: 0.75, marginTop: 6 }}>{hint}</div>
    </div>
  );
}
```

---

## 10) Koneksi portal dengan admin (biar tetap sinematik)

Kuncinya: ketika kamu ingin masuk admin dari galaxy/public, cukup sediakan link kecil “Admin” (bisa di footer 2D atau hidden) yang memanggil:

* `portalSingleton.startInternal({ toPath: "/admin/login", origin })`

Origin bisa dari tombol/link rect (untuk portal lahir dari tombol), atau tidak ada (center).

Semua admin route otomatis profile `utility` (kita set `useRouteTheme("/admin")` di AdminLayout), jadi portal admin terasa rapi.

---

Aku rekomendasikan kamu **lanjut pakai Node.js TypeScript + Fastify + Prisma**, karena dari log kamu sudah ada Prisma dan monorepo `apps/api` itu udah nyambung banget. Untuk database, development boleh tetap SQLite, tapi untuk production paling aman **PostgreSQL**. Untuk login admin, model paling “beneran aman” dan paling nyaman dipakai adalah **session cookie httpOnly** (bukan token localStorage), dengan tabel `Session` di database. Password admin di-hash pakai **argon2**.

Di bawah ini aku buatkan “kontrak endpoint server” yang kamu butuhkan, plus struktur folder backend, middleware `requireAuth/requireRole`, schema Prisma minimal (User/Session + konten), dan contoh implementasi Fastify yang sudah siap diintegrasikan dengan frontend AdminGuard yang tadi.

---

## Struktur folder backend yang rapi dan tidak bikin pusing

Misal di `apps/api/`:

```txt
apps/api/
  package.json
  tsconfig.json
  prisma/
    schema.prisma
    migrations/
    seed.ts
  src/
    index.ts
    env.ts
    plugins/
      prisma.ts
      cookies.ts
      auth.ts
    routes/
      auth.ts
      admin/
        projects.ts
        news.ts
        media.ts
        gallery.ts
        team.ts
        docs.ts
        assets.ts
    lib/
      password.ts
      session.ts
      guards.ts
      originCheck.ts
```

Konsepnya: `plugins/` mengisi “infrastruktur” (prisma, cookie, auth decorator), `routes/` isinya endpoint, `lib/` isinya logika reusable (hash password, create session, guards).

---

## Prisma schema minimal yang kamu butuhkan

Ini versi minimal tapi lengkap untuk admin login dan konten studio. Kamu bisa mulai dari ini dulu, lalu nambah field belakangan.

```prisma
// apps/api/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // dev bisa sqlite kalau mau, tapi prod rekomendasi postgres
  url      = env("DATABASE_URL")
}

enum Role {
  admin
  editor
}

enum PublishStatus {
  draft
  published
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String?
  role         Role     @default(editor)
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  sessions     Session[]
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  expiresAt DateTime
  ip        String?
  ua        String?
}

model Project {
  id          String        @id @default(cuid())
  slug        String        @unique
  title       String
  summary     String
  body        String        // markdown/mdx/raw html (pilih satu)
  tags        String        // json string dulu biar cepat, nanti bisa relasi
  status      PublishStatus @default(draft)
  coverUrl    String?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  publishedAt DateTime?
  authorId    String
  author      User          @relation(fields: [authorId], references: [id])
}

model NewsPost {
  id          String        @id @default(cuid())
  slug        String        @unique
  title       String
  excerpt     String
  body        String
  status      PublishStatus @default(draft)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  publishedAt DateTime?
  authorId    String
  author      User          @relation(fields: [authorId], references: [id])
}

model MediaItem {
  id          String        @id @default(cuid())
  slug        String        @unique
  title       String
  description String
  videoUrl    String?
  thumbUrl    String?
  status      PublishStatus @default(draft)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  publishedAt DateTime?
  authorId    String
  author      User          @relation(fields: [authorId], references: [id])
}

model GalleryItem {
  id          String        @id @default(cuid())
  slug        String        @unique
  title       String
  caption     String?
  imageUrl    String
  status      PublishStatus @default(draft)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  publishedAt DateTime?
  authorId    String
  author      User          @relation(fields: [authorId], references: [id])
}

model TeamMember {
  id        String   @id @default(cuid())
  slug      String   @unique
  name      String
  role      String
  bio       String
  avatarUrl String?
  links     String   // json string
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model DocPage {
  id        String        @id @default(cuid())
  section   String
  slug      String
  title     String
  body      String
  status    PublishStatus @default(draft)
  updatedAt DateTime      @updatedAt
  createdAt DateTime      @default(now())
  authorId  String
  author    User          @relation(fields: [authorId], references: [id])

  @@unique([section, slug])
}
```

Kalau kamu ingin tetap pakai MDX file untuk Docs (tanpa admin edit), `DocPage` bisa kamu tunda. Tapi karena kamu minta admin CMS, ini sudah siap.

---

## Env dan keamanan cookie session

Kamu butuh env seperti ini:

```env
DATABASE_URL="postgresql://..."
SESSION_COOKIE_NAME="ophius_session"
SESSION_TTL_DAYS=14
COOKIE_SECURE=false
CORS_ORIGIN="http://localhost:5173"
```

Cookie harus httpOnly, sameSite Lax, secure true saat production (https).

---

## Kontrak endpoint Auth (yang dipakai frontend AdminGuard)

Semua response JSON konsisten dan kecil.

`GET /api/auth/me` mengembalikan user jika session valid, atau `user: null` kalau tidak login.

`POST /api/auth/login` menerima email+password, lalu set cookie session, mengembalikan user.

`POST /api/auth/logout` menghapus session di server dan clear cookie.

---

## Kontrak endpoint Admin CRUD (minimal tapi lengkap)

Supaya frontend admin enak, tiap entitas punya pola yang sama: list, create, read, update, delete, publish, unpublish. Contoh untuk Project:

`GET /api/admin/projects?status=draft|published|all&q=...`
`POST /api/admin/projects`
`GET /api/admin/projects/:id`
`PATCH /api/admin/projects/:id`
`DELETE /api/admin/projects/:id`
`POST /api/admin/projects/:id/publish`
`POST /api/admin/projects/:id/unpublish`

Entitas lain sama: `news`, `media`, `gallery`, `team`, `docs`. Public endpoint bisa kamu buat terpisah, misal `GET /api/public/projects` yang hanya menampilkan published, sehingga halaman publik tidak perlu login.

---

## Implementasi Fastify: server inti + plugin auth + guards

### `src/env.ts`

```ts
export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  DATABASE_URL: process.env.DATABASE_URL!,
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME ?? "ophius_session",
  SESSION_TTL_DAYS: Number(process.env.SESSION_TTL_DAYS ?? 14),
  COOKIE_SECURE: (process.env.COOKIE_SECURE ?? "false") === "true",
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:5173",
};
```

### `src/plugins/prisma.ts`

```ts
import fp from "fastify-plugin";
import { PrismaClient } from "@prisma/client";

export default fp(async (app) => {
  const prisma = new PrismaClient();
  await prisma.$connect();

  app.decorate("prisma", prisma);

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
});

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}
```

### `src/lib/password.ts` (argon2)

```ts
import argon2 from "argon2";

export async function hashPassword(password: string) {
  return argon2.hash(password, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string, password: string) {
  return argon2.verify(hash, password);
}
```

### `src/lib/session.ts`

```ts
import { env } from "@/env";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

export async function createSession(app: FastifyInstance, args: {
  userId: string;
  ip?: string;
  ua?: string;
}) {
  const ttlMs = env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + ttlMs);

  const session = await app.prisma.session.create({
    data: { userId: args.userId, expiresAt, ip: args.ip, ua: args.ua },
  });

  return session;
}

export function setSessionCookie(reply: FastifyReply, sessionId: string) {
  reply.setCookie(env.SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.COOKIE_SECURE,
    path: "/",
    maxAge: env.SESSION_TTL_DAYS * 24 * 60 * 60,
  });
}

export function clearSessionCookie(reply: FastifyReply) {
  reply.clearCookie(env.SESSION_COOKIE_NAME, { path: "/" });
}

export function readSessionId(req: FastifyRequest) {
  return (req.cookies as any)?.[env.SESSION_COOKIE_NAME] as string | undefined;
}
```

### `src/lib/guards.ts` (requireAuth + requireRole)

```ts
import type { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

export async function requireAuth(app: FastifyInstance, req: FastifyRequest, reply: FastifyReply) {
  if (!req.user) {
    reply.code(401).send({ error: "UNAUTHORIZED" });
    return;
  }
}

export function requireRole(role: "admin" | "editor") {
  return async (app: FastifyInstance, req: FastifyRequest, reply: FastifyReply) => {
    if (!req.user) {
      reply.code(401).send({ error: "UNAUTHORIZED" });
      return;
    }
    if (role === "admin" && req.user.role !== "admin") {
      reply.code(403).send({ error: "FORBIDDEN" });
      return;
    }
  };
}
```

### `src/plugins/cookies.ts` + `src/lib/originCheck.ts`

Kita pasang cookie parser dan origin check sederhana untuk request non-GET agar tidak gampang kena CSRF (ditambah sameSite Lax, ini cukup aman untuk awal).

```ts
// src/plugins/cookies.ts
import fp from "fastify-plugin";
import cookie from "@fastify/cookie";

export default fp(async (app) => {
  await app.register(cookie);
});
```

```ts
// src/lib/originCheck.ts
import type { FastifyRequest, FastifyReply } from "fastify";
import { env } from "@/env";

export function enforceOrigin(req: FastifyRequest, reply: FastifyReply) {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return;

  const origin = req.headers.origin;
  if (!origin) return; // some clients omit; you can tighten later
  if (origin !== env.CORS_ORIGIN) {
    reply.code(403).send({ error: "BAD_ORIGIN" });
  }
}
```

### `src/plugins/auth.ts` (mengisi `req.user` dari session cookie)

```ts
import fp from "fastify-plugin";
import type { FastifyRequest } from "fastify";
import { readSessionId } from "@/lib/session";

export default fp(async (app) => {
  app.decorateRequest("user", null);

  app.addHook("preHandler", async (req) => {
    const sid = readSessionId(req);
    if (!sid) return;

    const session = await app.prisma.session.findUnique({
      where: { id: sid },
      include: { user: true },
    });

    if (!session) return;
    if (session.expiresAt.getTime() < Date.now()) {
      await app.prisma.session.delete({ where: { id: sid } }).catch(() => {});
      return;
    }

    (req as any).user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
    };
  });
});

declare module "fastify" {
  interface FastifyRequest {
    user: null | { id: string; email: string; name?: string | null; role: "admin" | "editor" };
  }
}
```

---

## Routes Auth: `/api/auth/*`

```ts
// src/routes/auth.ts
import type { FastifyInstance } from "fastify";
import { verifyPassword } from "@/lib/password";
import { createSession, setSessionCookie, clearSessionCookie, readSessionId } from "@/lib/session";

export async function authRoutes(app: FastifyInstance) {
  app.get("/auth/me", async (req) => {
    return { user: req.user };
  });

  app.post("/auth/login", async (req, reply) => {
    const body = req.body as any;
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      reply.code(400).send({ error: "INVALID_INPUT" });
      return;
    }

    const user = await app.prisma.user.findUnique({ where: { email } });
    if (!user) {
      reply.code(401).send({ error: "INVALID_CREDENTIALS" });
      return;
    }

    const ok = await verifyPassword(user.passwordHash, password);
    if (!ok) {
      reply.code(401).send({ error: "INVALID_CREDENTIALS" });
      return;
    }

    const session = await createSession(app, {
      userId: user.id,
      ip: req.ip,
      ua: req.headers["user-agent"] as string | undefined,
    });

    setSessionCookie(reply, session.id);

    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  });

  app.post("/auth/logout", async (req, reply) => {
    const sid = readSessionId(req);
    if (sid) {
      await app.prisma.session.delete({ where: { id: sid } }).catch(() => {});
    }
    clearSessionCookie(reply);
    return { ok: true };
  });
}
```

---

## Contoh routes Admin Projects (pola ini tinggal kamu copy untuk News/Media/Gallery/Docs/Team)

```ts
// src/routes/admin/projects.ts
import type { FastifyInstance } from "fastify";
import { enforceOrigin } from "@/lib/originCheck";

export async function adminProjectsRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (req, reply) => {
    enforceOrigin(req, reply);
    if (!req.user) {
      reply.code(401).send({ error: "UNAUTHORIZED" });
    }
  });

  app.get("/admin/projects", async (req) => {
    const q = (req.query as any)?.q?.toString() ?? "";
    const status = (req.query as any)?.status?.toString() ?? "all";

    const where: any = {};
    if (status === "draft" || status === "published") where.status = status;
    if (q) where.OR = [{ title: { contains: q, mode: "insensitive" } }, { slug: { contains: q, mode: "insensitive" } }];

    const items = await app.prisma.project.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      select: { id: true, slug: true, title: true, summary: true, status: true, updatedAt: true, publishedAt: true },
    });

    return { items };
  });

  app.post("/admin/projects", async (req, reply) => {
    const b = req.body as any;
    const title = String(b.title ?? "").trim();
    const slug = String(b.slug ?? "").trim();
    if (!title || !slug) {
      reply.code(400).send({ error: "INVALID_INPUT" });
      return;
    }

    const item = await app.prisma.project.create({
      data: {
        title,
        slug,
        summary: String(b.summary ?? ""),
        body: String(b.body ?? ""),
        tags: JSON.stringify(b.tags ?? []),
        coverUrl: b.coverUrl ? String(b.coverUrl) : null,
        authorId: req.user!.id,
      },
    });

    return { item };
  });

  app.get("/admin/projects/:id", async (req, reply) => {
    const id = (req.params as any).id as string;
    const item = await app.prisma.project.findUnique({ where: { id } });
    if (!item) {
      reply.code(404).send({ error: "NOT_FOUND" });
      return;
    }
    return { item };
  });

  app.patch("/admin/projects/:id", async (req, reply) => {
    const id = (req.params as any).id as string;
    const b = req.body as any;

    const item = await app.prisma.project.update({
      where: { id },
      data: {
        title: b.title !== undefined ? String(b.title) : undefined,
        slug: b.slug !== undefined ? String(b.slug) : undefined,
        summary: b.summary !== undefined ? String(b.summary) : undefined,
        body: b.body !== undefined ? String(b.body) : undefined,
        tags: b.tags !== undefined ? JSON.stringify(b.tags) : undefined,
        coverUrl: b.coverUrl !== undefined ? (b.coverUrl ? String(b.coverUrl) : null) : undefined,
      },
    });

    return { item };
  });

  app.delete("/admin/projects/:id", async (req) => {
    const id = (req.params as any).id as string;
    await app.prisma.project.delete({ where: { id } });
    return { ok: true };
  });

  app.post("/admin/projects/:id/publish", async (req, reply) => {
    const id = (req.params as any).id as string;
    const item = await app.prisma.project.update({
      where: { id },
      data: { status: "published", publishedAt: new Date() },
    });
    return { item };
  });

  app.post("/admin/projects/:id/unpublish", async (req) => {
    const id = (req.params as any).id as string;
    const item = await app.prisma.project.update({
      where: { id },
      data: { status: "draft", publishedAt: null },
    });
    return { item };
  });
}
```

Untuk `news/media/gallery/docs/team` kamu tinggal salin pola ini dan ganti model + field yang relevan.

---

## Server entry `src/index.ts` (CORS + register routes)

```ts
import Fastify from "fastify";
import cors from "@fastify/cors";
import { env } from "@/env";
import prismaPlugin from "@/plugins/prisma";
import cookiesPlugin from "@/plugins/cookies";
import authPlugin from "@/plugins/auth";
import { authRoutes } from "@/routes/auth";
import { adminProjectsRoutes } from "@/routes/admin/projects";

async function main() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  });

  await app.register(cookiesPlugin);
  await app.register(prismaPlugin);
  await app.register(authPlugin);

  await app.register(async (r) => {
    await authRoutes(r);
    await adminProjectsRoutes(r);
    // nanti register: news/media/gallery/team/docs/assets
  }, { prefix: "/api" });

  const port = Number(process.env.PORT ?? 3001);
  await app.listen({ port, host: "0.0.0.0" });
  app.log.info(`API listening on :${port}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

---

## Seed admin pertama (biar kamu bisa login)

```ts
// apps/api/prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function run() {
  const email = "admin@ophius.local";
  const password = "change-me-now";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return;

  await prisma.user.create({
    data: {
      email,
      name: "Ophius Admin",
      role: "admin",
      passwordHash: await hashPassword(password),
    },
  });

  console.log("Seeded admin:", email, password);
}

run().finally(async () => prisma.$disconnect());
```

---

## Kenapa Fastify + Prisma + session cookie ini cocok untuk proyek kamu

Ini nyambung dengan monorepo dan Prisma yang kamu sudah pakai, cepat diimplement, aman untuk admin dashboard, dan gampang kamu scale ke Postgres + storage untuk Gallery/Media. Frontend admin yang kita buat sebelumnya sudah “match” langsung karena dia pakai `credentials: include` dan endpoint `me/login/logout`.

---

Iya, **berubah sedikit**, tapi tidak merombak inti rancangan kamu. Yang berubah cuma: kita nambah “zona admin” di frontend dan nambah “auth/session” + “admin routes” di backend. Struktur Galaxy/Portal/Pages publik tetap sama.

Yang paling rapi adalah **tetap mempertahankan 3 lapisan besar** (galaxy, pages, portal), lalu **menambah 1 domain baru**: `admin/`.

## Frontend (apps/web) yang berubah apa saja

Folder yang sudah ada tidak perlu dipindah. Kamu cukup menambahkan:

* `src/admin/` untuk semua halaman dan util admin (auth store, guard, layout, pages CRUD).
* `src/pages/theme/profileForPath()` kamu update supaya `/admin` dipetakan ke profile `utility`.
* Router kamu menambah route `/admin/login` dan nested `/admin/*` yang diproteksi.

Struktur besarnya tetap:

```txt
src/
  galaxy/        (3D world)
  portal/        (Link Start overlay + controller)
  pages/         (public 2D pages)
  admin/         (NEW: admin 2D pages + auth)
  theme/         (tokens + profile mapping)
  app/           (AppShell + router)
```

Yang penting: **Admin bukan bagian dari `pages/`** supaya public dan internal tools tidak tercampur.

## Router dan layout yang paling bersih setelah ada admin

AppShell kamu tetap jadi “shell tunggal” yang memegang GalaxyCanvas + PortalOverlay. Yang kamu ubah hanya “bagaimana konten 2D dirender”:

* untuk route public 2D: pakai `PagesLayout` (punya breadcrumb + Back to Galaxy).
* untuk route admin 2D: pakai `AdminLayout` (punya sidebar + header admin + Back to Galaxy).

Galaxy tetap tampil di belakang, tapi `pointer-events` untuk canvas dimatikan saat kamu berada di halaman 2D supaya tidak mengganggu.

Jadi kamu tidak perlu bikin app baru untuk admin. Masih satu web.

## Backend (apps/api) yang berubah apa saja

Di backend, struktur folder jelas **bertambah**, bukan ganti total. Kamu menambah:

* `src/plugins/auth.ts` untuk membaca session cookie dan mengisi `req.user`.
* `src/routes/auth.ts` (login/me/logout).
* `src/routes/admin/*` (CRUD konten).
* `prisma` schema bertambah `User` + `Session` dan model konten kalau kamu mau CMS.

Kalau sebelumnya backend kamu sudah ada banyak routes, ini tinggal nambah modul.

## Jadi jawabannya: “berubah, tapi aman”

Perubahan itu terkontrol:

* **Tidak ada yang perlu kamu bongkar ulang** dari rancangan 3D/portal/pages.
* Cuma tambah folder `admin/` di frontend dan modul auth di backend.
* Mapping profile portal tetap bekerja; `/admin` cuma dianggap profile `utility`.

Kalau kamu mau, aku bisa kirimkan versi “tree final” yang sudah lengkap (public + admin + portal + galaxy + backend) dalam satu tampilan, biar kamu bisa copy dan cocokkan dengan monorepo Ophius Studio kamu sekarang.

```txt
Ophius Studio/                        (monorepo)
  package.json
  pnpm-workspace.yaml
  turbo.json                           (opsional)
  .env                                 (opsional: bisa split per app)
  .gitignore
  apps/
    web/                               (Front-end: Galaxy 3D + Public Pages + Admin Dashboard)
      package.json
      vite.config.ts
      tsconfig.json
      tsconfig.app.json
      tsconfig.node.json
      index.html
      public/
        posters/                        (thumbnail/poster video panel)
        videos/                         (preview video untuk Game panel & Media)
        textures/                       (starfield sprites, noise, dll)
        icons/
      src/
        main.tsx
        app/
          AppShell.tsx                  (GalaxyCanvas + (PagesLayout/AdminLayout) + PortalOverlay)
          router.tsx                    (route public + admin)
          hooks/
            useRaf.ts
          layout/
            PagesLayout.tsx             (public 2D template: bg starfield + BH sliver + breadcrumb + Back)
            GalaxyLandingOverlay.tsx    (opsional: hint UI di landing galaxy)
        theme/
          tokens.ts                     (SINGLE source of truth: timing/glow/portal profiles, route mapping)
        singletons/
          portalSingleton.ts            (PortalController instance global)
        portal/
          PortalOverlay.tsx             (SAO-style overlay canvas/webgl)
          portalOverlay.css
          portalController.ts
          navigateWithPortal.ts
          screenRectFromPanel.ts        (panel 3D -> screen rect origin)
        galaxy/
          GalaxyCanvas.tsx              (R3F Canvas wrapper, pointer-events on/off)
          scene/
            GalaxyScene.tsx             (composition: rigs + entities + UI)
            rigs/
              CameraRig.tsx             (yaw/pitch, inertia, constraints, focus mode)
              InteractionRig.tsx        (pointer/raycast, hover/pressed/preview state)
              SearchRig.tsx             (pitch-based reveal search bar + keyboard hologram)
            entities/
              BlackHole.tsx             (BH shader/particles, sliver rules, safe cone)
              Zodiac.tsx                (zodiac constellations in safe side)
              Starfield.tsx             (background stars)
            ui/
              PanelRing.tsx             (panel orbit placement + click => portal navigation)
              PlanetHub.tsx             (planet icon mode switch)
              FocusPanelMode.tsx        (Game focus view: video + desc + store buttons)
          panels/
            panelRegistry.ts            (panel ids -> route/behavior profile)
            PanelMesh.tsx               (shared panel mesh component)
            panels/
              GamePanel.tsx
              ProjectsPanel.tsx
              TeamPanel.tsx
              DocsPanel.tsx
              GalleryPanel.tsx
              MediaPanel.tsx
              NewsPanel.tsx
              ContactPanel.tsx
          interactions/
            panelMotion.ts              (token-based hover/pressed/preview transforms + glow)
            usePanelRaycast.ts
            usePanelPointer.ts
          materials/
            holoPanelMaterial.ts
            blackHoleMaterial.ts
            starfieldMaterial.ts
          data/
            panels.ts                   (panel content: title, subtitle, route, icon, etc.)
        pages/                          (PUBLIC pages 2D)
          docs/
            DocsIndex.tsx
            DocsPage.tsx
          projects/
            ProjectsIndex.tsx
            ProjectDetail.tsx
          news/
            NewsIndex.tsx
            NewsDetail.tsx
          media/
            MediaIndex.tsx
          gallery/
            GalleryIndex.tsx
          team/
            TeamIndex.tsx
          contact/
            ContactIndex.tsx
          games/
            GamesIndex.tsx              (opsional: list semua game)
            GameDetail.tsx              (opsional: SEO detail)
          theme/
            useRouteTheme.ts            (apply profile accent for public routes)
          utility/
            About.tsx
            Roadmap.tsx
            Status.tsx
            Support.tsx
        admin/                          (NEW: ADMIN dashboard 2D + auth)
          auth/
            authClient.ts               (me/login/logout fetch)
            authStore.ts                (status idle/checking/authed/guest)
            useAuth.ts
            AdminGuard.tsx              (ProtectedRoute minim flicker)
          layout/
            AdminLayout.tsx             (admin template: calmer bg + header + sidebar)
            AdminHeader.tsx             (Back to Galaxy triggers portal, logout)
            AdminSidebar.tsx
          pages/
            AdminLogin.tsx              (login form)
            AdminDashboard.tsx
            projects/
              ProjectsAdminList.tsx     (list + filter + create)
              ProjectsAdminEdit.tsx     (edit + publish/unpublish)
            news/
              NewsAdminList.tsx
              NewsAdminEdit.tsx
            media/
              MediaAdminList.tsx
              MediaAdminEdit.tsx
            gallery/
              GalleryAdminList.tsx
              GalleryAdminEdit.tsx
            team/
              TeamAdminList.tsx
              TeamAdminEdit.tsx
            docs/
              DocsAdminList.tsx
              DocsAdminEdit.tsx
        content/                        (opsional: jika sebagian konten masih file-based)
          docs/
          projects/
          games/
          news/
          media/
          gallery/
        components/
          ui/
            Header.tsx                  (public header + breadcrumb + Back)
            Breadcrumb.tsx
            Surface.tsx
            Button.tsx
          common/
            ErrorBoundary.tsx
            LoadingSkeleton.tsx
        styles/
          tokens.css                    (CSS vars for 2D)
          global.css
    api/                               (Backend: Fastify + Prisma + session cookie auth + admin CRUD)
      package.json
      tsconfig.json
      .env                              (DATABASE_URL, COOKIE_SECURE, CORS_ORIGIN, etc.)
      prisma/
        schema.prisma                   (User, Session, Project, NewsPost, MediaItem, GalleryItem, TeamMember, DocPage)
        migrations/
        seed.ts                         (create first admin)
      src/
        index.ts                        (Fastify bootstrap + CORS + plugin register)
        env.ts
        plugins/
          prisma.ts                     (decorate app.prisma)
          cookies.ts                    (@fastify/cookie)
          auth.ts                       (read session cookie -> req.user)
        lib/
          password.ts                   (argon2 hash/verify)
          session.ts                    (create session + set/clear cookie)
          guards.ts                     (requireAuth / requireRole)
          originCheck.ts                (basic CSRF origin enforcement)
        routes/
          auth.ts                       (GET me, POST login, POST logout)
          public/
            projects.ts                 (published-only endpoints)
            news.ts
            media.ts
            gallery.ts
            team.ts
            docs.ts
          admin/
            projects.ts                 (CRUD + publish/unpublish)
            news.ts
            media.ts
            gallery.ts
            team.ts
            docs.ts
            assets.ts                   (upload, optional)
  packages/                             (optional shared libs)
    ui/                                 (shared components if you want)
    shared/                             (types, zod schemas, utilities)
  infra/                                (optional deployment config)
    docker/
    nginx/
```

Kalau kamu pakai struktur ini, “titik sambung”-nya jelas dan tidak akan bikin kamu tersesat:

* **`apps/web/src/app/AppShell.tsx`** adalah pusat: GalaxyCanvas + Layout 2D (public/admin) + PortalOverlay.
* **`apps/web/src/theme/tokens.ts`** adalah sumber kebenaran: timing preview 0.28s, portal profiles, mapping route→profile.
* **`apps/api/src/routes/auth.ts`** adalah kontrak login yang dipakai frontend admin (`/api/auth/me|login|logout`).
* Semua CRUD konten admin ada di **`apps/api/src/routes/admin/*`** dan public view-nya di **`apps/api/src/routes/public/*`**.

Kalau kamu mau, aku bisa lanjutkan dengan versi `router.tsx` final yang sudah memasukkan **PagesLayout vs AdminLayout** secara nested rapi (jadi route public dan admin tidak perlu conditional di AppShell), tapi tree di atas sudah representasi final yang paling aman dan scalable.

Siap. Ini versi `router.tsx` final yang “nested rapi” dengan dua layout berbeda (public memakai `PagesLayout`, admin memakai `AdminLayout`), sementara `AppShell` tetap jadi root yang selalu hidup untuk `GalaxyCanvas` + `PortalOverlay`. Dengan ini kamu tidak perlu lagi conditional render `PagesLayout` di `AppShell`, karena routing-lah yang menentukan layout mana yang aktif.

```tsx
// src/app/router.tsx
import React from "react";
import { createBrowserRouter } from "react-router-dom";

import AppShell from "@/app/AppShell";

// Public layout (2D)
import PagesLayout from "@/app/layout/PagesLayout";

// Admin
import AdminLayout from "@/admin/layout/AdminLayout";
import AdminLogin from "@/admin/pages/AdminLogin";
import AdminDashboard from "@/admin/pages/AdminDashboard";
import AdminGuard from "@/admin/auth/AdminGuard";

// Public pages
import DocsIndex from "@/pages/docs/DocsIndex";
import DocsPage from "@/pages/docs/DocsPage";

import ProjectsIndex from "@/pages/projects/ProjectsIndex";
import ProjectDetail from "@/pages/projects/ProjectDetail";

import NewsIndex from "@/pages/news/NewsIndex";
import NewsDetail from "@/pages/news/NewsDetail";

import MediaIndex from "@/pages/media/MediaIndex";
import GalleryIndex from "@/pages/gallery/GalleryIndex";
import TeamIndex from "@/pages/team/TeamIndex";
import ContactIndex from "@/pages/contact/ContactIndex";

import GamesIndex from "@/pages/games/GamesIndex";
import GameDetail from "@/pages/games/GameDetail";

import About from "@/pages/utility/About";
import Roadmap from "@/pages/utility/Roadmap";
import Status from "@/pages/utility/Status";
import Support from "@/pages/utility/Support";

// Admin pages (contoh; lengkapi sesuai yang kamu bikin)
import ProjectsAdminList from "@/admin/pages/projects/ProjectsAdminList";
import ProjectsAdminEdit from "@/admin/pages/projects/ProjectsAdminEdit";

import NewsAdminList from "@/admin/pages/news/NewsAdminList";
import NewsAdminEdit from "@/admin/pages/news/NewsAdminEdit";

import MediaAdminList from "@/admin/pages/media/MediaAdminList";
import MediaAdminEdit from "@/admin/pages/media/MediaAdminEdit";

import GalleryAdminList from "@/admin/pages/gallery/GalleryAdminList";
import GalleryAdminEdit from "@/admin/pages/gallery/GalleryAdminEdit";

import TeamAdminList from "@/admin/pages/team/TeamAdminList";
import TeamAdminEdit from "@/admin/pages/team/TeamAdminEdit";

import DocsAdminList from "@/admin/pages/docs/DocsAdminList";
import DocsAdminEdit from "@/admin/pages/docs/DocsAdminEdit";

function GalaxyRoute() {
  // Landing galaxy ada di AppShell (GalaxyCanvas). Route ini cuma “menegaskan” kamu sedang di realm galaxy.
  return null;
}

function NotFound() {
  return (
    <div className="oph-page-bg" style={{ padding: 24 }}>
      <div style={{ fontSize: 22, fontWeight: 800 }}>404</div>
      <div style={{ opacity: 0.75, marginTop: 6 }}>Page not found.</div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    errorElement: <NotFound />,
    children: [
      // Galaxy realm routes
      { index: true, element: <GalaxyRoute /> },
      { path: "galaxy", element: <GalaxyRoute /> },

      // Public 2D pages (wrapped by PagesLayout)
      {
        element: <PagesLayout />,
        children: [
          { path: "docs", element: <DocsIndex /> },
          { path: "docs/:section/:page", element: <DocsPage /> },

          { path: "projects", element: <ProjectsIndex /> },
          { path: "projects/:projectSlug", element: <ProjectDetail /> },

          { path: "news", element: <NewsIndex /> },
          { path: "news/:postSlug", element: <NewsDetail /> },

          { path: "media", element: <MediaIndex /> },
          { path: "gallery", element: <GalleryIndex /> },
          { path: "team", element: <TeamIndex /> },
          { path: "contact", element: <ContactIndex /> },

          { path: "games", element: <GamesIndex /> },
          { path: "games/:gameSlug", element: <GameDetail /> },

          { path: "about", element: <About /> },
          { path: "roadmap", element: <Roadmap /> },
          { path: "status", element: <Status /> },
          { path: "support", element: <Support /> },
        ],
      },

      // Admin login (NO guard)
      { path: "admin/login", element: <AdminLogin /> },

      // Admin area (guarded + wrapped by AdminLayout)
      {
        path: "admin",
        element: (
          <AdminGuard minRole="editor">
            <AdminLayout />
          </AdminGuard>
        ),
        children: [
          { index: true, element: <AdminDashboard /> },

          { path: "projects", element: <ProjectsAdminList /> },
          { path: "projects/:id", element: <ProjectsAdminEdit /> },

          { path: "news", element: <NewsAdminList /> },
          { path: "news/:id", element: <NewsAdminEdit /> },

          { path: "media", element: <MediaAdminList /> },
          { path: "media/:id", element: <MediaAdminEdit /> },

          { path: "gallery", element: <GalleryAdminList /> },
          { path: "gallery/:id", element: <GalleryAdminEdit /> },

          { path: "team", element: <TeamAdminList /> },
          { path: "team/:id", element: <TeamAdminEdit /> },

          { path: "docs", element: <DocsAdminList /> },
          { path: "docs/:id", element: <DocsAdminEdit /> },
        ],
      },

      // Fallback
      { path: "*", element: <NotFound /> },
    ],
  },
]);
```

Supaya routing ini benar-benar “bersih”, `AppShell.tsx` cukup merender `GalaxyCanvas` + `PortalOverlay` + `<Outlet />` (tanpa lagi render `PagesLayout` secara manual). Ini versi yang cocok dengan router di atas:

```tsx
// src/app/AppShell.tsx
import React, { useCallback, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import GalaxyCanvas from "@/galaxy/GalaxyCanvas";
import PortalOverlay from "@/portal/PortalOverlay";
import { portalSingleton } from "@/singletons/portalSingleton";
import { createNavigator } from "@/portal/navigateWithPortal";
import { useRaf } from "@/app/hooks/useRaf";

export default function AppShell() {
  const loc = useLocation();
  const navigate = useNavigate();

  const isGalaxy = loc.pathname === "/" || loc.pathname === "/galaxy";

  const openExternal = useCallback((url: string, newTab: boolean) => {
    if (newTab) window.open(url, "_blank", "noopener,noreferrer");
    else window.location.href = url;
  }, []);

  const nav = useMemo(() => {
    return createNavigator(portalSingleton, {
      navigateInternal: (toPath) => navigate(toPath),
      openExternal,
    });
  }, [navigate, openExternal]);

  useRaf(() => {
    nav.tick();
  }, true);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <GalaxyCanvas active={isGalaxy} navigator={nav} />
      <Outlet />
      <PortalOverlay portal={portalSingleton} />
    </div>
  );
}
```

Dengan struktur ini, landing galaxy tetap tampil default di `/`, public pages otomatis dibungkus `PagesLayout`, admin otomatis dibungkus `AdminLayout` dan diproteksi `AdminGuard`, dan portal tetap global karena hidup di `AppShell`.
