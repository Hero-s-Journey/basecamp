# Timeline Unlock Animation — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use godmode:task-runner to implement this plan task-by-task.

**Goal:** Add a looping animation to the «14 дней подготовки» timeline that visually shows: 3 trainings (Верх → Низ → Кардио) complete one by one and unlock the «День фитнес чекапа» pill.

**Architecture:** A React state machine (`step` 0–4, `cardioVariant` 0/1) advances on timers once the section scrolls into view. The `Pill` component is extended with a `state` prop (pending/done/locked/unlocked) rendering a number, checkmark, or lock badge. The cardio pill label cycles Bootcamp ⇄ Metcon each loop. A CSS keyframe drives the unlock glow-pulse.

**Tech Stack:** React 19, TypeScript, Tailwind, Remix Icon (`ri-*`).

**Verification note:** No test runner — verify with `npm run type-check`, `npm run lint`, `npm run build`, plus a manual check at http://localhost:3000/.

---

### Task 1: Add the unlock glow-pulse keyframe

**Files:**
- Modify: `src/index.css`

**Step 1: Add the keyframe** — inside the `@layer utilities` block, after the existing `.hex-trace` / `hexTrace` rules, add:

```css
  .timeline-unlock-pulse {
    animation: timelineUnlockPulse 1.6s ease-in-out infinite;
  }
  @keyframes timelineUnlockPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(226, 114, 75, 0); }
    50% { box-shadow: 0 0 28px 2px rgba(226, 114, 75, 0.55); }
  }
```

**Step 2: Verify**

Run: `npm run type-check && npm run lint`
Expected: both pass.

**Step 3: Commit**

```bash
git add "src/index.css"
git commit -m "feat(timeline): add unlock glow-pulse keyframe"
```

---

### Task 2: Rework PreparationTimeline with the unlock animation

**Files:**
- Modify: `src/pages/home/components/PreparationTimeline.tsx`

**Step 1: Replace the entire file contents with:**

```tsx
import { useEffect, useState } from "react";
import { useReveal } from "@/hooks/useReveal";

const STEP_MS = 950;
const UNLOCK_HOLD_MS = 1500;
const RESET_HOLD_MS = 650;

type PillState = "pending" | "done" | "locked" | "unlocked";

function trackMouse(e: React.MouseEvent<HTMLDivElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${e.clientX - r.left}px`);
  el.style.setProperty("--my", `${e.clientY - r.top}px`);
}

