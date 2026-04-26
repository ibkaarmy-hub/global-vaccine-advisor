import Link from "next/link";
import type { Metadata } from "next";
import Layout from "@/components/Layout";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import {
  countries,
  countryFlag,
  globalAlerts,
  globalAlertsGeneratedAt,
  references,
} from "@/lib/data";
import { buildMetadata, getPageSeo } from "@/lib/seo";
import styles from "./page.module.css";

export const metadata: Metadata = buildMetadata(getPageSeo("alerts"));

export default function AlertsPage() {
  const countryEntries = countries
    .flatMap((c) => c.current_alerts.map((a) => ({ country: c, alert: a })))
    .sort((a, b) => b.alert.date_added.localeCompare(a.alert.date_added));

  const global = [...globalAlerts].sort((a, b) =>
    (b.published_at || "").localeCompare(a.published_at || "")
  );

  const alertSources = references.filter((r) => r.alerts_feed_url);

  return (
    <Layout active="alerts">
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.h1}>Current travel health alerts</h1>
          <p className={styles.lead}>
            Time-sensitive notices from CDC, WHO, NaTHNaC (UK), PHAC (Canada),
            Smartraveller (Australia), and ECDC. Per-country CDC notices are
            reviewed quarterly; global feeds are refreshed fortnightly.
          </p>
          {globalAlertsGeneratedAt && (
            <p className={styles.meta}>
              Global feeds last refreshed{" "}
              {new Date(globalAlertsGeneratedAt).toISOString().slice(0, 10)}.
            </p>
          )}
        </header>

        <section>
          <h2 className={styles.sectionH}>Country-specific alerts</h2>
          {countryEntries.length === 0 ? (
            <div className={styles.empty}>
              <p>No country-specific alerts. Check back later.</p>
            </div>
          ) : (
            <ul className={styles.list}>
              {countryEntries.map(({ country, alert }) => (
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
                  <h3 className={styles.itemH}>{alert.title}</h3>
                  <p className={styles.itemP}>{alert.detail}</p>
                  <p className={styles.source}>Source: {alert.source}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {global.length > 0 && (
          <section>
            <h2 className={styles.sectionH}>Global outbreak surveillance</h2>
            <p className={styles.sectionLead}>
              Latest items from the alert feeds we track. Auto-refreshed.
            </p>
            <ul className={styles.list}>
              {global.slice(0, 25).map((a) => (
                <li key={a.id} className={styles.itemMuted}>
                  <div className={styles.itemHead}>
                    <span className={styles.sourceBadge}>{a.source_name}</span>
                    {a.published_at && (
                      <span className={styles.date}>
                        {a.published_at.slice(0, 10)}
                      </span>
                    )}
                  </div>
                  <h3 className={styles.itemH}>
                    {a.url ? (
                      <a href={a.url} target="_blank" rel="noopener noreferrer">
                        {a.title}
                      </a>
                    ) : (
                      a.title
                    )}
                  </h3>
                  {a.summary && <p className={styles.itemP}>{a.summary}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className={styles.sources}>
          <h2 className={styles.sectionH}>Sources we track</h2>
          <ul className={styles.sourceList}>
            {alertSources.map((r) => (
              <li key={r.id}>
                <a href={r.homepage_url} target="_blank" rel="noopener noreferrer">
                  {r.short_name}
                </a>{" "}
                — {r.scope}
              </li>
            ))}
          </ul>
        </section>

        <div className={styles.disclaimer}>
          <DisclaimerBanner />
        </div>
      </main>
    </Layout>
  );
}
