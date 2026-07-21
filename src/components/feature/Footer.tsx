import { asset } from "@/lib/asset";

export default function Footer() {
  return (
    <footer className="bg-night text-white pt-16 pb-10 border-t border-white/10">
      <div className="mx-auto max-w-[1320px] px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-white/10">
          {/* Brand */}
          <div>
            <p className="text-display text-2xl md:text-3xl text-white leading-tight">
              Hero's Journey · Basecamp
            </p>
            <p className="mt-3 text-sm text-white/55 leading-relaxed">
              6 тренировок в любом из 6 клубов Hero's Journey — Алматы и Астана.
            </p>
          </div>

          {/* Address */}
          <div>
            <p className="text-xs uppercase tracking-widest2 text-white/40">
              Клубы
            </p>
            <p className="mt-3 text-sm text-white/80 leading-relaxed">
              Алматы · Астана
            </p>
            <a
              href="tel:+77172640841"
              className="mt-3 flex items-center gap-2 text-sm text-white/80 hover:text-terracotta transition-colors cursor-pointer w-fit"
            >
              <i className="ri-phone-line text-lg" />
              +7 (7172) 64-08-41
            </a>
            <a
              href="https://instagram.com/herosjourneykz"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center gap-2 text-sm text-white/60 hover:text-terracotta transition-colors cursor-pointer w-fit"
            >
              <i className="ri-instagram-line text-lg" />
              Instagram
            </a>
          </div>

          {/* Hours */}
          <div>
            <p className="text-xs uppercase tracking-widest2 text-white/40">
              Часы работы
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-white/80">
              <li className="flex justify-between gap-4">
                <span className="text-white/55">Будни</span>
                <span>07:00 — 23:00</span>
              </li>
              <li className="flex justify-between gap-4">
                <span className="text-white/55">Выходные и праздники</span>
                <span>09:00 — 20:00</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row — copyright + policy on the left (centered on mobile),
            Astana Hub logo on the right (centered on mobile, below). */}
        <div className="pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5 md:gap-3 text-center md:text-left">
          <div className="text-xs text-white/40 flex flex-col md:flex-row md:items-center gap-2 md:gap-4 items-center">
            <p>© {new Date().getFullYear()} Hero's Journey. Все права защищены.</p>
            <a
              href="https://herosjourney.kz/policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-terracotta transition-colors cursor-pointer underline underline-offset-4 decoration-white/20 hover:decoration-terracotta w-fit"
            >
              Пользовательское соглашение
            </a>
          </div>
          <div className="flex justify-center md:justify-end">
            <img
              src={asset("/logo/astanahub_logo.png")}
              alt="Astana Hub"
              className="h-10 w-auto object-contain opacity-70"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
