import { describe, expect, it } from "vitest";
import { hashIp } from "./ratelimit";

describe("hashIp", () => {
  it("returns a stable 64-char hex digest", () => {
    const h = hashIp("1.2.3.4", "salt");
    expect(h).toMatch(/^[a-f0-9]{64}$/);
    expect(hashIp("1.2.3.4", "salt")).toBe(h);
  });
  it("never contains the raw ip", () => {
    expect(hashIp("203.0.113.7", "salt")).not.toContain("203.0.113.7");
  });
  it("differs per salt and per ip", () => {
    expect(hashIp("1.2.3.4", "a")).not.toBe(hashIp("1.2.3.4", "b"));
    expect(hashIp("1.2.3.4", "a")).not.toBe(hashIp("5.6.7.8", "a"));
  });
});
