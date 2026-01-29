export type ApiError = { ok: false; message: string };

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    ...init
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg = data?.message ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data as T;
}

export type ProjectRecord = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  body: string | null;
  coverUrl: string | null;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NewsRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  coverUrl: string | null;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MediaRecord = {
  id: string;
  title: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  thumbnailUrl: string | null;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GalleryRecord = {
  id: string;
  title: string;
  imageUrl: string;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TeamRecord = {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  avatarUrl: string | null;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DocRecord = {
  id: string;
  title: string;
  slug: string;
  markdown: string | null;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

async function uploadFile(file: File): Promise<{ ok: true; url: string; filename: string; mimetype: string; size: number }> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("/api/admin/assets", {
    method: "POST",
    credentials: "include",
    body: form
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg = data?.message ?? `Upload failed (${res.status})`;
    throw new Error(msg);
  }

  return data as any;
}

export const adminClient = {
  projects: {
    async list(params?: { status?: "draft" | "published"; q?: string }) {
      const qs = new URLSearchParams();
      if (params?.status) qs.set("status", params.status);
      if (params?.q) qs.set("q", params.q);
      const url = `/api/admin/projects${qs.toString() ? `?${qs.toString()}` : ""}`;
      return requestJson<{ items: ProjectRecord[] }>(url, { method: "GET" });
    },

    async create(input: { title: string; slug: string; summary?: string; body?: string; coverUrl?: string }) {
      return requestJson<{ item: ProjectRecord }>("/api/admin/projects", {
        method: "POST",
        body: JSON.stringify(input)
      });
    },

    async update(id: string, input: Partial<{ title: string; slug: string; summary: string; body: string; coverUrl: string }>) {
      return requestJson<{ item: ProjectRecord }>(`/api/admin/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input)
      });
    },

    async remove(id: string) {
      return requestJson<{ ok: true }>(`/api/admin/projects/${id}`, { method: "DELETE" });
    },

    async publish(id: string) {
      return requestJson<{ item: ProjectRecord }>(`/api/admin/projects/${id}/publish`, { method: "POST" });
    },

    async unpublish(id: string) {
      return requestJson<{ item: ProjectRecord }>(`/api/admin/projects/${id}/unpublish`, { method: "POST" });
    }
  },

  news: {
    async list(params?: { status?: "draft" | "published"; q?: string }) {
      const qs = new URLSearchParams();
      if (params?.status) qs.set("status", params.status);
      if (params?.q) qs.set("q", params.q);
      const url = `/api/admin/news${qs.toString() ? `?${qs.toString()}` : ""}`;
      return requestJson<{ items: NewsRecord[] }>(url, { method: "GET" });
    },

    async create(input: { title: string; slug: string; excerpt?: string; body?: string; coverUrl?: string }) {
      return requestJson<{ item: NewsRecord }>("/api/admin/news", {
        method: "POST",
        body: JSON.stringify(input)
      });
    },

    async update(id: string, input: Partial<{ title: string; slug: string; excerpt: string; body: string; coverUrl: string }>) {
      return requestJson<{ item: NewsRecord }>(`/api/admin/news/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input)
      });
    },

    async remove(id: string) {
      return requestJson<{ ok: true }>(`/api/admin/news/${id}`, { method: "DELETE" });
    },

    async publish(id: string) {
      return requestJson<{ item: NewsRecord }>(`/api/admin/news/${id}/publish`, { method: "POST" });
    },

    async unpublish(id: string) {
      return requestJson<{ item: NewsRecord }>(`/api/admin/news/${id}/unpublish`, { method: "POST" });
    }
  },

  media: {
    async list(params?: { status?: "draft" | "published"; q?: string; type?: "IMAGE" | "VIDEO" }) {
      const qs = new URLSearchParams();
      if (params?.status) qs.set("status", params.status);
      if (params?.q) qs.set("q", params.q);
      if (params?.type) qs.set("type", params.type);
      const url = `/api/admin/media${qs.toString() ? `?${qs.toString()}` : ""}`;
      return requestJson<{ items: MediaRecord[] }>(url, { method: "GET" });
    },

    async create(input: { title: string; type: "IMAGE" | "VIDEO"; url: string; thumbnailUrl?: string }) {
      return requestJson<{ item: MediaRecord }>("/api/admin/media", {
        method: "POST",
        body: JSON.stringify(input)
      });
    },

    async update(id: string, input: Partial<{ title: string; type: "IMAGE" | "VIDEO"; url: string; thumbnailUrl: string | null }>) {
      return requestJson<{ item: MediaRecord }>(`/api/admin/media/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input)
      });
    },

    async remove(id: string) {
      return requestJson<{ ok: true }>(`/api/admin/media/${id}`, { method: "DELETE" });
    },

    async publish(id: string) {
      return requestJson<{ item: MediaRecord }>(`/api/admin/media/${id}/publish`, { method: "POST" });
    },

    async unpublish(id: string) {
      return requestJson<{ item: MediaRecord }>(`/api/admin/media/${id}/unpublish`, { method: "POST" });
    }
  },

  gallery: {
    async list(params?: { status?: "draft" | "published"; q?: string }) {
      const qs = new URLSearchParams();
      if (params?.status) qs.set("status", params.status);
      if (params?.q) qs.set("q", params.q);
      const url = `/api/admin/gallery${qs.toString() ? `?${qs.toString()}` : ""}`;
      return requestJson<{ items: GalleryRecord[] }>(url, { method: "GET" });
    },

    async create(input: { title: string; imageUrl: string }) {
      return requestJson<{ item: GalleryRecord }>("/api/admin/gallery", {
        method: "POST",
        body: JSON.stringify(input)
      });
    },

    async update(id: string, input: Partial<{ title: string; imageUrl: string }>) {
      return requestJson<{ item: GalleryRecord }>(`/api/admin/gallery/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input)
      });
    },

    async remove(id: string) {
      return requestJson<{ ok: true }>(`/api/admin/gallery/${id}`, { method: "DELETE" });
    },

    async publish(id: string) {
      return requestJson<{ item: GalleryRecord }>(`/api/admin/gallery/${id}/publish`, { method: "POST" });
    },

    async unpublish(id: string) {
      return requestJson<{ item: GalleryRecord }>(`/api/admin/gallery/${id}/unpublish`, { method: "POST" });
    }
  },

  team: {
    async list(params?: { status?: "draft" | "published"; q?: string; limit?: number }) {
      const qs = new URLSearchParams();
      if (params?.status) qs.set("status", params.status);
      if (params?.q) qs.set("q", params.q);
      if (params?.limit) qs.set("limit", String(params.limit));
      const url = `/api/admin/team${qs.toString() ? `?${qs.toString()}` : ""}`;
      return requestJson<{ items: TeamRecord[] }>(url, { method: "GET" });
    },

    async create(input: { name: string; title?: string; bio?: string; avatarUrl?: string }) {
      return requestJson<{ item: TeamRecord }>("/api/admin/team", {
        method: "POST",
        body: JSON.stringify(input)
      });
    },

    async update(id: string, input: Partial<{ name: string; title: string; bio: string; avatarUrl: string | null }>) {
      return requestJson<{ item: TeamRecord }>(`/api/admin/team/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input)
      });
    },

    async remove(id: string) {
      return requestJson<{ ok: true }>(`/api/admin/team/${id}`, { method: "DELETE" });
    },

    async publish(id: string) {
      return requestJson<{ item: TeamRecord }>(`/api/admin/team/${id}/publish`, { method: "POST" });
    },

    async unpublish(id: string) {
      return requestJson<{ item: TeamRecord }>(`/api/admin/team/${id}/unpublish`, { method: "POST" });
    }
  },

  docs: {
    async list(params?: { status?: "draft" | "published"; q?: string; limit?: number }) {
      const qs = new URLSearchParams();
      if (params?.status) qs.set("status", params.status);
      if (params?.q) qs.set("q", params.q);
      if (params?.limit) qs.set("limit", String(params.limit));
      const url = `/api/admin/docs${qs.toString() ? `?${qs.toString()}` : ""}`;
      return requestJson<{ items: DocRecord[] }>(url, { method: "GET" });
    },

    async create(input: { title: string; slug?: string; markdown?: string }) {
      return requestJson<{ item: DocRecord }>("/api/admin/docs", {
        method: "POST",
        body: JSON.stringify(input)
      });
    },

    async update(id: string, input: Partial<{ title: string; slug: string; markdown: string | null }>) {
      return requestJson<{ item: DocRecord }>(`/api/admin/docs/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input)
      });
    },

    async remove(id: string) {
      return requestJson<{ ok: true }>(`/api/admin/docs/${id}`, { method: "DELETE" });
    },

    async publish(id: string) {
      return requestJson<{ item: DocRecord }>(`/api/admin/docs/${id}/publish`, { method: "POST" });
    },

    async unpublish(id: string) {
      return requestJson<{ item: DocRecord }>(`/api/admin/docs/${id}/unpublish`, { method: "POST" });
    }
  },

  assets: {
    upload: uploadFile
  }
};
