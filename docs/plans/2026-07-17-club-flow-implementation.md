# Club Flow Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use godmode:task-runner to implement this plan task-by-task.

**Goal:** Refactor the Basecamp landing so section 2 explains the HJ system universally, add a dedicated "Choose your club" grid + per-club pages (`/clubs/:id`), and make the `Записаться` CTA carry the club context into the existing payment modal.

**Architecture:** Extract a single `CLUBS` data module used by both the landing grid and the club pages. Extend the existing `PaymentModalContext` to accept a `clubId` on `open()` and pass it through the payment library. Add a new `/clubs/:id` route with a `ClubPage` component that renders club-specific content. Update `DesignHome` to remove the current per-club selector, add a new system-pitch section, add a club grid section, and remove the redundant UPPER BODY preview.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, react-router-dom v7. No test runner is configured; verification uses `npm run type-check`, `npm run lint`, and puppeteer screenshots against `http://localhost:3001/`.

**Environment note:** Project is not a git repository, so plan steps use "checkpoint" (a manual review pause) instead of `git commit`.

**Design source of truth:** [docs/plans/2026-07-17-club-flow-redesign-design.md](2026-07-17-club-flow-redesign-design.md).

---

## Task 1: Club data module

**Files:**
- Create: `src/data/clubs.ts`

**Step 1: Create the data module**

Contents of `src/data/clubs.ts`:

```ts
import { asset } from "@/lib/asset";

export type ClubId =
  | "villa"
  | "colibri"
  | "4you"
  | "promenade"
  | "nurly"
  | "europe";

export type ClubCategory = "strength" | "hiit" | "mindBody";

export interface Club {
  id: ClubId;
  backendId: string;
  label: string;
  city: "АЛМАТЫ" | "АСТАНА";
  photo: string;
  trainings: Record<ClubCategory, string[]>;
}

export const CLUB_BACKEND_IDS: Record<ClubId, string> = {
  "4you":       "68a45233d9ba5a6ba953e5f0",
  colibri:      "65e9e70cbd4814536c5e27e9",
  promenade:    "67d7c4cc8b5b3112cb0bcd44",
  villa:        "683704d8c85fb0a6b1f5a8ca",
  europe:       "6788b54527af6c00ab78c66a",
  nurly:        "6351ace4d61faf000b2febc8",
};

export const CLUBS: Club[] = [
  {
    id: "villa",
    backendId: CLUB_BACKEND_IDS.villa,
    label: "VILLA",
    city: "АЛМАТЫ",
    photo: asset("/design/v1_17.png"),
    trainings: {
      strength: ["2× Upper Body / Reshape", "2× Legs"],
      hiit: ["2× Bootcamp"],
      mindBody: [],
    },
  },
  {
    id: "colibri",
    backendId: CLUB_BACKEND_IDS.colibri,
    label: "COLIBRI",
    city: "АЛМАТЫ",
    photo: asset("/design/v1_60.png"),
    trainings: {
      strength: ["2× Upper", "1× Legs / Glutes"],
      hiit: ["2× Bootcamp", "1× Metcon"],
      mindBody: [],
    },
  },
  {
    id: "4you",
    backendId: CLUB_BACKEND_IDS["4you"],
    label: "4YOU",
    city: "АЛМАТЫ",
    photo: asset("/design/v1_61.png"),
    trainings: {
      strength: ["2× Upper Body", "1× Legs / Glute", "1× Reshape + Assessment"],
      hiit: ["1× Bootcamp", "1× Metcon"],
      mindBody: [],
    },
  },
  {
    id: "promenade",
    backendId: CLUB_BACKEND_IDS.promenade,
    label: "PROMENADE",
    city: "АЛМАТЫ",
    photo: asset("/design/v1_62.png"),
    trainings: {
      strength: ["2× Full Body"],
      hiit: ["1× Bootcamp", "1× Metcon"],
      mindBody: [],
    },
  },
  {
    id: "nurly",
    backendId: CLUB_BACKEND_IDS.nurly,
    label: "NURLY ORDA",
    city: "АСТАНА",
    photo: asset("/design/v1_9.png"),
    trainings: {
      strength: ["2× Leg Day", "2× Upper Body"],
      hiit: ["2× Bootcamp"],
      mindBody: [],
    },
  },
  {
    id: "europe",
    backendId: CLUB_BACKEND_IDS.europe,
    label: "EUROPE CITY",
    city: "АСТАНА",
    photo: asset("/photos/hero_man.png"),
    trainings: {
      strength: ["2× Upper Body", "1× Legs / Glutes"],
      hiit: ["2× Metcon"],
      mindBody: ["1× Mind & Body"],
    },
  },
];

export const CLUB_CATEGORY_LABELS: Record<ClubCategory, string> = {
  strength: "СИЛОВЫЕ",
  hiit: "HIIT / ИНТЕРВАЛЬНЫЕ",
  mindBody: "MIND & BODY",
};

export function getClub(id: string): Club | undefined {
  return CLUBS.find((c) => c.id === id);
}
```

