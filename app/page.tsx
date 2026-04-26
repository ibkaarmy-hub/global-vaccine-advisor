import Link from "next/link";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import { countries } from "@/lib/data";
import styles from "./page.module.css";

const POPULAR_IDS = [
  "thailand",
  "india",
  "kenya",
  "mexico",
  "japan",
  "indonesia",
  "vietnam",
  "peru",
];

export default function HomePage() {
  const popular = POPULAR_IDS.map((id) => countries.find((c) => c.id === id)).filter(
    (c): c is NonNullable<typeof c> => Boolean(c)
  );

  const alertTitles = countries
    .flatMap((c) => c.current_alerts.map((a) => a.title))
    .slice(0, 3);

  return (
    <Layout active="destinations">
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.badge}>
            <span aria-hidden="true" className="material-symbols-outlined">
              verified
            </span>
            <span>Based on CDC Yellow Book 2026</span>
          </div>
          <h1 className={styles.h1}>
            Know exactly what vaccines you need before you travel.
          </h1>
          <p className={styles.sub}>
            Clear, honest travel vaccine advice based on CDC recommendations. No
            clinic pitches, no prices — just what you need to know.
          </p>
          <SearchBar />
          <div className={styles.chips}>
            <span className={styles.chipsLabel}>Popular destinations</span>
            {popular.map((c) => (
              <Link
                key={c.id}
                href={`/destination/${c.id}`}
                className={styles.chip}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {alertTitles.length > 0 && (
        <div className={styles.alertStrip}>
          <div className={styles.alertInner}>
            <span
              aria-hidden="true"
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              warning
            </span>
            <p className={styles.alertText}>
              <strong>Current CDC alerts:</strong> {alertTitles.join(" · ")}
            </p>
            <Link href="/alerts" className={styles.alertLink}>
              <span className={styles.alertLinkLabel}>View all alerts</span>
              <span aria-hidden="true" className="material-symbols-outlined">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      )}

      <section className={styles.steps}>
        <div className={styles.stepsInner}>
          <h2 className={styles.h2}>How it works</h2>
          <div className={styles.stepsGrid}>
            <div className={styles.step}>
              <div className={styles.stepNum}>1</div>
              <h3 className={styles.stepH}>Search your destination</h3>
              <p className={styles.stepP}>
                Enter any country and we pull CDC&apos;s current vaccine
                recommendations.
              </p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNum}>2</div>
              <h3 className={styles.stepH}>See what&apos;s required and recommended</h3>
              <p className={styles.stepP}>
                Three clear tiers — Required for entry, Recommended for most,
                Recommended for some — plus malaria and current alerts.
              </p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNum}>3</div>
              <h3 className={styles.stepH}>Find a travel clinic</h3>
              <p className={styles.stepP}>
                We link out to clinic finders so you can book an appointment near
                you 4–6 weeks before departure.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.bento}>
        <div className={styles.bentoInner}>
          <div className={styles.bentoPrimary}>
            <h2 className={styles.bentoH}>One trustworthy source. One-minute read.</h2>
            <p className={styles.bentoP}>
              Thousands of pages of CDC guidance distilled into the answer you
              actually need: what vaccines should you get for your trip?
            </p>
            <Link href="/about#sources" className={styles.bentoCta}>
              See how we source our data
              <span aria-hidden="true" className="material-symbols-outlined">
                arrow_forward
              </span>
            </Link>
          </div>
          <div className={styles.bentoNews}>
            <span
              aria-hidden="true"
              className={`material-symbols-outlined ${styles.bentoNewsIcon}`}
            >
              mark_email_unread
            </span>
            <h3 className={styles.bentoNewsH}>Travel health updates</h3>
            <p className={styles.bentoNewsP}>
              A monthly email: new outbreak alerts, one featured destination, one
              myth-busting tip. No spam.
            </p>
            <form className={styles.form} aria-label="Subscribe to travel health updates">
              <input
                type="email"
                placeholder="you@email.com"
                aria-label="Email address"
                className={styles.formInput}
                required
              />
              <button type="submit" className={styles.formBtn}>
                Subscribe
              </button>
            </form>
            <p className={styles.formNote}>
              We never share your email. Unsubscribe any time.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
