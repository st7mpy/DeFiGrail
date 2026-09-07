import { describe, expect, it } from "vitest";
import { submissionInput } from "./submission-schema";

const valid = {
  title: "A visual guide to concentrated liquidity",
  authorName: "0xYou",
  authorContact: "you@example.com",
  authorLink: "",
  category: "v2" as const,
  externalUrl: "https://mirror.xyz/someone/a-visual-guide",
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
  it("rejects a blurb below 40 chars", () => {
    expect(submissionInput.safeParse({ ...valid, bodyMd: "too short" }).success).toBe(false);
  });
  it("rejects a blurb above 600 chars", () => {
    expect(submissionInput.safeParse({ ...valid, bodyMd: "x".repeat(601) }).success).toBe(false);
  });
  it("requires the destination link", () => {
    const { externalUrl: _omitted, ...withoutUrl } = valid;
    expect(submissionInput.safeParse(withoutUrl).success).toBe(false);
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

describe("externalUrl protocol guard", () => {
  const base = {
    title: "A guide to concentrated liquidity",
    authorName: "0xYou",
    authorContact: "you@example.com",
    category: "general" as const,
    bodyMd: "A short summary of the writeup that is long enough to pass validation.",
  };
  const parse = (externalUrl: string) => submissionInput.safeParse({ ...base, externalUrl });

  it("accepts https and http links", () => {
    expect(parse("https://x.com/someone/status/1").success).toBe(true);
    expect(parse("http://example.com/post").success).toBe(true);
  });

  it("rejects javascript: URLs, which would become a live href once approved", () => {
    expect(parse("javascript:alert(document.cookie)").success).toBe(false);
  });

  it("rejects data: and other non-web schemes", () => {
    expect(parse("data:text/html,<script>alert(1)</script>").success).toBe(false);
    expect(parse("file:///etc/passwd").success).toBe(false);
  });

  it("rejects text that is not a URL at all", () => {
    expect(parse("not a link").success).toBe(false);
    expect(parse("").success).toBe(false);
  });
});
