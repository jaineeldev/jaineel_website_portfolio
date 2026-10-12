import type { MetadataRoute } from "next";

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
      url: `${base}/desktopbuddy`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