**Step 2: Verify types compile**

Run: `npm run type-check`
Expected: exits 0, no output.

**Step 3: Checkpoint**

No commit (project is not a git repo). Confirm the file exists and typechecks before moving on.

---

## Task 2: Extend payment library to accept a clubId

**Files:**
- Modify: `src/lib/payment.ts`

**Step 1: Read current signatures**

Read `src/lib/payment.ts`. Note every occurrence of `CLUB_ID_4YOU`. Identify the two entry points: `createCardPayment(...)` and `createKaspiPayment(...)`.

**Step 2: Add a required `clubId` parameter**

For each function that currently references `CLUB_ID_4YOU` from an inner request body, add `clubId: string` to its argument signature and thread it through to every request body it constructs. Keep the existing `CLUB_ID_4YOU` export for backwards compatibility so nothing else breaks — but remove all `clubId: CLUB_ID_4YOU` hardcodes.

Concretely: search for each `clubId: CLUB_ID_4YOU,` in the file and replace it with `clubId,` (referencing the new function parameter). If a function did not previously take a `clubId`, add it as the FIRST field of its options object so callers must supply it.

**Step 3: Verify types compile**

Run: `npm run type-check`
Expected: TypeScript errors ONLY in `src/components/feature/PaymentModal.tsx` (the caller does not pass `clubId` yet — that's Task 3).

**Step 4: Checkpoint**

Confirm expected errors are limited to `PaymentModal.tsx`. If other files fail, investigate before proceeding.

---

## Task 3: Extend `PaymentModalContext` + `PaymentModal` to accept and use `clubId`

**Files:**
- Modify: `src/components/feature/PaymentModalContext.tsx`
- Modify: `src/components/feature/PaymentModal.tsx`

**Step 1: Update the context signature**

Replace the `PaymentModalContextValue` and `PaymentModalProvider` in `src/components/feature/PaymentModalContext.tsx` with:

```tsx
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import PaymentModal from "./PaymentModal";
import { CLUB_BACKEND_IDS, type ClubId } from "@/data/clubs";

interface OpenArgs {
  clubId?: ClubId;
}

interface PaymentModalContextValue {
  open: (args?: OpenArgs) => void;
  close: () => void;
}

const PaymentModalContext = createContext<PaymentModalContextValue | null>(null);

export function PaymentModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [clubId, setClubId] = useState<ClubId>("4you"); // default fallback

  const open = useCallback((args?: OpenArgs) => {
    if (args?.clubId) setClubId(args.clubId);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <PaymentModalContext.Provider value={{ open, close }}>
      {children}
      <PaymentModal open={isOpen} onClose={close} clubBackendId={CLUB_BACKEND_IDS[clubId]} clubId={clubId} />
    </PaymentModalContext.Provider>
  );
}

export function usePaymentModal(): PaymentModalContextValue {
  const ctx = useContext(PaymentModalContext);
  if (!ctx) throw new Error("usePaymentModal must be used inside PaymentModalProvider");
  return ctx;
}
```

**Step 2: Update `PaymentModal.tsx` props**

Extend `PaymentModalProps`:

```tsx
interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  clubBackendId: string;
  clubId: ClubId;
}
```

Inside the component: destructure `clubBackendId` and `clubId` from props. Find every call to `createCardPayment({ ... })` and `createKaspiPayment({ ... })` and add `clubId: clubBackendId,` as an explicit field on the options passed in. Remove any lingering reference to the exported `CLUB_ID_4YOU` inside this file (it should now come exclusively from `clubBackendId`).

**Step 3: Show the selected club in the modal summary**

In the JSX block that renders the product summary (search for `PRODUCT.title` — `Hero's Journey · Basecamp`), append a small line showing the club: `HJ {getClub(clubId)?.label}` using `import { getClub } from "@/data/clubs";`. Keep it visually subtle (`text-white/60 text-sm`).

**Step 4: Verify types compile**

Run: `npm run type-check`
Expected: exits 0, no errors.

**Step 5: Verify lint passes**

Run: `npm run lint`
Expected: exits 0, no warnings.

**Step 6: Checkpoint**

Confirm both commands pass.

---

## Task 4: Create `ClubPage` component

**Files:**
- Create: `src/pages/clubs/ClubPage.tsx`

**Step 1: Create the component**

Contents of `src/pages/clubs/ClubPage.tsx`:

```tsx
import { Link, Navigate, useParams } from "react-router-dom";
import { getClub, CLUB_CATEGORY_LABELS, type ClubCategory } from "@/data/clubs";
import { usePaymentModal } from "@/components/feature/PaymentModalContext";
import { asset } from "@/lib/asset";

const C = {
  blue: "#8ABAD5",
  ink: "#201E1E",
  muted: "#DADADA",
};

export default function ClubPage() {
  const { id } = useParams<{ id: string }>();
  const club = id ? getClub(id) : undefined;
  const { open } = usePaymentModal();

  if (!club) return <Navigate to="/" replace />;

  const orderedCategories: ClubCategory[] = ["strength", "hiit", "mindBody"];
  let counter = 0;

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap&subset=cyrillic,latin"
        rel="stylesheet"
      />

      <div className="hj-brand min-h-screen bg-white text-[#201E1E]">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-neutral-200">
          <div className="mx-auto max-w-[720px] px-4 py-3 flex items-center">
            <Link to="/" className="text-sm font-medium hover:text-black text-neutral-600">
              ← Basecamp
            </Link>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[520px] px-4 sm:max-w-[640px] sm:px-5 lg:max-w-[720px]">
          {/* HERO */}
          <section className="relative overflow-hidden rounded-[28px] mt-4 sm:mt-6">
            <div className="relative aspect-[4/5] w-full bg-neutral-900">
              <img
                src={club.photo}
                alt={club.label}
                className="absolute inset-0 h-full w-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="relative flex h-full w-full flex-col justify-end px-6 pb-10 text-white">
                <p className="uppercase tracking-widest font-semibold text-xs sm:text-sm opacity-90">
                  {club.city}
                </p>
                <h1 className="hj-title uppercase leading-[0.95] text-[clamp(48px,14vw,96px)] mt-1">
                  HJ {club.label}
                </h1>
              </div>
            </div>
          </section>

          {/* TRAININGS */}
          <section className="mt-16 sm:mt-20">
            <h2 className="text-center hj-title uppercase leading-[0.95] text-[clamp(30px,8vw,52px)]">
              6 тренировок в HJ {club.label}
            </h2>

            <div className="mt-8 space-y-8">
              {orderedCategories.map((cat) => {
                const items = club.trainings[cat];
                if (!items.length) return null;
                return (
                  <div key={cat}>
                    <p
                      className="text-center uppercase font-semibold tracking-widest text-xs sm:text-sm"
                      style={{ color: C.muted }}
                    >
                      {CLUB_CATEGORY_LABELS[cat]}
                    </p>
                    <ul className="mt-4 space-y-4">
                      {items.map((t) => {
                        counter += 1;
                        return (
                          <li key={t} className="flex items-center gap-4">
                            <span
                              className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-full border-4 hj-title text-xl sm:text-2xl"
                              style={{ borderColor: C.blue, color: C.blue }}
                            >
                              {counter}
                            </span>
                            <span
                              className="hj-title uppercase text-2xl sm:text-3xl tracking-wide"
                              style={{ color: C.blue }}
                            >
                              {t}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 flex flex-col items-center">
              <button
                type="button"
                onClick={() => open({ clubId: club.id })}
                className="inline-flex flex-col items-center justify-center rounded-3xl px-10 py-3 sm:px-14 sm:py-4 shadow-lg transition hover:brightness-110"
                style={{ background: C.blue }}
              >
                <span className="hj-title text-3xl sm:text-4xl tracking-wide text-white">
                  ЗАПИСАТЬСЯ
                </span>
                <span className="mt-1 text-xs sm:text-sm font-semibold tracking-widest uppercase text-white/95">
                  за 19 900 тг
                </span>
              </button>
            </div>
          </section>

          <div className="h-24" />
        </div>

        <footer className="bg-black text-neutral-400">
          <div className="mx-auto max-w-[720px] px-4 sm:px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-5 text-xs sm:text-sm">
            <div className="text-center sm:text-left flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <p>© {new Date().getFullYear()} Hero's Journey · Все права защищены.</p>
              <Link to="/" className="underline underline-offset-4 hover:text-white transition-colors">На главную</Link>
            </div>
            <img
              src={asset("/logo/astanahub_logo.png")}
              alt="Astana Hub"
              className="h-10 w-auto object-contain opacity-70"
            />
          </div>
        </footer>
      </div>
    </>
  );
}
```

**Step 2: Verify types compile**

Run: `npm run type-check`
Expected: exits 0.

**Step 3: Checkpoint**

Confirm typecheck passes.

---

## Task 5: Wire the `/clubs/:id` route

**Files:**
- Modify: `src/router/config.tsx`

**Step 1: Add the route**

Replace `src/router/config.tsx` with:

```tsx
import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import ClubPage from "../pages/clubs/ClubPage";

const routes: RouteObject[] = [
  { path: "/",              element: <Home /> },
  { path: "/clubs/:id",     element: <ClubPage /> },
  { path: "*",              element: <NotFound /> },
];

export default routes;
```

**Step 2: Verify types compile**

Run: `npm run type-check`
Expected: exits 0.

**Step 3: Verify manually in the dev server**

The dev server is already running on port 3001. Navigate a puppeteer instance to `http://localhost:3001/clubs/villa` and take a screenshot to `/tmp/club-villa.png`. Expected: club page renders with "HJ VILLA" hero, training list grouped by СИЛОВЫЕ / HIIT, ЗАПИСАТЬСЯ button visible.

Also verify `http://localhost:3001/clubs/does-not-exist` redirects to `/` (screenshot should show landing).

**Step 4: Checkpoint**

Confirm all screenshots look correct.

---

## Task 6: Refactor `DesignHome` — new system section, club grid, remove UPPER BODY preview

**Files:**
- Modify: `src/pages/home/DesignHome.tsx`

This is the largest single edit. Break into 4 sub-steps.

**Step 1: Remove now-duplicated data**

Delete the local `CLUBS` constant at the top of `DesignHome.tsx` (moved to `src/data/clubs.ts`). Delete the local `type ClubId = ...` line. Import instead:

```tsx
import { CLUBS, CLUB_CATEGORY_LABELS, type Club } from "@/data/clubs";
import { Link } from "react-router-dom";
import { usePaymentModal } from "@/components/feature/PaymentModalContext";
```

Delete the `clubId` state, `setClubId`, `club` memo, and the `clubsAlmaty`/`clubsAstana` filter lines from inside `DesignHome`.

**Step 2: Replace the "Что входит в абонемент" section with the SYSTEM section**

Locate the section that currently starts with `<p ... >Что входит в абонемент</p>` and ends before `<section className="mt-16 sm:mt-20 relative overflow-hidden rounded-[28px]">` (the UPPER BODY preview). Replace the entire block with:

```tsx
{/* ---------------- SYSTEM ---------------- */}
<section className="mt-16 sm:mt-20">
  <p
    className="text-center uppercase font-semibold tracking-widest text-xs sm:text-sm"
    style={{ color: C.muted }}
  >
    Абонемент BASECAMP
  </p>
  <h2 className="mt-3 text-center hj-title uppercase leading-[0.95] text-[clamp(36px,10vw,64px)]">
    6 тренировок в неделю<br />одна система
  </h2>
  <p className="mt-4 text-center text-sm sm:text-base max-w-md mx-auto opacity-80">
    Программа делится на силовые и высокоинтенсивные интервальные (HIIT). В некоторых клубах есть Reshape и Mind & Body.
  </p>

  <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
    {[
      { key: "strength", title: "СИЛОВЫЕ", body: "Upper Body · Legs & Glutes · Full Body · Reshape" },
      { key: "hiit",     title: "HIIT · ИНТЕРВАЛЬНЫЕ", body: "Bootcamp · Metcon" },
      { key: "mindBody", title: "MIND & BODY", body: "Опционально · растяжка, восстановление" },
    ].map((c) => (
      <div
        key={c.key}
        className="rounded-2xl border p-5 sm:p-6"
        style={{ borderColor: "rgba(0,0,0,0.08)", background: "#f7f7f7" }}
      >
        <p
          className="hj-title uppercase text-2xl sm:text-[26px] tracking-wide"
          style={{ color: C.blue }}
        >
          {c.title}
        </p>
        <p className="mt-2 text-sm sm:text-base opacity-80">{c.body}</p>
      </div>
    ))}
  </div>
</section>
```

**Step 3: Remove the UPPER BODY preview section**

Delete the entire block that begins with `{/* ---------------- TRAINING TYPE PREVIEW ---------------- */}` and closes with `</section>` right before the DIFFERENTIATOR CAROUSEL. The СИСТЕМА section now conveys this information.

**Step 4: Add the "ВЫБЕРИ СВОЙ КЛУБ" section between reassurance and athlete stories**

Locate the reassurance block (`{/* ---------------- FOR ME (reassurance) ---------------- */}`). Immediately AFTER its closing `</section>`, insert:

```tsx
{/* ---------------- CHOOSE YOUR CLUB ---------------- */}
<section id="clubs" className="mt-16 sm:mt-20">
  <p
    className="text-center uppercase font-semibold tracking-widest text-xs sm:text-sm"
    style={{ color: C.muted }}
  >
    Где начать
  </p>
  <h2 className="mt-3 text-center hj-title uppercase leading-[0.95] text-[clamp(36px,10vw,64px)]">
    Выбери свой клуб
  </h2>
  <p className="mt-3 text-center text-sm sm:text-base opacity-75">
    6 клубов в Алматы и Астане
  </p>

  <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
    {CLUBS.map((c: Club) => (
      <Link
        key={c.id}
        to={`/clubs/${c.id}`}
        className="group relative overflow-hidden rounded-2xl bg-neutral-900 aspect-[4/5]"
      >
        <img
          src={c.photo}
          alt={c.label}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-4 text-white">
          <p className="text-[10px] sm:text-xs uppercase tracking-widest opacity-85">{c.city}</p>
          <p className="hj-title uppercase text-[clamp(20px,5vw,32px)] leading-none mt-1">
            {c.label}
          </p>
          <span
            className="mt-2 self-start rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-semibold uppercase tracking-widest"
            style={{ background: C.blue }}
          >
            6 тренировок
          </span>
        </div>
      </Link>
    ))}
  </div>
</section>
```

**Step 5: Update HERO and bottom `Записаться` CTAs to scroll to `#clubs`**

Locate the hero CTA `<a href="#cta" ...>` — change the href to `"#clubs"`. Locate the bottom CTA `<a href="#" ...>` inside the `id="cta"` section — change it to `"#clubs"`.

Delete the now-unused `id="cta"` attribute on that bottom section (or keep it; harmless). The `id="cta"` referenced nothing meaningful.

**Step 6: Verify types + lint**

Run:
```bash
npm run type-check
npm run lint
```
Expected: both exit 0.

**Step 7: Screenshot verification**

Puppeteer capture `http://localhost:3001/` at widths 430 and 1440. Confirm:
- HERO with `Записаться` present
- New СИСТЕМА section with 3 columns
- No UPPER BODY preview section
- ЧЕМ ОТЛИЧАЕТСЯ carousel present
- НЕ НУЖНО БЫТЬ ГОТОВЫМ block
- **ВЫБЕРИ СВОЙ КЛУБ** with 6 cards, links present
- 10 000 АТЛЕТОВ carousel
- Bottom CTA
- FAQ / Контакты footer

**Step 8: Checkpoint**

Confirm all present, no visual regressions.

---

## Task 7: End-to-end verification pass

**Files:** none modified.

**Step 1: Full click-through**

Using puppeteer:
1. Load `http://localhost:3001/`
2. Screenshot `/tmp/e2e-home.png` (mobile 430px viewport)
3. Click the hero `Записаться` button. Verify page scrolled to the club grid (`#clubs` in URL, grid visible on-screen). Screenshot `/tmp/e2e-scrolled.png`.
4. Click the first club card (VILLA). Verify URL is `/clubs/villa`. Screenshot `/tmp/e2e-villa.png`.
5. Confirm club page shows "HJ VILLA", trainings numbered 1..N grouped by category.
6. Click `ЗАПИСАТЬСЯ`. Verify the payment modal is open, and the club label ("HJ VILLA") appears in the modal summary. Screenshot `/tmp/e2e-modal.png`.
7. Close modal. Navigate to `/clubs/does-not-exist` — verify redirect to `/`. Screenshot `/tmp/e2e-404.png` should show landing.

**Step 2: Static checks**

Run:
```bash
npm run type-check
npm run lint
npm run build
```
All should exit 0. `npm run build` is the strongest signal — it forces the same TS strictness as CI and packages the assets.

**Step 3: Checkpoint**

If all screenshots and all commands pass, feature is complete.

---

## Rollback plan

Since the project is not a git repo, safest rollback is to keep a copy of the pre-change files:
- `src/pages/home/DesignHome.tsx` (biggest change)
- `src/lib/payment.ts`
- `src/components/feature/PaymentModal.tsx`
- `src/components/feature/PaymentModalContext.tsx`
- `src/router/config.tsx`

Before starting Task 2, copy each of the above to `<file>.bak` in the same directory. On failure, restore by copying `.bak` back.

---

## Out of scope (deferred)

- Club addresses / maps — v2
- Club schedules / trainers — v2
- Analytics events on the new club grid clicks — v2
- Real photos per club — pending designer delivery
