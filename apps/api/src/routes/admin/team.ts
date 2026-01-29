import type { FastifyPluginAsync } from "fastify";
import { PublishStatus } from "@prisma/client";
import { requireAuth, requireRole } from "../../lib/guards";
import { requireSameOrigin } from "../../lib/originCheck";

type TeamInput = {
  name?: unknown;
  title?: unknown;
  bio?: unknown;
  avatarUrl?: unknown;
};

function str(v: unknown) {
  if (typeof v !== "string") return "";
  return v.trim();
}

function optStr(v: unknown) {
  const s = str(v);
  return s ? s : null;
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

export const adminTeamRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/api/admin/team",
    { preHandler: [requireSameOrigin, requireAuth, requireRole("editor")] },
    async (req) => {
      const q = String((req.query as any)?.q ?? "").trim();
      const status = parseStatus((req.query as any)?.status);
      const take = clamp(Number((req.query as any)?.limit ?? 50) || 50, 1, 200);
      const where: any = {};
      if (status) where.status = status;
      if (q) where.OR = [{ name: { contains: q, mode: "insensitive" } }, { title: { contains: q, mode: "insensitive" } }];

      const items = await app.prisma.teamMember.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        take
      });
      return { items };
    }
  );

  app.get(
    "/api/admin/team/:id",
    { preHandler: [requireSameOrigin, requireAuth, requireRole("editor")] },
    async (req, reply) => {
      const id = String((req.params as any)?.id ?? "").trim();
      const item = await app.prisma.teamMember.findUnique({ where: { id } });
      if (!item) return reply.code(404).send({ ok: false, message: "Not found" });
      return { item };
    }
  );

  app.post(
    "/api/admin/team",
    { preHandler: [requireSameOrigin, requireAuth, requireRole("editor")] },
    async (req, reply) => {
      const body = (req.body ?? {}) as TeamInput;
      const name = str(body.name);
      if (!name) return reply.code(400).send({ ok: false, message: "Name is required" });

      const item = await app.prisma.teamMember.create({
        data: {
          name,
          title: optStr(body.title),
          bio: optStr(body.bio),
          avatarUrl: optStr(body.avatarUrl),
          status: PublishStatus.DRAFT
        }
      });
      return { item };
    }
  );

  app.patch(
    "/api/admin/team/:id",
    { preHandler: [requireSameOrigin, requireAuth, requireRole("editor")] },
    async (req, reply) => {
      const id = String((req.params as any)?.id ?? "").trim();
      const body = (req.body ?? {}) as TeamInput;
      const data: any = {};
      if (body.name !== undefined) data.name = str(body.name);
      if (body.title !== undefined) data.title = optStr(body.title);
      if (body.bio !== undefined) data.bio = optStr(body.bio);
      if (body.avatarUrl !== undefined) data.avatarUrl = optStr(body.avatarUrl);

      if (data.name !== undefined && !data.name) return reply.code(400).send({ ok: false, message: "Name is required" });

      const item = await app.prisma.teamMember
        .update({ where: { id }, data })
        .catch(() => null);
      if (!item) return reply.code(404).send({ ok: false, message: "Not found" });
      return { item };
    }
  );

  app.delete(
    "/api/admin/team/:id",
    { preHandler: [requireSameOrigin, requireAuth, requireRole("editor")] },
    async (req, reply) => {
      const id = String((req.params as any)?.id ?? "").trim();
      const ok = await app.prisma.teamMember
        .delete({ where: { id } })
        .then(() => true)
        .catch(() => false);
      if (!ok) return reply.code(404).send({ ok: false, message: "Not found" });
      return { ok: true };
    }
  );

  app.post(
    "/api/admin/team/:id/publish",
    { preHandler: [requireSameOrigin, requireAuth, requireRole("editor")] },
    async (req, reply) => {
      const id = String((req.params as any)?.id ?? "").trim();
      const item = await app.prisma.teamMember
        .update({ where: { id }, data: { status: PublishStatus.PUBLISHED, publishedAt: new Date() } })
        .catch(() => null);
      if (!item) return reply.code(404).send({ ok: false, message: "Not found" });
      return { item };
    }
  );

  app.post(
    "/api/admin/team/:id/unpublish",
    { preHandler: [requireSameOrigin, requireAuth, requireRole("editor")] },
    async (req, reply) => {
      const id = String((req.params as any)?.id ?? "").trim();
      const item = await app.prisma.teamMember
        .update({ where: { id }, data: { status: PublishStatus.DRAFT, publishedAt: null } })
        .catch(() => null);
      if (!item) return reply.code(404).send({ ok: false, message: "Not found" });
      return { item };
    }
  );
};
