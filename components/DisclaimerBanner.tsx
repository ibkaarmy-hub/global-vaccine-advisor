import styles from "./DisclaimerBanner.module.css";

type Props = {
  withSource?: {
    label: string;
    href: string;
  };
};

export default function DisclaimerBanner({ withSource }: Props) {
  return (
    <div className={styles.wrap}>
      {withSource && (
        <p className={styles.row}>
          <span aria-hidden="true" className={`material-symbols-outlined ${styles.icon}`}>
            menu_book
          </span>
          <span>
            <strong>Source:</strong>{" "}
            <a className={styles.link} href={withSource.href} target="_blank" rel="noopener noreferrer">
              {withSource.label}
            </a>
            .
          </span>
        </p>
      )}
      <p className={styles.row}>
        <span aria-hidden="true" className={`material-symbols-outlined ${styles.icon}`}>
          gavel
        </span>
        <span>
          <strong>Disclaimer:</strong> This information is for general guidance only,
          based on CDC Travelers&apos; Health. It does not replace advice from a qualified
          travel health professional. Consult a doctor 4–6 weeks before your trip.
        </span>
      </p>
    </div>
  );
}
