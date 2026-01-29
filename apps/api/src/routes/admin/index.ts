import type { FastifyPluginAsync } from "fastify";
import { requireAuth, requireRole } from "../../lib/guards";
import { requireSameOrigin } from "../../lib/originCheck";
import { adminProjectsRoutes } from "./projects";
import { adminNewsRoutes } from "./news";
import { adminGalleryRoutes } from "./gallery";
import { adminMediaRoutes } from "./media";
import { adminAssetsRoutes } from "./assets";
import { adminTeamRoutes } from "./team";
import { adminDocsRoutes } from "./docs";

export const adminRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/api/admin/ping",
    { preHandler: [requireAuth, requireRole("editor")] },
    async (req) => {
      return { ok: true, user: req.user };
    }
  );

  app.post(
    "/api/admin/ping",
    { preHandler: [requireSameOrigin, requireAuth, requireRole("editor")] },
    async (req) => {
      return { ok: true, message: "pong" };
    }
  );

  await app.register(adminProjectsRoutes);
  await app.register(adminNewsRoutes);
  await app.register(adminGalleryRoutes);
  await app.register(adminMediaRoutes);
  await app.register(adminAssetsRoutes);
  await app.register(adminTeamRoutes);
  await app.register(adminDocsRoutes);
};
