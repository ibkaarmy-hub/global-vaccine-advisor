#!/usr/bin/env node
// Fortnightly sync from the Google Sheets clinic-data backend to data/clinics-sg.json
// and data/clinics-my.json. Reads three published-CSV tabs of the Sheet (no auth /
// API key needed — the Sheet is published-to-web read-only), validates rows, joins
// clinic_vaccines into each clinic's vaccines[] array, and writes JSON shaped
// exactly to satisfy the Clinic / ClinicVaccine types in lib/clinics.ts.
//
// Photo paths and content blocks (enriched by separate scripts) are preserved from
// the existing JSONs — the Sheet does not own those fields.
//
// Run via .github/workflows/sync-clinics.yml or `node scripts/sync-clinics.mjs`.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT_SG = resolve(ROOT, "data/clinics-sg.json");
const OUT_MY = resolve(ROOT, "data/clinics-my.json");

const SHEET_PUB_ID =
  process.env.CLINIC_SHEET_PUB_ID ||
  "2PACX-1vR5bTdxYWXA0dW1f16Mc3FkOpT8kJH4nQT_WJLOwB3fuqGow8ICNuj1T6ZVAzJ9k_jC5h8AEWoCGXV7";

const TABS = {
  clinics: 0,
  clinic_vaccines: 1263404448,
  vaccines_master: 1326473892,
};

const FETCH_TIMEOUT_MS = 20_000;

function tabUrl(gid) {
  return `https://docs.google.com/spreadsheets/d/e/${SHEET_PUB_ID}/pub?output=csv&gid=${gid}`;
}

async function fetchCsv(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: "text/csv" },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

// Minimal RFC-4180 CSV parser: handles quoted fields with embedded commas,
// CRLF line endings, and "" → " escape.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        row.push(field);
        field = "";
      } else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else {
        field += c;
      }
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  // Drop trailing empty rows
  while (rows.length && rows[rows.length - 1].every((c) => c === "")) rows.pop();
  if (rows.length === 0) return [];
  const header = rows[0];
  return rows.slice(1).map((r) => {
    const obj = {};
    for (let j = 0; j < header.length; j++) obj[header[j]] = r[j] ?? "";
    return obj;
  });
}

function asBool(v) {
  if (v === undefined || v === null || v === "") return null;
  const s = String(v).trim().toLowerCase();
  if (s === "true" || s === "1" || s === "yes") return true;
  if (s === "false" || s === "0" || s === "no") return false;
  return null;
}

