import countriesJson from "@/data/countries.json";
import vaccinesJson from "@/data/vaccines.json";
import countryContentJson from "@/data/country-content.json";
import vaccinesContentJson from "@/data/vaccines-content.json";
import referencesJson from "@/data/references.json";
import destinationReferencesJson from "@/data/destination-references.json";
import healthAlertsJson from "@/data/health-alerts.json";

export type ConditionalRequirement = {
  vaccine_id: string;
  condition: string;
};

export type EntryRequirements = {
  passport_validity_months: number | null;
  visa_note: string | null;
  yellow_card_required: boolean;
  yellow_card_conditional: boolean;
};

export type CurrentAlert = {
  id: string;
  title: string;
  detail: string;
  date_added: string;
  source: string;
};

export type Country = {
  id: string;
  name: string;
  region: string;
  required_vaccines: string[];
  conditional_requirements: ConditionalRequirement[];
  recommended_most_vaccines: string[];
  recommended_some_vaccines: string[];
  malaria_note: string | null;
  entry_requirements: EntryRequirements;
  health_notes: string;
  current_alerts: CurrentAlert[];
  cdc_page_url: string;
};

export type TransmissionTag =
  | "Mosquito"
  | "Food & Water"
  | "Airborne"
  | "Blood & Body Fluids"
  | "Animal Contact";

export type Vaccine = {
  id: string;
  name: string;
  transmission: TransmissionTag;
  is_routine: boolean;
  brief_description: string;
  timing_note: string;
  cdc_url: string;
};

export type CountryContent = {
  intro: string;
  seasonal_note?: string;
};

export type VaccineFaq = { q: string; a: string };

export type VaccineContent = {
  id: string;
  what_it_is: string;
  how_it_spreads: string;
  who_needs_it: string;
  schedule: {
    primary_series: string;
    boosters?: string;
    timing_before_travel?: string;
  };
  side_effects: {
    common: string[];
    serious_rare: string[];
  };
  contraindications: string;
  faq: VaccineFaq[];
  consult_note: string;
  sources: { label: string; url: string }[];
};

type CountriesFile = { countries: Country[] };
type VaccinesFile = { vaccines: Vaccine[] };
type CountryContentFile = { content: Record<string, CountryContent> };
type VaccinesContentFile = { vaccines: Record<string, VaccineContent> };

export type Reference = {
  id: string;
  name: string;
  short_name: string;
  tier: "primary" | "regional" | "professional";
  country_of_origin: string;
  scope: string;
  homepage_url: string;
  alerts_feed_url: string | null;
  alerts_feed_kind: "rss" | "atom" | null;
  license_note: string;
  last_verified: string;
  [extra: string]: unknown;
};

export type DestinationReferenceLink = {
  deep_url?: string;
  search_url?: string;
  verified_at?: string;
  note?: string;
};

export type DestinationReferences = {
  cdc?: DestinationReferenceLink;
  phac?: DestinationReferenceLink;
  smartraveller?: DestinationReferenceLink;
  nathnac?: DestinationReferenceLink;
  who?: DestinationReferenceLink;
};

export type GlobalAlert = {
  id: string;
  source_id: string;
  source_name: string;
  title: string;
  summary: string;
  url: string;
  published_at: string | null;
};

type ReferencesFile = { references: Reference[] };
type DestinationReferencesFile = {
  destinations: Record<string, DestinationReferences>;
};
type HealthAlertsFile = {
  $generated: string | null;
  alerts: GlobalAlert[];
};

export const countries: Country[] = (countriesJson as CountriesFile).countries;
export const vaccines: Vaccine[] = (vaccinesJson as VaccinesFile).vaccines;
const countryContent: Record<string, CountryContent> = (
  countryContentJson as CountryContentFile
).content;
const vaccineContent: Record<string, VaccineContent> = (
  vaccinesContentJson as unknown as VaccinesContentFile
).vaccines;
export const references: Reference[] = (referencesJson as unknown as ReferencesFile).references;
const destinationReferences: Record<string, DestinationReferences> = (
  destinationReferencesJson as unknown as DestinationReferencesFile
).destinations;
const healthAlertsFile = healthAlertsJson as unknown as HealthAlertsFile;
export const globalAlerts: GlobalAlert[] = healthAlertsFile.alerts ?? [];
export const globalAlertsGeneratedAt: string | null =
  healthAlertsFile.$generated ?? null;

