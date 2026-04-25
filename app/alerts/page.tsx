import Link from "next/link";
import type { Metadata } from "next";
import Layout from "@/components/Layout";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import { countries, countryFlag } from "@/lib/data";
import { buildMetadata, getPageSeo } from "@/lib/seo";
import styles from "./page.module.css";

export const metadata: Metadata = buildMetadata(getPageSeo("alerts"));

export default function AlertsPage() {
  const entries = countries
    .flatMap((c) =>
      c.current_alerts.map((a) => ({ country: c, alert: a }))
    )
    .sort((a, b) => b.alert.date_added.localeCompare(a.alert.date_added));

  return (
    <Layout active="alerts">
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.h1}>Current travel health alerts</h1>
          <p className={styles.lead}>
            Time-sensitive CDC travel health notices. Each alert is reviewed quarterly
            against the CDC country page.
          </p>
        </header>

        {entries.length === 0 ? (
          <div className={styles.empty}>
            <p>No current alerts. Check back later.</p>
          </div>
        ) : (
          <ul className={styles.list}>
            {entries.map(({ country, alert }) => (
              <li key={`${country.id}-${alert.id}`} className={styles.item}>
                <div className={styles.itemHead}>
                  <Link href={`/destination/${country.id}`} className={styles.country}>
                    {countryFlag(country.id) && (
                      <span aria-hidden="true">{countryFlag(country.id)} </span>
                    )}
                    {country.name}
                  </Link>
                  <span className={styles.date}>{alert.date_added}</span>
                </div>
                <h2 className={styles.itemH}>{alert.title}</h2>
                <p className={styles.itemP}>{alert.detail}</p>
                <p className={styles.source}>Source: {alert.source}</p>
              </li>
            ))}
          </ul>
        )}

        <div className={styles.disclaimer}>
          <DisclaimerBanner />
        </div>
      </main>
    </Layout>
  );
}
