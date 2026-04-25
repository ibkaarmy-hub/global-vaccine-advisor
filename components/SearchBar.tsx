"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { countries, type Country } from "@/lib/data";
import styles from "./SearchBar.module.css";

type Variant = "hero" | "compact";

type Props = {
  variant?: Variant;
  placeholder?: string;
};

export default function SearchBar({
  variant = "hero",
  placeholder = "Where are you travelling to?",
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const matches = useMemo<Country[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return countries
      .filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query]);

  const go = (country: Country) => {
    router.push(`/destination/${country.id}`);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const exact = countries.find(
      (c) => c.name.toLowerCase() === query.trim().toLowerCase()
    );
    const target = exact ?? matches[0];
    if (target) go(target);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!matches.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % matches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? matches.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      go(matches[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showList = open && matches.length > 0;

  return (
    <form
      className={`${styles.form} ${styles[variant]}`}
      onSubmit={onSubmit}
      role="search"
      aria-label="Search destinations"
    >
      <div className={styles.inputWrap}>
        <span aria-hidden="true" className={`material-symbols-outlined ${styles.icon}`}>
          location_on
        </span>
        <input
          type="text"
          className={styles.input}
          placeholder={placeholder}
          aria-label="Destination country"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            blurTimer.current = setTimeout(() => setOpen(false), 120);
          }}
          onKeyDown={onKeyDown}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls="search-listbox"
        />
        <button type="submit" className={styles.submit}>
          <span className={styles.submitLabel}>Search</span>
          <span aria-hidden="true" className="material-symbols-outlined">
            arrow_forward
          </span>
        </button>
      </div>
      {showList && (
        <ul
          id="search-listbox"
          role="listbox"
          className={styles.listbox}
          onMouseDown={() => {
            if (blurTimer.current) clearTimeout(blurTimer.current);
          }}
        >
          {matches.map((c, i) => (
            <li
              key={c.id}
              role="option"
              aria-selected={i === activeIndex}
              className={`${styles.option} ${i === activeIndex ? styles.optionActive : ""}`}
              onClick={() => go(c)}
            >
              <span className={styles.optionName}>{c.name}</span>
              <span className={styles.optionRegion}>{c.region}</span>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
