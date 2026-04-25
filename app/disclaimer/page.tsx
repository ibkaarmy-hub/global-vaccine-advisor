import Link from "next/link";
import type { Metadata } from "next";
import Layout from "@/components/Layout";
import { buildMetadata, getPageSeo } from "@/lib/seo";
import styles from "../about/page.module.css";

export const metadata: Metadata = buildMetadata(getPageSeo("disclaimer"));

export default function DisclaimerPage() {
  return (
    <Layout>
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.h1}>Disclaimer</h1>
          <p className={styles.lead}>
            Travel Vaccine Advisor is an information site. It is not a medical
            provider and does not replace advice from a qualified travel health
            professional.
          </p>
        </header>

        <section className={styles.section}>
          <h2 className={styles.h2}>General guidance only</h2>
          <p>
            The recommendations shown on this site come from CDC Travelers&apos;
            Health and the CDC Yellow Book 2026. They describe what CDC advises for
            the general traveller to each destination. Your personal vaccine plan
            depends on your age, health history, pregnancy, medications, and the
            specifics of your trip — factors only a qualified doctor can weigh.
          </p>
          <p>Consult a travel health professional 4–6 weeks before you travel.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Data freshness</h2>
          <p>
            We review country data periodically and cite the date on each country
            page. Alerts are reviewed at least quarterly against the CDC source
            notice. If you see information that disagrees with the CDC page for a
            country, trust CDC and let us know.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>No clinical or booking services</h2>
          <p>
            This site does not sell vaccines, list clinics, quote prices, or take
            bookings. See the{" "}
            <Link className={styles.link} href="/about#clinics">
              About page
            </Link>{" "}
            for how to find a travel clinic near you.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Liability</h2>
          <p>
            Information on this site is provided &ldquo;as is&rdquo;. We make no
            warranty as to fitness for a particular purpose. Your use of this
            information is at your own risk; reliance on it does not create a
            doctor-patient relationship.
          </p>
        </section>
      </main>
    </Layout>
  );
}
