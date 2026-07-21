# Hero's Journey Basecamp — лендинг пробного абонемента

Лендинг оффера **«Basecamp: 6 тренировок с тренером за 2 недели, 19 990 тг»** для 6 клубов Hero's Journey в Алматы и Астане. Светлый дизайн на фирменной палитре HJ: Bebas-заголовки, голубые акценты, карусели и модалки-сторис.

Продакшен: `herosjourney.kz/basecamp` (Тильда-страница с iframe на GitHub Pages).

---

## Стек

| Технология | Назначение |
|---|---|
| **React 19** + **TypeScript** | UI |
| **Vite 8** | сборка и dev-сервер |
| **Tailwind CSS 3** | стили (утилитарные классы) |
| **React Router 7** | роутинг: `/`, `/clubs/:id`, 404 |
| **GSAP** + ScrollTrigger, **Lenis** | анимации (частично) |

## Структура

- `src/pages/home/DesignHome.tsx` — вся главная: hero, блок «Какие тренировки входят», карусель «Чем отличается», истории атлетов, карусель клубов, модалки (тренировки/FAQ/контакты).
- `src/pages/clubs/ClubPage.tsx` — страница клуба: расписание тренировок, кнопка «Записаться», шаги после оплаты.
- `src/data/clubs.ts` — единственный источник данных о клубах (адреса, backend-ID, тренировки) + `UPCOMING_CLUBS` (Дубай, Нью-Йорк).
- `src/components/feature/PaymentModal.tsx` + `src/lib/payment.ts` — оплата Kaspi/Freedom Pay через `admin.herosjourney.kz/pay/api`, промокоды.
- `src/lib/gtm.ts`, `src/lib/pixel.ts`, `src/lib/utm.ts` — аналитика (GTM `GTM-KZDVZM9V`, Meta Pixel через GTM, Яндекс.Метрика в `index.html`).
- `src/components/feature/SchemaOrg.tsx` — JSON-LD: Organization, 6 HealthClub, Service, Offer, FAQPage.
- `public/llms.txt` — описание продукта для AI-краулеров.

## Команды

```bash
npm install
npm run dev          # dev-сервер (порт 3000 или $PORT)
npm run build        # сборка в out/ (BASE_PATH задаёт базовый путь)
npm run type-check
npm run lint
```

## Деплой

Пуш в `main` → GitHub Actions (`.github/workflows/deploy.yml`) собирает с `BASE_PATH=/basecamp/` и деплоит на GitHub Pages: `https://hero-s-journey.github.io/basecamp/`. На herosjourney.kz страница `/basecamp` подключает сайт через блок Тильды T123 (iframe).

## Цена продукта

19 990 тг. Захардкожена в: `PaymentModal.tsx` (`basePrice`), `gtm.ts`/`pixel.ts` (`VALUE`), тексты в `DesignHome.tsx`, `ClubPage.tsx`, `index.html`, `SchemaOrg.tsx`, `public/llms.txt`. При изменении цены обновить все места (грепать по `19990` и `19 990`).
