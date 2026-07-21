# Basecamp Landing — Club Flow Redesign

**Date:** 2026-07-17
**Status:** approved
**Author:** intent-discovery session (Claude + user)

## Problem

In the current landing, the second section ("Что входит в абонемент") mixes three concerns at once:
1. Explaining what the subscription is
2. Making the visitor pick a club
3. Showing per-club training breakdown

This buries the main pitch — *6 trainings a week, one HJ system, split into strength + HIIT (+ optional Mind & Body / Reshape)* — behind a decision the visitor is not ready to make. The wall of chip toggles reads as "different clubs give different products," when the actual message should be "same system everywhere; six locations to pick from."

## Decision

Split the second section into two separate blocks with different purposes, and move club-specific content onto dedicated per-club pages.

**Chosen approach:** C — separate routes per club (`/clubs/:id`), reached from a landing-level "Choose your club" card grid. Rejected: bottom-sheet overlay (A) and inline accordion (B) — accepted trade-off is a longer navigation path in exchange for a page per club that can grow to hold address, gallery, schedule, trainers later.

## Information Architecture

### Landing (`/`)

Ordered top-to-bottom:

1. **HERO** — unchanged. `Записаться` CTA becomes `href="#clubs"` — scrolls to the club grid.
2. **СИСТЕМА** (rewritten from current "Что входит") — universal system pitch, no club selector:
   - Headline: "6 тренировок в неделю · Одна система"
   - Three columns (mobile: stacked):
     - **СИЛОВЫЕ** — Upper Body, Legs & Glutes, Full Body, Reshape
     - **HIIT / ИНТЕРВАЛЬНЫЕ** — Bootcamp, Metcon
     - **MIND & BODY** — опц.
   - Each column has a one-liner explanation.
3. **ЧЕМ ОТЛИЧАЕТСЯ** — existing 4-card carousel (Планшет / Пульсометр / Тренер / Программа). Unchanged.
4. **НЕ НУЖНО БЫТЬ ГОТОВЫМ** — existing reassurance block. Unchanged.
5. **ВЫБЕРИ СВОЙ КЛУБ** *(new section)* — see UI Spec below.
6. **10 000 АТЛЕТОВ** — existing athlete carousel. Unchanged.
7. **ГОТОВ НАЧАТЬ?** — existing bottom CTA. `Записаться` becomes `href="#clubs"`.
8. **FAQ + КОНТАКТЫ** — existing. Unchanged.

*Removed:* the current "UPPER BODY preview" section (it was redundant — the СИСТЕМА block already covers training types).

*Category change:* Bootcamp moves from strength → HIIT (per user feedback).

### Club Page (`/clubs/:id`)

New route template used by all 6 clubs.

```
[← Basecamp]                        ← sticky top nav

┌────── HERO ──────────┐
│ фото клуба            │
│  HJ VILLA             │
│  АЛМАТЫ               │
└──────────────────────┘

  6 тренировок в HJ Villa

  СИЛОВЫЕ
  1  2× Upper Body / Reshape
  2  2× Legs

  HIIT / ИНТЕРВАЛЬНЫЕ
  3  2× Bootcamp

  [ ЗАПИСАТЬСЯ ]         ← opens PaymentModal(clubId=villa)
     за 19 900 тг

  Адрес/карта — плейсхолдер, наполним позже

  FAQ + Контакты — переиспользуем футер главной
```

If `:id` is unknown → redirect to `/`.

## Data Model

Replace the current flat `CLUBS` constant:

```ts
type ClubCategory = "strength" | "hiit" | "mindBody";

type Club = {
  id: "villa" | "colibri" | "4you" | "promenade" | "nurly" | "europe";
  backendId: string;                 // Mongo ObjectId used by payment API
  label: string;                     // "VILLA"
  city: "АЛМАТЫ" | "АСТАНА";
  photo?: string;                    // /design/... placeholder if unknown
  address?: string;                  // optional, ok to leave empty in v1
  trainings: Record<ClubCategory, string[]>;
};
```

Data (from user):
- **HJ Villa (Алматы):** 2× Upper Body / Reshape, 2× Bootcamp (HIIT), 2× Legs
- **HJ Colibri (Алматы):** 2× Bootcamp (HIIT), 2× Upper, 1× Legs/Glutes, 1× Metcon (HIIT)
- **HJ 4YOU (Алматы):** 2× Upper Body, 1× Bootcamp (HIIT), 1× Legs/Glute, 1× Metcon (HIIT), 1× Reshape + Assessment
- **HJ Promenade (Алматы):** 2× Full Body, 1× Bootcamp (HIIT), 1× Metcon (HIIT)
- **HJ Nurly Orda (Астана):** 2× Bootcamp (HIIT), 2× Leg Day, 2× Upper Body
- **HJ Europe City (Астана):** 2× Upper Body, 2× Metcon (HIIT), 1× Legs/Glutes, 1× Mind & Body

