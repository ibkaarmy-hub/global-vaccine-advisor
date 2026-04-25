import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Layout from "@/components/Layout";
import CountryResults from "@/components/CountryResults";
import { countries, getCountry } from "@/lib/data";
import { getCountrySeo, buildMetadata, notFoundMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return countries.map((c) => ({ country: c.id }));
}

type Params = Promise<{ country: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { country: id } = await params;
  const seo = getCountrySeo(id);
  if (!seo) return notFoundMetadata("Country");
  return buildMetadata(seo, { ogType: "article" });
}

export default async function CountryPage({ params }: { params: Params }) {
  const { country: id } = await params;
  const country = getCountry(id);
  const seo = getCountrySeo(id);
  if (!country || !seo) notFound();

  return (
    <Layout active="destinations">
      {/* FAQ JSON-LD for AI Overviews and rich-result eligibility — per
          stages/05-seo/output/seo-metadata.json */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.faq_schema) }}
      />
      <CountryResults country={country} />
    </Layout>
  );
}
