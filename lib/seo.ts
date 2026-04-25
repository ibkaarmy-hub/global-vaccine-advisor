import type { Metadata } from "next";
import seoJson from "@/data/seo-metadata.json";

/**
 * Typed loader for Stage 05 SEO metadata.
 * Source of truth: data/seo-metadata.json (copy of
 * stages/05-seo/output/seo-metadata.json).
 *
 * Every page should call one of getPageMetadata / getCountryMetadata /
 * getVaccineMetadata to produce its Next.js Metadata object — never hand-write
 * titles or descriptions in page files.
 */

type IconMap = {
  favicon_ico: string;
  favicon_16: string;
  favicon_32: string;
  favicon_48: string;
  apple_touch_icon: string;
  icon_192: string;
  icon_512: string;
};

type SeoDefaults = {
  site_name: string;
  base_url: string;
  og_image_default: string;
  og_image_home: string;
  og_image_alt: string;
  og_image_width: number;
  og_image_height: number;
  og_image_type: string;
  twitter_card: "summary_large_image" | "summary";
  locale: string;
  theme_color: string;
  icons: IconMap;
};

type PageSeo = {
  path: string;
  title: string;
  description: string;
  og_image?: string;
};

type FaqAnswer = { "@type": "Answer"; text: string };
type FaqQuestion = {
  "@type": "Question";
  name: string;
  acceptedAnswer: FaqAnswer;
};
export type FaqSchema = {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: FaqQuestion[];
};

type CountrySeo = PageSeo & { faq_schema: FaqSchema };
type VaccineSeo = PageSeo;

type SeoFile = {
  defaults: SeoDefaults;
  pages: Record<"home" | "alerts" | "about" | "disclaimer", PageSeo>;
  countries: Record<string, CountrySeo>;
  vaccines: Record<string, VaccineSeo>;
};

const seo = seoJson as unknown as SeoFile;

export const SEO_DEFAULTS: SeoDefaults = seo.defaults;

export type StaticPageKey = keyof SeoFile["pages"];

export function getPageSeo(key: StaticPageKey): PageSeo {
  return seo.pages[key];
}

export function getCountrySeo(id: string): CountrySeo | undefined {
  return seo.countries[id];
}

export function getVaccineSeo(id: string): VaccineSeo | undefined {
  return seo.vaccines[id];
}

/**
 * Build a fully-formed Next.js Metadata object from a PageSeo entry.
 * Applies site-wide defaults for OG image, Twitter card, and locale so every
 * page emits a consistent social preview.
 */
export function buildMetadata(
  page: PageSeo,
  opts?: { ogType?: "website" | "article" }
): Metadata {
  const image = page.og_image ?? SEO_DEFAULTS.og_image_default;
  const url = SEO_DEFAULTS.base_url + page.path;
  return {
    metadataBase: new URL(SEO_DEFAULTS.base_url),
    title: page.title,
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: {
      type: opts?.ogType ?? "website",
      url,
      siteName: SEO_DEFAULTS.site_name,
      title: page.title,
      description: page.description,
      locale: SEO_DEFAULTS.locale,
      images: [
        {
          url: image,
          width: SEO_DEFAULTS.og_image_width,
          height: SEO_DEFAULTS.og_image_height,
          alt: SEO_DEFAULTS.og_image_alt,
          type: SEO_DEFAULTS.og_image_type,
        },
      ],
    },
    twitter: {
      card: SEO_DEFAULTS.twitter_card,
      title: page.title,
      description: page.description,
      images: [image],
    },
  };
}

/**
 * Fallback metadata for 404-style states, so pages that can't resolve their
 * slug don't leak a blank <title>.
 */
export function notFoundMetadata(subject: string): Metadata {
  return {
    title: `${subject} not found | ${SEO_DEFAULTS.site_name}`,
    description: `We couldn't find that ${subject.toLowerCase()}. Try searching from the home page.`,
    robots: { index: false, follow: false },
  };
}