export function getReference(id: string): Reference | undefined {
  return references.find((r) => r.id === id);
}

export function getDestinationReferences(
  countryId: string
): DestinationReferences | undefined {
  return destinationReferences[countryId];
}

export function getCountry(id: string): Country | undefined {
  return countries.find((c) => c.id === id);
}

export function getVaccine(id: string): Vaccine | undefined {
  return vaccines.find((v) => v.id === id);
}

export function getCountryContent(id: string): CountryContent | undefined {
  return countryContent[id];
}

export function getVaccineContent(id: string): VaccineContent | undefined {
  return vaccineContent[id];
}

export const travelVaccines: Vaccine[] = vaccines.filter((v) => !v.is_routine);
export const routineVaccines: Vaccine[] = vaccines.filter((v) => v.is_routine);

export function countriesRecommending(vaccineId: string): Country[] {
  return countries.filter(
    (c) =>
      c.recommended_most_vaccines.includes(vaccineId) ||
      c.recommended_some_vaccines.includes(vaccineId)
  );
}

export function countryTier(country: Country, vaccineId: string):
  | "required"
  | "conditional"
  | "most"
  | "some"
  | null {
  if (country.required_vaccines.includes(vaccineId)) return "required";
  if (country.conditional_requirements.some((r) => r.vaccine_id === vaccineId))
    return "conditional";
  if (country.recommended_most_vaccines.includes(vaccineId)) return "most";
  if (country.recommended_some_vaccines.includes(vaccineId)) return "some";
  return null;
}

// Single source of truth for the country emoji flag rendered alongside names.
// Keep keys aligned with country.id slugs in countries.json.
// When adding a new country, add the flag here too — the UI silently falls
// back to no flag if missing, but the bento and pill components look better
// with one.
const COUNTRY_FLAG: Record<string, string> = {
  // Launch 10 (2026-04-21)
  thailand: "🇹🇭",
  india: "🇮🇳",
  mexico: "🇲🇽",
  indonesia: "🇮🇩",
  vietnam: "🇻🇳",
  kenya: "🇰🇪",
  egypt: "🇪🇬",
  peru: "🇵🇪",
  philippines: "🇵🇭",
  japan: "🇯🇵",
  // Post-launch batch 1 (2026-04-25): 11–18
  turkey: "🇹🇷",
  brazil: "🇧🇷",
  morocco: "🇲🇦",
  uae: "🇦🇪",
  tanzania: "🇹🇿",
  "south-africa": "🇿🇦",
  "costa-rica": "🇨🇷",
  "sri-lanka": "🇱🇰",
  // Post-launch batch 2 (2026-04-27): 19–50
  cambodia: "🇰🇭",
  laos: "🇱🇦",
  myanmar: "🇲🇲",
  nepal: "🇳🇵",
  bangladesh: "🇧🇩",
  singapore: "🇸🇬",
  malaysia: "🇲🇾",
  maldives: "🇲🇻",
  china: "🇨🇳",
  "south-korea": "🇰🇷",
  taiwan: "🇹🇼",
  "saudi-arabia": "🇸🇦",
  jordan: "🇯🇴",
  israel: "🇮🇱",
  oman: "🇴🇲",
  qatar: "🇶🇦",
  "united-states": "🇺🇸",
  canada: "🇨🇦",
  argentina: "🇦🇷",
  chile: "🇨🇱",
  colombia: "🇨🇴",
  "dominican-republic": "🇩🇴",
  jamaica: "🇯🇲",
  ecuador: "🇪🇨",
  nigeria: "🇳🇬",
  ethiopia: "🇪🇹",
  ghana: "🇬🇭",
  uganda: "🇺🇬",
  rwanda: "🇷🇼",
  zambia: "🇿🇲",
  madagascar: "🇲🇬",
  australia: "🇦🇺",
};

export function countryFlag(id: string): string {
  return COUNTRY_FLAG[id] ?? "";
}
