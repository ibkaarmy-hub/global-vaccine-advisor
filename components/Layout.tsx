import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./Layout.module.css";

type NavKey = "destinations" | "vaccines" | "alerts" | "about" | null;

type Props = {
  children: ReactNode;
  active?: NavKey;
};

const NAV_LINKS: { key: Exclude<NavKey, null>; label: string; href: string }[] = [
  { key: "destinations", label: "Destinations", href: "/#destinations" },
  { key: "vaccines", label: "Vaccines", href: "/#vaccines" },
  { key: "alerts", label: "Alerts", href: "/alerts" },
  { key: "about", label: "About", href: "/about" },
];

export default function Layout({ children, active = null }: Props) {
  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.brand}>
            Travel Vaccine Advisor
          </Link>
          <div className={styles.links}>
            {NAV_LINKS.map((l) => {
              const isActive = active === l.key;
              return (
                <Link
                  key={l.key}
                  href={l.href}
                  className={`${styles.link} ${isActive ? styles.linkActive : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <main>{children}</main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div>
            <div className={styles.footerBrand}>Travel Vaccine Advisor</div>
            <p className={styles.footerText}>
              Independent travel vaccine information for international travellers.
              Recommendations sourced from CDC Travelers&apos; Health.
            </p>
            <p className={styles.footerCopy}>© 2026 Medlens Tech Pte Ltd.</p>
          </div>
          <div className={styles.footerLinks}>
            <Link href="/about">About</Link>
            <Link href="/disclaimer">Disclaimer</Link>
            <Link href="/about#sources">Data Sources</Link>
            <Link href="/about#clinics">Find a Clinic</Link>
            <Link href="/privacy">Privacy</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
