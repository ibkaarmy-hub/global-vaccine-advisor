#!/usr/bin/env node
// Fortnightly fetcher for global travel-health alerts.
// Reads alerts_feed_url entries from data/references.json, fetches each RSS/Atom
// feed, normalises items, drops anything older than $retention_days, and writes
// data/health-alerts.json. Designed to run from .github/workflows/update-health-alerts.yml.
//
// Zero runtime dependencies — uses Node 20+ built-in fetch and a small XML parser
// tuned for RSS 2.0 and Atom 1.0 feeds. If a feed shape changes upstream, this
// script logs a warning and skips that source rather than crashing the run.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const REFERENCES_PATH = resolve(ROOT, "data/references.json");
const OUT_PATH = resolve(ROOT, "data/health-alerts.json");

const USER_AGENT =
  "travelvaccineadvisor.com health-alerts updater (+https://travelvaccineadvisor.com)";
const FETCH_TIMEOUT_MS = 20_000;
const PER_SOURCE_LIMIT = 25;

async function fetchText(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

// Minimal RSS 2.0 / Atom 1.0 parser. We only need <item>/<entry> with
// title, link, description/summary, pubDate/updated, guid/id.
function parseFeed(xml) {
  const items = [];
  const isAtom = /<feed[^>]*xmlns=["']http:\/\/www\.w3\.org\/2005\/Atom/i.test(xml);
  const itemTag = isAtom ? "entry" : "item";
  const blockRe = new RegExp(`<${itemTag}\\b[^>]*>([\\s\\S]*?)<\\/${itemTag}>`, "gi");
  let m;
  while ((m = blockRe.exec(xml)) !== null) {
    const body = m[1];
    const title = pickFirst(body, ["title"]);
    const link = isAtom ? pickAtomLink(body) : pickFirst(body, ["link"]);
    const desc = pickFirst(body, isAtom ? ["summary", "content"] : ["description"]);
    const date = pickFirst(body, isAtom ? ["updated", "published"] : ["pubDate", "dc:date"]);
    const guid = pickFirst(body, isAtom ? ["id"] : ["guid"]);
    if (!title) continue;
    items.push({
      title: clean(stripCdata(title)),
      link: clean(stripCdata(link || "")),
      description: clean(stripCdata(desc || "")),
      date: clean(stripCdata(date || "")),
      guid: clean(stripCdata(guid || "")),
    });
  }
  return items;
}

function pickFirst(block, tags) {
  for (const tag of tags) {
    const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
    const m = block.match(re);
    if (m && m[1]) return m[1];
  }
  return "";
}

function pickAtomLink(block) {
  // <link href="..." rel="alternate"/>
  const m = block.match(/<link\b([^>]*)\/?>(?:<\/link>)?/i);
  if (!m) return "";
  const attrs = m[1] || "";
  const href = attrs.match(/href=["']([^"']+)["']/i);
  return href ? href[1] : "";
}

function stripCdata(s) {
  return String(s || "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
}

function clean(s) {
  return String(s || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseDate(s) {
  if (!s) return null;
  const d = new Date(s);
  return Number.isFinite(d.getTime()) ? d : null;
}

function alertId(sourceId, item) {
  const seed = item.guid || item.link || item.title;
  // Stable, dependency-free hash → first 12 hex chars is enough for de-dup.
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const hex = (h >>> 0).toString(16).padStart(8, "0");
  return `${sourceId}-${hex}`;
}

async function run() {
  const refsRaw = await readFile(REFERENCES_PATH, "utf8");
  const refs = JSON.parse(refsRaw);

  const existing = JSON.parse(await readFile(OUT_PATH, "utf8").catch(() => '{"alerts":[]}'));
  const retentionDays = existing.$retention_days ?? 60;
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;

  const sources = refs.references.filter((r) => r.alerts_feed_url);
  console.log(`Fetching ${sources.length} alert feeds…`);

  const alerts = [];
  const errors = [];

  for (const src of sources) {
    try {
      const xml = await fetchText(src.alerts_feed_url);
      const items = parseFeed(xml).slice(0, PER_SOURCE_LIMIT);
      let kept = 0;
      for (const it of items) {
        const d = parseDate(it.date);
        const ts = d ? d.getTime() : Date.now();
        if (ts < cutoff) continue;
        alerts.push({
          id: alertId(src.id, it),
          source_id: src.id,
          source_name: src.short_name,
          title: it.title,
          summary: it.description ? it.description.slice(0, 320) : "",
          url: it.link,
          published_at: d ? d.toISOString() : null,
        });
        kept++;
      }
      console.log(`  ${src.short_name}: ${items.length} items, ${kept} within retention`);
    } catch (e) {
      console.warn(`  ${src.short_name}: FETCH FAILED — ${e.message}`);
      errors.push({ source: src.id, error: String(e.message || e) });
    }
  }

  // Sort newest first, dedupe by id.
  const seen = new Set();
  const deduped = alerts
    .sort((a, b) => (b.published_at || "").localeCompare(a.published_at || ""))
    .filter((a) => (seen.has(a.id) ? false : (seen.add(a.id), true)));

  const out = {
    $schema_version: "1.0",
    $generated: new Date().toISOString(),
    $source:
      "Auto-managed by scripts/update-health-alerts.mjs (runs fortnightly via .github/workflows/update-health-alerts.yml). DO NOT EDIT BY HAND — manual edits will be overwritten.",
    $retention_days: retentionDays,
    $errors: errors,
    alerts: deduped,
  };

  await writeFile(OUT_PATH, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`Wrote ${deduped.length} alerts to ${OUT_PATH}`);
  if (errors.length) {
    console.log(`(${errors.length} sources failed; recorded under $errors)`);
  }
}

run().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
