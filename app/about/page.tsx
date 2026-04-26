import type { Metadata } from "next";
import Layout from "@/components/Layout";
import { buildMetadata, getPageSeo } from "@/lib/seo";
import styles from "./page.module.css";

export const metadata: Metadata = buildMetadata(getPageSeo("about"));

export default function AboutPage() {
  return (
    <Layout active="about">
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.h1}>About</h1>
          <p className={styles.lead}>
            Travel Vaccine Advisor is an independent information site for
            international travellers. No clinic listings, no prices, no booking
            links — just clear, current vaccine guidance for the trip you&apos;re
            planning.
          </p>
        </header>

        <section id="sources" className={styles.section}>
          <h2 className={styles.h2}>How we source our data</h2>
          <p>
            Every country page on this site is built from{" "}
            <a
              className={styles.link}
              href="https://wwwnc.cdc.gov/travel/destinations/list"
              target="_blank"
              rel="noopener noreferrer"
            >
              CDC Travelers&apos; Health destination pages
            </a>{" "}
            and the CDC Yellow Book 2026. Required, recommended-for-most, and
            recommended-for-some tiers follow CDC&apos;s own language.
          </p>
          <p>
            Every alert on the{" "}
            <a className={styles.link} href="/alerts">
              alerts page
            </a>{" "}
            links back to CDC&apos;s source notice. Alerts are reviewed at least
            quarterly and removed or refreshed if no longer current.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>How to use this site</h2>
          <ol className={styles.steps}>
            <li>Search your destination country.</li>
            <li>
              Read the three tiers: <strong>Required</strong> for entry,{" "}
              <strong>Recommended for most</strong> travellers, and{" "}
              <strong>Recommended for some</strong> depending on your itinerary.
            </li>
            <li>
              Book an appointment with a travel health doctor 4–6 weeks before
              departure. They will adapt the plan to your age, health, and trip.
            </li>
          </ol>
        </section>

        <section id="clinics" className={styles.section}>
          <h2 className={styles.h2}>Finding a travel clinic</h2>
          <p>
            We don&apos;t list clinics or take bookings. CDC maintains a{" "}
            <a
              className={styles.link}
              href="https://wwwnc.cdc.gov/travel/page/find-clinic"
              target="_blank"
              rel="noopener noreferrer"
            >
              Find a Clinic tool
            </a>{" "}
            that lists accredited yellow-fever centres and travel health providers in
            the US. Outside the US, check the ISTM directory or your national public
            health authority.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>What this site is not</h2>
          <p>
            This is not medical advice. Vaccine decisions depend on your personal
            health history, pregnancy, medications, and the specifics of your
            itinerary — things only a qualified travel health professional can weigh.
            Consult a doctor before you travel.
          </p>
        </section>
      </main>
    </Layout>
  );
}
