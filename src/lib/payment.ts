import { getUtm } from "./utm";

/** Hero's Journey 4YOU club (Almaty, ул. Ескараева 3). */
export const CLUB_ID_4YOU = "68a45233d9ba5a6ba953e5f0";

/** Backend that creates Kaspi / Freedom Pay links. */
const API_BASE = "https://admin.herosjourney.kz/pay/api";

/** Intermediary URL HJ uses for analytics tracking of the final redirect. */
const INTERMEDIARY = "https://herosjourney.kz/paymentlink";

export type PaymentMethod = "kaspi" | "card";

export type DeliveryDate = "сегодня" | "завтра" | "послезавтра";

export interface PaymentInput {
  /** Mongo ObjectId of the club to bill against. */
  clubId: string;
  /** Cleaned digits-only KZ phone, e.g. "87771234567" */
  phoneNumber: string;
  /** User-selected delivery date label */
  deliveryDate: DeliveryDate;
  /** Uppercase promo code, omitted if empty */
  promocode?: string;
}

interface KaspiResponse {
  Data?: { PaymentLink?: string };
  message?: string;
}

interface CardResponse {
  url?: string;
  message?: string;
}

export class PaymentError extends Error {
  /** "promocode" if the failure is promocode-specific, else "general". */
  kind: "promocode" | "general";

  constructor(message: string, kind: "promocode" | "general" = "general") {
    super(message);
    this.name = "PaymentError";
    this.kind = kind;
  }
}

export interface PromocodeValidation {
  /** Discount as a fraction of basePrice, e.g. 0.2 for 20% off. */
  discount: number;
  /** Optional human-readable label from backend. */
  message?: string;
}

/**
 * Validates a promocode against the backend. Throws PaymentError("promocode")
 * with a user-facing message when the code is invalid.
 *
 * Backend may return discount as: fraction (0.2), percent (20), or absolute
 * tenge amount (3998). `basePrice` is used to normalize tenge amounts → fraction.
 */
export async function validatePromocode(
  code: string,
  basePrice: number,
  clubId: string,
): Promise<PromocodeValidation> {
  const body = {
    promocode: code,
    clubId,
    type: PROGRAM_TYPE,
  };
  const { ok, status, data } = await postJson<{
    valid?: boolean;
    discount?: number;
    discountPercent?: number;
    discountAmount?: number;
    message?: string;
    Data?: { discount?: number; discountPercent?: number; discountAmount?: number };
  }>("validatePromocode", body);

  if (!ok) {
    throw new PaymentError(data.message || `Промокод недействителен`, "promocode");
  }

  if (data.valid === false) {
    throw new PaymentError(data.message || "Промокод недействителен", "promocode");
  }

  const raw =
    data.discount ??
    data.Data?.discount ??
    data.discountAmount ??
    data.Data?.discountAmount ??
    (data.discountPercent != null ? data.discountPercent / 100 : undefined) ??
    (data.Data?.discountPercent != null ? data.Data.discountPercent / 100 : undefined);

  if (raw == null || raw <= 0) {
    throw new PaymentError(data.message || "Промокод недействителен", "promocode");
  }

  // Normalize to fraction:
  //   raw <= 1     → already a fraction (0.2 = 20%)
  //   raw <= 100   → percent (20 = 20%)
  //   raw > 100    → absolute tenge amount (3998 тг off basePrice)
  let discount: number;
  if (raw <= 1) discount = raw;
  else if (raw <= 100) discount = raw / 100;
  else discount = raw / basePrice;

  // Clamp to [0, 1]
  discount = Math.max(0, Math.min(1, discount));

  return { discount, message: data.message };
}

/** Strips formatting from a masked phone, returning digits only. */
export function cleanPhone(masked: string): string {
  return masked.replace(/\D/g, "");
}

