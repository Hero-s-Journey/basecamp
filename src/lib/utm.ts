/**
 * Captures UTM parameters from the URL on first visit and persists them
 * across the session so they survive internal navigation.
 * Returns the current UTM bundle, falling back to sensible defaults.
 */

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_referrer",
] as const;

type UtmKey = (typeof UTM_KEYS)[number];

export interface UtmBundle {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string | null;
  utm_referrer: string | null;
}

const DEFAULTS: UtmBundle = {
  utm_source: "basecamp_landing",
  utm_medium: "organic",
  utm_campaign: "organic",
  utm_content: null,
  utm_referrer: null,
};

/** Reads UTMs from URL and writes them to sessionStorage. Call once on app mount. */
export function captureUtm(): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) sessionStorage.setItem(key, value);
  }
  // Stash document.referrer as a fallback for utm_referrer
  if (!sessionStorage.getItem("utm_referrer") && document.referrer) {
    sessionStorage.setItem("utm_referrer", document.referrer);
  }
}

/** Reads current UTM bundle (URL → sessionStorage → defaults). */
export function getUtm(): UtmBundle {
  if (typeof window === "undefined") return { ...DEFAULTS };
  const params = new URLSearchParams(window.location.search);
  const read = (key: UtmKey): string | null =>
    params.get(key) || sessionStorage.getItem(key);

  return {
    utm_source: read("utm_source") || DEFAULTS.utm_source,
    utm_medium: read("utm_medium") || DEFAULTS.utm_medium,
    utm_campaign: read("utm_campaign") || DEFAULTS.utm_campaign,
    utm_content: read("utm_content"),
    utm_referrer: read("utm_referrer") || document.referrer || null,
  };
}
