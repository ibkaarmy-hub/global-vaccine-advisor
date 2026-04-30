import type { Metadata } from "next";
import Link from "next/link";
import Layout from "@/components/Layout";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Find a Travel Vaccine Clinic | Singapore & Malaysia",
  description:
    "Find travel vaccine clinics in Singapore and Malaysia. Compare yellow fever, typhoid, rabies, hepatitis and other vaccine prices. Book direct.",
  alternates: {
    canonical: "https://travelvaccineadvisor.com/clinics/",
  },
};

const COUNTRIES = [
  {
    name: "Singapore",
    href: "/clinics/singapore/",
    tagline: "MOH-licensed yellow fever centres, walk-in clinics, and specialist travel medicine",
    cities: ["CBD", "Orchard", "Jurong", "Tampines", "Woodlands"],
    flag: "🇸🇬",
    photo: "/images/countries/singapore.jpg",
    stat: "30 clinics",
  },
  {
    name: "Malaysia",
    href: "/clinics/malaysia/",
    tagline: "Clinics across 14 cities — Johor Bahru, Kuala Lumpur, Penang, Kota Kinabalu and more",
    cities: ["Johor Bahru", "Kuala Lumpur", "Penang", "Kota Kinabalu", "Ipoh"],
    flag: "🇲🇾",
    photo: "/images/countries/malaysia.jpg",
    stat: "49 clinics · 14 cities",
  },
];

export default function ClinicLandingPage() {
  return (
    <Layout active="clinics">
      <div className={styles.page}>
        <div className={styles.intro}>
          <h1 className={styles.heading}>Find a Travel Vaccine Clinic</h1>
          <p className={styles.sub}>
            Compare prices, check availability, and book direct — no middleman.
          </p>
        </div>

        <div className={styles.grid}>
          {COUNTRIES.map((country) => (
            <Link key={country.name} href={country.href} className={styles.card}
              style={{
                "--bg-photo": `url(${country.photo})`,
              } as React.CSSProperties}
            >
              <div className={styles.cardBg} />
              <div className={styles.cardContent}>
                <h2 className={styles.country}>{country.name}</h2>
                <p className={styles.stat}>{country.stat}</p>
                <span className={styles.cta}>Browse clinics →</span>
              </div>
            </Link>
          ))}
        </div>

        <div className={styles.moreComingSoon}>
          <p>🌏 Thailand, Indonesia & Vietnam — coming soon</p>
        </div>
      </div>
    </Layout>
  );
}
