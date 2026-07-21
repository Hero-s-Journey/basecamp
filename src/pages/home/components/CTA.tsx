import { useEffect, useRef } from "react";
import { useReveal } from "@/hooks/useReveal";
import GlowCard from "@/components/feature/GlowCard";
import { usePaymentModal } from "@/components/feature/PaymentModalContext";
import { pixel } from "@/lib/pixel";
import { gtm } from "@/lib/gtm";
import { CLUBS } from "@/data/clubs";

const tags = ["6 тренировок", "Тренер", "Персональная программа", "50 минут"];

export default function CTA() {
  const ref = useReveal<HTMLDivElement>();
  const { open } = usePaymentModal();
  const viewedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !viewedRef.current) {
          viewedRef.current = true;
          pixel.viewContent();
          gtm.viewContent();
          obs.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref]);

  return (
    <section ref={ref} className="bg-night pb-16 md:pb-32 pt-8 md:pt-12">
      <div className="mx-auto max-w-[1320px] px-4 md:px-10" data-reveal>
        <GlowCard className="overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(80% 60% at 50% 0%, rgba(226,114,75,0.16), transparent 70%)",
            }}
          />
          <div className="relative px-6 py-14 md:px-12 md:py-20 flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 text-[10px] uppercase tracking-widest2 text-white/60">
              <span className="w-1.5 h-1.5 rounded-full bg-terracotta" />
              Финальный шаг
            </span>

            <h2 className="mt-6 text-display text-4xl md:text-6xl leading-[1.05] text-balance text-white max-w-2xl">
              Готов <span className="italic font-light text-white/55">начать?</span>
            </h2>

            <p className="mt-5 text-white/55 text-sm md:text-base leading-relaxed max-w-md">
              После оплаты сразу выбираешь дату первой тренировки в приложении.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] uppercase tracking-widest2 text-white/65 font-medium"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {CLUBS.map((c) => {
                const inner = (
                  <div className="group relative h-56 rounded-2xl overflow-hidden border border-white/10 cursor-pointer transition-all duration-300 hover:border-white/30 hover:scale-[1.02]">
                    <img
                      src={c.photo}
                      alt={c.name}
                      className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/85" />
                    {c.badge && (
                      <span className="absolute top-3 right-3 z-10 rounded-full bg-terracotta text-white px-3 py-1 text-[10px] uppercase tracking-widest2 font-semibold">
                        {c.badge}
                      </span>
                    )}
                    <div className="absolute inset-0 p-5 flex flex-col justify-end text-left">
                      <h3 className="text-display text-xl md:text-2xl text-white leading-tight">
                        {c.name}
                      </h3>
                      <p className="mt-1 text-white/70 text-xs uppercase tracking-widest2">
                        {c.city}
                      </p>
                      <p className="mt-1 text-white/55 text-xs leading-snug">
                        {c.address}
                      </p>
                    </div>
                  </div>
                );

                if (c.external) {
                  return (
                    <a
                      key={c.id}
                      href={c.external}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      {inner}
                    </a>
                  );
                }
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={open}
                    className="text-left"
                  >
                    {inner}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={open}
              className="group mt-10 inline-flex items-center gap-3 rounded-full bg-white pl-7 pr-2 py-2 text-xs md:text-sm font-semibold uppercase tracking-widest2 !text-black cursor-pointer whitespace-nowrap shadow-[0_8px_30px_-6px_rgba(255,255,255,0.4)] hover:bg-[#3DDC5C] hover:scale-105 hover:shadow-[0_0_44px_-2px_rgba(61,220,92,0.8)] transition-all duration-300"
            >
              Записаться за 19 990 тг
              <span className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white group-hover:rotate-[-45deg] transition-transform duration-300">
                <i className="ri-arrow-right-line text-base" />
              </span>
            </button>
          </div>
        </GlowCard>
      </div>
    </section>
  );
}
