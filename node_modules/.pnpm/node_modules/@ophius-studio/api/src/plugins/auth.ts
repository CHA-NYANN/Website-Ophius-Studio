import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import { getSessionIdFromRequest, readSession } from "../lib/session";

export const authPlugin: FastifyPluginAsync = fp(async (app) => {
  app.addHook("preHandler", async (req) => {
    const url = req.url ?? "";
    if (!url.startsWith("/api")) return;

    const sid = getSessionIdFromRequest(req);
    if (!sid) {
      (req as any).user = null;
      return;
    }

    try {
      const user = await readSession(app.prisma, sid);
      (req as any).user = user;
    } catch {
      (req as any).user = null;
    }
  });
});
