import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Layout from "@/components/Layout";
import VaccineDetail from "@/components/VaccineDetail";
import { vaccines, getVaccine, getVaccineContent } from "@/lib/data";
import { getVaccineSeo, buildMetadata, notFoundMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return vaccines.map((v) => ({ vaccine: v.id }));
}

type Params = Promise<{ vaccine: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { vaccine: id } = await params;
  const seo = getVaccineSeo(id);
  if (!seo) return notFoundMetadata("Vaccine");
  return buildMetadata(seo, { ogType: "article" });
}

export default async function VaccinePage({ params }: { params: Params }) {
  const { vaccine: id } = await params;
  const vaccine = getVaccine(id);
  if (!vaccine) notFound();

  // FAQ JSON-LD built from Stage 04 vaccines-content.json. Gives every vaccine
  // page rich-result eligibility for AI Overviews and Google FAQ rich results.
  const content = getVaccineContent(id);
  const faqSchema =
    content && content.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: content.faq.map((qa) => ({
            "@type": "Question",
            name: qa.q,
            acceptedAnswer: { "@type": "Answer", text: qa.a },
          })),
        }
      : null;

  return (
    <Layout active="vaccines">
      {faqSchema && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <VaccineDetail vaccine={vaccine} />
    </Layout>
  );
}
