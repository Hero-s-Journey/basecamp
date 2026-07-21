import { useEffect, useState } from "react";
import { useGsap } from "@/hooks/useGsap";
import gsap from "gsap";
import { asset } from "@/lib/asset";
import { usePaymentModal } from "@/components/feature/PaymentModalContext";

const links = [
  { id: "trainings", label: "Что входит?" },
  { id: "about", label: "О Hero's Journey" },
  { id: "forme", label: "Это для меня?" },
  { id: "transformations", label: "Реальные истории" },
  { id: "cta", label: "Клубы" },
  { id: "studio", label: "FAQ" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState("");
  const { open: openPayment } = usePaymentModal();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 32);

      const scrollPos = window.scrollY + 120;
      let current = "";
      for (let i = links.length - 1; i >= 0; i--) {
        const sec = document.getElementById(links[i].id);
        if (sec && sec.offsetTop <= scrollPos) {
          current = links[i].id;
          break;
        }
      }
      setActiveId(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const headerRef = useGsap<HTMLElement>((el) => {
    gsap.from(el.querySelectorAll("[data-nav-anim]"), {
      y: -10,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
      stagger: 0.08,
      delay: 0.1,
    });
  });

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpen(false);
  };

  const trackMouse = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  // Dark frosted glass — pill stays dark enough for white text to read on
  // light beige Hero, while blending naturally with dark sections below.
  const pillBg = scrolled
    ? "bg-zinc-900/55 backdrop-blur-xl"
    : "bg-zinc-900/35 backdrop-blur-xl";

  return (
    <header
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-50 px-6 md:px-6 pt-3 md:pt-4"
    >
      <div className="mx-auto w-[66%] md:w-[75%] lg:w-[80%] xl:w-[78%] max-w-[1280px] flex items-center justify-between gap-2.5 md:gap-3">
        {/* Pill */}
        <div
          data-nav-anim
          onMouseMove={trackMouse}
          className={`group relative overflow-hidden flex-1 flex items-center justify-between rounded-full border border-white/15 ${pillBg} pl-5 pr-3 md:pl-7 md:pr-5 h-14 md:h-16 shadow-[0_8px_28px_-12px_rgba(0,0,0,0.25)] transition-colors duration-500`}
        >
          {/* Cursor-following glow border */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background:
                "radial-gradient(220px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.85), transparent 70%)",
              WebkitMask:
                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              padding: "1px",
            }}
          />
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              scrollTo("hero");
            }}
            className="flex items-center cursor-pointer"
          >
            <img
              src={asset("/logo/hj_logo.png")}
              alt="Hero's Journey"
              className="h-6 md:h-7 w-auto"
            />
          </a>

          <nav className="hidden md:flex items-center gap-5 lg:gap-6 ml-auto pr-2">
            {links.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(l.id);
                }}
                className={`text-xs uppercase tracking-widest2 font-medium cursor-pointer whitespace-nowrap transition-all duration-300 [text-shadow:0_1px_2px_rgba(0,0,0,0.25)] hover:text-white ${
                  activeId === l.id ? "text-white" : "text-white/75"
                }`}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <button
            aria-label="Open menu"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full text-white cursor-pointer"
          >
            <i className={`${open ? "ri-close-line" : "ri-menu-line"} text-xl`} />
          </button>
        </div>

        {/* Round CTA button */}
        <button
          type="button"
          data-nav-anim
          onClick={() => openPayment()}
          onMouseMove={trackMouse}
          className="group relative overflow-hidden hidden md:flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-terracotta !text-white cursor-pointer hover:bg-[#3DDC5C] hover:!text-night shadow-[0_8px_24px_-6px_rgba(226,114,75,0.55)] hover:shadow-[0_0_44px_-2px_rgba(61,220,92,0.7)] hover:scale-105 transition-all duration-300"
        >
          {/* Cursor-following glow border */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background:
                "radial-gradient(90px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.9), transparent 70%)",
              WebkitMask:
                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              padding: "1px",
            }}
          />
          <i className="ri-arrow-right-up-line text-xl group-hover:rotate-45 transition-transform duration-300" />
        </button>
      </div>

      {/* Mobile dropdown */}
      {open ? (
        <div className={`md:hidden w-1/2 mx-auto mt-2 rounded-3xl border border-white/10 ${pillBg} backdrop-blur-xl`}>
          <div className="px-5 py-6 flex flex-col items-center gap-4 text-center">
            {links.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(l.id);
                }}
                className={`text-base cursor-pointer ${
                  activeId === l.id ? "text-white font-medium" : "text-white/70"
                }`}
              >
                {l.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openPayment();
              }}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-white !text-black px-6 py-3 text-xs uppercase tracking-widest2 font-semibold cursor-pointer whitespace-nowrap"
            >
              Записаться
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
