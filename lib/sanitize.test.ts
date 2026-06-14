import { describe, expect, it } from "vitest";
import { renderCommunityMarkdown } from "./sanitize";

describe("renderCommunityMarkdown", () => {
  it("renders headings, bold, lists, and gfm tables", async () => {
    const html = await renderCommunityMarkdown("## Hi\n\n**bold**\n\n| a | b |\n|---|---|\n| 1 | 2 |");
    expect(html).toContain("<h2>");
    expect(html).toContain("<strong>");
    expect(html).toContain("<table>");
  });

  it.each([
    "<script>alert(1)</script>",
    '<img src=x onerror="alert(1)">',
    "[x](javascript:alert(1))",
    '<iframe src="https://evil.example"></iframe>',
    '<a href="data:text/html,boom">x</a>',
    '<div onclick="steal()">hi</div>',
    "![pwn](javascript:alert(1))",
  ])("neutralizes XSS payload: %s", async (payload) => {
    const html = await renderCommunityMarkdown(payload);
    expect(html).not.toMatch(/<script|onerror=|onclick=|javascript:|<iframe|data:text\/html/i);
  });

  it("keeps safe http/https/mailto links", async () => {
    const html = await renderCommunityMarkdown("[site](https://example.com) [mail](mailto:a@b.com)");
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('href="mailto:a@b.com"');
  });
});
