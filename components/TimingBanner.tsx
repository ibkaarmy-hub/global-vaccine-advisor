import styles from "./TimingBanner.module.css";

export default function TimingBanner() {
  return (
    <div className={styles.wrap} role="note">
      <span
        aria-hidden="true"
        className="material-symbols-outlined"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        schedule
      </span>
      <span>See a travel doctor 4–6 weeks before you leave.</span>
    </div>
  );
}