/** Converts label to a Date object at midnight local time. */
function deliveryDateToDate(value: DeliveryDate): Date {
  const date = new Date();
  if (value === "завтра") date.setDate(date.getDate() + 1);
  else if (value === "послезавтра") date.setDate(date.getDate() + 2);
  date.setHours(0, 0, 0, 0);
  return date;
}

/** Wraps the final payment URL in HJ's analytics intermediary. */
function wrapIntermediary(finalUrl: string): string {
  return `${INTERMEDIARY}?redirectTo=${encodeURIComponent(finalUrl)}`;
}

async function postJson<T>(endpoint: string, body: unknown): Promise<{
  ok: boolean;
  status: number;
  data: T;
}> {
  const response = await fetch(`${API_BASE}/${endpoint}`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as T;
  return { ok: response.ok, status: response.status, data };
}

/** Program type identifier expected by the GeneratedFirstStep endpoints. */
const PROGRAM_TYPE = "burn";

/**
 * Creates a Kaspi payment link for the 4YOU Basecamp BURN product (19 990 тг).
 * Uses GeneratedFirstStep endpoint with type + clubId so backend resolves the product.
 */
export async function createKaspiPayment(input: PaymentInput): Promise<string> {
  const utm = getUtm();
  const startTimeMs = deliveryDateToDate(input.deliveryDate).getTime();
  const body = {
    phoneNumber: input.phoneNumber,
    clubId: input.clubId,
    type: PROGRAM_TYPE,
    promocode: input.promocode ?? null,
    utm_campaign: utm.utm_campaign,
    utm_source: utm.utm_source,
    utm_medium: utm.utm_medium,
    utm_content: utm.utm_content,
    utm_referrer: utm.utm_referrer,
    input: {
      type: PROGRAM_TYPE,
      clubId: input.clubId,
      startTime: startTimeMs,
      selectedMarathonEventId: input.deliveryDate,
    },
    userFormData: null,
  };

  const { ok, status, data } = await postJson<KaspiResponse>(
    "generateKaspiLinkForGeneratedFirstStep",
    body,
  );

  if (!ok) {
    throw new PaymentError(
      data.message || `Ошибка ${status}`,
      input.promocode ? "promocode" : "general",
    );
  }

  const link = data.Data?.PaymentLink;
  if (!link) {
    throw new PaymentError(
      data.message || "Не удалось получить ссылку оплаты",
    );
  }

  return wrapIntermediary(link);
}

/**
 * Creates a Visa/MC (Freedom Pay) payment link for the 4YOU Basecamp BURN product.
 * Uses GeneratedFirstStep endpoint with type + clubId so backend resolves the product.
 */
export async function createCardPayment(input: PaymentInput): Promise<string> {
  const utm = getUtm();
  const startTime = deliveryDateToDate(input.deliveryDate);
  const startTimeMs = startTime.getTime();
  const body = {
    phoneNumber: input.phoneNumber,
    clubId: input.clubId,
    type: PROGRAM_TYPE,
    startTime,
    utm_campaign: utm.utm_campaign,
    utm_source: utm.utm_source,
    utm_medium: utm.utm_medium,
    utm_content: utm.utm_content,
    utm_referrer: utm.utm_referrer,
    input: {
      type: PROGRAM_TYPE,
      clubId: input.clubId,
      startTime: startTimeMs,
      selectedMarathonEventId: input.deliveryDate,
    },
    userFormData: null,
    ...(input.promocode ? { promocode: input.promocode } : {}),
  };

  const { ok, status, data } = await postJson<CardResponse>(
    "registerCardTokenGeneratedFirstStep",
    body,
  );

  if (!ok) {
    throw new PaymentError(
      data.message || `Ошибка ${status}`,
      input.promocode ? "promocode" : "general",
    );
  }

  if (!data.url) {
    throw new PaymentError(
      data.message || "Не удалось получить ссылку оплаты",
    );
  }

  return wrapIntermediary(data.url);
}
