import { useEffect, useRef, useState } from "react";
import {
  PaymentError,
  createCardPayment,
  createKaspiPayment,
  validatePromocode,
  cleanPhone,
  type DeliveryDate,
  type PaymentMethod,
} from "@/lib/payment";
import { pixel } from "@/lib/pixel";
import { gtm } from "@/lib/gtm";
import { logToSheet } from "@/lib/sheets";
import { getUtm } from "@/lib/utm";
import { asset } from "@/lib/asset";
import { getClub, type ClubId } from "@/data/clubs";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  clubBackendId: string;
  clubId: ClubId;
}

const PRODUCT = {
  title: "Hero's Journey · Basecamp",
  program: "6 тренировок",
  address: "Алматы · Астана",
  /** Base price in tenge, before any promocode discount. */
  basePrice: 19990,
};

/** Pretty-print a tenge amount with non-breaking space thousands separator. */
function formatTenge(amount: number): string {
  return amount.toLocaleString("ru-RU").replace(/,/g, " ") + " тг";
}

/** Format raw KZ digit string into "8(XXX) XXX-XX-XX". */
function formatKz(digits: string): string {
  let body = digits.startsWith("8") ? digits.slice(1) : digits;
  body = body.slice(0, 10);
  let r = "8";
  if (body.length > 0) r += "(" + body.slice(0, 3);
  if (body.length >= 3) r += ") " + body.slice(3, 6);
  if (body.length >= 6) r += "-" + body.slice(6, 8);
  if (body.length >= 8) r += "-" + body.slice(8, 10);
  return r;
}

