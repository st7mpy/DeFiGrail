import { describe, expect, it } from "vitest";
import { isAuthorized } from "./middleware-auth";

const header = (pw: string) => "Basic " + Buffer.from("admin:" + pw).toString("base64");

describe("isAuthorized", () => {
  it("accepts correct credentials", () => {
    expect(isAuthorized(header("s3cret"), "s3cret")).toBe(true);
  });
  it("rejects wrong password", () => {
    expect(isAuthorized(header("nope"), "s3cret")).toBe(false);
  });
  it("rejects missing header", () => {
    expect(isAuthorized(null, "s3cret")).toBe(false);
  });
  it("rejects when no password configured (fail closed)", () => {
    expect(isAuthorized(header("anything"), undefined)).toBe(false);
    expect(isAuthorized(header(""), "")).toBe(false);
  });
});
