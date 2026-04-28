import type { Metadata } from "next";
import Layout from "@/components/Layout";
import { buildMetadata } from "@/lib/seo";
import styles from "../about/page.module.css";

export const metadata: Metadata = buildMetadata({
  path: "/privacy/",
  title: "Privacy Policy — Travel Vaccine Advisor",
  description:
    "How Travel Vaccine Advisor handles visitor data. We don't run analytics, set tracking cookies, or collect personal information from readers.",
});

export default function PrivacyPage() {
  return (
    <Layout>
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.h1}>Privacy Policy</h1>
          <p className={styles.lead}>
            Travel Vaccine Advisor is a static information site. We don&apos;t
            run analytics, set tracking cookies, or collect personal information
            from readers.
          </p>
        </header>

        <section className={styles.section}>
          <h2 className={styles.h2}>What we collect</h2>
          <p>
            Nothing directly. The site has no accounts, forms, comments, or
            search box that sends data back to us. We don&apos;t use Google
            Analytics or any other first-party tracking script.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Hosting and server logs</h2>
          <p>
            The site is served as static files from GitHub Pages. Like every web
            host, GitHub may keep short-term request logs (IP address, user
            agent, requested URL) for abuse prevention and uptime. Those logs
            are governed by GitHub&apos;s own privacy policy — we don&apos;t
            access or retain them.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Third-party resources</h2>
          <p>
            Pages load fonts and icons from Google Fonts (fonts.googleapis.com,
            fonts.gstatic.com). These requests expose your IP address to Google
            for the duration of the request, as with any site that embeds Google
            Fonts. We link out to CDC Travelers&apos; Health from country and
            vaccine pages; following those links is governed by CDC&apos;s
            privacy notice.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Cookies</h2>
          <p>
            We don&apos;t set any cookies. Your browser may receive cookies from
            the third parties listed above when their resources load.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Children</h2>
          <p>
            The site is general-audience travel health information. We don&apos;t
            knowingly collect data from anyone, including children under 13.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Changes</h2>
          <p>
            If this policy changes, the updated version will be published at
            this URL. Material changes will be reflected in the page&apos;s last
            review date in our content workflow.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Contact</h2>
          <p>
            Travel Vaccine Advisor is operated by Medlens Tech Pte Ltd. For
            privacy questions, contact us through the channel listed on the{" "}
            <a className={styles.link} href="/about">
              About page
            </a>
            .
          </p>
        </section>
      </main>
    </Layout>
  );
}
