import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { expandClubTrainings, getClub } from "@/data/clubs";
import { usePaymentModal } from "@/components/feature/PaymentModalContext";
import { useSnapCarousel } from "@/lib/useSnapCarousel";
import { asset } from "@/lib/asset";

const C = {
  blue: "#8ABAD5",
  blueBright: "#6BC6F2",
  ink: "#201E1E",
  muted: "#DADADA",
};

const APP_URL = "https://herosjourney.kz/app";

/** Static styled maps per club (with HJ pin). Files live in /public/photos. */
const CLUB_MAP: Record<string, string> = {
  villa: asset("/photos/HJMAPS_VILLA.jpg"),
  colibri: asset("/photos/HJMAPS_COLIBRI.jpg"),
  "4you": asset("/photos/HJMAPS_4YOU.jpg"),
  promenade: asset("/photos/HJMAPS_PROMENADE.jpg"),
  nurly: asset("/photos/HJMAPS_NURLYORDA.jpg"),
  europe: asset("/photos/HJMAPS_EUROPECITY.jpg"),
};

/** Same onboarding steps as the fitness-checkup landing, adapted to the
 * Basecamp light theme. */
const AFTER_PURCHASE_STEPS: {
  number: string;
  title: string;
  body: string;
  icon?: string;
  image?: string;
  cta?: { label: string; href: string };
}[] = [
  {
    number: "01",
    title: "Скачай приложение Hero's Journey",
    body: "Установи официальное приложение, чтобы записываться на тренировки и видеть свои результаты.",
    image: asset("/logo/google_apple.png"),
    cta: { label: "Скачать", href: APP_URL },
  },
  {
    number: "02",
    title: "Пройди регистрацию",
    body: "Укажи тот же номер телефона, который вводил при оплате — программа автоматически привяжется к аккаунту.",
    icon: "ri-smartphone-line",
  },
  {
    number: "03",
    title: "Запишись на тренировки",
    body: "Выбери удобное время по готовому расписанию в течение 14 дней с момента покупки. На входе в студию отсканируй QR-код.",
    icon: "ri-calendar-check-line",
  },
];

