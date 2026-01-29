import type { FastifyPluginAsync } from "fastify";
import { PublishStatus } from "@prisma/client";
import { requireAuth, requireRole } from "../../lib/guards";
import { requireSameOrigin } from "../../lib/originCheck";

type DocsInput = {
  title?: unknown;
  slug?: unknown;
  markdown?: unknown;
};

function str(v: unknown) {
  if (typeof v !== "string") return "";
  return v.trim();
}

function optStr(v: unknown) {
  if (v === undefined) return undefined;
  const s = str(v);
  return s ? s : null;
}

function slugify(s: string) {
  const raw = s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return raw;
}

function parseStatus(v: unknown): PublishStatus | null {
  const s = String(v ?? "").trim().toLowerCase();
  if (s === "draft") return PublishStatus.DRAFT;
  if (s === "published") return PublishStatus.PUBLISHED;
  return null;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export const adminDocsRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/api/admin/docs",
    { preHandler: [requireSameOrigin, requireAuth, requireRole("editor")] },
    async (req) => {
      const q = String((req.query as any)?.q ?? "").trim();
      const status = parseStatus((req.query as any)?.status);
      const take = clamp(Number((req.query as any)?.limit ?? 50) || 50, 1, 200);
      const where: any = {};
      if (status) where.status = status;
      if (q) where.OR = [{ title: { contains: q, mode: "insensitive" } }, { slug: { contains: q, mode: "insensitive" } }];

      const items = await app.prisma.docPage.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        take
      });
      return { items };
    }
  );

  app.get(
    "/api/admin/docs/:id",
    { preHandler: [requireSameOrigin, requireAuth, requireRole("editor")] },
    async (req, reply) => {
      const id = String((req.params as any)?.id ?? "").trim();
      const item = await app.prisma.docPage.findUnique({ where: { id } });
      if (!item) return reply.code(404).send({ ok: false, message: "Not found" });
      return { item };
    }
  );

  app.post(
    "/api/admin/docs",
    { preHandler: [requireSameOrigin, requireAuth, requireRole("editor")] },
    async (req, reply) => {
      const body = (req.body ?? {}) as DocsInput;
      const title = str(body.title);
      if (!title) return reply.code(400).send({ ok: false, message: "Title is required" });

      let slug = slugify(str(body.slug));
      if (!slug) slug = slugify(title);
      if (!slug) return reply.code(400).send({ ok: false, message: "Slug is required" });

      const item = await app.prisma.docPage
        .create({
          data: {
            title,
            slug,
            markdown: optStr(body.markdown) ?? null,
            status: PublishStatus.DRAFT
          }
        })
        .catch((e) => {
          if (String(e?.code) === "P2002") return null;
          throw e;
        });

      if (!item) return reply.code(409).send({ ok: false, message: "Slug already exists" });
      return { item };
    }
  );

  app.patch(
    "/api/admin/docs/:id",
    { preHandler: [requireSameOrigin, requireAuth, requireRole("editor")] },
    async (req, reply) => {
      const id = String((req.params as any)?.id ?? "").trim();
      const body = (req.body ?? {}) as DocsInput;
      const data: any = {};
      if (body.title !== undefined) data.title = str(body.title);
      if (body.markdown !== undefined) data.markdown = optStr(body.markdown);

      if (body.slug !== undefined) {
        const s = slugify(str(body.slug));
        data.slug = s;
      }

      if (data.title !== undefined && !data.title) return reply.code(400).send({ ok: false, message: "Title is required" });
      if (data.slug !== undefined && !data.slug) return reply.code(400).send({ ok: false, message: "Slug is required" });

      const item = await app.prisma.docPage
        .update({ where: { id }, data })
        .catch((e) => {
          if (String(e?.code) === "P2002") return null;
          return null;
        });

      if (!item) return reply.code(404).send({ ok: false, message: "Not found or slug exists" });
      return { item };
    }
  );

  app.delete(
    "/api/admin/docs/:id",
    { preHandler: [requireSameOrigin, requireAuth, requireRole("editor")] },
    async (req, reply) => {
      const id = String((req.params as any)?.id ?? "").trim();
      const ok = await app.prisma.docPage
        .delete({ where: { id } })
        .then(() => true)
        .catch(() => false);
      if (!ok) return reply.code(404).send({ ok: false, message: "Not found" });
      return { ok: true };
    }
  );

  app.post(
    "/api/admin/docs/:id/publish",
    { preHandler: [requireSameOrigin, requireAuth, requireRole("editor")] },
    async (req, reply) => {
      const id = String((req.params as any)?.id ?? "").trim();
      const item = await app.prisma.docPage
        .update({ where: { id }, data: { status: PublishStatus.PUBLISHED, publishedAt: new Date() } })
        .catch(() => null);
      if (!item) return reply.code(404).send({ ok: false, message: "Not found" });
      return { item };
    }
  );

  app.post(
    "/api/admin/docs/:id/unpublish",
    { preHandler: [requireSameOrigin, requireAuth, requireRole("editor")] },
    async (req, reply) => {
      const id = String((req.params as any)?.id ?? "").trim();
      const item = await app.prisma.docPage
        .update({ where: { id }, data: { status: PublishStatus.DRAFT, publishedAt: null } })
        .catch(() => null);
      if (!item) return reply.code(404).send({ ok: false, message: "Not found" });
      return { item };
    }
  );
};
