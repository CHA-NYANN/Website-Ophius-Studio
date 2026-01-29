import "fastify";
import type { PrismaClient } from "@prisma/client";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }

  interface FastifyRequest {
    user?: { id: string; role: "admin" | "editor"; username: string } | null;
  }
}
