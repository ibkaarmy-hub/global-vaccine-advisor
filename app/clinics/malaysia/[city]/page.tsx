import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Layout from "@/components/Layout";
import {
  myCities,
  cityToSlug,
  slugToCity,
  getClinicsByCity,
  formatPrice,
} from "@/lib/clinics";
import styles from "./page.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return myCities.map((city) => ({ city: cityToSlug(city) }));
}

type Params = Promise<{ city: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { city: slug } = await params;
  const cityName = slugToCity(slug);
  if (!cityName) return { title: "City Not Found" };
  return {
    title: `Travel Vaccine Clinics in ${cityName}, Malaysia | Prices & Locations`,
    description: `Find travel vaccine clinics in ${cityName}, Malaysia. Compare yellow fever, typhoid, rabies and other vaccine prices.`,
    alternates: {
      canonical: `https://travelvaccineadvisor.com/clinics/malaysia/${slug}/`,
    },
  };
}

export default async function MalaysiaCityHub({ params }: { params: Params }) {
  const { city: slug } = await params;
  const cityName = slugToCity(slug);
  if (!cityName) notFound();

  const clinics = getClinicsByCity(cityName);
  const liveClinics = clinics.filter((c) => c.status === "LIVE" || c.status === "VERIFY");

  return (
    <Layout active="clinics">
      <div className={styles.container}>
        <p className={styles.breadcrumb}>
          <Link href="/">Home</Link> › <Link href="/clinics/malaysia/">Malaysia</Link> › {cityName}
        </p>

        <header className={styles.header}>
          <h1 className={styles.title}>
            Travel Vaccine Clinics in {cityName}, Malaysia
          </h1>
          <p className={styles.subtitle}>
            {liveClinics.length} clinics listed · Compare prices · Book direct
          </p>
        </header>

        <div className={styles.clinicList}>
          {liveClinics.map((clinic) => {
            const yf = clinic.vaccines.find((v) => v.vaccine_slug === "yellow-fever");
            const priceVaccines = clinic.vaccines.filter((v) => v.price_local != null);

            return (
              <article key={clinic.clinic_id} className={styles.clinicCard}>
                <img
                  src={clinic.photo_path ?? "/images/clinic-placeholder.svg"}
                  alt={clinic.clinic_name}
                  className={styles.cardPhoto}
                  width={120}
                  height={80}
                />
                <div className={styles.clinicInfo}>
                  <h2 className={styles.clinicName}>
                    <Link href={`/clinics/malaysia/${slug}/${clinic.clinic_id}/`}>
                      {clinic.clinic_name}
                    </Link>
                  </h2>
                  {clinic.address && (
                    <p className={styles.address}>
                      <span className={styles.icon}>📍</span> {clinic.address}
                    </p>
                  )}
                  {clinic.nearest_transit && (
                    <p className={styles.transit}>
                      <span className={styles.icon}>🚇</span> {clinic.nearest_transit}
                    </p>
                  )}
                  {clinic.phone && (
                    <p className={styles.phone}>
                      <span className={styles.icon}>📞</span>{" "}
                      <a href={`tel:${clinic.phone}`}>{clinic.phone}</a>
                    </p>
                  )}
                  {clinic.content?.highlight && (
                    <p className={styles.highlight}>✦ {clinic.content.highlight}</p>
                  )}
                </div>

                <div className={styles.clinicMeta}>
                  {priceVaccines.length > 0 && (
                    <div className={styles.prices}>
                      {priceVaccines.slice(0, 3).map((v, i) => (
                        <span key={`${v.vaccine_slug}-${i}`} className={styles.priceTag}>
                          {v.vaccine_name}: <strong>{formatPrice(v)}</strong>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className={styles.badges}>
                    {clinic.walk_in && <span className={styles.badge}>Walk-in</span>}
                    {yf && (
                      <span className={`${styles.badge} ${styles.badgeYf}`}>
                        🟡 Yellow Fever
                      </span>
                    )}
                    {clinic.status === "GOV" && (
                      <span className={`${styles.badge} ${styles.badgeGov}`}>Gov</span>
                    )}
                  </div>
                  <div className={styles.actions}>
                    <Link
                      href={`/clinics/malaysia/${slug}/${clinic.clinic_id}/`}
                      className={styles.detailLink}
                    >
                      View details →
                    </Link>
                    {clinic.website_url && (
                      <a
                        href={clinic.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.bookLink}
                      >
                        Book →
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <aside className={styles.otherCities}>
          <h3>Other cities in Malaysia</h3>
          <div className={styles.cityList}>
            {myCities
              .filter((c) => c !== cityName)
              .map((c) => (
                <Link key={c} href={`/clinics/malaysia/${cityToSlug(c)}/`} className={styles.cityLink}>
                  {c}
                </Link>
              ))}
          </div>
        </aside>

        <aside className={styles.note}>
          <p>
            Prices are for reference only and may change without notice. Always
            confirm with the clinic before visiting.{" "}
            <Link href="/disclaimer">Disclaimer</Link>
          </p>
        </aside>
      </div>
    </Layout>
  );
}
