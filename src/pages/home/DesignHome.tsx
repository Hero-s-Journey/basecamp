import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { asset } from "@/lib/asset";
import { CLUBS, CITIES, UPCOMING_CLUBS, type CityId, type Club, type UpcomingClub } from "@/data/clubs";
import { useSnapCarousel } from "@/lib/useSnapCarousel";

// Design palette (from designer)
const C = {
  blue: "#8ABAD5",
  blueBright: "#6BC6F2",
  ink: "#201E1E",
  night: "#1E1E1E",
  muted: "#DADADA",
  mutedSoft: "rgba(218,218,218,0.65)",
};

// ---------- data ----------

type DiffCard = {
  kicker: string;
  title: string;
  body: string;
  video?: string;
  poster?: string;
  hasPrograms?: boolean;
};

const DIFF_CARDS: DiffCard[] = [
  {
    kicker: "АВТОМАТИЗАЦИЯ",
    title: "Планшет на каждом тренажёре",
    body: "Подходишь к тренажёру — и планшет уже показывает инструкцию, рекомендованный вес на каждое упражнение и подход, хранит историю весов со всех тренировок. Ты не считаешь, не вспоминаешь и не гадаешь — просто берёшь и работаешь.",
    video: asset("/video/planshet_lowq.mp4"),
    poster: asset("/video/static.jpg"),
  },
  {
    kicker: "ДАННЫЕ",
    title: "Пульсометр",
    body: "Во время тренировки система видит, как работает твоё сердце: в какой пульсовой зоне ты тренируешься, сколько сжёг калорий и как восстанавливаешься между подходами. По этим данным мы корректируем следующие тренировки.",
    video: asset("/video/pulsometr_lowq.mp4"),
    poster: asset("/video/static.jpg"),
  },
  {
    kicker: "СОПРОВОЖДЕНИЕ",
    title: "Тренер на каждой тренировке",
    body: "На каждой тренировке рядом тренер: ставит технику, страхует и подсказывает, как делать упражнения правильно. В других залах это персональные занятия за отдельные деньги — здесь работа тренера входит в абонемент.",
    video: asset("/video/trainers_lowq.mp4"),
    poster: asset("/video/static.jpg"),
  },
  {
    kicker: "ПРОЗРАЧНОСТЬ",
    title: "Ты знаешь, что тебя ждет",
    body: "Записываешься на тренировку в приложении и там же видишь, какие упражнения тебя ждут. Никакой неизвестности: можно заранее понять, что будет на тренировке, и прийти готовым.",
  },
  {
    kicker: "АНАЛИТИКА",
    title: "Отчёт после тренировки",
    body: "После занятия ты получаешь детальный разбор: пульсовые зоны, сожжённые калории, вес на каждом подходе и десятки других показателей.",
  },
  {
    kicker: "СИСТЕМА",
    title: "Готовый план тренировок",
    body: "Индивидуальная программа на месяцы вперёд. Каждый месяц — отдельный цикл под конкретную цель: жиросжигание, набор мышц, выносливость, ноги и ягодицы или сбалансированная проработка.",
    hasPrograms: true,
  },
];

/** One training hall (зона) shown as a story slide inside the type modal.
 * Photos are the same training shots used on the club pages (/public/photos). */
type Zone = {
  key: string;
  title: string;
  tagline: string;
  photo: string;
  /** Направления as chips: name + short note. */
  directions?: { name: string; note?: string }[];
  /** Meta line under the chips (variation count). */
  meta?: string;
  /** One big selling number. */
  stat?: { value: string; label: string };
  bullets?: string[];
  /** Clubs where this zone is available (Reshape, Mind & Body). */
  availability?: string;
};

type TrainingType = {
  key: string;
  kicker: string;
  title: string;
  body: string;
  zones: Zone[];
};

