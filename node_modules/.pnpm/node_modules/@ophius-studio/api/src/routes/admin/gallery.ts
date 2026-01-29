import type { FastifyPluginAsync } from "fastify";
import { PublishStatus } from "@prisma/client";
import { requireAuth, requireRole } from "../../lib/guards";
import { requireSameOrigin } from "../../lib/originCheck";

type GalleryInput = {
  title?: unknown;
  imageUrl?: unknown;
};

function str(v: unknown) {
  return String(v ?? "").trim();
}


export const adminGalleryRoutes: FastifyPluginAsync = async (app) => {
  const auth = [requireAuth, requireRole("editor")];
  const mut = [requireSameOrigin, requireAuth, requireRole("editor")];

  app.get("/api/admin/gallery", { preHandler: auth }, async (req) => {
    const q = (req.query ?? {}) as { status?: string; q?: string };
    const statusRaw = str(q.status);
    const search = str(q.q);

    const where: any = {};
    if (statusRaw === "draft") where.status = PublishStatus.DRAFT;
    if (statusRaw === "published") where.status = PublishStatus.PUBLISHED;
    if (search) {
      where.OR = [{ title: { contains: search } }, { imageUrl: { contains: search } }];
    }

    const items = await app.prisma.galleryItem.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }]
    });
    return { items };
  });

  app.get("/api/admin/gallery/:id", { preHandler: auth }, async (req, reply) => {
    const p = (req.params ?? {}) as { id?: string };
    const id = str(p.id);
    if (!id) return reply.code(400).send({ ok: false, message: "Id required" });

    const item = await app.prisma.galleryItem.findUnique({ where: { id } });
    if (!item) return reply.code(404).send({ ok: false, message: "Not found" });
    return { item };
  });

  app.post("/api/admin/gallery", { preHandler: mut }, async (req, reply) => {
    const body = (req.body ?? {}) as GalleryInput;
    const title = str(body.title);
    const imageUrl = str(body.imageUrl);
    if (!title) return reply.code(400).send({ ok: false, message: "Title required" });
    if (!imageUrl) return reply.code(400).send({ ok: false, message: "Image URL required" });

    const item = await app.prisma.galleryItem.create({
      data: {
        title,
        imageUrl,
        status: PublishStatus.DRAFT,
        publishedAt: null
      }
    });
    return reply.code(201).send({ item });
  });

  app.patch("/api/admin/gallery/:id", { preHandler: mut }, async (req, reply) => {
    const p = (req.params ?? {}) as { id?: string };
    const id = str(p.id);
    if (!id) return reply.code(400).send({ ok: false, message: "Id required" });

    const body = (req.body ?? {}) as GalleryInput;
    const data: any = {};
    if (body.title !== undefined) data.title = str(body.title);
    if (body.imageUrl !== undefined) data.imageUrl = str(body.imageUrl);

    const item = await app.prisma.galleryItem
      .update({ where: { id }, data })
      .catch(() => null);
    if (!item) return reply.code(404).send({ ok: false, message: "Not found" });
    return { item };
  });

  app.delete("/api/admin/gallery/:id", { preHandler: mut }, async (req, reply) => {
    const p = (req.params ?? {}) as { id?: string };
    const id = str(p.id);
    if (!id) return reply.code(400).send({ ok: false, message: "Id required" });

    const deleted = await app.prisma.galleryItem.delete({ where: { id } }).catch(() => null);
    if (!deleted) return reply.code(404).send({ ok: false, message: "Not found" });
    return { ok: true };
  });

  app.post("/api/admin/gallery/:id/publish", { preHandler: mut }, async (req, reply) => {
    const p = (req.params ?? {}) as { id?: string };
    const id = str(p.id);
    if (!id) return reply.code(400).send({ ok: false, message: "Id required" });

    const item = await app.prisma.galleryItem
      .update({ where: { id }, data: { status: PublishStatus.PUBLISHED, publishedAt: new Date() } })
      .catch(() => null);
    if (!item) return reply.code(404).send({ ok: false, message: "Not found" });
    return { item };
  });

  app.post("/api/admin/gallery/:id/unpublish", { preHandler: mut }, async (req, reply) => {
    const p = (req.params ?? {}) as { id?: string };
    const id = str(p.id);
    if (!id) return reply.code(400).send({ ok: false, message: "Id required" });

    const item = await app.prisma.galleryItem
      .update({ where: { id }, data: { status: PublishStatus.DRAFT, publishedAt: null } })
      .catch(() => null);
    if (!item) return reply.code(404).send({ ok: false, message: "Not found" });
    return { item };
  });
};
