import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://jaineel.dev";
  const lastModified = new Date();
  return [
    {
      url: `${base}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${base}/blimo`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...projects.map((p) => ({
      url: `${base}/work/${p.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
