import { useState } from "react";
import { useReveal } from "@/hooks/useReveal";

const faqs = [
  {
    question: "Можно ли ходить в разные клубы?",
    answer:
      "Абонемент Basecamp привязан к выбранному клубу. 6 тренировок проходят в одном клубе, чтобы тренер знал тебя и корректировал нагрузку.",
  },
  {
    question: "Я новичок, справлюсь?",
    answer:
      "Да. Тренер рядом на каждой тренировке — ставит технику и подбирает вес. Программа масштабируется под любой уровень.",
  },
  {
    question: "Что если я пропущу тренировку?",
    answer:
      "У тебя 14 дней, чтобы использовать все 6 тренировок. Расписание гибкое — записывайся в приложении на удобное время.",
  },
  {
    question: "Чем HJ 4YOU отличается от других клубов?",
    answer:
      "В HJ 4YOU в базовый пакет входит Assessment — замер физической формы (состав тела, сила, выносливость). В остальных клубах пакет без Assessment. Assessment доступен отдельно на годовом или полугодовом абонементе в любом клубе.",
  },
];

function FaqItem({
  item,
  isOpen,
  onToggle,
  index,
}: {
  item: (typeof faqs)[0];
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <div
      className="border-b border-white/10 last:border-b-0"
      data-reveal
      data-reveal-delay={index * 80}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-6 md:py-7 text-left group cursor-pointer"
      >
        <span className="text-display text-lg md:text-2xl leading-snug text-white group-hover:text-white/70 transition-colors">
          {item.question}
        </span>
        <span
          className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${
            isOpen ? "bg-white border-white rotate-45" : "border-white/20"
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className={`transition-colors duration-300 ${
              isOpen ? "text-night" : "text-white"
            }`}
          >
            <path
              d="M7 1V13M1 7H13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-500 ease-out"
        style={{
          maxHeight: isOpen ? "300px" : "0px",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <p className="pb-6 md:pb-7 text-white/55 text-sm md:text-base leading-relaxed max-w-3xl">
          {item.answer}
        </p>
      </div>
    </div>
  );
}

export default function StudioStrip() {
  const ref = useReveal<HTMLDivElement>();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section ref={ref} className="bg-night py-24 md:py-32">
      <div className="mx-auto max-w-[1320px] px-6 md:px-10">
        <div className="mb-10 md:mb-14" data-reveal>
          <span className="text-xs uppercase tracking-widest2 text-white/40">
            FAQ
          </span>
          <h2 className="mt-4 text-display text-4xl md:text-6xl leading-[1.05] text-balance max-w-2xl text-white">
            Частые <span className="italic font-light text-white/55">вопросы</span>
          </h2>
        </div>

        <div className="max-w-4xl">
          {faqs.map((item, i) => (
            <FaqItem
              key={item.question}
              item={item}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
