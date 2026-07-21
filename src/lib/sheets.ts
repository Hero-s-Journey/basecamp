/**
 * Fire-and-forget logging of successful payment intents to a Google Sheet
 * via Apps Script Web App. Failures here never block the user redirect.
 */

const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbwz_PvR8tRhIgP4DowoOdDtpjNUO9b77Py4epQjTsuaLpkt_uKxVLhftfWkBwvJoI347Q/exec";

export type LeadStatus = "attempt" | "link_created" | "error" | "network_error";

export interface SheetRow {
  phoneNumber: string;
  paymentMethod: "kaspi" | "card";
  deliveryDate: string;
  promocode: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_referrer: string | null;
  clubId: string;
  status: LeadStatus;
  errorMessage?: string | null;
}

/**
 * Sends the lead to Google Sheet. Uses `keepalive` so the request survives
 * the page redirect that happens immediately after.
 *
 * `mode: 'no-cors'` is used because Apps Script does not send CORS headers;
 * the response is opaque to us but the row is still appended server-side.
 */
export function logToSheet(row: SheetRow): void {
  if (typeof window === "undefined") return;
  try {
    fetch(SHEET_URL, {
      method: "POST",
      mode: "no-cors",
      keepalive: true,
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(row),
    }).catch(() => {
      /* ignore — fire and forget */
    });
  } catch {
    /* ignore */
  }
}
