/**
 * Meta Pixel helpers. The base PageView fires from index.html on every load.
 * These functions trigger custom Standard Events from React.
 */

declare global {
  interface Window {
    fbq?: (
      command: string,
      eventName: string,
      params?: Record<string, unknown>,
    ) => void;
  }
}

/** KZT price of the Hero's Journey Basecamp product. */
const VALUE = 19990;
const CURRENCY = "KZT";

function track(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", eventName, params);
}

export const pixel = {
  /** Виден ли пользователю основной CTA-блок / страница продукта. */
  viewContent: () =>
    track("ViewContent", {
      content_name: "Hero's Journey Basecamp",
      content_category: "fitness",
      value: VALUE,
      currency: CURRENCY,
    }),

  /** Открыл попап оплаты. */
  initiateCheckout: () =>
    track("InitiateCheckout", {
      value: VALUE,
      currency: CURRENCY,
      num_items: 1,
    }),

  /** Успешная оплата (вызвать только если backend подтвердит — например, на success-странице). */
  purchase: (overrides?: { value?: number; currency?: string }) =>
    track("Purchase", {
      value: overrides?.value ?? VALUE,
      currency: overrides?.currency ?? CURRENCY,
    }),
};
