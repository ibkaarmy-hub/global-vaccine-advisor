import clinicsSgJson from "@/data/clinics-sg.json";
import clinicsMyJson from "@/data/clinics-my.json";

export type ClinicVaccine = {
  vaccine_slug: string;
  vaccine_name: string;
  available: boolean;
  price_local: number | null;
  price_note: string | null;
  price_currency: string | null;
  price_incl_consult: boolean | null;
  price_last_updated: string | null;
  notes: string | null;
};

export type ClinicContent = {
  services_summary: string | null;
  travel_specialist: boolean | null;
  yf_licensed: boolean | null;
  certifications: string[];
  consult_note: string | null;
  highlight: string | null;
};

export type Clinic = {
  clinic_id: string;
  clinic_name: string;
  parent_chain: string | null;
  country: string;
  country_code: "SG" | "MY";
  city: string;
  address: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website_url: string | null;
  booking_url: string | null;
  email: string | null;
  nearest_transit: string | null;
  walk_in: boolean | null;
  appt_required: boolean | null;
  hours_summary: string | null;
  languages: string[];
  status: "LIVE" | "VERIFY" | "GOV";
  vaccines: ClinicVaccine[];
  photo_path?: string | null;
  content?: ClinicContent | null;
};

type ClinicsFile = { clinics: Clinic[] };

export const clinicsSg: Clinic[] = (clinicsSgJson as ClinicsFile).clinics;
export const clinicsMy: Clinic[] = (clinicsMyJson as ClinicsFile).clinics;
export const allClinics: Clinic[] = [...clinicsSg, ...clinicsMy];

// Unique MY cities for static route generation
export const myCities: string[] = [
  ...new Set(clinicsMy.map((c) => c.city)),
].sort();

// City → URL slug (e.g. "Johor Bahru" → "johor-bahru")
export function cityToSlug(city: string): string {
  return city.toLowerCase().replace(/\s+/g, "-");
}

// URL slug → city name
export function slugToCity(slug: string): string | undefined {
  return myCities.find((c) => cityToSlug(c) === slug);
}

export function getClinic(id: string): Clinic | undefined {
  return allClinics.find((c) => c.clinic_id === id);
}

export function getClinicsByCity(city: string): Clinic[] {
  return clinicsMy.filter((c) => c.city === city);
}

export function formatPrice(vaccine: ClinicVaccine): string {
  if (vaccine.price_note) {
    const sym = vaccine.price_currency === "MYR" ? "RM" : "$";
    return `${sym}${vaccine.price_note}`;
  }
  if (vaccine.price_local == null) return "—";
  const sym = vaccine.price_currency === "MYR" ? "RM" : "$";
  return `${sym}${vaccine.price_local.toFixed(0)}`;
}

export function priceForVaccine(
  clinic: Clinic,
  vaccineSlug: string
): ClinicVaccine | undefined {
  return clinic.vaccines.find((v) => v.vaccine_slug === vaccineSlug);
}

// Build JSON-LD MedicalBusiness schema for a clinic page
export function buildClinicJsonLd(clinic: Clinic): object {
  const services = clinic.vaccines
    .filter((v) => v.available)
    .map((v) => ({
      "@type": "MedicalProcedure",
      name: `${v.vaccine_name} Vaccination`,
    }));

  return {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: clinic.clinic_name,
    ...(clinic.address && {
      address: {
        "@type": "PostalAddress",
        streetAddress: clinic.address,
        addressCountry: clinic.country_code,
      },
    }),
    ...(clinic.latitude &&
      clinic.longitude && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: clinic.latitude,
          longitude: clinic.longitude,
        },
      }),
    ...(clinic.phone && { telephone: clinic.phone }),
    ...(clinic.website_url && { url: clinic.website_url }),
    ...(clinic.hours_summary && { openingHours: clinic.hours_summary }),
    medicalSpecialty: "TravelMedicine",
    ...(services.length > 0 && { availableService: services }),
  };
}
