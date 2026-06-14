import { describe, expect, it } from "vitest";
import { submissionInput } from "./submission-schema";

const valid = {
  title: "A visual guide to concentrated liquidity",
  authorName: "0xYou",
  authorContact: "you@example.com",
  authorLink: "",
  category: "v2" as const,
  bodyMd: "x".repeat(250),
  website: "" as const,
};

describe("submissionInput", () => {
  it("accepts a valid submission", () => {
    expect(submissionInput.safeParse(valid).success).toBe(true);
  });
  it("rejects short titles", () => {
    expect(submissionInput.safeParse({ ...valid, title: "short" }).success).toBe(false);
  });
  it("rejects bad email", () => {
    expect(submissionInput.safeParse({ ...valid, authorContact: "nope" }).success).toBe(false);
  });
  it("rejects body below 200 chars", () => {
    expect(submissionInput.safeParse({ ...valid, bodyMd: "too short" }).success).toBe(false);
  });
  it("rejects body above 50KB", () => {
    expect(submissionInput.safeParse({ ...valid, bodyMd: "x".repeat(51201) }).success).toBe(false);
  });
  it("rejects unknown category", () => {
    expect(submissionInput.safeParse({ ...valid, category: "bogus" }).success).toBe(false);
  });
  it("rejects a filled honeypot", () => {
    expect(submissionInput.safeParse({ ...valid, website: "http://spam" }).success).toBe(false);
  });
  it("accepts a valid optional authorLink url", () => {
    expect(submissionInput.safeParse({ ...valid, authorLink: "https://me.dev" }).success).toBe(true);
  });
});
