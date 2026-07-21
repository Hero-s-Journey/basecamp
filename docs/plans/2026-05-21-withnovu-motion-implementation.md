# withnovu-style Motion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use godmode:task-runner to implement this plan task-by-task.

**Goal:** Add withnovu.com-style entrance and scroll animations to the Basecamp landing — animated hero with text over a full-bleed image, fade-in navbar, and parallax transitions between blocks.

**Architecture:** GSAP drives all motion. ScrollTrigger is wired into the existing Lenis smooth-scroll instance so scrub animations stay in sync. A small `useGsap` hook scopes per-component animations with `gsap.context` for automatic cleanup. Hero entrance is a one-shot GSAP timeline on mount; section images get scrub-linked parallax.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind, GSAP 3.13 (already in deps), Lenis (already wired in `SiteLayout`).

**Verification note:** This project has no test runner — only `npm run type-check` and `npm run lint`. Each task is verified with those two commands plus a manual browser check at http://localhost:3000/.

---

### Task 1: Wire ScrollTrigger into Lenis

**Files:**
- Modify: `src/hooks/useLenis.ts`

**Step 1: Replace the file contents**

```ts
import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    // Keep ScrollTrigger in sync with Lenis-driven scroll
    lenis.on("scroll", ScrollTrigger.update);

    // Drive Lenis from GSAP's ticker so scrub animations stay frame-locked
    const update = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, []);
}
```

**Step 2: Verify**

Run: `npm run type-check && npm run lint`
Expected: both pass, no errors.

**Step 3: Commit**

```bash
git add src/hooks/useLenis.ts
git commit -m "feat(motion): wire GSAP ScrollTrigger into Lenis smooth scroll"
```

---

### Task 2: Add the `useGsap` hook

**Files:**
- Create: `src/hooks/useGsap.ts`

**Step 1: Create the file**

```ts
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Runs GSAP setup scoped to a container element via gsap.context,
 * so every tween/ScrollTrigger created inside is reverted on unmount.
 */
export function useGsap<T extends HTMLElement = HTMLElement>(
  setup: (el: T) => void,
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => setup(el), el);
    return () => ctx.revert();
    // setup is intentionally not a dependency — animations run once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}
```

**Step 2: Verify**

Run: `npm run type-check && npm run lint`
Expected: both pass.

**Step 3: Commit**

```bash
git add src/hooks/useGsap.ts
git commit -m "feat(motion): add useGsap hook for scoped GSAP animations"
```

---

### Task 3: Rewrite Hero — text over full-bleed image + GSAP entrance + parallax

**Files:**
- Modify: `src/pages/home/components/Hero.tsx`

**Step 1: Replace the file contents**

