import path from "node:path";

function splitCsv(v: string | undefined): string[] {
  const s = (v ?? "").trim();
  if (!s) return [];
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function readBool(v: string | undefined): boolean | undefined {
  if (v == null) return undefined;
  const s = v.trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(s)) return true;
  if (["0", "false", "no", "n", "off"].includes(s)) return false;
  return undefined;
}

export type SameSite = "lax" | "strict" | "none";

export const config = {
  nodeEnv: (process.env.NODE_ENV ?? "development") as "development" | "production" | "test",
  port: Number(process.env.PORT ?? 3001),

  // CORS controls what browsers are allowed to call the API with credentials.
  // In production, set this to your web origin(s), e.g. "https://ophius.studio".
  corsOrigins: splitCsv(process.env.CORS_ORIGINS ?? process.env.ALLOWED_ORIGINS).length
    ? splitCsv(process.env.CORS_ORIGINS ?? process.env.ALLOWED_ORIGINS)
    : [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173"
      ],

  // Extra CSRF-ish hardening for non-GET routes.
  allowedOrigins: splitCsv(process.env.ALLOWED_ORIGINS ?? process.env.CORS_ORIGINS).length
    ? splitCsv(process.env.ALLOWED_ORIGINS ?? process.env.CORS_ORIGINS)
    : [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173"
      ],

  trustProxy: readBool(process.env.TRUST_PROXY) ?? (process.env.NODE_ENV === "production"),

  cookie: {
    secret: process.env.COOKIE_SECRET ?? "dev-secret-change-me",
    // If web+api are on different origins, browsers require SameSite=None + Secure.
    sameSite: ((process.env.COOKIE_SAMESITE ?? "lax").toLowerCase() as SameSite) || "lax",
    domain: (process.env.COOKIE_DOMAIN ?? "").trim() || undefined,
    secure: readBool(process.env.COOKIE_SECURE) ?? (process.env.NODE_ENV === "production")
  },

  sessionTtlSeconds: Number(process.env.SESSION_TTL_SECONDS ?? 60 * 60 * 12),

  uploadDir: path.resolve(process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads"))
};
