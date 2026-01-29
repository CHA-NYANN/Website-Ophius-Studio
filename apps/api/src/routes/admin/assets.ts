import type { FastifyPluginAsync } from "fastify";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomId } from "../../lib/random";
import { requireAuth, requireRole } from "../../lib/guards";
import { requireSameOrigin } from "../../lib/originCheck";
import { config } from "../../config";

function safeExt(filename: string) {
  const ext = path.extname(filename || "").toLowerCase();
  if (!ext) return "";
  if (ext.length > 12) return "";
  return ext.replace(/[^a-z0-9.]/g, "");
}

function safeBase(name: string) {
  const base = path.basename(name || "file").replace(/\s+/g, "-");
  return base.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 80) || "file";
}

export const adminAssetsRoutes: FastifyPluginAsync = async (app) => {
  const mut = [requireSameOrigin, requireAuth, requireRole("editor")];

  app.post("/api/admin/assets", { preHandler: mut }, async (req, reply) => {
    // requires @fastify/multipart
    const anyReq: any = req as any;
    if (typeof anyReq.file !== "function") {
      return reply.code(500).send({ ok: false, message: "multipart not configured" });
    }

    const file = await anyReq.file();
    if (!file) return reply.code(400).send({ ok: false, message: "File required" });

    const buf = await file.toBuffer();
    const now = new Date();
    const y = String(now.getUTCFullYear());
    const m = String(now.getUTCMonth() + 1).padStart(2, "0");

    const ext = safeExt(file.filename);
    const base = safeBase(file.filename);
    const fname = `${randomId(10)}_${base}${ext}`;
    const rel = path.posix.join(y, m, fname);
    const root = config.uploadDir;
    const absDir = path.join(root, y, m);
    const abs = path.join(absDir, fname);

    await mkdir(absDir, { recursive: true });
    await writeFile(abs, buf);

    const url = `/uploads/${rel}`;
    return reply.code(201).send({ ok: true, url, filename: file.filename, mimetype: file.mimetype, size: buf.length });
  });
};
