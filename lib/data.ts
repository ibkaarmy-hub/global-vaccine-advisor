import countriesJson from "@/data/countries.json";
import vaccinesJson from "@/data/vaccines.json";
import countryContentJson from "@/data/country-content.json";

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

type CountriesFile = { countries: Country[] };
type VaccinesFile = { vaccines: Vaccine[] };
type CountryContentFile = { content: Record<string, CountryContent> };

export const countries: Country[] = (countriesJson as CountriesFile).countries;
export const vaccines: Vaccine[] = (vaccinesJson as VaccinesFile).vaccines;
const countryContent: Record<string, CountryContent> = (
  countryContentJson as CountryContentFile
).content;

export function getCountry(id: string): Country | undefined {
  return countries.find((c) => c.id === id);
}

export function getVaccine(id: string): Vaccine | undefined {
  return vaccines.find((v) => v.id === id);
}

export function getCountryContent(id: string): CountryContent | undefined {
  return countryContent[id];
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

const TRANSMISSION_ICON: Record<TransmissionTag, string> = {
  "Mosquito": "pest_control",
  "Food & Water": "restaurant",
  "Airborne": "masks",
  "Blood & Body Fluids": "bloodtype",
  "Animal Contact": "pets",
};

export function transmissionIcon(tag: TransmissionTag): string {
  return TRANSMISSION_ICON[tag];
}

const COUNTRY_FLAG: Record<string, string> = {
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
  turkey: "🇹🇷",
};

export function countryFlag(id: string): string {
  return COUNTRY_FLAG[id] ?? "";
}
