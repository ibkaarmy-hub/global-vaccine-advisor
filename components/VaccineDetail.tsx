import Link from "next/link";
import {
  countriesRecommending,
  countryFlag,
  countryTier,
  type Vaccine,
} from "@/lib/data";
import DisclaimerBanner from "./DisclaimerBanner";
import styles from "./VaccineDetail.module.css";

type Props = { vaccine: Vaccine };

export default function VaccineDetail({ vaccine }: Props) {
  const countries = countriesRecommending(vaccine.id);
  const mostCountries = countries.filter(
    (c) => countryTier(c, vaccine.id) === "most"
  );
  const someCountries = countries.filter(
    (c) => countryTier(c, vaccine.id) === "some"
  );

  return (
    <main className={styles.main}>
      <Link href="/" className={styles.back}>
        <span aria-hidden="true" className="material-symbols-outlined">
          arrow_back
        </span>
        All vaccines
      </Link>

      <header className={styles.header}>
        <div className={styles.tags}>
          <span className={styles.transmissionPill}>{vaccine.transmission}</span>
          <span className={styles.typePill}>
            {vaccine.is_routine ? "Routine vaccine" : "Travel vaccine"}
          </span>
        </div>
        <h1 className={styles.h1}>{vaccine.name}</h1>
        <p className={styles.lead}>{vaccine.brief_description}</p>
      </header>

      <div className={styles.bento}>
        <section className={`${styles.tile} ${styles.tile7}`}>
          <div className={styles.tileHead}>
            <span aria-hidden="true" className={`material-symbols-outlined ${styles.tileIcon}`}>
              schedule
            </span>
            <h2 className={styles.tileH}>Dosing &amp; timing</h2>
          </div>
          <p className={styles.tileP}>{vaccine.timing_note}</p>
        </section>

        <section className={`${styles.tile} ${styles.tile5} ${styles.tilePrimary}`}>
          <div className={styles.tileHead}>
            <span aria-hidden="true" className="material-symbols-outlined">
              groups
            </span>
            <h2 className={styles.tileH}>Who should consider it</h2>
          </div>
          <p className={styles.tileP}>
            Travellers to destinations where CDC lists {vaccine.name} under
            &ldquo;recommended for most&rdquo; or &ldquo;recommended for some&rdquo;.
            See the country list below for destinations on this site. Your travel
            doctor will tailor the decision to your itinerary, duration, and health.
          </p>
        </section>

        {(mostCountries.length > 0 || someCountries.length > 0) && (
          <section className={`${styles.tile} ${styles.tile12}`}>
            <div className={styles.tileHead}>
              <span aria-hidden="true" className={`material-symbols-outlined ${styles.tileIcon}`}>
                public
              </span>
              <h2 className={styles.tileH}>Countries where CDC recommends this</h2>
            </div>
            <p className={styles.tileNote}>
              Click any country for its full vaccine list.
            </p>
            {mostCountries.length > 0 && (
              <>
                <p className={styles.groupLabel}>Recommended for most travellers</p>
                <div className={styles.pills}>
                  {mostCountries.map((c) => (
                    <Link
                      key={c.id}
                      href={`/destination/${c.id}`}
                      className={styles.countryPill}
                    >
                      {countryFlag(c.id) && (
                        <span aria-hidden="true">{countryFlag(c.id)} </span>
                      )}
                      {c.name}
                    </Link>
                  ))}
                </div>
              </>
            )}
            {someCountries.length > 0 && (
              <>
                <p className={styles.groupLabel}>Recommended for some travellers</p>
                <div className={styles.pills}>
                  {someCountries.map((c) => (
                    <Link
                      key={c.id}
                      href={`/destination/${c.id}`}
                      className={styles.countryPill}
                    >
                      {countryFlag(c.id) && (
                        <span aria-hidden="true">{countryFlag(c.id)} </span>
                      )}
                      {c.name}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        <section className={`${styles.tile} ${styles.tile12} ${styles.tileMuted}`}>
          <div className={styles.tileHead}>
            <span aria-hidden="true" className={`material-symbols-outlined ${styles.tileIcon}`}>
              info
            </span>
            <h2 className={styles.tileH}>Side effects and safety</h2>
          </div>
          <p className={styles.tileP}>
            Most travel vaccine reactions are mild — soreness at the injection site,
            low-grade fever, headache, or tiredness for a day or two. Serious
            reactions are rare.{" "}
            <a
              className={styles.link}
              href="https://www.cdc.gov/vaccines/basics/possible-side-effects.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more about vaccine safety on CDC
            </a>
            .
          </p>
        </section>
      </div>

      <DisclaimerBanner
        withSource={{
          label: `CDC — ${vaccine.name}`,
          href: vaccine.cdc_url,
        }}
      />
    </main>
  );
}
