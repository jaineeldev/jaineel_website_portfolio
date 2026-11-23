import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";

// No lastModified: a build-time date changes on every deploy whether a page did or not, which teaches search
// engines to ignore it. Leaving it out is more honest than guessing.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://jaineel.dev";
  return [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/blimo`, changeFrequency: "monthly", priority: 0.8 },
    ...projects.map((p) => ({
      url: `${base}/work/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
