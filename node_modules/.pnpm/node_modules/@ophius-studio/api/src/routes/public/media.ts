import type { FastifyPluginAsync } from "fastify";
import { MediaType, PublishStatus } from "@prisma/client";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function parseMediaType(v: unknown): MediaType | null {
  const s = String(v ?? "").trim().toUpperCase();
  if (!s) return null;
  if (s === "VIDEO") return MediaType.VIDEO;
  if (s === "IMAGE") return MediaType.IMAGE;
  return null;
}

export const publicMediaRoutes: FastifyPluginAsync = async (app) => {
  app.get("/api/public/media", async (req) => {
    const q = (req.query ?? {}) as { limit?: string; type?: string };
    const limit = clamp(Number(q.limit ?? 60), 1, 200);
    const t = parseMediaType(q.type);

    const where: any = { status: PublishStatus.PUBLISHED };
    if (t) where.type = t;

    const items = await app.prisma.mediaItem.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      take: limit
    });

    return { items };
  });

  app.get("/api/public/media/:id", async (req, reply) => {
    const p = (req.params ?? {}) as { id?: string };
    const id = String(p.id ?? "").trim();
    if (!id) return reply.code(400).send({ ok: false, message: "Id required" });

    const item = await app.prisma.mediaItem.findFirst({
      where: { id, status: PublishStatus.PUBLISHED }
    });
    if (!item) return reply.code(404).send({ ok: false, message: "Not found" });
    return { item };
  });
};
