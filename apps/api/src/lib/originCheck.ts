import type { FastifyReply, FastifyRequest } from "fastify";
import { config } from "../config";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function requireSameOrigin(req: FastifyRequest, reply: FastifyReply) {
  if (SAFE_METHODS.has(req.method)) return;

  const origin = String(req.headers.origin ?? "").trim();

  // In development, allow tools like curl/postman (no Origin header).
  if (!origin && process.env.NODE_ENV !== "production") return;

  if (!origin) {
    return reply.code(403).send({ ok: false, message: "Missing Origin" });
  }

  if (!config.allowedOrigins.includes(origin)) {
    return reply.code(403).send({ ok: false, message: "Blocked Origin" });
  }
}
