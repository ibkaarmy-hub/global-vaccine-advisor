import type { Metadata } from "next";
import Link from "next/link";
import Layout from "@/components/Layout";
import { clinicsSg, formatPrice, cityToSlug } from "@/lib/clinics";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Travel Vaccine Clinics in Singapore | Find & Compare Prices",
  description:
    "Find travel vaccine clinics in Singapore. Compare yellow fever, typhoid, rabies, hepatitis A and other vaccine prices across 30+ clinics.",
  alternates: {
    canonical: "https://travelvaccineadvisor.com/clinics/singapore/",
  },
};

const PRIORITY_VACCINES = ["yellow-fever", "typhoid", "rabies", "hepatitis-a", "hepatitis-b"];

export default function SingaporeClinicHub() {
  const liveClinics = clinicsSg.filter((c) => c.status === "LIVE" || c.status === "VERIFY");

  return (
    <Layout active="clinics">
      <div className={styles.container}>
        <header className={styles.header}>
          <p className={styles.breadcrumb}>
            <Link href="/">Home</Link> › Clinics › Singapore
          </p>
          <h1 className={styles.title}>Travel Vaccine Clinics in Singapore</h1>
          <p className={styles.subtitle}>
            {liveClinics.length} clinics listed · Compare prices · Book direct
          </p>
        </header>

        <div className={styles.clinicList}>
          {liveClinics.map((clinic) => {
            const yf = clinic.vaccines.find((v) => v.vaccine_slug === "yellow-fever");
            const typhoid = clinic.vaccines.find((v) => v.vaccine_slug === "typhoid");
            const priceVaccines = clinic.vaccines.filter(
              (v) => v.price_local != null && PRIORITY_VACCINES.includes(v.vaccine_slug)
            );

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
                    <Link href={`/clinics/singapore/${clinic.clinic_id}/`}>
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
                      {priceVaccines.map((v, i) => (
                        <span key={`${v.vaccine_slug}-${i}`} className={styles.priceTag}>
                          {v.vaccine_name}: <strong>{formatPrice(v)}</strong>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className={styles.badges}>
                    {clinic.walk_in && (
                      <span className={styles.badge}>Walk-in</span>
                    )}
                    {yf && (
                      <span className={`${styles.badge} ${styles.badgeYf}`}>
                        🟡 Yellow Fever
                      </span>
                    )}
                  </div>
                  <div className={styles.actions}>
                    <Link
                      href={`/clinics/singapore/${clinic.clinic_id}/`}
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
