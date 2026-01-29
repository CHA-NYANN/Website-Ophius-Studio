import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import { mkdir } from "node:fs/promises";
import { prismaPlugin } from "./plugins/prisma";
import { authPlugin } from "./plugins/auth";
import { authRoutes } from "./routes/auth";
import { adminRoutes } from "./routes/admin";
import { publicRoutes } from "./routes/public";
import { config } from "./config";

const app = Fastify({ logger: true, trustProxy: config.trustProxy });

// ensure uploads dir exists
await mkdir(config.uploadDir, { recursive: true });

await app.register(cors, {
  origin: (origin, cb) => {
    // Non-browser tools may not send Origin.
    if (!origin) {
      return cb(null, config.nodeEnv !== "production");
    }
    if (config.corsOrigins.includes(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true
});

await app.register(cookie, {
  secret: config.cookie.secret
});

await app.register(multipart, {
  limits: {
    fileSize: 15 * 1024 * 1024
  }
});

await app.register(fastifyStatic, {
  root: config.uploadDir,
  prefix: "/uploads/",
  decorateReply: false
});

await app.register(prismaPlugin);
await app.register(authPlugin);

app.get("/api/health", async () => ({ ok: true }));

await app.register(authRoutes);
await app.register(adminRoutes);
await app.register(publicRoutes);


app.setNotFoundHandler(async (req, reply) => {
  reply.status(404).send({
    ok: false,
    error: {
      code: "NOT_FOUND",
      message: `Route not found: ${req.method} ${req.url}`
    }
  });
});

app.setErrorHandler((err, req, reply) => {
  // keep default fastify logging but also return consistent json shape
  req.log.error({ err }, "request error");
  const status = (err as any).statusCode || (err as any).status || 500;
  const message = status >= 500 ? "Internal Server Error" : (err as any).message || "Request Error";
  reply.status(status).send({
    ok: false,
    error: {
      code: status >= 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR",
      message
    }
  });
});


const port = config.port;
await app.listen({ port, host: "0.0.0.0" });