const TRAINING_TYPES: TrainingType[] = [
  {
    key: "strength",
    kicker: "Основа программы",
    title: "СИЛОВЫЕ",
    body: "Работа на тренажёрах и со свободными весами.",
    zones: [
      {
        key: "upper-body",
        title: "UPPER BODY",
        tagline:
          "Силовые тренировки на верх тела: грудь, спина, плечи, руки. Тренажёры с индивидуально подобранным весом и видео-инструкцией.",
        photo: asset("/photos/upper.jpg"),
        directions: [
          { name: "Full Body", note: "всё тело" },
          { name: "Upper", note: "грудь, спина, плечи" },
          { name: "Push", note: "грудь и трицепс" },
          { name: "Pull", note: "спина и бицепс" },
          { name: "Arms", note: "руки и плечи" },
        ],
        meta: "Больше 30 вариаций тренировок",
      },
      {
        key: "legs",
        title: "LEGS",
        tagline:
          "Силовые тренировки на низ тела: ноги и ягодицы. Тренажёры с индивидуально подобранным весом и видео-инструкцией.",
        photo: asset("/photos/legs.jpg"),
        directions: [
          { name: "Legs", note: "бёдра, голень, ягодицы" },
          { name: "Glute", note: "точечно на ягодичные" },
        ],
        meta: "Больше 25 вариаций тренировок",
      },
    ],
  },
  {
    key: "hiit",
    kicker: "Основа программы",
    title: "ИНТЕРВАЛЬНЫЕ",
    body: "Кардио и функциональные упражнения.",
    zones: [
      {
        key: "bootcamp",
        title: "BOOTCAMP",
        tagline:
          "Интервальная кардио тренировка на беговых дорожках и упражнения на фит-бенчах с гантелями и своим весом.",
        photo: asset("/photos/bootcamo.jpg"),
        stat: { value: "до 1000", label: "калорий за тренировку" },
        bullets: [
          "Разгоняет метаболизм, укрепляет сердце и приводит мышцы в тонус",
        ],
      },
      {
        key: "metcon",
        title: "METCON",
        tagline:
          "Функциональный HIIT (metabolic conditioning): кардио + силовая работа. Выносливость, сила и скорость.",
        photo: asset("/photos/metcon.jpg"),
        stat: { value: "до 1000", label: "калорий за тренировку" },
        bullets: ["Работа на пределе с короткими паузами"],
      },
    ],
  },
  {
    key: "reshape",
    kicker: "Зависит от клуба",
    title: "RESHAPE",
    body: "Проработка глубоких мышц и осанки.",
    zones: [
      {
        key: "reshape",
        title: "RESHAPE",
        tagline:
          "Функциональный пилатес на реформерах Lagree. Пружины и подвижная платформа включают глубокие мышцы, которые не работают на классических тренировках.",
        photo: asset("/photos/reshape.jpg"),
        availability: "Доступен в HJ 4YOU и HJ Villa",
      },
    ],
  },
  {
    key: "mindBody",
    kicker: "Зависит от клуба",
    title: "MIND & BODY",
    body: "Растяжка и восстановление.",
    zones: [
      {
        key: "mind-body",
        title: "MIND & BODY",
        tagline: "Растяжка и восстановление после силовых и интервальных нагрузок.",
        photo: asset("/photos/mindandbody.jpg"),
        availability: "Доступен в HJ Europe City",
      },
    ],
  },
];

/** Modal with story slides: one slide per zone of the tapped training type.
 * A rounded card over a dimmed backdrop (not fullscreen); visual language
 * matches the differentiator carousel. */
