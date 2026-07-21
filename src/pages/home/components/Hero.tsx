import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import { usePaymentModal } from "@/components/feature/PaymentModalContext";

const MARQUEE_COPIES = 6;

export default function Hero() {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const { open } = usePaymentModal();

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;
    let animId: number;
    let x = 0;
    const speed = 0.5;
    const step = () => {
      x -= speed;
      const contentWidth = marquee.scrollWidth / MARQUEE_COPIES;
      if (contentWidth > 0 && Math.abs(x) >= contentWidth) x = 0;
      marquee.style.transform = `translateX(${x}px)`;
      animId = requestAnimationFrame(step);
    };
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative overflow-hidden flex flex-col min-h-[100svh] bg-night">
      <div className="relative w-full flex-1 min-h-[68svh] md:min-h-[calc(100svh-56px)] overflow-hidden">
        <img
          src={asset("/studio_4you/bootcamp4you.jpeg")}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${revealed ? "opacity-70" : "opacity-0"}`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/85" />

        <div className="relative z-10 h-full min-h-[68svh] md:min-h-[calc(100svh-56px)] flex flex-col justify-end px-6 md:px-14 lg:px-20 pb-14 md:pb-20">
          <div
            className={`max-w-3xl transition-all duration-700 ${revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
          >
            <span className="text-xs uppercase tracking-widest2 text-white/60">
              Basecamp · Hero's Journey
            </span>
            <h1 className="mt-5 text-display text-4xl md:text-6xl lg:text-7xl leading-[1.05] text-balance text-white">
              6 тренировок в Hero's Journey
            </h1>
            <p className="mt-4 max-w-md text-white/70 text-base md:text-lg leading-relaxed">
              тренер · тренировка = 50 минут
            </p>
            <button
              type="button"
              onClick={open}
              className="mt-8 inline-flex items-center justify-center rounded-full bg-white !text-night px-8 py-3.5 text-xs md:text-sm font-semibold uppercase tracking-widest2 cursor-pointer whitespace-nowrap shadow-[0_8px_30px_-6px_rgba(255,255,255,0.35)] hover:bg-[#3DDC5C] hover:!text-night hover:scale-105 transition-all duration-300"
            >
              Записаться за 19 990 тг
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 border-t border-white/10 py-3.5 overflow-hidden bg-black/40 backdrop-blur-sm">
        <div ref={marqueeRef} className="flex whitespace-nowrap gap-8 text-white/55">
          {Array.from({ length: MARQUEE_COPIES }).map((_, i) => (
            <div key={i} className="flex items-center gap-8 pr-8">
              {["6 тренировок", "Тренер", "50 минут", "6 клубов"].map((t) => (
                <span key={t} className="text-xs uppercase tracking-widest2 flex items-center gap-8">
                  {t}
                  <span className="text-white/30 text-[8px]">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
