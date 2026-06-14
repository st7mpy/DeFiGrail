import { createHash } from "node:crypto";

// One-way hash of an IP for rate limiting — the raw IP is never stored.
export function hashIp(ip: string, salt = process.env.IP_SALT ?? ""): string {
  return createHash("sha256").update(ip + salt).digest("hex");
}
