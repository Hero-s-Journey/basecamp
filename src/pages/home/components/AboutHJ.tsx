import { useEffect, useState } from "react";
import { useReveal } from "@/hooks/useReveal";
import GlowCard from "@/components/feature/GlowCard";
import { asset } from "@/lib/asset";

const cards = [
  {
    title: "Планшет на каждом тренажёре",
    body: "Подходишь к тренажёру — и планшет уже показывает инструкцию, рекомендованный вес на каждое упражнение и подход, хранит историю весов со всех тренировок. Ты не считаешь, не вспоминаешь и не гадаешь — просто берёшь и работаешь.",
    video: asset("/video/planshet_lowq.mp4"),
  },
  {
    title: "Пульсометр",
    body: "Во время тренировки система видит, как работает твоё сердце: в какой пульсовой зоне ты тренируешься, сколько сжёг калорий и как восстанавливаешься между подходами. По этим данным мы корректируем следующие тренировки.",
    video: asset("/video/pulsometr_lowq.mp4"),
  },
  {
    title: "Тренер на каждой тренировке",
    body: "На каждой тренировке рядом тренер: ставит технику, страхует и подсказывает, как делать упражнения правильно. В других залах это персональные занятия за отдельные деньги — здесь работа тренера входит в абонемент.",
    video: asset("/video/trainers_lowq.mp4"),
  },
  {
    title: "Программа тренировок на год",
    body: "Твой план составлен на 12 месяцев вперёд. Каждый месяц — отдельный цикл под конкретную цель: жиросжигание, набор мышц, выносливость, ноги и ягодицы или сбалансированная проработка. Тело получает новый стимул каждые 4 недели.",
    hasPrograms: true,
  },
];

const programs = [
  { name: "Burn", image: asset("/photos/burn.png") },
  { name: "Strong", image: asset("/photos/strong.png") },
  { name: "Athlete", image: asset("/photos/athlete.png") },
  { name: "Fitbody", image: asset("/photos/fitbody.png") },
  { name: "Legs and Glutes", image: asset("/photos/legsandglutes.png") },
];

function ProgramSlides() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setI((v) => (v + 1) % programs.length),
      2400,
    );
    return () => clearInterval(id);
  }, []);
  const p = programs[i];
  return (
    <div className="aspect-square bg-black border-b border-white/10 relative overflow-hidden">
      <img
        key={i}
        src={p.image}
        alt={p.name}
        className="absolute inset-0 w-full h-full object-cover hero-fade-in"
      />
      {/* Dots */}
      <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5 z-10">
        {programs.map((pr, idx) => (
          <span
            key={pr.name}
            className={`h-1 rounded-full transition-all duration-300 ${
              idx === i ? "w-4 bg-white/80" : "w-1 bg-white/25"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function AboutHJ() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section ref={ref} className="bg-night py-24 md:py-32">
      <div className="mx-auto max-w-[1320px] px-6 md:px-10">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start mb-12 md:mb-16">
          <div className="lg:col-span-7" data-reveal>
            <span className="text-xs uppercase tracking-widest2 text-white/40">
              О Hero's Journey
            </span>
            <h2 className="mt-4 text-display text-4xl md:text-6xl leading-[1.05] text-balance text-white">
              Чем Hero's Journey отличается от обычного зала?
            </h2>
          </div>
          <div className="lg:col-span-5 lg:pl-12" data-reveal data-reveal-delay="120">
            <p className="text-white/55 text-base md:text-lg leading-relaxed">
              Hero's Journey — это фитнес-студия нового поколения, построенная вокруг технологий, данных и реального прогресса атлета.
            </p>
          </div>
        </div>

        {/* Feature cards — vertical: media on top, text below */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((c, i) => (
            <div key={c.title} data-reveal data-reveal-delay={`${i * 100}`}>
              <GlowCard className="h-full overflow-hidden">
                {/* Media: program slides for card 4, video placeholder for others */}
                {c.hasPrograms ? (
                  <ProgramSlides />
                ) : c.video ? (
                  <div className="aspect-square relative overflow-hidden border-b border-white/10 bg-black">
                    <video
                      className="absolute inset-0 w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    >
                      <source src={c.video} type="video/mp4" />
                    </video>
                  </div>
                ) : (
                  <div className="aspect-square bg-white/[0.03] border-b border-white/10 flex flex-col items-center justify-center gap-2 text-white/25">
                    <i className="ri-play-circle-line text-4xl" />
                    <span className="text-[10px] uppercase tracking-widest2">
                      Видео
                    </span>
                  </div>
                )}
                {/* Text */}
                <div className="p-6 md:p-7">
                  <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest2 text-white/40 mb-3">
                    <span className="h-px w-6 bg-white/25" />
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="text-display text-lg md:text-xl leading-snug text-white">
                    {c.title}
                  </h3>
                  <p className="text-white/55 mt-2.5 text-sm leading-relaxed">
                    {c.body}
                  </p>
                </div>
              </GlowCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
