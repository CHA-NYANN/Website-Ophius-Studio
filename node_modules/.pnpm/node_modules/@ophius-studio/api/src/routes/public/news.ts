import type { FastifyPluginAsync } from "fastify";
import { PublishStatus } from "@prisma/client";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export const publicNewsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/api/public/news", async (req) => {
    const q = (req.query ?? {}) as { limit?: string };
    const limit = clamp(Number(q.limit ?? 50), 1, 200);

    const items = await app.prisma.news.findMany({
      where: { status: PublishStatus.PUBLISHED },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      take: limit
    });

    return { items };
  });

  app.get("/api/public/news/:slug", async (req, reply) => {
    const p = (req.params ?? {}) as { slug?: string };
    const slug = String(p.slug ?? "").trim();
    if (!slug) return reply.code(400).send({ ok: false, message: "Slug required" });

    const item = await app.prisma.news.findFirst({
      where: { slug, status: PublishStatus.PUBLISHED }
    });
    if (!item) return reply.code(404).send({ ok: false, message: "Not found" });

    return { item };
  });
};
