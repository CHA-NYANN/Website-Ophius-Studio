import { randomBytes } from "node:crypto";

export function randomId(bytes = 24) {
  return randomBytes(bytes).toString("base64url");
}
