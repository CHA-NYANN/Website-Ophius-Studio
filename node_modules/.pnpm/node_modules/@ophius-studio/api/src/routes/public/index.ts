import type { FastifyPluginAsync } from "fastify";
import { publicProjectsRoutes } from "./projects";
import { publicNewsRoutes } from "./news";
import { publicGalleryRoutes } from "./gallery";
import { publicMediaRoutes } from "./media";
import { publicTeamRoutes } from "./team";
import { publicDocsRoutes } from "./docs";

export const publicRoutes: FastifyPluginAsync = async (app) => {
  await app.register(publicProjectsRoutes);
  await app.register(publicNewsRoutes);
  await app.register(publicGalleryRoutes);
  await app.register(publicMediaRoutes);
  await app.register(publicTeamRoutes);
  await app.register(publicDocsRoutes);
};
