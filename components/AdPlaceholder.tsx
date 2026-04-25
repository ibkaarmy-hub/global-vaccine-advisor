import styles from "./AdPlaceholder.module.css";

type Props = {
  variant: "sidebar" | "bottom";
  label?: string;
};

/**
 * Ad slot. Stage 06 fills in the creative. Per design rules this must never
 * appear between VaccineCard items — pass it only to page-level slots.
 */
export default function AdPlaceholder({
  variant,
  label = "Featured partner",
}: Props) {
  return (
    <aside
      className={`${styles.wrap} ${styles[variant]}`}
      aria-label="Advertisement"
    >
      <span className={styles.label}>{label}</span>
      <div className={styles.body}>
        <p className={styles.note}>Ad slot — {variant}</p>
      </div>
    </aside>
  );
}
