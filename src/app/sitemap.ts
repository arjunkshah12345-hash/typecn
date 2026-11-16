import type { MetadataRoute } from "next";
import { effects } from "@/registry/effects";
import { docs } from "@/lib/docs";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${site.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/effects`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site.url}/playground`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    ...docs.map((d) => ({ url: `${site.url}/docs${d.slug ? `/${d.slug}` : ""}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...effects.map((e) => ({ url: `${site.url}/effects/${e.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
