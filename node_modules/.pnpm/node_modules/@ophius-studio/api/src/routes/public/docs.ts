import type { FastifyPluginAsync } from "fastify";
import { PublishStatus } from "@prisma/client";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export const publicDocsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/api/public/docs", async (req) => {
    const take = clamp(Number((req.query as any)?.limit ?? 50) || 50, 1, 200);
    const items = await app.prisma.docPage.findMany({
      where: { status: PublishStatus.PUBLISHED },
      orderBy: { publishedAt: "desc" },
      take,
      select: {
        id: true,
        title: true,
        slug: true,
        markdown: true,
        publishedAt: true
      }
    });
    return { items };
  });

  app.get("/api/public/docs/:slug", async (req, reply) => {
    const slug = String((req.params as any)?.slug ?? "").trim();
    if (!slug) return reply.code(400).send({ ok: false, message: "Slug is required" });

    const item = await app.prisma.docPage.findFirst({
      where: { slug, status: PublishStatus.PUBLISHED },
      select: {
        id: true,
        title: true,
        slug: true,
        markdown: true,
        publishedAt: true
      }
    });
    if (!item) return reply.code(404).send({ ok: false, message: "Not found" });
    return { item };
  });
};
