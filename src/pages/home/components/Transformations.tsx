import { useRef, useState } from "react";
import { useReveal } from "@/hooks/useReveal";
import { asset } from "@/lib/asset";

const stories = [
  { name: "Бауыржан", image: asset("/members/client_baurzha.jpeg"), url: "https://www.instagram.com/reel/DRboxh-jZGq/" },
  { name: "Ева", image: asset("/members/client_eva.jpeg"), url: "https://www.instagram.com/reel/DKw9h1-NOPb/" },
  { name: "Гайнеш", image: asset("/members/client_gaines.jpeg"), url: "https://www.instagram.com/reel/DT-nD4pDReB/" },
  { name: "Ажар", image: asset("/members/client_azha.jpeg"), url: "https://www.instagram.com/reel/DJHYG2GPj66/" },
  { name: "Жадыра", image: asset("/members/client_zhadyra.jpeg"), url: "https://www.instagram.com/reel/DTvMA4Hj13B/" },
  { name: "Светлана", image: asset("/members/client_svetlan.jpeg"), url: "https://www.instagram.com/reel/DMxsS86N8xx/" },
  { name: "Дарья", image: asset("/members/client_darya.jpeg"), url: "https://www.instagram.com/reel/DJjt5PNMyK9/" },
  { name: "Малика", image: asset("/members/client_mali.jpeg"), url: "https://www.instagram.com/reel/DQo3Ws9DT6z/" },
  { name: "Жанар", image: asset("/members/client_zhanar.jpeg"), url: "https://www.instagram.com/reel/DP9G0-0AmNT/" },
];

export default function Transformations() {
  const ref = useReveal<HTMLDivElement>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const progress = max > 0 ? el.scrollLeft / max : 0;
    setActive(Math.round(progress * (stories.length - 1)));
  };

  const scrollToCard = (i: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    el.scrollTo({ left: (max * i) / (stories.length - 1), behavior: "smooth" });
  };

  return (
    <section ref={ref} className="bg-night py-24 md:py-32 border-t border-white/10">
      <div className="mx-auto max-w-[1320px] px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-12">
          <div className="lg:col-span-7" data-reveal>
            <span className="text-xs uppercase tracking-widest2 text-white/40">
              истории участников
            </span>
            <h2 className="mt-4 text-display text-4xl md:text-6xl leading-[1.05] text-balance text-white">
              10 000 атлетов в Алматы и Астане{" "}
              <span className="italic font-light text-white/55">уже прошли этот путь</span>
            </h2>
          </div>
          <div className="lg:col-span-5 lg:pl-12" data-reveal data-reveal-delay="120">
            <p className="text-white/55 text-base md:text-lg leading-relaxed">
              Мы создали систему, которая работает даже для тех, кто раньше не
              верил в спорт. Ниже — реальные истории наших атлетов. Открой
              любую карточку и посмотри её историю в Instagram.
            </p>
          </div>
        </div>

        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="flex gap-4 md:gap-5 overflow-x-auto snap-x snap-mandatory pb-2 scroll-smooth -mx-6 px-6 md:-mx-10 md:px-10 no-scrollbar"
        >
          {stories.map((s, i) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group cursor-pointer shrink-0 w-[66vw] sm:w-[280px] lg:w-[260px] snap-center"
              data-reveal
              data-reveal-delay={i * 100}
            >
              <div className="relative aspect-[9/16] rounded-2xl md:rounded-3xl overflow-hidden bg-night-700 border border-white/10">
                <img
                  src={s.image}
                  alt={s.name}
                  className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
                {/* Instagram hint on hover */}
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

        {/* Scroll dots */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {stories.map((s, i) => (
            <button
              key={s.name}
              type="button"
              aria-label={`Атлет ${i + 1}`}
              onClick={() => scrollToCard(i)}
              className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${
                i === active ? "w-7 bg-white" : "w-2 bg-white/25"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}