## Routing

```ts
{ path: "/",             element: <Home /> },
{ path: "/clubs/:id",    element: <ClubPage /> },
{ path: "*",             element: <NotFound /> },
```
`ClubPage` reads `useParams<{ id: string }>()`, looks up in `CLUBS`; on miss → `<Navigate to="/" replace />`.

## Payment Modal API changes

Current: `PaymentModalContext.open()` opens modal that internally hard-codes `CLUB_ID_4YOU`. Needs generalization.

**New context signature:**
```ts
type OpenArgs = { clubId?: string };
usePaymentModal().open(args?: OpenArgs)
```

Behavior:
- `open({ clubId })` — modal opens with that club pre-selected.
- `open()` (no clubId) — modal opens with a first step that asks visitor to pick a club (chips), then continues into the existing phone/promo/payment flow. *(This branch is a safety net — landing CTAs use `href="#clubs"` and shouldn't reach it in the golden path.)*

`PaymentModal` state holds `clubId` and passes it into `createCardPayment({ clubId, ... })` / `createKaspiPayment({ clubId, ... })` instead of the current hard-coded constant.

## UI Spec — "Выбери свой клуб" section

- Section heading (Bebas/Oswald 700, big): `ВЫБЕРИ СВОЙ КЛУБ`
- Subtitle (Suisse/Inter 500, muted): `6 клубов в Алматы и Астане`
- Grid: 2-col on mobile, 3-col ≥ `sm` breakpoint
- Card:
  ```
  ┌────────────────────┐
  │ [фото 4:5, cover]   │
  │                    │
  │  VILLA             │  ← hj-title, ~28-36px
  │  АЛМАТЫ            │  ← 11-13px muted uppercase
  │              [6 тр]│  ← small chip, bottom-right of card
  └────────────────────┘
  ```
- Wrap entire card in `<Link to={`/clubs/${id}`}>`
- Order: Алматы clubs first (VILLA, COLIBRI, 4YOU, PROMENADE), then Астана (NURLY ORDA, EUROPE CITY)
- Section has `id="clubs"` so `href="#clubs"` from HERO CTA scrolls here

## UI Spec — Club page

- Layout container: same `max-w-[520px]/[640px]/[720px]` as landing
- Back nav: sticky top bar, `← Basecamp` — `Link to="/"`
- Hero: same rounded-[28px] aspect-[4/5] frame as landing hero, club photo `object-cover`, gradient overlay, club label + city on it
- Trainings list: numbered rows grouped under category headings (СИЛОВЫЕ / HIIT / MIND & BODY), only categories with items are rendered
- CTA: same pill style as landing hero (light-blue #8ABAD5, `Bebas Neue Bold` 40-48px), on click calls `usePaymentModal().open({ clubId: club.backendId })`
- Footer: reuse landing footer component

## Open dependencies

- **Backend club IDs.** `src/lib/payment.ts` currently exports only `CLUB_ID_4YOU`. The payment API needs to accept an id per club. Missing IDs for: villa, colibri, promenade, nurly, europe. Blocker for real payments on those clubs — needs to be gathered from backend team.
- **Club photos.** Placeholder gradients / existing `/photos/*` reused; designer to supply per-club hero photos when ready.
- **Addresses.** Deferred to v2.

## Success criteria

- Landing's second section reads as one clear message: "6 trainings, one system, mixed strength + HIIT" — with no club-picking friction.
- All 6 clubs have their own reachable page at `/clubs/:id` with the correct training list.
- `Записаться` on any club page opens the payment modal with that club's `clubId` — payment flow completes end-to-end.
- Landing CTAs (hero + bottom) scroll to the club grid rather than opening the modal without club context.
- No regressions to existing sections: hero, differentiator carousel, reassurance block, athlete carousel, FAQ, footer.

## Non-goals

- No changes to the payment provider integration itself.
- No changes to the `PaymentModal` UI/copy beyond adding club context.
- No new club data beyond what was provided.
- No addresses, maps, schedules, trainer bios on club pages in v1.
