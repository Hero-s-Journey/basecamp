/**
 * Google Tag Manager dataLayer helpers.
 *
 * GTM is loaded from index.html (container `GTM-KZDVZM9V`). From React we just
 * push named events into `window.dataLayer`. In the GTM web UI those events
 * are routed to GA4 / Meta CAPI / Yandex Metrika / etc. so we never have to
 * configure individual destinations in code.
 */

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

/** Base price of the Hero's Journey Basecamp product. */
const VALUE = 19990;
const CURRENCY = "KZT";

function push(event: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}

export const gtm = {
  /** User scrolled the main CTA block into view. */
  viewContent: () =>
    push("view_content", {
      content_name: "Hero's Journey Basecamp",
      content_category: "fitness",
      value: VALUE,
      currency: CURRENCY,
    }),

  /** User opened the payment modal. */
  initiateCheckout: () =>
    push("begin_checkout", {
      value: VALUE,
      currency: CURRENCY,
      num_items: 1,
    }),

  /** A valid promocode was entered (client-side check). */
  applyPromo: (code: string, discount: number) =>
    push("apply_promo", {
      promo_code: code,
      discount,
      value_after: Math.round(VALUE * (1 - discount)),
      currency: CURRENCY,
    }),

  /** Backend returned a payment link — user is about to be redirected. */
  paymentLinkCreated: (
    method: "kaspi" | "card",
    overrides?: { value?: number },
  ) =>
    push("payment_link_created", {
      payment_method: method,
      value: overrides?.value ?? VALUE,
      currency: CURRENCY,
    }),

  /** Backend rejected the payment request. */
  paymentError: (
    method: "kaspi" | "card",
    kind: "promocode" | "general" | "network",
    message: string,
  ) =>
    push("payment_error", {
      payment_method: method,
      error_kind: kind,
      error_message: message,
    }),
};