function asNumber(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

function asStr(v) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

function asArr(v) {
  const s = asStr(v);
  if (!s) return [];
  return s
    .split(/\s*,\s*/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function rowToClinic(r) {
  return {
    clinic_id: asStr(r.clinic_id),
    clinic_name: asStr(r.clinic_name),
    parent_chain: asStr(r.parent_chain),
    country: asStr(r.country),
    country_code: asStr(r.country_code),
    city: asStr(r.city),
    address: asStr(r.address),
    postal_code: asStr(r.postal_code),
    latitude: asNumber(r.latitude),
    longitude: asNumber(r.longitude),
    phone: asStr(r.phone),
    website_url: asStr(r.website_url),
    booking_url: asStr(r.booking_url),
    email: asStr(r.email),
    nearest_transit: asStr(r.nearest_transit),
    walk_in: asBool(r.walk_in),
    appt_required: asBool(r.appt_required),
    hours_summary: asStr(r.hours_summary),
    languages: asArr(r.languages),
    status: asStr(r.status),
  };
}

function rowToVaccine(r) {
  return {
    clinic_id: asStr(r.clinic_id),
    vaccine_slug: asStr(r.vaccine_slug),
    vaccine_name: asStr(r.vaccine_name),
    available: asBool(r.available) ?? true,
    price_local: asNumber(r.price_local),
    price_note: asStr(r.price_note),
    price_currency: asStr(r.price_currency),
    price_incl_consult: asBool(r.price_incl_consult),
    price_last_updated: asStr(r.price_last_updated),
    notes: asStr(r.notes),
  };
}

async function loadExisting(path) {
  try {
    const txt = await readFile(path, "utf8");
    return JSON.parse(txt);
  } catch {
    return { clinics: [] };
  }
}

async function run() {
  console.log("Fetching clinic data from published Google Sheet…");
  const [clinicsCsv, vaccinesCsv, mastersCsv] = await Promise.all([
    fetchCsv(tabUrl(TABS.clinics)),
    fetchCsv(tabUrl(TABS.clinic_vaccines)),
    fetchCsv(tabUrl(TABS.vaccines_master)),
  ]);

  const clinicRows = parseCsv(clinicsCsv);
  const vaccineRows = parseCsv(vaccinesCsv);
  const masterRows = parseCsv(mastersCsv);
  console.log(
    `  clinics: ${clinicRows.length}, clinic_vaccines: ${vaccineRows.length}, vaccines_master: ${masterRows.length}`
  );

  const errors = [];
  const warnings = [];

  // Validate vaccines master is non-empty (used as soft sanity check)
  if (masterRows.length === 0) {
    warnings.push({ scope: "vaccines_master", msg: "tab is empty" });
  }

  // Group vaccines by clinic_id
  const byClinic = new Map();
  for (const raw of vaccineRows) {
    const v = rowToVaccine(raw);
    if (!v.clinic_id) {
      errors.push({ scope: "clinic_vaccines", msg: "row missing clinic_id", row: raw });
      continue;
    }
    if (!v.vaccine_slug || !v.vaccine_name) {
      errors.push({
        scope: "clinic_vaccines",
        clinic_id: v.clinic_id,
        msg: "row missing vaccine_slug or vaccine_name",
      });
      continue;
    }
    if (v.price_local !== null && !v.price_last_updated) {
      warnings.push({
        scope: "clinic_vaccines",
        clinic_id: v.clinic_id,
        vaccine_slug: v.vaccine_slug,
        msg: "price_local set but price_last_updated missing (Hard Rule #4)",
      });
    }
    if (!byClinic.has(v.clinic_id)) byClinic.set(v.clinic_id, []);
    byClinic.get(v.clinic_id).push({
      vaccine_slug: v.vaccine_slug,
      vaccine_name: v.vaccine_name,
      available: v.available,
      price_local: v.price_local,
      price_note: v.price_note,
      price_currency: v.price_currency,
      price_incl_consult: v.price_incl_consult,
      price_last_updated: v.price_last_updated,
      notes: v.notes,
    });
  }

  // Preserve photo_path + content from existing JSONs (those fields are
  // populated by separate enrichment scripts, not the Sheet).
  const [existingSg, existingMy] = await Promise.all([
    loadExisting(OUT_SG),
    loadExisting(OUT_MY),
  ]);
  const enrichmentById = new Map();
  for (const c of [...existingSg.clinics, ...existingMy.clinics]) {
    const enrichment = {};
    if (c.photo_path) enrichment.photo_path = c.photo_path;
    if (c.content) enrichment.content = c.content;
    if (Object.keys(enrichment).length) enrichmentById.set(c.clinic_id, enrichment);
  }

  const sgClinics = [];
  const myClinics = [];
  const seenIds = new Set();

  for (const raw of clinicRows) {
    const c = rowToClinic(raw);
    if (!c.clinic_id || !c.clinic_name || !c.country_code) {
      errors.push({
        scope: "clinics",
        msg: "row missing required field (clinic_id, clinic_name, or country_code)",
        clinic_id: c.clinic_id,
      });
      continue;
    }
    if (seenIds.has(c.clinic_id)) {
      errors.push({ scope: "clinics", clinic_id: c.clinic_id, msg: "duplicate clinic_id" });
      continue;
    }
    seenIds.add(c.clinic_id);

    if (c.country_code !== "SG" && c.country_code !== "MY") {
      errors.push({
        scope: "clinics",
        clinic_id: c.clinic_id,
        msg: `unsupported country_code "${c.country_code}" (Phase 1 is SG/MY)`,
      });
      continue;
    }
    if (c.status !== "LIVE" && c.status !== "VERIFY" && c.status !== "GOV") {
      warnings.push({
        scope: "clinics",
        clinic_id: c.clinic_id,
        msg: `unknown status "${c.status}" — defaulting to VERIFY`,
      });
      c.status = "VERIFY";
    }
    if (c.latitude === null || c.longitude === null) {
      warnings.push({
        scope: "clinics",
        clinic_id: c.clinic_id,
        msg: "missing latitude/longitude (needed for JSON-LD geo)",
      });
    }

    const vaccines = byClinic.get(c.clinic_id) || [];
    if (vaccines.length === 0) {
      warnings.push({
        scope: "clinics",
        clinic_id: c.clinic_id,
        msg: "no rows in clinic_vaccines for this clinic",
      });
    }

    // Currency sanity check: per CLAUDE.md, SG → SGD, MY → MYR
    const expectedCurrency = c.country_code === "SG" ? "SGD" : "MYR";
    for (const v of vaccines) {
      if (v.price_currency && v.price_currency !== expectedCurrency) {
        warnings.push({
          scope: "clinic_vaccines",
          clinic_id: c.clinic_id,
          vaccine_slug: v.vaccine_slug,
          msg: `currency "${v.price_currency}" does not match country_code ${c.country_code} (expected ${expectedCurrency})`,
        });
      }
      // Backfill currency if missing
      if (!v.price_currency) v.price_currency = expectedCurrency;
    }

    const enrichment = enrichmentById.get(c.clinic_id) || {};
    const out = {
      clinic_id: c.clinic_id,
      clinic_name: c.clinic_name,
      parent_chain: c.parent_chain,
      country: c.country,
      country_code: c.country_code,
      city: c.city,
      address: c.address,
      postal_code: c.postal_code,
      latitude: c.latitude,
      longitude: c.longitude,
      phone: c.phone,
      website_url: c.website_url,
      booking_url: c.booking_url,
      email: c.email,
      nearest_transit: c.nearest_transit,
      walk_in: c.walk_in,
      appt_required: c.appt_required,
      hours_summary: c.hours_summary,
      languages: c.languages,
      status: c.status,
      vaccines,
      ...(enrichment.photo_path !== undefined && { photo_path: enrichment.photo_path }),
      ...(enrichment.content !== undefined && { content: enrichment.content }),
    };

    if (c.country_code === "SG") sgClinics.push(out);
    else myClinics.push(out);
  }

  // Surface orphan vaccine rows (clinic_vaccines entries whose clinic_id
  // doesn't exist in the clinics tab). These would otherwise be silently
  // dropped — the warning makes the data mismatch visible.
  for (const cid of byClinic.keys()) {
    if (!seenIds.has(cid)) {
      errors.push({
        scope: "clinic_vaccines",
        clinic_id: cid,
        msg: `${byClinic.get(cid).length} vaccine row(s) reference a clinic_id that is not in the clinics tab`,
      });
    }
  }

  // Stable order: by clinic_id
  sgClinics.sort((a, b) => a.clinic_id.localeCompare(b.clinic_id));
  myClinics.sort((a, b) => a.clinic_id.localeCompare(b.clinic_id));

  const header = (country) => ({
    $schema_version: "1.0",
    $generated: new Date().toISOString(),
    $source: `Auto-managed by scripts/sync-clinics.mjs from Google Sheet ${SHEET_PUB_ID}. DO NOT EDIT BY HAND — manual edits will be overwritten by the next fortnightly run.`,
    $country: country,
    $errors: errors.filter(
      (e) =>
        !e.clinic_id ||
        (country === "SG" && e.clinic_id.startsWith("sg-")) ||
        (country === "MY" && e.clinic_id.startsWith("my-"))
    ),
    $warnings: warnings.filter(
      (w) =>
        !w.clinic_id ||
        (country === "SG" && w.clinic_id.startsWith("sg-")) ||
        (country === "MY" && w.clinic_id.startsWith("my-"))
    ),
  });

  const sgOut = { ...header("SG"), clinics: sgClinics };
  const myOut = { ...header("MY"), clinics: myClinics };

  await writeFile(OUT_SG, JSON.stringify(sgOut, null, 2) + "\n", "utf8");
  await writeFile(OUT_MY, JSON.stringify(myOut, null, 2) + "\n", "utf8");

  console.log(`Wrote ${sgClinics.length} SG clinics → ${OUT_SG}`);
  console.log(`Wrote ${myClinics.length} MY clinics → ${OUT_MY}`);
  if (errors.length) console.log(`  ${errors.length} hard errors (rows skipped)`);
  if (warnings.length) console.log(`  ${warnings.length} warnings (kept, see $warnings)`);

  // Hard-fail the run only if NO clinics survived validation, so a cron run
  // never wipes the data file because of a single bad row.
  if (sgClinics.length + myClinics.length === 0) {
    console.error("Fatal: zero clinics passed validation — refusing to overwrite JSONs");
    process.exit(1);
  }
}

run().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
