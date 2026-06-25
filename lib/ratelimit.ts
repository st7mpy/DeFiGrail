import { createHash } from "node:crypto";

// One-way hash of an IP for rate limiting — the raw IP is never stored.
export function hashIp(ip: string, salt = process.env.IP_SALT ?? ""): string {
  if (!salt && process.env.NODE_ENV === "production") {
    throw new Error("IP_SALT env var must be set in production");
  }
  return createHash("sha256").update(ip + salt).digest("hex");
}
