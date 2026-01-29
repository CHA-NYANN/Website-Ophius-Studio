import type { FastifyPluginAsync } from "fastify";
import { PublishStatus } from "@prisma/client";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export const publicGalleryRoutes: FastifyPluginAsync = async (app) => {
  app.get("/api/public/gallery", async (req) => {
    const q = (req.query ?? {}) as { limit?: string };
    const limit = clamp(Number(q.limit ?? 60), 1, 200);

    const items = await app.prisma.galleryItem.findMany({
      where: { status: PublishStatus.PUBLISHED },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      take: limit
    });

    return { items };
  });

  app.get("/api/public/gallery/:id", async (req, reply) => {
    const p = (req.params ?? {}) as { id?: string };
    const id = String(p.id ?? "").trim();
    if (!id) return reply.code(400).send({ ok: false, message: "Id required" });

    const item = await app.prisma.galleryItem.findFirst({
      where: { id, status: PublishStatus.PUBLISHED }
    });
    if (!item) return reply.code(404).send({ ok: false, message: "Not found" });
    return { item };
  });
};
