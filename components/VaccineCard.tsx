import Link from "next/link";
import { type Vaccine } from "@/lib/data";
import styles from "./VaccineCard.module.css";

type Props = {
  vaccine: Vaccine;
  variant?: "card" | "row";
};

export default function VaccineCard({ vaccine, variant = "card" }: Props) {
  const href = `/vaccine/${vaccine.id}`;

  if (variant === "row") {
    return (
      <Link href={href} className={`${styles.row}`}>
        <div className={styles.rowBody}>
          <div className={styles.rowHead}>
            <span className={styles.tag}>{vaccine.transmission}</span>
            <h3 className={styles.rowTitle}>{vaccine.name}</h3>
          </div>
          <p className={styles.rowDesc}>{vaccine.brief_description}</p>
        </div>
        <span aria-hidden="true" className={`material-symbols-outlined ${styles.chev}`}>
          chevron_right
        </span>
      </Link>
    );
  }

  return (
    <Link href={href} className={styles.card}>
      <span className={styles.tag}>{vaccine.transmission}</span>
      <h3 className={styles.cardTitle}>{vaccine.name}</h3>
      <p className={styles.cardDesc}>{vaccine.brief_description}</p>
      <p className={styles.cardMeta}>{vaccine.timing_note}</p>
    </Link>
  );
}
