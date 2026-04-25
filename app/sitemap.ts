import type { MetadataRoute } from "next";
import { countries, vaccines } from "@/lib/data";
import { SEO_DEFAULTS } from "@/lib/seo";

export const dynamic = "force-static";

/**
 * Static sitemap emitted at build time. Every URL corresponds to a pre-rendered
 * page in the `out/` export. Updated whenever countries.json / vaccines.json change.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = SEO_DEFAULTS.base_url.replace(/\/$/, "");
  const today = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: today, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/alerts/`, lastModified: today, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/about/`, lastModified: today, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/disclaimer/`, lastModified: today, changeFrequency: "yearly", priority: 0.3 },
  ];

  const countryPages: MetadataRoute.Sitemap = countries.map((c) => ({
    url: `${base}/destination/${c.id}/`,
    lastModified: today,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const vaccinePages: MetadataRoute.Sitemap = vaccines.map((v) => ({
    url: `${base}/vaccine/${v.id}/`,
    lastModified: today,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...countryPages, ...vaccinePages];
}
