import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Layout from "@/components/Layout";
import { clinicsMy, getClinic, formatPrice, buildClinicJsonLd, cityToSlug } from "@/lib/clinics";
import styles from "./page.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return clinicsMy.map((c) => ({
    city: cityToSlug(c.city),
    "clinic-slug": c.clinic_id,
  }));
}

type Params = Promise<{ city: string; "clinic-slug": string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { "clinic-slug": id } = await params;
  const clinic = getClinic(id);
  if (!clinic) return { title: "Clinic Not Found" };
  return {
    title: `${clinic.clinic_name} — Travel Vaccines ${clinic.city}, Malaysia`,
    description: `${clinic.clinic_name} in ${clinic.city}, Malaysia. Vaccines offered, prices, address, and booking information.`,
    alternates: {
      canonical: `https://travelvaccineadvisor.com/clinics/malaysia/${cityToSlug(clinic.city)}/${id}/`,
    },
  };
}

export default async function MalaysiaClinicDetailPage({ params }: { params: Params }) {
  const { city: citySlug, "clinic-slug": id } = await params;
  const clinic = getClinic(id);
  if (!clinic) notFound();

  const jsonLd = buildClinicJsonLd(clinic);
  const vaccinesWithPrice = clinic.vaccines.filter((v) => v.price_local != null);
  const vaccinesNoPrice = clinic.vaccines.filter((v) => v.price_local == null);

  return (
    <Layout active="clinics">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <p className={styles.breadcrumb}>
          <Link href="/">Home</Link> ›{" "}
          <Link href={`/clinics/malaysia/${citySlug}/`}>{clinic.city} Clinics</Link> ›{" "}
          {clinic.clinic_name}
        </p>

        <div className={styles.heroWrap}>
          <img
            src={clinic.photo_path ?? "/images/clinic-placeholder.svg"}
            alt={`${clinic.clinic_name} clinic`}
            className={styles.hero}
            width={800}
            height={450}
          />
        </div>

        <header className={styles.header}>
          <h1 className={styles.title}>{clinic.clinic_name}</h1>
          {clinic.parent_chain && clinic.parent_chain !== "Independent" && (
            <p className={styles.chain}>{clinic.parent_chain}</p>
          )}
          <div className={styles.badges}>
            {clinic.walk_in && <span className={styles.badge}>Walk-in available</span>}
            {clinic.appt_required && (
              <span className={styles.badge}>Appointment required</span>
            )}
            {clinic.content?.travel_specialist && (
              <span className={`${styles.badge} ${styles.badgeSpecialist}`}>
                Travel Medicine Specialist
              </span>
            )}
            {clinic.content?.yf_licensed && (
              <span className={`${styles.badge} ${styles.badgeYf}`}>
                🟡 Yellow Fever Licensed
              </span>
            )}
            {clinic.status === "GOV" && (
              <span className={`${styles.badge} ${styles.badgeGov}`}>Government clinic</span>
            )}
          </div>
          {clinic.content?.services_summary && (
            <p className={styles.servicesSummary}>{clinic.content.services_summary}</p>
          )}
          {clinic.content?.certifications && clinic.content.certifications.length > 0 && (
            <div className={styles.certs}>
              {clinic.content.certifications.map((cert, i) => (
                <span key={i} className={styles.cert}>✓ {cert}</span>
              ))}
            </div>
          )}
        </header>

        <div className={styles.grid}>
          <section className={styles.details}>
            <h2 className={styles.sectionTitle}>Clinic Details</h2>
            <dl className={styles.detailList}>
              {clinic.address && (
                <>
                  <dt>Address</dt>
                  <dd>{clinic.address}{clinic.postal_code ? `, ${clinic.postal_code}` : ""}</dd>
                </>
              )}
              {clinic.nearest_transit && (
                <>
                  <dt>Nearest Transit</dt>
                  <dd>{clinic.nearest_transit}</dd>
                </>
              )}
              {clinic.phone && (
                <>
                  <dt>Phone</dt>
                  <dd><a href={`tel:${clinic.phone}`}>{clinic.phone}</a></dd>
                </>
              )}
              {clinic.email && (
                <>
                  <dt>Email</dt>
                  <dd><a href={`mailto:${clinic.email}`}>{clinic.email}</a></dd>
                </>
              )}
              {clinic.hours_summary && (
                <>
                  <dt>Hours</dt>
                  <dd>{clinic.hours_summary}</dd>
                </>
              )}
              {clinic.languages && clinic.languages.length > 0 && (
                <>
                  <dt>Languages</dt>
                  <dd>{clinic.languages.join(", ")}</dd>
                </>
              )}
            </dl>

            <div className={styles.ctaRow}>
              {clinic.website_url && (
                <a
                  href={clinic.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.btnPrimary}
                >
                  Book / Visit Website →
                </a>
              )}
            </div>
          </section>

          <section className={styles.vaccines}>
            <h2 className={styles.sectionTitle}>Vaccines & Prices</h2>
            {vaccinesWithPrice.length > 0 && (
              <table className={styles.priceTable}>
                <thead>
                  <tr>
                    <th>Vaccine</th>
                    <th>Price (MYR)</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {vaccinesWithPrice.map((v, i) => (
                    <tr key={`${v.vaccine_slug}-${i}`}>
                      <td>{v.vaccine_name}</td>
                      <td className={styles.price}>{formatPrice(v)}</td>
                      <td className={styles.noteCell}>{v.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {vaccinesNoPrice.length > 0 && (
              <div className={styles.unpriced}>
                <p className={styles.unpricedLabel}>Also available (call for price):</p>
                <div className={styles.tagList}>
                  {vaccinesNoPrice.map((v, i) => (
                    <span key={`${v.vaccine_slug}-${i}`} className={styles.tag}>
                      {v.vaccine_name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {clinic.content?.consult_note && (
              <p className={styles.consultNote}>
                💬 <strong>Consultation:</strong> {clinic.content.consult_note}
              </p>
            )}
            <p className={styles.priceNote}>
              Prices last updated: {vaccinesWithPrice[0]?.price_last_updated ?? "—"}.
              Always confirm with the clinic before visiting.
            </p>
          </section>
        </div>

        <aside className={styles.disclaimer}>
          <p>
            Travel Vaccine Advisor is an independent directory. We do not book
            appointments or hold vaccination records.{" "}
            <Link href="/disclaimer">Full disclaimer</Link>
          </p>
        </aside>
      </div>
    </Layout>
  );
}
