import type { FastifyPluginAsync } from "fastify";
import { PublishStatus } from "@prisma/client";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export const publicTeamRoutes: FastifyPluginAsync = async (app) => {
  app.get("/api/public/team", async (req) => {
    const take = clamp(Number((req.query as any)?.limit ?? 50) || 50, 1, 200);
    const items = await app.prisma.teamMember.findMany({
      where: { status: PublishStatus.PUBLISHED },
      orderBy: { publishedAt: "desc" },
      take,
      select: {
        id: true,
        name: true,
        title: true,
        bio: true,
        avatarUrl: true,
        publishedAt: true
      }
    });
    return { items };
  });
};
