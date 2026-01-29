import type { AuthUser } from "@/admin/auth/authTypes";

type MeResponse = { user: AuthUser | null };

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

export const authClient = {
  async me() {
    return requestJson<MeResponse>("/api/auth/me", { method: "GET" });
  },

  async login(password: string) {
    return requestJson<{ ok: true }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ password })
    });
  },

  async logout() {
    return requestJson<{ ok: true }>("/api/auth/logout", { method: "POST" });
  }
};
