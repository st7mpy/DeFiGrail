import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Community submissions. `approved` IS published — no separate articles table.
export const submissions = pgTable("submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  authorName: text("author_name").notNull(),
  authorContact: text("author_contact").notNull(), // email — never displayed
  authorLink: text("author_link"),
  category: text("category").notNull(),
  bodyMd: text("body_md").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  slug: text("slug").unique(),
  ipHash: text("ip_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
});

export type Submission = typeof submissions.$inferSelect;