export default function ClubPage() {
  const { id } = useParams<{ id: string }>();
  const club = id ? getClub(id) : undefined;
  const { open } = usePaymentModal();
  // Compute trainings list unconditionally so hook order stays stable when the
  // redirect branch fires below.
  const trainings = club ? expandClubTrainings(club) : [];
  const totalCount = trainings.reduce((s, t) => s + (t.bonus ? 0 : t.count), 0);
  const hasAssessment = trainings.some((t) => t.bonus);
  const carousel = useSnapCarousel(trainings.length);

  // Floating CTA: visible while scrolling, hides once the in-flow ("dock")
  // button scrolls into view so the two never overlap.
  const dockRef = useRef<HTMLDivElement>(null);
  const [dockVisible, setDockVisible] = useState(false);

  // React Router preserves scroll position across route changes; force the
  // club page to open from the top whenever `id` changes.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [id]);

  useEffect(() => {
    const el = dockRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setDockVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [id]);

  if (!club) return <Navigate to="/" replace />;

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap&subset=cyrillic,latin"
        rel="stylesheet"
      />

      <div className="hj-brand min-h-screen bg-white text-[#201E1E]">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-neutral-200">
          <div className="mx-auto max-w-[720px] px-4 py-3 flex items-center">
            <Link to="/" className="text-sm font-medium hover:text-black text-neutral-600">
              ← Basecamp
            </Link>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[520px] px-5 sm:max-w-[640px] sm:px-6 lg:max-w-[720px]">
          {/* HERO — name above, compact photo, contacts below */}
          <section className="mt-6 sm:mt-8">
            <div className="text-center">
              <p className="hj-title uppercase tracking-widest text-[13px] sm:text-sm text-neutral-500">
                {club.city}
              </p>
              <h1 className="mt-2 hj-title uppercase leading-[0.9] text-[#201E1E] text-[clamp(44px,12vw,80px)]">
                HJ {club.label}
              </h1>
            </div>

            {/* Branch description */}
            {club.description && (
              <p className="mt-6 text-center text-sm sm:text-base text-neutral-700 leading-relaxed max-w-xl mx-auto">
                {club.description}
              </p>
            )}

            {/* Map + hours & address block, side by side on desktop */}
            {(club.address || club.schedule) && (
              <div className="mt-6 flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto items-stretch">
                {CLUB_MAP[club.id] && (
                  <div className="sm:w-1/2 overflow-hidden rounded-2xl border" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                    <img
              loading="lazy"
              decoding="async"
                      src={CLUB_MAP[club.id]}
                      alt={`Карта — ${club.label}`}
                      className="h-48 sm:h-full w-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                )}
                <div
                  className="sm:w-1/2 rounded-2xl border p-5 sm:p-6"
                  style={{ borderColor: "rgba(0,0,0,0.08)", background: "#f7f7f7" }}
                >
                  <p className="text-center uppercase tracking-widest text-[11px] font-bold opacity-45">
                    Режим работы и адрес
                  </p>
                <dl className="mt-4 space-y-2.5 text-sm sm:text-base">
                  {club.address && (
                    <div className="flex items-start gap-3">
                      <i className="ri-map-pin-2-line text-lg shrink-0" style={{ color: C.blue }} />
                      <span className="text-neutral-800">{club.address}</span>
                    </div>
                  )}
                  {club.schedule && (
                    <div className="flex items-start gap-3">
                      <i className="ri-time-line text-lg shrink-0" style={{ color: C.blue }} />
                      <span className="text-neutral-800 leading-snug">
                        Пн–Пт: {club.schedule.weekday}
                        <br />
                        Сб–Вс и праздничные: {club.schedule.weekend}
                      </span>
                    </div>
                  )}
                  {club.schedule && (
                    <div className="flex items-start gap-3">
                      <i className="ri-customer-service-2-line text-lg shrink-0" style={{ color: C.blue }} />
                      <span className="text-neutral-800">
                        Отдел продаж, Пн–Вс: {club.schedule.sales}
                      </span>
                    </div>
                  )}
                  </dl>
                </div>
              </div>
            )}
          </section>

          {/* TRAININGS — swipeable carousel */}
          <section className="mt-16 sm:mt-20">
            <h2 className="text-center hj-title uppercase leading-[0.95] text-[clamp(30px,8vw,52px)]">
              Какие тренировки доступны<br />за 2 недели?
            </h2>
            <p className="mt-3 text-center text-sm sm:text-base opacity-70">
              {totalCount} тренировок{hasAssessment ? " + assessment" : ""} · свайпни, чтобы посмотреть каждую
            </p>

            <div
              ref={carousel.ref}
              onScroll={carousel.onScroll}
              className="mt-8 mx-auto max-w-[420px] flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar rounded-[28px]"
              style={{ scrollbarWidth: "none" }}
            >
              {trainings.map((t) => (
                <div
                  key={t.key}
                  className="relative w-full shrink-0 snap-center"
                  style={{ scrollSnapAlign: "center" }}
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-200 [container-type:inline-size]">
                    {t.combo ? (
                      /* "Choose one" slot (Upper Body / Reshape): colored card with
                         kicker, description and two labelled half-images. */
                      <div className="absolute inset-0 flex flex-col px-4 pt-5 pb-4 text-white" style={{ background: t.comboBg }}>
                        <p className="text-center hj-title uppercase tracking-widest text-lg sm:text-xl">
                          {t.count} тренировки на выбор
                        </p>
                        <p className="mt-2 text-center text-[12px] sm:text-sm leading-snug opacity-95 max-w-[92%] mx-auto">
                          {t.body}
                        </p>
                        <div className="mt-3 flex min-h-0 flex-1 flex-col gap-2">
                          {t.combo.map((o) => (
                            <div key={o.label} className="relative min-h-0 flex-1 overflow-hidden rounded-2xl">
                              <img
              loading="lazy"
              decoding="async"
                                src={o.photo}
                                alt={o.label}
                                className="absolute inset-0 h-full w-full object-cover"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="hj-title uppercase leading-none text-white text-[clamp(28px,13cqw,60px)] drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
                                  {o.label}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        <img
              loading="lazy"
              decoding="async"
                          src={t.photo}
                          alt={t.title}
                          className="absolute inset-0 h-full w-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/25" />
                        <div className="relative flex h-full w-full flex-col items-center justify-center px-6 text-center text-white">
                          <p className="hj-title uppercase tracking-widest text-base sm:text-lg">
                            {t.countLabel}
                          </p>
                          <h3 className="mt-2 hj-title uppercase leading-none text-[clamp(44px,12vw,80px)]">
                            {t.title}
                          </h3>
                          <p className="mt-4 text-sm sm:text-base max-w-md">
                            {t.body}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* dot pagination */}
            <div className="mt-5 flex justify-center gap-2">
              {trainings.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Тренировка ${i + 1}`}
                  onClick={() => carousel.goTo(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === carousel.index ? "w-2 bg-neutral-900" : "w-2 bg-neutral-300"
                  }`}
                />
              ))}
            </div>

            <div ref={dockRef} className="mt-10 flex flex-col items-center">
              <button
                type="button"
                onClick={() => open({ clubId: club.id })}
                className="inline-flex flex-col items-center justify-center rounded-3xl px-10 py-3 sm:px-14 sm:py-4 shadow-lg transition hover:brightness-110"
                style={{ background: C.blueBright }}
              >
                <span className="hj-title text-3xl sm:text-4xl tracking-wide text-white">
                  ЗАПИСАТЬСЯ
                </span>
                <span className="mt-1 text-xs sm:text-sm font-semibold tracking-widest uppercase text-white/95">
                  за 19 990 тг
                </span>
              </button>
            </div>
          </section>

          {/* AFTER PURCHASE — onboarding steps (same mechanics as fitness-checkup) */}
          <section className="mt-16 sm:mt-20">
            <p className="text-center uppercase tracking-widest text-xs sm:text-sm" style={{ color: C.muted }}>
              После покупки
            </p>
            <h2 className="mt-3 text-center hj-title uppercase leading-[0.95] text-[clamp(30px,8vw,52px)]">
              Что делать после оплаты?
            </h2>

            <div className="mt-8 space-y-3 sm:space-y-4">
              {AFTER_PURCHASE_STEPS.map((s) => (
                <div
                  key={s.number}
                  className="rounded-2xl border p-5 sm:p-6"
                  style={{ borderColor: "rgba(0,0,0,0.08)", background: "#f7f7f7" }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white border border-black/5">
                      {s.image ? (
                        <img src={s.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain p-1.5" />
                      ) : (
                        <i className={`${s.icon} text-3xl sm:text-4xl`} style={{ color: C.blue }} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-[11px] uppercase tracking-widest font-bold opacity-45">
                        Шаг {s.number}
                      </p>
                      <h3 className="mt-1.5 hj-title uppercase text-xl sm:text-2xl tracking-wide leading-none">
                        {s.title}
                      </h3>
                      <p className="mt-2 text-[13px] sm:text-sm leading-snug opacity-75">{s.body}</p>
                      {s.cta && (
                        <a
                          href={s.cta.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs sm:text-sm font-semibold uppercase tracking-widest text-white transition hover:brightness-110"
                          style={{ background: C.blue }}
                        >
                          <i className="ri-download-line text-base" />
                          {s.cta.label}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="h-24" />
        </div>

        <footer className="bg-black text-neutral-400">
          <div className="mx-auto max-w-[720px] px-4 sm:px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-5 text-xs sm:text-sm">
            <div className="text-center sm:text-left flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <p>© {new Date().getFullYear()} Hero's Journey · Все права защищены.</p>
              <Link to="/" className="underline underline-offset-4 hover:text-white transition-colors">На главную</Link>
            </div>
            <img
              loading="lazy"
              decoding="async"
              src={asset("/logo/astanahub_logo.png")}
              alt="Astana Hub"
              className="h-10 w-auto object-contain opacity-70"
            />
          </div>
        </footer>

        {/* Floating CTA — always visible while scrolling; hides once the
           in-flow dock button is on screen so they never overlap. */}
        <div
          className={`fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/90 backdrop-blur transition-all duration-300 ${
            dockVisible ? "pointer-events-none translate-y-full opacity-0" : "translate-y-0 opacity-100"
          }`}
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 10px)" }}
        >
          <div className="mx-auto flex max-w-[520px] justify-center px-4 pt-2.5 sm:max-w-[640px] sm:px-6">
            <button
              type="button"
              onClick={() => open({ clubId: club.id })}
              className="inline-flex items-center justify-center rounded-3xl px-12 py-3 sm:px-16 sm:py-3.5 shadow-lg transition hover:brightness-110"
              style={{ background: C.blueBright }}
            >
              <span className="hj-title text-2xl sm:text-3xl tracking-wide text-white leading-none">
                ЗАПИСАТЬСЯ
              </span>
            </button>
          </div>
        </div>

        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
        `}</style>
      </div>
    </>
  );
}