function ZoneStoriesOverlay({
  type,
  onClose,
}: {
  type: TrainingType;
  onClose: () => void;
}) {
  const stories = useSnapCarousel(type.zones.length);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="hj-brand fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-5 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={type.title}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[420px] overflow-hidden rounded-[28px] bg-neutral-900 text-white shadow-2xl"
        style={{ height: "min(78dvh, 640px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: type name + close */}
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-center px-5 pt-5">
          <p className="uppercase tracking-widest text-[11px] sm:text-xs font-bold opacity-90">
            {type.title}
          </p>
          <button
            type="button"
            aria-label="Закрыть"
            onClick={onClose}
            className="absolute right-3.5 top-3.5 flex h-9 w-9 items-center justify-center rounded-full bg-black/35 backdrop-blur-md transition hover:bg-black/55"
          >
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        <div
          ref={stories.ref}
          onScroll={stories.onScroll}
          className="flex h-full overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
          style={{ scrollbarWidth: "none" }}
        >
          {type.zones.map((z) => (
            <div key={z.key} className="relative h-full w-full shrink-0 snap-center overflow-hidden">
              <img
              loading="lazy"
              decoding="async"
                src={z.photo}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.62), rgba(0,0,0,0.28) 42%, rgba(0,0,0,0.82))" }}
              />

              <div className="relative flex h-full w-full flex-col px-6 pt-14 pb-10">
                <div className="my-auto text-center">
                  <p className="uppercase tracking-widest text-[10px] sm:text-[11px] font-bold" style={{ color: C.blueBright }}>
                    Зал
                  </p>
                  <h3 className="mt-1.5 hj-title uppercase leading-[0.9] text-[clamp(38px,10vw,56px)]">
                    {z.title}
                  </h3>
                  <p className="mt-3 text-[12px] sm:text-[13px] leading-snug max-w-[95%] mx-auto opacity-95">
                    {z.tagline}
                  </p>

                  {z.directions && (
                    <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                      {z.directions.map((d) => (
                        <span
                          key={d.name}
                          className="rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[10px] sm:text-[11px] backdrop-blur-md"
                        >
                          <span className="font-bold">{d.name}</span>
                          {d.note && <span className="opacity-70"> · {d.note}</span>}
                        </span>
                      ))}
                    </div>
                  )}
                  {z.meta && (
                    <p className="mt-3.5 text-[10px] sm:text-[11px] uppercase tracking-widest opacity-70">
                      {z.meta}
                    </p>
                  )}
                </div>

                <div className="shrink-0 text-center">
                  {z.stat && (
                    <div>
                      <p className="hj-title uppercase leading-none text-[clamp(28px,7vw,40px)]" style={{ color: C.blueBright }}>
                        {z.stat.value}
                      </p>
                      <p className="mt-1 text-[10px] sm:text-[11px] uppercase tracking-widest opacity-80">
                        {z.stat.label}
                      </p>
                    </div>
                  )}
                  {z.bullets && (
                    <p className="mt-3 mx-auto max-w-[300px] text-[12px] sm:text-[13px] leading-snug opacity-90">
                      {z.bullets.join(" · ")}
                    </p>
                  )}
                  {z.availability && (
                    <p className="flex items-center justify-center gap-1.5 text-[12px] sm:text-[13px] font-semibold">
                      <i className="ri-map-pin-2-line text-base" style={{ color: C.blueBright }} />
                      {z.availability}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots — only when there is something to swipe between */}
        {type.zones.length > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3.5 flex justify-center gap-2">
            {type.zones.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Зал ${i + 1}`}
                onClick={() => stories.goTo(i)}
                className={`pointer-events-auto h-2 w-2 rounded-full transition-all ${
                  i === stories.index ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- FAQ ----------

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "Что будет после пробной программы?",
    a: "После прохождения 2-недельной пробной программы ты сможешь оформить полугодовую или годовую клубную карту в удобном клубе сети Hero's Journey и продолжить тренироваться, сохранив уже полученный результат. Повторно пройти эту же или любую другую пробную программу нельзя — она доступна один раз.",
  },
  {
    q: "Можно ли проходить тренировки в разных клубах в рамках пробного абонемента?",
    a: "Нет. При регистрации ты выбираешь один клуб — и все 6 тренировок пробной программы проходят именно там. Сменить клуб в рамках пробной программы нельзя. После Basecamp, при покупке уже полноценного абонемента, ты сможешь выбрать любой клуб сети.",
  },
  {
    q: "Я не в форме и боюсь не справиться",
    a: "Это нормально — первые тренировки тяжёлые для всех, это адаптация, а не сигнал, что формат не подходит. Тренировки подбираются под твой уровень: тренер регулирует нагрузку и вес на каждом тренажёре, а объём и сложность упражнений подстраиваются под твою текущую форму. Ты работаешь в своём темпе, а не догоняешь чужой.",
  },
  {
    q: "Что будет, если я отменю или пропущу тренировку?",
    a: "Если отменить тренировку за 8 часов до начала и раньше — она не сгорает, и её можно перенести на другое время в рамках действия программы. Если отменить меньше чем за 8 часов — тренировка сгорает. Если просто не прийти без отмены — тренировка также сгорает.",
  },
  {
    q: "Можно ли опоздать на тренировку?",
    a: "Лучше приходить за 20–30 минут до начала — чтобы переодеться, взять пульсометр и услышать брифинг тренера. Тренировка идёт по общему таймингу: группа вместе проходит разминку и стартует по станциям. Через 5 минут после старта турникет закрывает вход по QR-коду: включаться в тренировку на середине небезопасно. Тренировка в этом случае сгорает.",
  },
  {
    q: "Можно ли заниматься самостоятельно, без тренера?",
    a: "Нет. Все занятия проходят по расписанию и обязательно с тренером — он следит за техникой, регулирует нагрузку и помогает на каждом этапе. Запись на тренировки — только через приложение.",
  },
  {
    q: "Смогу ли я подобрать время под своё расписание?",
    a: "Да. Тренировки проходят каждый час: первая начинается в 6:50–7:00 утра, последняя стартует в 21:00–21:30 (время может немного отличаться по клубам). Ты сам выбираешь удобное время и записываешься через приложение.",
  },
];

/** FAQ modal: accordion of questions + contacts at the bottom. */
function FaqModal({ onClose }: { onClose: () => void }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="hj-brand fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-5 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="FAQ"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-[520px] flex-col overflow-hidden rounded-[28px] bg-white text-[#201E1E] shadow-2xl"
        style={{ maxHeight: "min(84dvh, 720px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-black/5">
          <p className="hj-title uppercase text-2xl sm:text-3xl tracking-wide">FAQ</p>
          <button
            type="button"
            aria-label="Закрыть"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 transition hover:bg-black/10"
          >
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-6 pb-6">
          {FAQ_ITEMS.map((item, i) => (
            <div key={item.q} className="border-b border-black/5">
              <button
                type="button"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left"
              >
                <span className="text-sm sm:text-[15px] font-semibold leading-snug">
                  {item.q}
                </span>
                <i
                  className={`ri-arrow-down-s-line shrink-0 text-xl transition-transform ${
                    openIdx === i ? "rotate-180" : ""
                  }`}
                  style={{ color: C.blue }}
                />
              </button>
              {openIdx === i && (
                <p className="pb-4 text-[13px] sm:text-sm leading-relaxed opacity-75">
                  {item.a}
                </p>
              )}
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}

/** Contacts modal: WhatsApp + Instagram. */
function ContactsModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="hj-brand fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-5 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Контакты"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[420px] overflow-hidden rounded-[28px] bg-white text-[#201E1E] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-black/5">
          <p className="hj-title uppercase text-2xl sm:text-3xl tracking-wide">Контакты</p>
          <button
            type="button"
            aria-label="Закрыть"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 transition hover:bg-black/10"
          >
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <a
            href="https://wa.me/77172640841"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-2xl border p-4 transition hover:border-black/20"
            style={{ borderColor: "rgba(0,0,0,0.08)", background: "#f7f7f7" }}
          >
            <i className="ri-whatsapp-line text-2xl" style={{ color: C.blue }} />
            <span className="text-sm sm:text-base">
              <span className="font-semibold">Написать на WhatsApp</span>
              <br />
              <span className="opacity-70">+7 717 264 08 41</span>
            </span>
          </a>
          <a
            href="https://instagram.com/herosjourneykz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-2xl border p-4 transition hover:border-black/20"
            style={{ borderColor: "rgba(0,0,0,0.08)", background: "#f7f7f7" }}
          >
            <i className="ri-instagram-line text-2xl" style={{ color: C.blue }} />
            <span className="text-sm sm:text-base">
              <span className="font-semibold">Instagram</span>
              <br />
              <span className="opacity-70">@herosjourneykz</span>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}

/** Placeholder card for a not-yet-opened location (Dubai, NY): same visual
 * language as club cards, but not clickable — with an opening badge and a
 * note for club-card holders instead of the CTA pill. */
function UpcomingClubCard({ info }: { info: UpcomingClub }) {
  return (
    <div
      className="relative mx-auto mt-8 block overflow-hidden rounded-2xl aspect-[4/5] w-full max-w-[420px]"
      style={{ background: C.blue }}
    >
      {info.photo && (
        <img
              loading="lazy"
              decoding="async"
          src={info.photo}
          alt={info.label}
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      )}

      <div className="relative flex h-full w-full flex-col items-center px-5 sm:px-6 pt-7 sm:pt-9 pb-5 sm:pb-6 text-center">
        {/* Country — Suisse Intl Bold */}
        <p className="text-[13px] sm:text-sm uppercase tracking-[0.02em] text-white" style={{ fontWeight: 700 }}>
          {info.country}
        </p>
        {/* City name — Bebas Neue Bold */}
        <p className="mt-2 hj-title uppercase leading-none text-white whitespace-nowrap text-[clamp(36px,10.5vw,60px)]">
          {info.label}
        </p>
        {/* Address — Suisse Intl Regular */}
        <p className="mt-4 text-[14px] sm:text-base text-white leading-snug">
          {info.addressLines.map((line) => (
            <span key={line}>
              {line}
              <br />
            </span>
          ))}
        </p>
        {/* Opening badge */}
        <span className="mt-4 rounded-full border border-white/40 bg-white/15 px-4 py-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md">
          {info.badge}
        </span>

        {/* Note for club-card holders */}
        <p className="mt-auto w-full rounded-xl bg-white/15 border border-white/20 backdrop-blur-md px-4 py-3 text-[12px] sm:text-[13px] leading-snug text-white">
          {info.note}
        </p>
      </div>
    </div>
  );
}

/** Horizontal snap carousel of club cards for the active city. Keyed by city
 * in the parent so index/scroll reset when the tab changes. */
function ClubCarousel({ clubs }: { clubs: Club[] }) {
  const car = useSnapCarousel(clubs.length);

  return (
    <>
      <div
        ref={car.ref}
        onScroll={car.onScroll}
        className="mt-8 flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-proximity scroll-smooth no-scrollbar -mx-5 px-5 sm:-mx-6 sm:px-6"
        style={{ scrollbarWidth: "none" }}
      >
        {clubs.map((c) => (
          <Link
            key={c.id}
            to={`/clubs/${c.id}`}
            className="group relative block shrink-0 snap-center overflow-hidden rounded-2xl aspect-[4/5] w-[82vw] max-w-[420px] sm:w-[420px]"
            style={{ background: C.blue }}
          >
            {c.photo && (
              <img
              loading="lazy"
              decoding="async"
                src={c.photo}
                alt={c.label}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            )}

            {/* Text overlay — city top, name huge below, address, then
               CTA pill "Подробнее" anchored near the bottom. */}
            <div className="relative flex h-full w-full flex-col items-center px-5 sm:px-6 pt-7 sm:pt-9 pb-6 sm:pb-7 text-center">
              {/* City — Suisse Intl Bold */}
              <p
                className="text-[13px] sm:text-sm uppercase tracking-[0.02em] text-white"
                style={{ fontWeight: 700 }}
              >
                {c.city}
              </p>
              {/* Club name — Bebas Neue Bold (hj-title), always one line with
                 side margins (long names like PROMENADE must not hit edges) */}
              <p className="mt-2 hj-title uppercase leading-none text-white whitespace-nowrap text-[clamp(36px,10.5vw,60px)]">
                {c.label}
              </p>
              {/* Address — Suisse Intl Regular, comma starts a new line */}
              {c.address && (
                <p className="mt-4 text-[14px] sm:text-base text-white leading-snug">
                  {c.address.split(/,\s*/).map((line, i, arr) => (
                    <span key={line}>
                      {line}
                      {i < arr.length - 1 ? "," : ""}
                      {i < arr.length - 1 && <br />}
                    </span>
                  ))}
                </p>
              )}
              <span
                className="mt-auto inline-flex items-center gap-1.5 rounded-full bg-white text-neutral-900 px-5 py-2 hj-title uppercase tracking-widest text-sm sm:text-base shadow-md transition-transform group-hover:translate-y-[-2px]"
              >
                Выбрать
                <i className="ri-arrow-right-line text-base" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {clubs.length > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {clubs.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Клуб ${i + 1}`}
              onClick={() => car.goTo(i)}
              className={`h-2 rounded-full transition-all ${
                i === car.index ? "w-2 bg-neutral-900" : "w-2 bg-neutral-300"
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}

type Athlete = { name: string; image: string; url: string };

/** Story cards with baked-in HERO'S STORIES text (name, role, transformation
 * result, HJ mark) — designer composites living in /public/members/. All
 * copy is inside the image; the UI adds only the Instagram hover hint. */
const ATHLETES: Athlete[] = [
  { name: "Бауыржан", image: asset("/members/client_baurzha.jpeg"), url: "https://www.instagram.com/reel/DRboxh-jZGq/" },
  { name: "Ева",      image: asset("/members/client_eva.jpeg"),     url: "https://www.instagram.com/reel/DKw9h1-NOPb/" },
  { name: "Гайнеш",   image: asset("/members/client_gaines.jpeg"),  url: "https://www.instagram.com/reel/DT-nD4pDReB/" },
  { name: "Ажар",     image: asset("/members/client_azha.jpeg"),    url: "https://www.instagram.com/reel/DJHYG2GPj66/" },
  { name: "Жадыра",   image: asset("/members/client_zhadyra.jpeg"), url: "https://www.instagram.com/reel/DTvMA4Hj13B/" },
  { name: "Светлана", image: asset("/members/client_svetlan.jpeg"), url: "https://www.instagram.com/reel/DMxsS86N8xx/" },
  { name: "Дарья",    image: asset("/members/client_darya.jpeg"),   url: "https://www.instagram.com/reel/DJjt5PNMyK9/" },
  { name: "Малика",   image: asset("/members/client_mali.jpeg"),    url: "https://www.instagram.com/reel/DQo3Ws9DT6z/" },
  { name: "Жанар",    image: asset("/members/client_zhanar.jpeg"),  url: "https://www.instagram.com/reel/DP9G0-0AmNT/" },
];

// carousel primitive lives in @/lib/useSnapCarousel

// ---------- page ----------

export default function DesignHome() {
  const diff = useSnapCarousel(DIFF_CARDS.length);
  const athlete = useSnapCarousel(ATHLETES.length);
  const [activeCity, setActiveCity] = useState<CityId>("almaty");
  const [openType, setOpenType] = useState<TrainingType | null>(null);
  const [faqOpen, setFaqOpen] = useState(false);
  const [contactsOpen, setContactsOpen] = useState(false);

  const cityMap = useMemo(() => new Map(CITIES.map((c) => [c.id, c])), []);
  const clubsForCity = useMemo(() => {
    const target = cityMap.get(activeCity)?.clubCity;
    return target ? CLUBS.filter((c) => c.city === target) : [];
  }, [activeCity, cityMap]);

  // Floating "Выбрать клуб": appears after the hero scrolls away, hides once
  // the club-picker section comes into view.
  const heroRef = useRef<HTMLElement>(null);
  const clubsRef = useRef<HTMLElement>(null);
  const [heroVisible, setHeroVisible] = useState(true);
  const [clubsVisible, setClubsVisible] = useState(false);
  const showFloatingCta = !heroVisible && !clubsVisible;

  useEffect(() => {
    const hero = heroRef.current;
    const clubs = clubsRef.current;
    const observers: IntersectionObserver[] = [];
    if (hero) {
      const io = new IntersectionObserver(([e]) => setHeroVisible(e.isIntersecting), { threshold: 0 });
      io.observe(hero);
      observers.push(io);
    }
    if (clubs) {
      const io = new IntersectionObserver(([e]) => setClubsVisible(e.isIntersecting), { threshold: 0.1 });
      io.observe(clubs);
      observers.push(io);
    }
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700;800;900&display=swap&subset=cyrillic,latin"
        rel="stylesheet"
      />

      <div className="hj-brand min-h-screen bg-white text-[#201E1E]">
        <div className="mx-auto w-full max-w-[520px] px-5 sm:max-w-[640px] sm:px-6 lg:max-w-[720px] [container-type:inline-size]">

          {/* ---------------- HERO ---------------- */}
          {/* Height leaves ~3rem breathing room so the top rounded corner is
             visible; caps at 900px on landscape/desktop so the frame doesn't
             stretch. Content stack sits mid-lower with padding-bottom so the
             CTA + price aren't glued to the edge. */}
          <section
            ref={heroRef}
            className="relative overflow-hidden rounded-[32px] mt-10 sm:mt-14 w-full bg-neutral-900"
            style={{
              height: "min(calc(100dvh - 6rem), 900px)",
              minHeight: 340,
            }}
          >
            <img
              loading="eager"
              fetchPriority="high"
              decoding="async"
              src={asset("/photos/hero_new.jpg")}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/0 to-black/55" />

            <div className="relative h-full w-full flex flex-col items-center px-6 pt-6 sm:pt-8 pb-8 sm:pb-10 text-white">
              <img
              loading="lazy"
              decoding="async"
                src={asset("/logo/hj_logo.png")}
                alt="Hero's Journey"
                className="h-10 sm:h-14 w-auto object-contain"
              />

              {/* Middle spacer — pushes content into lower third but leaves
                 room at the very bottom (via pb-8/pb-10 on parent). */}
              <div className="mt-auto w-full flex flex-col items-center text-center pb-4 sm:pb-6">
                <h1 className="hj-title uppercase leading-[0.9] w-full text-[clamp(38px,19cqw,150px)]">
                  BASECAMP
                </h1>
                <p className="mt-3 w-full uppercase tracking-wide whitespace-nowrap text-[clamp(7.5px,3.3cqw,20px)] font-medium opacity-95">
                  6 тренировок&nbsp;&nbsp;|&nbsp;&nbsp;тренер&nbsp;&nbsp;|&nbsp;&nbsp;готовый план
                </p>

                <a
                  href="#clubs"
                  className="mt-6 sm:mt-7 inline-flex items-center justify-center rounded-3xl px-12 py-3 sm:px-16 sm:py-3.5 shadow-lg transition hover:brightness-110"
                  style={{ background: C.blueBright }}
                >
                  <span className="hj-title text-2xl sm:text-3xl tracking-wide">
                    ЗАПИСАТЬСЯ
                  </span>
                </a>
                <p className="mt-3 uppercase tracking-wide text-[clamp(16px,3.4vw,20px)] font-medium opacity-95">
                  за 19 990 тг
                </p>
              </div>
            </div>
          </section>

          {/* ---------------- SYSTEM ---------------- */}
          <section className="mt-16 sm:mt-20">
            <p
              className="text-center uppercase tracking-widest text-xs sm:text-sm"
              style={{ color: C.muted }}
            >
              Абонемент BASECAMP
            </p>
            <h2 className="mt-3 text-center hj-title uppercase leading-[0.95] text-[clamp(28px,11cqw,56px)]">
              Какие тренировки<br />входят в 19&nbsp;990&nbsp;тг?
            </h2>
            <p className="mt-4 text-center text-sm sm:text-base max-w-md mx-auto opacity-80">
              Покупая 2-недельный пробный абонемент, ты получаешь доступ к 6 тренировкам с тренером в клубах Hero's Journey.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-2 sm:gap-4">
              {TRAINING_TYPES.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setOpenType(c)}
                  className="group flex flex-col items-center rounded-2xl border p-3 sm:p-6 text-center transition hover:border-black/20"
                  style={{ borderColor: "rgba(0,0,0,0.08)", background: "#f7f7f7" }}
                >
                  <p className="uppercase tracking-widest text-[9px] sm:text-[11px] font-bold opacity-45">
                    {c.kicker}
                  </p>
                  <p
                    className="mt-1.5 hj-title uppercase text-[23px] sm:text-[34px] tracking-wide"
                    style={{ color: C.blue }}
                  >
                    {c.title}
                  </p>
                  <p className="mt-1.5 text-xs sm:text-base opacity-80">{c.body}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[11px] sm:text-sm font-semibold opacity-60 transition group-hover:opacity-100">
                    Подробнее
                    <i className="ri-arrow-right-line text-sm transition-transform group-hover:translate-x-0.5" />
                  </span>
                </button>
              ))}
            </div>

            {/* Facts strip: duration + coach presence */}
            <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-3 sm:gap-4">
              {[
                {
                  key: "duration",
                  icon: "ri-time-line",
                  title: "50 минут",
                  body: "длится каждая тренировка",
                },
                {
                  key: "coach",
                  icon: "ri-user-star-line",
                  title: "Тренер рядом",
                  body: "от постановки техники до контроля нагрузки",
                },
              ].map((f) => (
                <div
                  key={f.key}
                  className="flex flex-col items-center text-center gap-1.5 rounded-2xl p-4 sm:p-5 text-white"
                  style={{ background: C.night }}
                >
                  <i className={`${f.icon} text-xl sm:text-2xl`} style={{ color: C.blueBright }} />
                  <p className="hj-title uppercase text-base sm:text-xl tracking-wide leading-none">
                    {f.title}
                  </p>
                  <p className="text-xs sm:text-sm opacity-70">{f.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ---------------- DIFFERENTIATOR CAROUSEL ---------------- */}
          <section className="mt-16 sm:mt-20">
            <p
              className="text-center uppercase tracking-widest text-xs sm:text-sm"
              style={{ color: C.muted }}
            >
              О Hero's Journey
            </p>
            <h2 className="mt-3 text-center hj-title uppercase leading-[0.95] text-[clamp(22px,9cqw,46px)]">
              Чем Hero's Journey отличается<br className="hidden sm:block" /> от обычного зала?
            </h2>

            <div
              ref={diff.ref}
              onScroll={diff.onScroll}
              className="mt-8 flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-proximity scroll-smooth no-scrollbar -mx-5 px-5 sm:-mx-6 sm:px-6"
              style={{ scrollbarWidth: "none" }}
            >
              {DIFF_CARDS.map((c) => (
                <div
                  key={c.title}
                  className="relative shrink-0 snap-center overflow-hidden rounded-[28px] w-[82vw] max-w-[420px] [container-type:inline-size]"
                >
                  <div className="relative aspect-[4/5] w-full bg-neutral-900">
                    {c.video ? (
                      <video
                        className="absolute inset-0 h-full w-full object-cover"
                        src={c.video}
                        poster={c.poster}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    ) : c.hasPrograms ? (
                      <div className="absolute inset-0 bg-black" />
                    ) : null}
                    {/* Uniform dark tint so text stays readable; no
                       bottom gradient because content is centered, not
                       anchored to the bottom. */}
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="relative flex h-full w-full flex-col text-white px-6 pt-8 sm:pt-10 pb-8">
                      {/* Kicker anchored to top */}
                      <p className="text-center uppercase tracking-widest text-[11px] sm:text-xs font-bold opacity-95">
                        {c.kicker}
                      </p>
                      {/* Title + body centered vertically (my-auto) */}
                      <div className="my-auto text-center">
                        <h3
                          className="hj-title uppercase leading-[0.9] text-[clamp(36px,15cqw,64px)]"
                        >
                          {c.title}
                        </h3>
                        <p className="mt-5 text-[13px] sm:text-sm leading-snug max-w-[85%] mx-auto opacity-95">
                          {c.body}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dots below the carousel — same pattern as athletes / clubs */}
            <div className="mt-6 flex justify-center gap-2 flex-wrap">
              {DIFF_CARDS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Слайд ${i + 1}`}
                  onClick={() => diff.goTo(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === diff.index ? "w-2 bg-neutral-900" : "w-2 bg-neutral-300"
                  }`}
                />
              ))}
            </div>
          </section>

          {/* ---------------- ATHLETE STORIES (moved above club picker) ---------------- */}
          <section className="mt-16 sm:mt-20">
            <p className="text-center uppercase tracking-widest text-xs sm:text-sm" style={{ color: C.muted }}>
              Истории участников
            </p>
            <h2 className="mt-3 text-center hj-title uppercase leading-[0.95] text-[clamp(20px,7.5cqw,42px)]" style={{ color: C.blue }}>
              10 000 АТЛЕТОВ В&nbsp;АЛМАТЫ И&nbsp;АСТАНЕ<br />УЖЕ&nbsp;ПРОШЛИ ЭТОТ ПУТЬ
            </h2>
            <p className="mt-4 text-center text-sm sm:text-base max-w-lg mx-auto opacity-80">
              Мы создали систему, которая работает даже для тех, кто раньше не верил в спорт. Ниже — реальные истории наших атлетов. Открой любую карточку и посмотри её историю в Instagram.
            </p>

            <div
              ref={athlete.ref}
              onScroll={athlete.onScroll}
              className="mt-8 flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-proximity scroll-smooth no-scrollbar -mx-5 px-5 sm:-mx-6 sm:px-6"
              style={{ scrollbarWidth: "none" }}
            >
              {ATHLETES.map((a) => (
                <a
                  key={a.name}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block shrink-0 snap-center cursor-pointer w-[66vw] sm:w-[280px] lg:w-[260px]"
                >
                  <div className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl md:rounded-3xl bg-neutral-950 border border-black/5">
                    <img
              loading="lazy"
              decoding="async"
                      src={a.image}
                      alt={a.name}
                      className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/25 px-4 py-2 text-xs font-medium text-white">
                        <i className="ri-instagram-line text-base" />
                        Смотреть в Instagram
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-6 flex justify-center gap-2 flex-wrap">
              {ATHLETES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Атлет ${i + 1}`}
                  onClick={() => athlete.goTo(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === athlete.index ? "w-2 bg-neutral-900" : "w-2 bg-neutral-300"
                  }`}
                />
              ))}
            </div>
          </section>

          {/* ---------------- CHOOSE YOUR CLUB ---------------- */}
          <section ref={clubsRef} id="clubs" className="mt-16 sm:mt-20">
            <p
              className="text-center uppercase tracking-widest text-xs sm:text-sm"
              style={{ color: C.muted }}
            >
              Клубы
            </p>
            <h2 className="mt-3 text-center hj-title uppercase leading-[0.95] text-[clamp(32px,13cqw,68px)]">
              Готов начать?
            </h2>
            <p className="mt-4 text-center text-sm sm:text-base max-w-md mx-auto opacity-80">
              Выбери свой клуб.
            </p>

            {/* City tabs */}
            <div className="mt-6 flex flex-nowrap sm:flex-wrap justify-center gap-1.5 sm:gap-3">
              {CITIES.map((city) => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => setActiveCity(city.id)}
                  className={`whitespace-nowrap rounded-full px-3 sm:px-5 py-2 text-xs sm:text-sm font-bold uppercase tracking-wide sm:tracking-widest transition ${
                    activeCity === city.id
                      ? "text-white"
                      : "text-neutral-500 hover:text-neutral-800"
                  }`}
                  style={{
                    background:
                      activeCity === city.id ? C.blue : "rgba(0,0,0,0.05)",
                  }}
                >
                  {city.label}
                </button>
              ))}
            </div>

            {clubsForCity.length > 0 ? (
              <ClubCarousel key={activeCity} clubs={clubsForCity} />
            ) : activeCity === "dubai" || activeCity === "ny" ? (
              <UpcomingClubCard info={UPCOMING_CLUBS[activeCity]!} />
            ) : (
              <div
                className="mt-8 rounded-2xl border p-8 text-center"
                style={{ borderColor: "rgba(0,0,0,0.08)", background: "#f7f7f7" }}
              >
                <p className="hj-title uppercase text-2xl sm:text-3xl" style={{ color: C.blue }}>
                  Скоро откроемся
                </p>
                <p className="mt-2 text-sm sm:text-base opacity-70">
                  В этом городе клубы пока в планах. Следи за нами в соцсетях, чтобы не пропустить открытие.
                </p>
              </div>
            )}
          </section>

          {/* ---------------- FOOTER ---------------- */}
          <section className="mt-16 sm:mt-20 pb-10 text-center">
            <button
              type="button"
              onClick={() => setFaqOpen(true)}
              className="block w-full transition hover:opacity-80"
            >
              <h3
                className="text-left hj-title uppercase leading-none text-[clamp(60px,18vw,120px)]"
                style={{ color: C.mutedSoft }}
              >
                FAQ
              </h3>
            </button>
            <button
              type="button"
              onClick={() => setContactsOpen(true)}
              className="mt-6 block w-full transition hover:opacity-80"
            >
              <h3
                className="text-right hj-title uppercase leading-none text-[clamp(60px,18vw,120px)]"
                style={{ color: C.blue }}
              >
                КОНТАКТЫ
              </h3>
            </button>
          </section>
        </div>

        {/* Footer bar */}
        <footer className="bg-black text-neutral-400">
          <div className="mx-auto max-w-[720px] px-4 sm:px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-5 text-xs sm:text-sm">
            <div className="text-center sm:text-left flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <p>
                © {new Date().getFullYear()} Hero's Journey · Все права защищены.
              </p>
              <a
                href="https://herosjourney.kz/policy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-white transition-colors"
              >
                Пользовательское соглашение
              </a>
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

        {/* Floating "Выбрать клуб" — shows after the hero leaves the screen,
           hides once the club-picker section is in view. */}
        <div
          className={`fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/90 backdrop-blur transition-all duration-300 ${
            showFloatingCta ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
          }`}
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 10px)" }}
        >
          <div className="mx-auto flex max-w-[520px] justify-center px-4 pt-2.5 sm:max-w-[640px] sm:px-6">
            <a
              href="#clubs"
              className="inline-flex items-center justify-center rounded-3xl px-12 py-3 sm:px-16 sm:py-3.5 shadow-lg transition hover:brightness-110"
              style={{ background: C.blueBright }}
            >
              <span className="hj-title text-2xl sm:text-3xl tracking-wide text-white leading-none">
                ВЫБРАТЬ КЛУБ
              </span>
            </a>
          </div>
        </div>
      </div>

      {openType && (
        <ZoneStoriesOverlay type={openType} onClose={() => setOpenType(null)} />
      )}
      {faqOpen && <FaqModal onClose={() => setFaqOpen(false)} />}
      {contactsOpen && <ContactsModal onClose={() => setContactsOpen(false)} />}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }

        /* -------- Global typography for the redesigned page -------- */
        /* Kill synthetic italic/bold so the browser doesn't fake styles
           when a font variant is missing. Prevents unwanted slanted
           rendering when only some weights are available. */
        .hj-brand,
        .hj-brand * {
          font-style: normal !important;
          font-synthesis: none;
        }

        /* Body / small text — Suisse Intl Regular (with close free fallbacks) */
        .hj-brand,
        .hj-brand p,
        .hj-brand span,
        .hj-brand li,
        .hj-brand a,
        .hj-brand button,
        .hj-brand input,
        .hj-brand select,
        .hj-brand textarea,
        .hj-brand label {
          font-family: "Suisse Intl", "Suisse Int'l", "SuisseIntl",
            "Neue Haas Grotesk Text", "Inter", -apple-system,
            BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial,
            sans-serif;
          font-weight: 400;
          letter-spacing: 0;
        }

        /* Titles — Bebas Neue Pro / Cyrillic variants first (system-
           installed on user's Mac); Oswald 700 next as the shared fallback
           that covers BOTH Latin and Cyrillic so digits and letters render
           at consistent metrics. Google Fonts' free Bebas Neue is Latin-
           only and would create mixed-font sizes on Russian text, so it's
           demoted to last-resort. */
        .hj-brand h1,
        .hj-brand h2,
        .hj-brand h3,
        .hj-brand h4,
        .hj-brand .hj-title {
          font-family: "Bebas Neue Pro", "Bebas Neue Cyrillic",
            "BebasNeueCyrillic", "Oswald", "Bebas Neue",
            "Impact", "Arial Narrow", sans-serif;
          font-weight: 700;
          letter-spacing: 0.01em;
        }

        /* Card display face — wide heavy grotesk used on club-card names
           (VILLA, COLIBRI, ...) and matching call-outs. Distinct from
           .hj-title which is condensed. Uses Suisse Intl / Inter Black. */
        .hj-brand .hj-display {
          font-family: "Suisse Intl", "Inter", "Neue Haas Grotesk Display",
            "Helvetica Neue", Arial, sans-serif;
          font-weight: 900;
          letter-spacing: -0.02em;
        }
      `}</style>
    </>
  );
}

