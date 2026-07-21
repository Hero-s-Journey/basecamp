import { useReveal } from "@/hooks/useReveal";
import GlowCard from "@/components/feature/GlowCard";

const cards = [
  {
    icon: "ri-shield-user-line",
    q: "«Я не в форме и боюсь не справиться»",
    a: "Не нужно быть готовым. Тренер рядом на каждом занятии — поставит технику и подберёт нагрузку под тебя с первого дня.",
  },
  {
    icon: "ri-refresh-line",
    q: "«Раньше пробовал(а) — бросил(а)»",
    a: "Здесь не нужно придумывать план или заставлять себя. Расписание, нагрузка, программа — всё уже готово. Просто приходи.",
  },
  {
    icon: "ri-line-chart-line",
    q: "«Не понимаю зачем Assessment — я просто хочу тренироваться»",
    a: "Assessment покажет, что именно мешает прогрессу. После теста ты будешь тренироваться не вслепую, а по своим данным — это и есть разница между «хожу» и «вижу результат».",
  },
];

export default function ForMe() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section ref={ref} className="bg-night py-12 md:py-20">
      <div className="mx-auto max-w-[1320px] px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start mb-12 md:mb-16">
          <div className="lg:col-span-7" data-reveal>
            <span className="text-xs uppercase tracking-widest2 text-white/40">
              Сомнения
            </span>
            <h2 className="mt-4 text-display text-4xl md:text-6xl leading-[1.05] text-balance text-white">
              Это точно <span className="italic font-light text-white/55">для меня?</span>
            </h2>
          </div>
          <div className="lg:col-span-5 lg:pl-12" data-reveal data-reveal-delay="120">
            <p className="text-white/55 text-base md:text-lg leading-relaxed">
              Три причины сомневаться и три честных ответа. Basecamp — это простая точка входа: приходишь, тренируешься с тренером, разбираешься на месте.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cards.map((c, i) => (
            <div key={c.q} data-reveal data-reveal-delay={`${i * 100}`}>
              <GlowCard className="h-full p-8 md:p-10">
                <span className="inline-flex w-12 h-12 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/10 text-terracotta">
                  <i className={`${c.icon} text-2xl`} />
                </span>
                <h3 className="text-display text-lg md:text-xl mt-6 leading-snug text-white">
                  {c.q}
                </h3>
                <p className="text-white/55 mt-3 text-sm md:text-base leading-relaxed">
                  {c.a}
                </p>
                <div className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest2 text-white/40">
                  <span className="h-px w-8 bg-white/25" />
                  {String(i + 1).padStart(2, "0")}
                </div>
              </GlowCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
