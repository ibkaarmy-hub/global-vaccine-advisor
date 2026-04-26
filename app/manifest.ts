import type { MetadataRoute } from "next";
import { SEO_DEFAULTS } from "@/lib/seo";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SEO_DEFAULTS.site_name,
    short_name: "Vaccine Advisor",
    description:
      "Search any country and see which travel vaccines CDC recommends.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f9fa",
    theme_color: SEO_DEFAULTS.theme_color,
    icons: [
      { src: SEO_DEFAULTS.icons.icon_192, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: SEO_DEFAULTS.icons.icon_512, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: SEO_DEFAULTS.icons.icon_192, sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: SEO_DEFAULTS.icons.icon_512, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
