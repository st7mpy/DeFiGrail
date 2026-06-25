import type { MetadataRoute } from "next";
import { loadTopics } from "@/lib/mdx";

const BASE = "https://defigrail.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/learn", "/graph", "/playground", "/quiz", "/glossary", "/news", "/community"].map((p) => ({
    url: BASE + p,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
  const topicRoutes = loadTopics().map((t) => ({
    url: `${BASE}/learn/${t.meta.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  return [...staticRoutes, ...topicRoutes];
}