export default function PaymentModal({ open, onClose, clubBackendId, clubId }: PaymentModalProps) {
  const [phone, setPhone] = useState("");
  const digitsRef = useRef("");
  const [phoneConfirm, setPhoneConfirm] = useState("");
  const digitsConfirmRef = useRef("");
  const [deliveryDate, setDeliveryDate] = useState<DeliveryDate>("сегодня");
  const [promocode, setPromocode] = useState("");
  const [validatedPromo, setValidatedPromo] = useState<{ code: string; discount: number } | null>(
    null,
  );
  const [checkingPromo, setCheckingPromo] = useState(false);
  const [submitting, setSubmitting] = useState<PaymentMethod | null>(null);
  const [error, setError] = useState<{ message: string; kind: "promocode" | "general" } | null>(
    null,
  );
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Fire analytics once per modal open — kept separate from the effect below,
  // which re-runs on every `submitting` change.
  useEffect(() => {
    if (!open) return;
    pixel.initiateCheckout();
    gtm.initiateCheckout();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    // Focus the phone input shortly after open animation
    const t = setTimeout(() => firstInputRef.current?.focus(), 100);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, onClose, submitting]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setSubmitting(null);
      setError(null);
      setPhone("");
      digitsRef.current = "";
      setPhoneConfirm("");
      digitsConfirmRef.current = "";
      setPromocode("");
      setValidatedPromo(null);
      setCheckingPromo(false);
      setDeliveryDate("сегодня");
    }
  }, [open]);

  const digits = digitsRef.current || cleanPhone(phone);
  const digitsConfirm = digitsConfirmRef.current || cleanPhone(phoneConfirm);
  const phoneValid = digits.length === 11;
  const phonesMatch = digits === digitsConfirm;
  const trimmedPromo = promocode.trim().toUpperCase();
  const promoApplied =
    validatedPromo && validatedPromo.code === trimmedPromo ? validatedPromo : null;
  const discount = promoApplied?.discount ?? 0;
  const finalPrice = Math.round(PRODUCT.basePrice * (1 - discount));

  // Drop a previously-validated promo if the user edits the field after applying.
  useEffect(() => {
    if (validatedPromo && validatedPromo.code !== trimmedPromo) {
      setValidatedPromo(null);
    }
  }, [trimmedPromo, validatedPromo]);

  async function handleCheckPromo() {
    const code = trimmedPromo;
    if (!code || checkingPromo) return;
    setError(null);
    setCheckingPromo(true);
    try {
      const { discount: d } = await validatePromocode(code, PRODUCT.basePrice, clubBackendId);
      setValidatedPromo({ code, discount: d });
      gtm.applyPromo(code, d);
    } catch (err) {
      setValidatedPromo(null);
      const message =
        err instanceof PaymentError
          ? err.message
          : "Не удалось проверить промокод, попробуйте позже";
      setError({ message, kind: "promocode" });
    } finally {
      setCheckingPromo(false);
    }
  }

  if (!open) return null;

  async function handlePay(method: PaymentMethod) {
    setError(null);
    if (!phoneValid || digitsConfirm.length !== 11) {
      setError({ message: "Введите корректный номер телефона", kind: "general" });
      firstInputRef.current?.focus();
      return;
    }
    if (!phonesMatch) {
      setError({ message: "Номера телефонов не совпадают", kind: "general" });
      return;
    }
    setSubmitting(method);
    const input = {
      clubId: clubBackendId,
      phoneNumber: digits,
      deliveryDate,
      promocode: promoApplied?.code || undefined,
    };

    const utm = getUtm();
    const baseRow = {
      phoneNumber: digits,
      paymentMethod: method,
      deliveryDate,
      promocode: input.promocode ?? null,
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
      utm_content: utm.utm_content,
      utm_referrer: utm.utm_referrer,
      clubId: clubBackendId,
    };

    // Log the attempt immediately so we capture every click, even if the
    // backend or network fails afterwards.
    logToSheet({ ...baseRow, status: "attempt" });

    try {
      const url =
        method === "kaspi"
          ? await createKaspiPayment(input)
          : await createCardPayment(input);

      // Backend gave us a payment link — log success and redirect.
      logToSheet({ ...baseRow, status: "link_created" });
      gtm.paymentLinkCreated(method, { value: finalPrice });

      // Iframe-aware redirect: navigate the top window so the Kaspi/Freedom
      // page opens on the parent (herosjourney.kz) instead of inside the iframe.
      try {
        const top = window.top;
        if (top && top !== window.self) {
          top.location.href = url;
        } else {
          window.location.replace(url);
        }
      } catch {
        window.location.replace(url);
      }
    } catch (err) {
      if (err instanceof PaymentError) {
        // Promocode errors stay specific; any other backend rejection means
        // the user is already in the Kolibri database (existing client).
        // Same copy as the original Tilda form's catch-alert.
        const message =
          err.kind === "promocode"
            ? err.message
            : "Данная программа только для новых пользователей, которые не тренировались в Hero's Journey";
        setError({ message, kind: err.kind });
        logToSheet({ ...baseRow, status: "error", errorMessage: err.message });
        gtm.paymentError(method, err.kind, err.message);
      } else {
        const msg = err instanceof Error ? err.message : String(err);
        setError({ message: "Сетевая ошибка, попробуйте позже", kind: "general" });
        logToSheet({ ...baseRow, status: "network_error", errorMessage: msg });
        gtm.paymentError(method, "network", msg);
      }
      setSubmitting(null);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
      className="hj-brand fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={() => !submitting && onClose()}
    >
      <div className="fixed inset-0 bg-black/55 backdrop-blur-sm" />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl bg-white text-[#201E1E] border border-neutral-200 shadow-2xl overflow-hidden flex flex-col my-auto"
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          disabled={!!submitting}
          aria-label="Закрыть"
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <i className="ri-close-line text-xl" />
        </button>

        {/* Header — tight to save vertical space */}
        <div className="px-5 md:px-7 pt-5 md:pt-6 pb-4 border-b border-neutral-200 flex-shrink-0">
          <h2
            id="payment-modal-title"
            className="hj-title uppercase text-2xl md:text-3xl leading-tight"
          >
            {PRODUCT.title}
          </h2>
          <p className="mt-1 text-neutral-600 text-xs md:text-sm">{PRODUCT.program}</p>
          <p className="mt-1 text-sm font-semibold" style={{ color: "#8ABAD5" }}>
            HJ {getClub(clubId)?.label}
          </p>
          <p className="mt-2 text-neutral-500 text-[11px] leading-snug">
            Укажи номер, который будешь использовать при регистрации в приложении Hero's Journey — он привяжется к твоему аккаунту автоматически.
          </p>
        </div>

        {/* Body — flows naturally, no internal scroll */}
        <div className="px-5 md:px-7 py-4 space-y-3">
          {error && error.kind === "general" && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700 leading-snug">
              {error.message}
            </div>
          )}

          {/* Phone */}
          <div>
            <label htmlFor="pm-phone" className="block text-xs uppercase tracking-widest text-neutral-500 font-semibold mb-1.5">
              Номер телефона
            </label>
            <input
              ref={firstInputRef}
              id="pm-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onKeyDown={(e) => {
                if (e.key === "Backspace") {
                  e.preventDefault();
                  const newDigits = digitsRef.current.slice(0, -1);
                  digitsRef.current = newDigits;
                  setPhone(newDigits ? formatKz(newDigits) : "");
                }
              }}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
                digitsRef.current = digits;
                setPhone(digits ? formatKz(digits) : "");
              }}
              placeholder="8(7XX) XXX-XX-XX"
              disabled={!!submitting}
              className="w-full bg-neutral-50 border border-neutral-200 focus:border-[#8ABAD5] focus:ring-2 focus:ring-[#8ABAD5]/25 focus:outline-none rounded-lg px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors disabled:opacity-50"
            />
          </div>

          {/* Phone confirmation */}
          <div>
            <label htmlFor="pm-phone-confirm" className="block text-xs uppercase tracking-widest text-neutral-500 font-semibold mb-1.5">
              Подтвердите номер
            </label>
            <input
              id="pm-phone-confirm"
              type="tel"
              inputMode="tel"
              autoComplete="off"
              value={phoneConfirm}
              onKeyDown={(e) => {
                if (e.key === "Backspace") {
                  e.preventDefault();
                  const newDigits = digitsConfirmRef.current.slice(0, -1);
                  digitsConfirmRef.current = newDigits;
                  setPhoneConfirm(newDigits ? formatKz(newDigits) : "");
                }
              }}
              onChange={(e) => {
                const d = e.target.value.replace(/\D/g, "").slice(0, 11);
                digitsConfirmRef.current = d;
                setPhoneConfirm(d ? formatKz(d) : "");
              }}
              placeholder="8(7XX) XXX-XX-XX"
              disabled={!!submitting}
              className="w-full bg-neutral-50 border border-neutral-200 focus:border-[#8ABAD5] focus:ring-2 focus:ring-[#8ABAD5]/25 focus:outline-none rounded-lg px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors disabled:opacity-50"
            />
            {digitsConfirm.length === 11 && !phonesMatch && (
              <p className="mt-2 text-sm text-red-600">Номера не совпадают</p>
            )}
          </div>

          {/* Delivery date */}
          <div>
            <label htmlFor="pm-date" className="block text-xs uppercase tracking-widest text-neutral-500 font-semibold mb-1.5">
              Дата старта программы
            </label>
            <select
              id="pm-date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value as DeliveryDate)}
              disabled={!!submitting}
              className="w-full bg-neutral-50 border border-neutral-200 focus:border-[#8ABAD5] focus:ring-2 focus:ring-[#8ABAD5]/25 focus:outline-none rounded-lg px-3.5 py-2.5 text-sm text-neutral-900 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <option value="сегодня">Сегодня</option>
              <option value="завтра">Завтра</option>
              <option value="послезавтра">Послезавтра</option>
            </select>
          </div>

          {/* Promocode */}
          <div>
            <label htmlFor="pm-promo" className="block text-xs uppercase tracking-widest text-neutral-500 font-semibold mb-1.5">
              Промокод <span className="normal-case text-neutral-400">(необязательно)</span>
            </label>
            <div className="flex gap-2">
              <input
                id="pm-promo"
                type="text"
                autoComplete="off"
                maxLength={32}
                value={promocode}
                onChange={(e) => setPromocode(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCheckPromo();
                  }
                }}
                placeholder="HERO"
                disabled={!!submitting}
                className="flex-1 min-w-0 bg-neutral-50 border border-neutral-200 focus:border-[#8ABAD5] focus:ring-2 focus:ring-[#8ABAD5]/25 focus:outline-none rounded-lg px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleCheckPromo}
                disabled={
                  !!submitting || checkingPromo || !trimmedPromo || !!promoApplied
                }
                className="flex-shrink-0 inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {checkingPromo ? (
                  <span className="inline-block w-3.5 h-3.5 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
                ) : (
                  "Проверить"
                )}
              </button>
            </div>
            {discount > 0 && (
              <p className="mt-2 text-sm text-emerald-600 inline-flex items-center gap-1.5">
                <i className="ri-checkbox-circle-fill" />
                Промокод применён — скидка {formatTenge(PRODUCT.basePrice - finalPrice)}
              </p>
            )}
            {error && error.kind === "promocode" && (
              <p className="mt-2 text-sm text-red-600">{error.message}</p>
            )}
          </div>

          {/* Total — updates instantly when a valid promocode is entered */}
          <div className="pt-3 border-t border-neutral-200 flex items-baseline justify-between gap-3 flex-wrap">
            <p className="text-xs uppercase tracking-widest text-neutral-500 font-semibold flex-shrink-0">
              К оплате
            </p>
            <div className="flex items-baseline gap-2.5 flex-wrap">
              {discount > 0 && (
                <span className="text-neutral-400 text-base line-through">
                  {formatTenge(PRODUCT.basePrice)}
                </span>
              )}
              <span
                className={`hj-title text-3xl md:text-4xl leading-none ${discount > 0 ? "text-emerald-600" : "text-[#201E1E]"}`}
              >
                {formatTenge(finalPrice)}
              </span>
            </div>
          </div>

        </div>

        {/* Footer — payment buttons, safe-area for mobile */}
        <div
          className="px-4 md:px-7 pt-2.5 pb-3 md:pb-4 flex flex-col sm:flex-row gap-2 border-t border-neutral-200 flex-shrink-0 bg-white"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}
        >
          <button
            type="button"
            onClick={() => handlePay("kaspi")}
            disabled={!!submitting}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#F14635] !text-white px-4 py-2.5 text-sm font-semibold cursor-pointer transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {submitting === "kaspi" ? (
              <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <img
                src={asset("/logo/kaspi.png")}
                alt=""
                className="h-5 w-auto object-contain"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            )}
            Kaspi
          </button>
          <button
            type="button"
            onClick={() => handlePay("card")}
            disabled={!!submitting}
            className="flex-1 inline-flex items-center justify-center rounded-full !text-white px-4 py-2 text-sm font-semibold cursor-pointer transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            style={{ background: "#22C55E" }}
          >
            {submitting === "card" ? (
              <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <img
                src={asset("/logo/visa_mc.png")}
                alt="Visa / Mastercard"
                className="h-6 w-auto object-contain"
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
