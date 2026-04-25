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
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700;800;900&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