```tsx
import { useEffect, useRef } from 'react';
import { useGsap } from '@/hooks/useGsap';
import gsap from 'gsap';

export default function Hero() {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;
    let animId: number;
    let x = 0;
    const speed = 0.5;
    const step = () => {
      x -= speed;
      const contentWidth = marquee.scrollWidth / 2;
      if (Math.abs(x) >= contentWidth) x = 0;
      marquee.style.transform = `translateX(${x}px)`;
      animId = requestAnimationFrame(step);
    };
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, []);

  const sectionRef = useGsap<HTMLElement>((el) => {
    // Cascading entrance for hero content
    gsap.from(el.querySelectorAll('[data-hero-anim]'), {
      y: 32,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.12,
      delay: 0.15,
    });

    // Background image parallax — image drifts slower than scroll
    const img = el.querySelector('[data-hero-img]');
    if (img) {
      gsap.to(img, {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    // Content fades slightly as you scroll past
    const content = el.querySelector('[data-hero-content]');
    if (content) {
      gsap.to(content, {
        opacity: 0,
        y: -40,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }
  });

  return (
    <section
      ref={sectionRef}
      className="relative pt-[72px] overflow-hidden min-h-[640px] md:min-h-[760px] lg:min-h-[820px] flex flex-col bg-[#15100c]"
    >
      {/* Full-bleed background image */}
      <img
        data-hero-img
        src="https://storage.readdy-site.link/project_files/271d57aa-8568-4d15-bffb-f5499143c238/0b39ab1d-ca94-4d4b-afca-d500e7106dd6_client_her.jpeg?v=f97a7b8a48798c38f46ae0512c58e720"
        alt=""
        className="absolute inset-0 w-full h-[120%] object-cover object-top"
      />

      {/* Dark gradient overlays for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/75 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#15100c] via-transparent to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center">
        <div
          data-hero-content
          className="mx-auto max-w-[1100px] w-full px-6 md:px-10 py-16 md:py-24 flex flex-col items-center text-center"
        >
          <h1
            data-hero-anim
            className="text-display text-4xl md:text-5xl lg:text-6xl leading-[1.08] text-balance text-white max-w-3xl drop-shadow-lg"
          >
            6 тренировок в Hero's Journey 4you + фитнес чекап
          </h1>
          <p
            data-hero-anim
            className="mt-5 max-w-xl text-white/70 text-sm md:text-base leading-relaxed drop-shadow"
          >
            За 14 дней мы готовим твоё тело к точным замерам. Получаешь 6 показателей о своей реальной форме и персональный план тренировок.
          </p>

          <a
            data-hero-anim
            href="#cta"
            className="group mt-9 inline-flex items-center justify-center gap-2.5 rounded-full px-8 py-4 text-xs font-semibold uppercase tracking-widest2 text-white cursor-pointer whitespace-nowrap border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 hover:border-white/35 transition-all duration-300"
          >
            Записаться за 19 990 ₸
            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white/15 group-hover:bg-white/25 transition-colors">
              <i className="ri-arrow-right-line text-sm" />
            </span>
          </a>

          <p data-hero-anim className="mt-5 text-white/40 text-xs tracking-wide">
            HJ 4you, Алматы, Ескараева 3
          </p>
        </div>
      </div>

      {/* Marquee */}
      <div className="relative z-10 border-t border-white/10 py-3.5 overflow-hidden">
        <div ref={marqueeRef} className="flex whitespace-nowrap gap-8 text-white/50">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-8 pr-8">
              {["Состав тела","Силовой тест","Кардио-тест","Функциональный тест"].map((t) => (
                <span key={t} className="text-xs uppercase tracking-widest2 flex items-center gap-8">
                  {t}
                  <span className="text-yellow-400/70 text-[8px]">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Verify**

Run: `npm run type-check && npm run lint`
Expected: both pass.

Manual: open http://localhost:3000/ — hero text cascades in on load; background image parallaxes on scroll; content fades as you scroll past.

**Step 3: Commit**

```bash
git add src/pages/home/components/Hero.tsx
git commit -m "feat(hero): text over full-bleed image with GSAP entrance and parallax"
```

---

### Task 4: Navbar fade-in on mount

**Files:**
- Modify: `src/components/feature/Navbar.tsx`

**Step 1: Add the import** at the top of the file, after the existing imports:

```tsx
import { useGsap } from "@/hooks/useGsap";
import gsap from "gsap";
```

**Step 2: Add the entrance animation** inside the `Navbar` component, after the existing `useEffect` block. Create a ref via `useGsap`:

```tsx
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
```

**Step 3: Attach the ref** — change the opening `<header` tag to include `ref={headerRef}`:

```tsx
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
```

**Step 4: Tag the animated children** — add `data-nav-anim` to three elements:
- the logo `<a>` (the one wrapping the logo `<img>`)
- the desktop `<nav>` element
- the desktop CTA wrapper `<div className="hidden md:flex items-center gap-3">`

**Step 5: Verify**

Run: `npm run type-check && npm run lint`
Expected: both pass.

Manual: reload http://localhost:3000/ — logo, links, and CTA fade down into place on load.

**Step 6: Commit**

```bash
git add src/components/feature/Navbar.tsx
git commit -m "feat(navbar): fade-in entrance animation on mount"
```

---

### Task 5: Parallax on section images

**Files:**
- Modify: `src/pages/home/components/CheckupResult.tsx`
- Modify: `src/pages/home/components/CTA.tsx`
- Modify: `src/pages/home/components/Transformations.tsx`

For each file, add a scrub-linked parallax to the main image(s). Use `useGsap` on the section's existing root element. Since each file already has a `useReveal` ref on the `<section>`, add a **separate** inner wrapper ref or reuse the section: attach `useGsap` to a new ref on the `<section>` is not possible (one ref slot). Instead, run GSAP in a plain `useEffect`.

**Step 1 — CheckupResult.tsx:** add this `useEffect` inside the component (import `gsap` and `useRef`):

```tsx
import { useEffect, useRef } from "react";
import gsap from "gsap";
// ...
  const imgWrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const wrap = imgWrapRef.current;
    if (!wrap) return;
    const img = wrap.querySelector("img");
    if (!img) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        img,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: "none",
          scrollTrigger: { trigger: wrap, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    }, wrap);
    return () => ctx.revert();
  }, []);
```

Attach `ref={imgWrapRef}` to the right-column image wrapper `<div className="relative w-full h-full min-h-[420px]">`. Add `overflow-hidden` to that wrapper so the parallax overflow is clipped.

**Step 2 — CTA.tsx:** same pattern. Attach a ref to the `<div className="relative rounded-2xl md:rounded-[32px] overflow-hidden ...">` (already has `overflow-hidden`), parallax the `<img>` inside. Image className needs `h-[120%]` instead of `h-full` so there is room to move.

**Step 3 — Transformations.tsx:** add a subtle per-card parallax — give the cards container a ref, and in a `useEffect` parallax each `img` with a small `yPercent` range (`-6` → `6`). Each card wrapper already has `overflow-hidden` on the inner `aspect-[9/16]` div.

**Step 4: Verify**

Run: `npm run type-check && npm run lint`
Expected: both pass.

Manual: scroll http://localhost:3000/ — images in CheckupResult, CTA, and athlete cards drift gently against the scroll.

**Step 5: Commit**

```bash
git add src/pages/home/components/CheckupResult.tsx src/pages/home/components/CTA.tsx src/pages/home/components/Transformations.tsx
git commit -m "feat(motion): scrub-linked parallax on section images"
```

---

## Done criteria

- `npm run type-check` and `npm run lint` pass.
- Hero text cascades in on load; hero image parallaxes; content fades on scroll-past.
- Navbar fades in on load, still hardens to glass on scroll.
- CheckupResult / CTA / athlete-card images drift with scroll.
- No console errors; smooth scroll (Lenis) still works.

## Notes

- `CheckupResult` and `Testimonials` are not currently mounted in `page.tsx`; the CheckupResult parallax will only be visible if that section is re-added. Implement it anyway for completeness.
- Respect `prefers-reduced-motion` is out of scope for this pass — note as a future task.
