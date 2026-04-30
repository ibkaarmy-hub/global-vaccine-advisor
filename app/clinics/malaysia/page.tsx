import type { Metadata } from "next";
import Link from "next/link";
import Layout from "@/components/Layout";
import { myCities, cityToSlug, getClinicsByCity } from "@/lib/clinics";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Travel Vaccine Clinics in Malaysia | Find by City",
  description:
    "Find travel vaccine clinics across Malaysia. Browse by city — Kuala Lumpur, Johor Bahru, Penang, Kota Kinabalu and more.",
  alternates: {
    canonical: "https://travelvaccineadvisor.com/clinics/malaysia/",
  },
};

export default function MalaysiaHub() {
  const cityData = myCities.map((city) => {
    const clinics = getClinicsByCity(city).filter(
      (c) => c.status === "LIVE" || c.status === "VERIFY"
    );
    const hasYf = clinics.some((c) =>
      c.vaccines.some((v) => v.vaccine_slug === "yellow-fever")
    );
    return { city, slug: cityToSlug(city), count: clinics.length, hasYf };
  }).sort((a, b) => b.count - a.count);

  return (
    <Layout active="clinics">
      <div className={styles.container}>
        <p className={styles.breadcrumb}>
          <Link href="/">Home</Link> › <Link href="/clinics/">Find a Clinic</Link> › Malaysia
        </p>

        <header className={styles.header}>
          <h1 className={styles.title}>Travel Vaccine Clinics in Malaysia</h1>
          <p className={styles.subtitle}>
            {cityData.reduce((s, c) => s + c.count, 0)} clinics across{" "}
            {cityData.length} cities · Compare prices · Book direct
          </p>
        </header>

        <div className={styles.cityGrid}>
          {cityData.map(({ city, slug, count, hasYf }) => (
            <Link key={city} href={`/clinics/malaysia/${slug}/`} className={styles.cityCard}>
              <div className={styles.cityName}>{city}</div>
              <div className={styles.cityMeta}>
                <span className={styles.clinicCount}>{count} clinic{count !== 1 ? "s" : ""}</span>
                {hasYf && <span className={styles.yfBadge}>🟡 Yellow Fever</span>}
              </div>
              <span className={styles.arrow}>→</span>
            </Link>
          ))}
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