function Pill({
  index,
  title,
  state,
}: {
  index: number;
  title: string;
  state: PillState;
}) {
  const unlocked = state === "unlocked";
  const lit = state === "done" || unlocked;
  const glowColor = lit ? "rgba(255,255,255,0.95)" : "rgba(226,114,75,0.95)";
  return (
    <div
      onMouseMove={trackMouse}
      className={`group relative overflow-hidden inline-flex items-center gap-2.5 rounded-full border px-5 py-2.5 cursor-default transition-all duration-500 hover:scale-105 ${
        unlocked
          ? "bg-terracotta border-terracotta timeline-unlock-pulse"
          : lit
          ? "bg-white/[0.08] border-white/25"
          : "bg-white/[0.04] border-white/10"
      }`}
    >
      {/* Cursor-tracking border glow */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(120px circle at var(--mx, 50%) var(--my, 50%), ${glowColor}, transparent 70%)`,
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "1.5px",
        }}
      />
      {/* Badge: number / check / lock */}
      <span className="relative flex items-center justify-center min-w-[1.4rem] text-xs font-semibold transition-colors duration-300">
        {state === "pending" && (
          <span className="text-white/40">
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
        {state === "done" && (
          <i className="ri-check-line text-sm text-terracotta" />
        )}
        {state === "locked" && (
          <i className="ri-lock-line text-sm text-white/40" />
        )}
        {unlocked && <i className="ri-lock-unlock-line text-sm text-white" />}
      </span>
      <span
        key={title}
        className="relative text-sm font-medium text-white hero-fade-in"
      >
        {title}
      </span>
    </div>
  );
}

export default function PreparationTimeline() {
  const ref = useReveal<HTMLDivElement>();
  const [showVideo, setShowVideo] = useState(false);
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [cardioVariant, setCardioVariant] = useState(0);

  // Lazy-load the video + start the timeline animation when the section nears the viewport
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowVideo(true);
          setStarted(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  // Step loop: 0 (reset) → 1 → 2 → 3 → 4 (unlocked) → back to 0
  useEffect(() => {
    if (!started) return;
    const delay =
      step === 0 ? RESET_HOLD_MS : step >= 4 ? UNLOCK_HOLD_MS : STEP_MS;
    const timer = setTimeout(() => {
      setStep((s) => {
        if (s >= 4) {
          setCardioVariant((v) => 1 - v);
          return 0;
        }
        return s + 1;
      });
    }, delay);
    return () => clearTimeout(timer);
  }, [started, step]);

  const cardioName = cardioVariant === 0 ? "Bootcamp" : "Metcon";
  const pills = [
    { title: "Upper Body" },
    { title: "Legs / Glute" },
    { title: cardioName },
    { title: "День фитнес чекапа" },
  ];
  const pillState = (i: number): PillState => {
    if (i === 3) return step >= 4 ? "unlocked" : "locked";
    return step > i ? "done" : "pending";
  };

  return (
    <section ref={ref} className="relative overflow-hidden bg-night py-24 md:py-32">
      {/* Static background — mobile fallback & video poster */}
      <img
        src="/video/static.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Background video — lazy-loaded, all devices */}
      {showVideo && (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src="/video/hj_brand.mp4" type="video/mp4" />
        </video>
      )}
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/95" />

      <div className="relative z-10 mx-auto max-w-[1320px] px-6 md:px-10">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start mb-12 md:mb-16">
          <div className="lg:col-span-7" data-reveal>
            <span className="text-xs uppercase tracking-widest2 text-white/40">
              14 дней подготовки
            </span>
            <h2 className="mt-4 text-display text-4xl md:text-6xl leading-[1.05] text-balance text-white">
              Твой путь к фитнес чекапу
            </h2>
          </div>
          <div className="lg:col-span-5 lg:pl-12" data-reveal data-reveal-delay="120">
            <p className="text-white/55 text-base md:text-lg leading-relaxed">
              В абонемент входит 6 тренировок, а фитнес чекап можно уже пройти в любой момент после трёх обязательных тренировок (Upper Body, Legs / Glute и Bootcamp / Metcon). Каждая тренировка готовит тело к конкретному упражнению: приходишь на чекап уверенным и показываешь максимум.
            </p>
          </div>
        </div>

        {/* Desktop timeline */}
        <div className="hidden md:flex items-center justify-center gap-3" data-reveal>
          {pills.map((p, i) => (
            <div key={i} className="flex items-center gap-3">
              <Pill index={i} title={p.title} state={pillState(i)} />
              {i < pills.length - 1 && (
                <span
                  className={`w-4 h-4 flex items-center justify-center transition-colors duration-500 ${
                    step > i ? "text-terracotta" : "text-white/20"
                  }`}
                >
                  <i className="ri-arrow-right-line text-sm" />
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Mobile timeline */}
        <div className="md:hidden flex flex-col items-center gap-2" data-reveal>
          {pills.map((p, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Pill index={i} title={p.title} state={pillState(i)} />
              {i < pills.length - 1 && (
                <span
                  className={`w-4 h-4 flex items-center justify-center transition-colors duration-500 ${
                    step > i ? "text-terracotta" : "text-white/20"
                  }`}
                >
                  <i className="ri-arrow-down-line text-sm" />
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Verify**

Run: `npm run type-check && npm run lint && npm run build`
Expected: all pass, no errors.

Manual: open http://localhost:3000/, scroll to «Твой путь к фитнес чекапу». The 3 training pills should complete one by one (number → checkmark), arrows light up, the checkup pill unlocks (lock → unlock, terracotta + glow pulse), then reset; the 3rd pill alternates Bootcamp ⇄ Metcon each loop.

**Step 3: Commit**

```bash
git add "src/pages/home/components/PreparationTimeline.tsx"
git commit -m "feat(timeline): animated 3-training unlock sequence for fitness checkup"
```

---

## Done criteria

- `npm run type-check`, `npm run lint`, `npm run build` all pass.
- Timeline pills complete in sequence and loop.
- Checkup pill toggles locked → unlocked with glow pulse.
- Cardio pill alternates Bootcamp / Metcon between loops.
- Cursor-following glow on pills still works.
- Animation starts only when the section is near the viewport.

## Notes

- `prefers-reduced-motion` is out of scope (future task).
- The block's heading/description text is unchanged.
