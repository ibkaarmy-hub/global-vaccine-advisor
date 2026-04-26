import type { Metadata, Viewport } from "next";
import { SEO_DEFAULTS, buildMetadata, getPageSeo } from "@/lib/seo";
import "./globals.css";

/**
 * Root metadata — acts as the default for every page and supplies icons +
 * OG defaults. Per-page files override title/description/canonical via their
 * own generateMetadata() or `metadata` export.
 */
export const metadata: Metadata = {
  ...buildMetadata(getPageSeo("home")),
  icons: {
    icon: [
      { url: SEO_DEFAULTS.icons.favicon_ico, sizes: "any" },
      { url: SEO_DEFAULTS.icons.favicon_16, sizes: "16x16", type: "image/png" },
      { url: SEO_DEFAULTS.icons.favicon_32, sizes: "32x32", type: "image/png" },
      { url: SEO_DEFAULTS.icons.favicon_48, sizes: "48x48", type: "image/png" },
      { url: SEO_DEFAULTS.icons.icon_192, sizes: "192x192", type: "image/png" },
      { url: SEO_DEFAULTS.icons.icon_512, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: SEO_DEFAULTS.icons.apple_touch_icon, sizes: "180x180" }],
  },
  applicationName: SEO_DEFAULTS.site_name,
  authors: [{ name: SEO_DEFAULTS.site_name }],
  creator: SEO_DEFAULTS.site_name,
  publisher: SEO_DEFAULTS.site_name,
};

export const viewport: Viewport = {
  themeColor: SEO_DEFAULTS.theme_color,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Public Sans — only the weights we actually use (400/600/700/800).
            Was 7 weights → 4. Cuts the body-font payload roughly in half. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;600;700;800&display=swap"
        />
        {/* Material Symbols — explicit icon_names list keeps the icon-font
            payload to a small subset (~10KB) instead of the full variable
            font (~200KB+). When adding new icons in components, append the
            name here too. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=arrow_back,arrow_forward,campaign,check_circle,chevron_right,expand_more,gavel,groups,health_and_safety,info,local_hospital,location_on,mark_email_unread,menu_book,open_in_new,pest_control,public,schedule,verified,warning&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
