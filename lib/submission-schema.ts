import { z } from "zod";

// Validates an incoming community submission. `website` is a honeypot field —
// real users never see or fill it; bots that do are silently dropped upstream.
export const submissionInput = z.object({
  title: z.string().min(8).max(120),
  authorName: z.string().min(2).max(60),
  authorContact: z.string().email().max(120),
  authorLink: z.union([z.string().url().max(200), z.literal("")]).optional(),
  category: z.enum(["v0", "v1", "v2", "esoteric", "infra", "general"]),
  bodyMd: z.string().min(200).max(51200),
  website: z.literal("").optional(),
});

export type SubmissionInput = z.infer<typeof submissionInput>;
