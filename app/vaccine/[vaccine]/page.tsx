import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Layout from "@/components/Layout";
import VaccineDetail from "@/components/VaccineDetail";
import { vaccines, getVaccine } from "@/lib/data";
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

  return (
    <Layout active="vaccines">
      <VaccineDetail vaccine={vaccine} />
    </Layout>
  );
}
