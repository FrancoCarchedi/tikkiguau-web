import type { MetadataRoute } from "next";

const SITE_URL = "https://tikkiguau.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/disenar`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];
}
