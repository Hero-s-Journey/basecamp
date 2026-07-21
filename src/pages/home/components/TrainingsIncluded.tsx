import { useRef, useState } from "react";
import { useReveal } from "@/hooks/useReveal";
import GlowCard from "@/components/feature/GlowCard";
import { CLUBS, TRAININGS } from "@/data/clubs";

export default function TrainingsIncluded() {
  const ref = useReveal<HTMLDivElement>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeClub, setActiveClub] = useState(0);
  const [active, setActive] = useState(0);

  const club = CLUBS[activeClub];
  const cards = club.trainings.map((t) => {
    const info = TRAININGS[t.type] ?? {
      title: t.type,
      image: TRAININGS["Bootcamp"].image,
      body: "Тренировка в базовом абонементе Basecamp.",
    };
    return {
      key: `${club.id}-${t.type}`,
      title: info.title,
      image: info.image,
      body: info.body,
      count: `${t.count} ${t.count === 1 ? "тренировка" : t.count < 5 ? "тренировки" : "тренировок"}`,
    };
  });

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const progress = max > 0 ? el.scrollLeft / max : 0;
    setActive(Math.round(progress * (cards.length - 1)));
  };

  const scrollToCard = (i: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    el.scrollTo({ left: (max * i) / Math.max(cards.length - 1, 1), behavior: "smooth" });
  };

  return (
    <section
      ref={ref}
      className="relative py-12 md:py-20 bg-white"
      style={{
        backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.045 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>',
        )}")`,
      }}>
      <div className="mx-auto max-w-[1320px] px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start mb-10 md:mb-12">
          <div className="lg:col-span-7" data-reveal>
            <span className="text-xs uppercase tracking-widest2 text-night/50">
              Что входит в абонемент
            </span>
            <h2 className="mt-4 text-display text-4xl md:text-6xl leading-[1.05] text-balance text-night">
              Какие тренировки входят в 19 990 тг?
            </h2>
          </div>
          <div className="lg:col-span-5 lg:pl-12" data-reveal data-reveal-delay="120">
            <p className="text-night/65 text-base md:text-lg leading-relaxed">
              Покупая 2-недельный пробный абонемент, ты получаешь доступ к 6 тренировкам в выбранном клубе Hero's Journey. Все тренировки длятся 50 минут, а тренер следит за безопасностью и техникой выполнения.
            </p>
          </div>
        </div>

        {/* Club selector */}
        <div className="mb-8 md:mb-10 flex flex-wrap gap-2" data-reveal>
          {CLUBS.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setActiveClub(i);
                setActive(0);
                scrollRef.current?.scrollTo({ left: 0 });
              }}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-widest2 font-medium cursor-pointer transition-all duration-200 ${
                i === activeClub
                  ? "bg-night text-white border-night"
                  : "bg-white/60 text-night/70 border-night/15 hover:border-night/40 hover:text-night"
              }`}
            >
              {c.name}
              <span className={`text-[10px] ${i === activeClub ? "text-white/50" : "text-night/40"}`}>
                {c.city}
              </span>
            </button>
          ))}
        </div>

        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="flex md:grid gap-4 overflow-x-auto snap-x snap-mandatory pb-2 md:overflow-visible md:snap-none scroll-smooth -mx-6 px-[9vw] md:mx-0 md:px-0 no-scrollbar"
          style={{ gridTemplateColumns: `repeat(${cards.length}, minmax(0, 1fr))` }}
        >
          {cards.map((c, i) => (
            <div
              key={c.key}
              data-reveal
              data-reveal-delay={`${i * 100}`}
              className="shrink-0 w-[82vw] snap-center md:w-auto"
            >
              <GlowCard wash={false} className="h-[540px] md:h-[480px] overflow-hidden cursor-default">
                <img
                  src={c.image}
                  alt={c.title}
                  className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/85" />
                <div className="absolute inset-0 p-6 md:p-7 flex flex-col justify-between">
                  <div>
                    <h3 className="text-display text-xl md:text-2xl text-white">
                      {c.title}
                    </h3>
                    <span className="inline-block mt-2 rounded-full bg-white/15 backdrop-blur-sm px-3 py-0.5 text-[10px] uppercase tracking-wider font-medium text-white/90 border border-white/10">
                      {c.count}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {c.body}
                  </p>
                </div>
              </GlowCard>
            </div>
          ))}
        </div>

        <div className="md:hidden mt-6 flex items-center justify-center gap-2">
          {cards.map((c, i) => (
            <button
              key={c.key}
              type="button"
              aria-label={`Тренировка ${i + 1}`}
              onClick={() => scrollToCard(i)}
              className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${
                i === active ? "w-7 bg-night" : "w-2 bg-night/25"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
