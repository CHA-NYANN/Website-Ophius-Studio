import type { FastifyReply, FastifyRequest } from "fastify";
import type { SessionRole } from "./session";

export type AuthedRequest = FastifyRequest & { user?: { id: string; role: SessionRole; username: string } | null };

export function requireAuth(req: AuthedRequest, reply: FastifyReply) {
  if (!req.user) {
    return reply.code(401).send({ ok: false, message: "Unauthorized" });
  }
}

export function requireRole(minRole: SessionRole) {
  const rank: Record<SessionRole, number> = { editor: 1, admin: 2 };
  return (req: AuthedRequest, reply: FastifyReply) => {
    if (!req.user) return reply.code(401).send({ ok: false, message: "Unauthorized" });
    if (rank[req.user.role] < rank[minRole]) {
      return reply.code(403).send({ ok: false, message: "Forbidden" });
    }
  };
}
