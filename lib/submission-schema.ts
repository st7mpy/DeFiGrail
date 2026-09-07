import { z } from "zod";

// Validates an incoming community submission. `website` is a honeypot field —
// real users never see or fill it; bots that do are silently dropped upstream.
export const submissionInput = z.object({
  title: z.string().min(8).max(120),
  authorName: z.string().min(2).max(60),
  authorContact: z.string().email().max(120),
  authorLink: z.union([z.string().url().max(200), z.literal("")]).optional(),
  category: z.enum(["v0", "v1", "v2", "esoteric", "infra", "general"]),
  // The destination. z.url() alone accepts "javascript:alert(1)", which would
  // become a live href on the forum once approved — so the protocol is checked
  // explicitly rather than trusted to the URL parser.
  externalUrl: z
    .string()
    .max(500)
    .refine((v) => {
      try {
        return ["http:", "https:"].includes(new URL(v).protocol);
      } catch {
        return false;
      }
    }, "must be an http(s) link"),
  // Now a short summary rather than a full article body.
  bodyMd: z.string().min(40).max(600),
  website: z.literal("").optional(),
});

export type SubmissionInput = z.infer<typeof submissionInput>;
