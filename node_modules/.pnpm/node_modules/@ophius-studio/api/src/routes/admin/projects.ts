import type { FastifyPluginAsync } from "fastify";
import { PublishStatus } from "@prisma/client";
import { requireAuth, requireRole } from "../../lib/guards";
import { requireSameOrigin } from "../../lib/originCheck";

type ProjectInput = {
  title?: unknown;
  slug?: unknown;
  summary?: unknown;
  body?: unknown;
  coverUrl?: unknown;
};

function str(v: unknown) {
  return String(v ?? "").trim();
}

function optStr(v: unknown) {
  const s = str(v);
  return s ? s : null;
}

function normalizeSlug(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export const adminProjectsRoutes: FastifyPluginAsync = async (app) => {
  const auth = [requireAuth, requireRole("editor")];
  const mut = [requireSameOrigin, requireAuth, requireRole("editor")];

  app.get(
    "/api/admin/projects",
    { preHandler: auth },
    async (req) => {
      const q = (req.query ?? {}) as { status?: string; q?: string };
      const statusRaw = str(q.status);
      const search = str(q.q);

      const where: any = {};
      if (statusRaw === "draft") where.status = PublishStatus.DRAFT;
      if (statusRaw === "published") where.status = PublishStatus.PUBLISHED;
      if (search) {
        where.OR = [
          { title: { contains: search } },
          { slug: { contains: search } },
          { summary: { contains: search } }
        ];
      }

      const items = await app.prisma.project.findMany({
        where,
        orderBy: [{ updatedAt: "desc" }]
      });
      return { items };
    }
  );

  app.get(
    "/api/admin/projects/:id",
    { preHandler: auth },
    async (req, reply) => {
      const p = (req.params ?? {}) as { id?: string };
      const id = str(p.id);
      if (!id) return reply.code(400).send({ ok: false, message: "Id required" });

      const item = await app.prisma.project.findUnique({ where: { id } });
      if (!item) return reply.code(404).send({ ok: false, message: "Not found" });
      return { item };
    }
  );

  app.post(
    "/api/admin/projects",
    { preHandler: mut },
    async (req, reply) => {
      const body = (req.body ?? {}) as ProjectInput;
      const title = str(body.title);
      const slug = normalizeSlug(str(body.slug));
      if (!title) return reply.code(400).send({ ok: false, message: "Title required" });
      if (!slug) return reply.code(400).send({ ok: false, message: "Slug required" });

      const existing = await app.prisma.project.findUnique({ where: { slug } });
      if (existing) return reply.code(409).send({ ok: false, message: "Slug already used" });

      const item = await app.prisma.project.create({
        data: {
          title,
          slug,
          summary: optStr(body.summary),
          body: optStr(body.body),
          coverUrl: optStr(body.coverUrl),
          status: PublishStatus.DRAFT,
          publishedAt: null
        }
      });
      return reply.code(201).send({ item });
    }
  );

  app.patch(
    "/api/admin/projects/:id",
    { preHandler: mut },
    async (req, reply) => {
      const p = (req.params ?? {}) as { id?: string };
      const id = str(p.id);
      if (!id) return reply.code(400).send({ ok: false, message: "Id required" });

      const body = (req.body ?? {}) as ProjectInput;
      const data: any = {};
      if (body.title !== undefined) data.title = str(body.title);
      if (body.summary !== undefined) data.summary = optStr(body.summary);
      if (body.body !== undefined) data.body = optStr(body.body);
      if (body.coverUrl !== undefined) data.coverUrl = optStr(body.coverUrl);

      if (body.slug !== undefined) {
        const nextSlug = normalizeSlug(str(body.slug));
        if (!nextSlug) return reply.code(400).send({ ok: false, message: "Slug required" });
        const existing = await app.prisma.project.findUnique({ where: { slug: nextSlug } });
        if (existing && existing.id !== id) {
          return reply.code(409).send({ ok: false, message: "Slug already used" });
        }
        data.slug = nextSlug;
      }

      const item = await app.prisma.project
        .update({ where: { id }, data })
        .catch(() => null);
      if (!item) return reply.code(404).send({ ok: false, message: "Not found" });
      return { item };
    }
  );

  app.delete(
    "/api/admin/projects/:id",
    { preHandler: mut },
    async (req, reply) => {
      const p = (req.params ?? {}) as { id?: string };
      const id = str(p.id);
      if (!id) return reply.code(400).send({ ok: false, message: "Id required" });

      const deleted = await app.prisma.project
        .delete({ where: { id } })
        .catch(() => null);
      if (!deleted) return reply.code(404).send({ ok: false, message: "Not found" });
      return { ok: true };
    }
  );

  app.post(
    "/api/admin/projects/:id/publish",
    { preHandler: mut },
    async (req, reply) => {
      const p = (req.params ?? {}) as { id?: string };
      const id = str(p.id);
      if (!id) return reply.code(400).send({ ok: false, message: "Id required" });

      const item = await app.prisma.project
        .update({
          where: { id },
          data: { status: PublishStatus.PUBLISHED, publishedAt: new Date() }
        })
        .catch(() => null);
      if (!item) return reply.code(404).send({ ok: false, message: "Not found" });
      return { item };
    }
  );

  app.post(
    "/api/admin/projects/:id/unpublish",
    { preHandler: mut },
    async (req, reply) => {
      const p = (req.params ?? {}) as { id?: string };
      const id = str(p.id);
      if (!id) return reply.code(400).send({ ok: false, message: "Id required" });

      const item = await app.prisma.project
        .update({
          where: { id },
          data: { status: PublishStatus.DRAFT, publishedAt: null }
        })
        .catch(() => null);
      if (!item) return reply.code(404).send({ ok: false, message: "Not found" });
      return { item };
    }
  );
};
