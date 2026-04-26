import Link from "next/link";
import {
  countryFlag,
  getCountryContent,
  getDestinationReferences,
  getVaccine,
  routineVaccines,
  type Country,
  type DestinationReferenceLink,
} from "@/lib/data";
import VaccineCard from "./VaccineCard";
import TimingBanner from "./TimingBanner";
import DisclaimerBanner from "./DisclaimerBanner";
import AdPlaceholder from "./AdPlaceholder";
import styles from "./CountryResults.module.css";

type Props = { country: Country };

export default function CountryResults({ country }: Props) {
  const most = country.recommended_most_vaccines
    .map((id) => getVaccine(id))
    .filter((v): v is NonNullable<typeof v> => Boolean(v));

  const some = country.recommended_some_vaccines
    .map((id) => getVaccine(id))
    .filter((v): v is NonNullable<typeof v> => Boolean(v));

  const required = country.required_vaccines
    .map((id) => getVaccine(id))
    .filter((v): v is NonNullable<typeof v> => Boolean(v));

  const conditional = country.conditional_requirements
    .map((r) => {
      const v = getVaccine(r.vaccine_id);
      return v ? { vaccine: v, condition: r.condition } : null;
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const flag = countryFlag(country.id);
  const content = getCountryContent(country.id);
  const er = country.entry_requirements;
  const refs = getDestinationReferences(country.id);
  const refLinks: { label: string; href: string }[] = [];
  const pushRef = (label: string, link?: DestinationReferenceLink) => {
    if (!link) return;
    const href = link.deep_url ?? link.search_url;
    if (href) refLinks.push({ label, href });
  };
  if (refs) {
    pushRef(`PHAC (Canada) — ${country.name}`, refs.phac);
    pushRef(`Smartraveller (Australia) — ${country.name}`, refs.smartraveller);
    pushRef(`NaTHNaC (UK) — ${country.name}`, refs.nathnac);
    pushRef(`WHO — ${country.name}`, refs.who);
  }

  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <Link href="/" className={styles.back}>
          <span aria-hidden="true" className="material-symbols-outlined">
            arrow_back
          </span>
          All destinations
        </Link>

        <header className={styles.header}>
          <h1 className={styles.h1}>
            {flag && <span aria-hidden="true">{flag} </span>}
            {country.name}
          </h1>
          <p className={styles.sub}>
            {country.region} · Updated April 2026
          </p>

          <div className={styles.banners}>
            <TimingBanner />
            {country.current_alerts.map((a) => (
              <div key={a.id} className={styles.alert}>
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  campaign
                </span>
                <div>
                  <p className={styles.alertTitle}>Current alert — {a.title}</p>
                  <p className={styles.alertDetail}>{a.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </header>

        {content && (
          <section className={styles.intro}>
            <p className={styles.introBody}>{content.intro}</p>
            {content.seasonal_note && (
              <p className={styles.seasonal}>
                <span
                  aria-hidden="true"
                  className={`material-symbols-outlined ${styles.seasonalIcon}`}
                >
                  info
                </span>
                <span>{content.seasonal_note}</span>
              </p>
            )}
          </section>
        )}

        {/* Required for entry */}
        <section className={styles.section}>
          <h2 className={styles.h2}>
            <span className={`${styles.dot} ${styles.dotRequired}`} />
            Required for entry
          </h2>
          {required.length > 0 ? (
            <div className={styles.grid3}>
              {required.map((v) => (
                <VaccineCard key={v.id} vaccine={v} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyBox}>
              <span aria-hidden="true" className={`material-symbols-outlined ${styles.emptyIcon}`}>
                check_circle
              </span>
              <div>
                <p className={styles.emptyLead}>
                  No vaccines are currently required for entry to {country.name} from
                  most countries.
                </p>
                {conditional.length > 0 && (
                  <p className={styles.emptyNote}>
                    <strong>Exception:</strong>{" "}
                    {conditional.map((c, i) => (
                      <span key={c.vaccine.id}>
                        Proof of{" "}
                        <Link
                          className={styles.link}
                          href={`/vaccine/${c.vaccine.id}`}
                        >
                          {c.vaccine.name} vaccination
                        </Link>{" "}
                        — {c.condition}
                        {i < conditional.length - 1 ? " " : ""}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Recommended for most */}
        {most.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <h2 className={styles.h2}>
                <span className={`${styles.dot} ${styles.dotMost}`} />
                Recommended for most travellers
              </h2>
              <p className={styles.sectionNote}>
                CDC advises these for all visitors to {country.name}.
              </p>
            </div>
            <div className={styles.grid3}>
              {most.map((v) => (
                <VaccineCard key={v.id} vaccine={v} />
              ))}
            </div>
          </section>
        )}

        {/* Recommended for some */}
        {some.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <h2 className={styles.h2}>
                <span className={`${styles.dot} ${styles.dotSome}`} />
                Recommended for some travellers
              </h2>
              <p className={styles.sectionNote}>
                Depends on your itinerary, activities, duration, or health.
              </p>
            </div>
            <div className={styles.stack}>
              {some.map((v) => (
                <VaccineCard key={v.id} vaccine={v} variant="row" />
              ))}
            </div>
          </section>
        )}

        {/* Malaria */}
        {country.malaria_note && (
          <section className={styles.section}>
            <div className={styles.malaria}>
              <div className={styles.malariaHead}>
                <span aria-hidden="true" className="material-symbols-outlined">
                  pest_control
                </span>
                <h2 className={styles.malariaH}>Malaria</h2>
                <span className={styles.malariaBadge}>Not a vaccine</span>
              </div>
              <p className={styles.malariaBody}>{country.malaria_note}</p>
              <div className={styles.malariaNote}>
                <span aria-hidden="true" className="material-symbols-outlined">
                  info
                </span>
                <span>
                  Discuss prescription chemoprophylaxis with a travel doctor if your
                  itinerary includes risk areas.
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Routine + Entry */}
        <div className={styles.twoCol}>
          <div>
            <h3 className={styles.miniH}>Routine vaccines to be up to date on</h3>
            <p className={styles.miniNote}>
              CDC advises every international traveller to have these current.
            </p>
            <div className={styles.accordionStack}>
              {routineVaccines.map((v) => (
                <details key={v.id} className={styles.accordion}>
                  <summary className={styles.summary}>
                    {v.name}
                    <span
                      aria-hidden="true"
                      className={`material-symbols-outlined ${styles.summaryIcon}`}
                    >
                      expand_more
                    </span>
                  </summary>
                  <div className={styles.accordionBody}>{v.timing_note}</div>
                </details>
              ))}
            </div>
          </div>

          <div>
            <h3 className={styles.miniH}>Entry requirements</h3>
            <p className={styles.miniNote}>
              For US citizens. Non-US travellers should check their government&apos;s
              guidance.
            </p>
            <div className={styles.entry}>
              {er.passport_validity_months !== null && (
                <div className={styles.entryRow}>
                  <span className={styles.entryLabel}>Passport validity</span>
                  <span className={styles.entryValue}>
                    {er.passport_validity_months} months beyond travel
                  </span>
                </div>
              )}
              {er.visa_note && (
                <div className={styles.entryRow}>
                  <span className={styles.entryLabel}>Visa</span>
                  <span className={styles.entryValue}>{er.visa_note}</span>
                </div>
              )}
              <div className={styles.entryRow}>
                <span className={styles.entryLabel}>Yellow fever certificate</span>
                <span className={styles.entryValue}>
                  {er.yellow_card_required
                    ? "Required"
                    : er.yellow_card_conditional
                    ? "Only if arriving from a YF-risk country"
                    : "Not required"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {country.health_notes && (
          <section className={styles.section}>
            <div className={styles.notes}>
              <span aria-hidden="true" className={`material-symbols-outlined ${styles.notesIcon}`}>
                health_and_safety
              </span>
              <p>{country.health_notes}</p>
            </div>
          </section>
        )}

        <DisclaimerBanner
          withSource={{
            label: `CDC Travelers' Health — ${country.name}`,
            href: country.cdc_page_url,
          }}
        />
      </div>

      <aside className={styles.aside}>
        <div className={styles.asideSticky}>
          <AdPlaceholder variant="sidebar" />
          <div className={styles.links}>
            <h4 className={styles.linksH}>Related</h4>
            <ul>
              <li>
                <a href={country.cdc_page_url} target="_blank" rel="noopener noreferrer">
                  <span aria-hidden="true" className="material-symbols-outlined">
                    open_in_new
                  </span>
                  CDC {country.name} page
                </a>
              </li>
              <li>
                <Link href="/alerts">
                  <span aria-hidden="true" className="material-symbols-outlined">
                    campaign
                  </span>
                  All current alerts
                </Link>
              </li>
              <li>
                <Link href="/about#clinics">
                  <span aria-hidden="true" className="material-symbols-outlined">
                    local_hospital
                  </span>
                  Find a travel clinic
                </Link>
              </li>
            </ul>
          </div>
          {refLinks.length > 0 && (
            <div className={styles.links}>
              <h4 className={styles.linksH}>Cross-references</h4>
              <ul>
                {refLinks.map((r) => (
                  <li key={r.href}>
                    <a href={r.href} target="_blank" rel="noopener noreferrer">
                      <span aria-hidden="true" className="material-symbols-outlined">
                        open_in_new
                      </span>
                      {r.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </aside>
    </main>
  );
}
