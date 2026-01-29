import type { FastifyPluginAsync } from "fastify";
import { MediaType, PublishStatus } from "@prisma/client";
import { requireAuth, requireRole } from "../../lib/guards";
import { requireSameOrigin } from "../../lib/originCheck";

type MediaInput = {
  title?: unknown;
  type?: unknown;
  url?: unknown;
  thumbnailUrl?: unknown;
};

function str(v: unknown) {
  return String(v ?? "").trim();
}

function optStr(v: unknown) {
  const s = str(v);
  return s ? s : null;
}

function parseMediaType(v: unknown): MediaType {
  const s = str(v).toUpperCase();
  if (s === "VIDEO") return MediaType.VIDEO;
  return MediaType.IMAGE;
}

export const adminMediaRoutes: FastifyPluginAsync = async (app) => {
  const auth = [requireAuth, requireRole("editor")];
  const mut = [requireSameOrigin, requireAuth, requireRole("editor")];

  app.get("/api/admin/media", { preHandler: auth }, async (req) => {
    const q = (req.query ?? {}) as { status?: string; q?: string; type?: string };
    const statusRaw = str(q.status);
    const search = str(q.q);
    const typeRaw = str(q.type);

    const where: any = {};
    if (statusRaw === "draft") where.status = PublishStatus.DRAFT;
    if (statusRaw === "published") where.status = PublishStatus.PUBLISHED;
    if (typeRaw) where.type = parseMediaType(typeRaw);
    if (search) {
      where.OR = [{ title: { contains: search } }, { url: { contains: search } }];
    }

    const items = await app.prisma.mediaItem.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }]
    });
    return { items };
  });

  app.get("/api/admin/media/:id", { preHandler: auth }, async (req, reply) => {
    const p = (req.params ?? {}) as { id?: string };
    const id = str(p.id);
    if (!id) return reply.code(400).send({ ok: false, message: "Id required" });

    const item = await app.prisma.mediaItem.findUnique({ where: { id } });
    if (!item) return reply.code(404).send({ ok: false, message: "Not found" });
    return { item };
  });

  app.post("/api/admin/media", { preHandler: mut }, async (req, reply) => {
    const body = (req.body ?? {}) as MediaInput;
    const title = str(body.title);
    const url = str(body.url);
    const type = parseMediaType(body.type);

    if (!title) return reply.code(400).send({ ok: false, message: "Title required" });
    if (!url) return reply.code(400).send({ ok: false, message: "URL required" });

    const item = await app.prisma.mediaItem.create({
      data: {
        title,
        type,
        url,
        thumbnailUrl: optStr(body.thumbnailUrl),
        status: PublishStatus.DRAFT,
        publishedAt: null
      }
    });

    return reply.code(201).send({ item });
  });

  app.patch("/api/admin/media/:id", { preHandler: mut }, async (req, reply) => {
    const p = (req.params ?? {}) as { id?: string };
    const id = str(p.id);
    if (!id) return reply.code(400).send({ ok: false, message: "Id required" });

    const body = (req.body ?? {}) as MediaInput;
    const data: any = {};
    if (body.title !== undefined) data.title = str(body.title);
    if (body.url !== undefined) data.url = str(body.url);
    if (body.type !== undefined) data.type = parseMediaType(body.type);
    if (body.thumbnailUrl !== undefined) data.thumbnailUrl = optStr(body.thumbnailUrl);

    const item = await app.prisma.mediaItem.update({ where: { id }, data }).catch(() => null);
    if (!item) return reply.code(404).send({ ok: false, message: "Not found" });
    return { item };
  });

  app.delete("/api/admin/media/:id", { preHandler: mut }, async (req, reply) => {
    const p = (req.params ?? {}) as { id?: string };
    const id = str(p.id);
    if (!id) return reply.code(400).send({ ok: false, message: "Id required" });

    const deleted = await app.prisma.mediaItem.delete({ where: { id } }).catch(() => null);
    if (!deleted) return reply.code(404).send({ ok: false, message: "Not found" });
    return { ok: true };
  });

  app.post("/api/admin/media/:id/publish", { preHandler: mut }, async (req, reply) => {
    const p = (req.params ?? {}) as { id?: string };
    const id = str(p.id);
    if (!id) return reply.code(400).send({ ok: false, message: "Id required" });

    const item = await app.prisma.mediaItem
      .update({ where: { id }, data: { status: PublishStatus.PUBLISHED, publishedAt: new Date() } })
      .catch(() => null);
    if (!item) return reply.code(404).send({ ok: false, message: "Not found" });
    return { item };
  });

  app.post("/api/admin/media/:id/unpublish", { preHandler: mut }, async (req, reply) => {
    const p = (req.params ?? {}) as { id?: string };
    const id = str(p.id);
    if (!id) return reply.code(400).send({ ok: false, message: "Id required" });

    const item = await app.prisma.mediaItem
      .update({ where: { id }, data: { status: PublishStatus.DRAFT, publishedAt: null } })
      .catch(() => null);
    if (!item) return reply.code(404).send({ ok: false, message: "Not found" });
    return { item };
  });
};
