import type { FastifyReply, FastifyRequest } from "fastify";
import type { PrismaClient, Role } from "@prisma/client";
import { randomId } from "./random";
import { config } from "../config";

export type SessionRole = "admin" | "editor";

export type SessionUser = {
  id: string;
  role: SessionRole;
  username: string;
};

const SESS_COOKIE = "ophsid";
const TTL_MS = 1000 * config.sessionTtlSeconds;

export function getCookieName() {
  return SESS_COOKIE;
}

export function getTtlMs() {
  return TTL_MS;
}

function mapRole(role: Role): SessionRole {
  return role === "ADMIN" ? "admin" : "editor";
}

export async function createSession(prisma: PrismaClient, userId: string) {
  const sid = randomId();
  const expiresAt = new Date(Date.now() + TTL_MS);
  await prisma.session.create({
    data: {
      id: sid,
      userId,
      expiresAt
    }
  });
  return sid;
}

export async function deleteSession(prisma: PrismaClient, sid: string) {
  await prisma.session.delete({ where: { id: sid } }).catch(() => null);
}

export async function readSession(prisma: PrismaClient, sid: string): Promise<SessionUser | null> {
  const rec = await prisma.session.findUnique({
    where: { id: sid },
    include: { user: true }
  });
  if (!rec) return null;

  if (rec.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id: sid } }).catch(() => null);
    return null;
  }

  return {
    id: rec.user.id,
    username: rec.user.username,
    role: mapRole(rec.user.role)
  };
}

export function setSessionCookie(reply: FastifyReply, sid: string) {
  reply.setCookie(SESS_COOKIE, sid, {
    httpOnly: true,
    sameSite: config.cookie.sameSite,
    path: "/",
    secure: config.cookie.secure,
    domain: config.cookie.domain,
    maxAge: Math.floor(TTL_MS / 1000)
  });
}

export function clearSessionCookie(reply: FastifyReply) {
  reply.clearCookie(SESS_COOKIE, {
    path: "/",
    domain: config.cookie.domain,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite
  });
}

export function getSessionIdFromRequest(req: FastifyRequest) {
  const sid = (req.cookies as any)?.[SESS_COOKIE] as string | undefined;
  return sid ?? null;
}
