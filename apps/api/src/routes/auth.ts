import type { FastifyPluginAsync } from "fastify";
import { verifyPassword } from "../lib/password";
import {
  clearSessionCookie,
  createSession,
  deleteSession,
  getSessionIdFromRequest,
  setSessionCookie
} from "../lib/session";
import { requireSameOrigin } from "../lib/originCheck";

type LoginBody = { password?: unknown };

function normalizePassword(input: unknown) {
  return String(input ?? "").trim();
}

const ADMIN_USERNAME = process.env.SEED_ADMIN_USERNAME ?? "admin";

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.get("/api/auth/me", async (req, reply) => {
    const sid = getSessionIdFromRequest(req);
    if (!sid) return { user: null };

    if (!req.user) {
      clearSessionCookie(reply);
      return { user: null };
    }

    return { user: req.user };
  });

  app.post(
    "/api/auth/login",
    { preHandler: requireSameOrigin },
    async (req, reply) => {
      const body = (req.body ?? {}) as LoginBody;
      const password = normalizePassword(body.password);
      if (!password) return reply.code(400).send({ ok: false, message: "Password required" });

      const user = await app.prisma.user.findUnique({ where: { username: ADMIN_USERNAME } });
      if (!user) {
        return reply.code(500).send({ ok: false, message: "Admin user not seeded" });
      }

      const ok = await verifyPassword(user.passwordHash, password);
      if (!ok) return reply.code(401).send({ ok: false, message: "Invalid credentials" });

      const sid = await createSession(app.prisma, user.id);
      setSessionCookie(reply, sid);
      return { ok: true };
    }
  );

  app.post(
    "/api/auth/logout",
    { preHandler: requireSameOrigin },
    async (req, reply) => {
      const sid = getSessionIdFromRequest(req);
      if (sid) await deleteSession(app.prisma, sid);
      clearSessionCookie(reply);
      return { ok: true };
    }
  );
};
