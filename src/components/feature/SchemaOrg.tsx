import { useEffect } from "react";
import { CLUBS, type ClubId } from "@/data/clubs";

interface SchemaOrgProps {
  type?:
    | "Organization"
    | "WebSite"
    | "HealthClub"
    | "FAQPage"
    | "Service"
    | "Offer"
    | "All";
}

/** Known studio coordinates (only 4YOU is verified so far). */
const CLUB_GEO: Partial<Record<ClubId, { latitude: string; longitude: string }>> = {
  "4you": { latitude: "43.220000", longitude: "76.851000" },
};

/** clubs.ts uses uppercase city labels; schema.org wants normal case. */
const CITY_NAMES: Record<string, string> = {
  АЛМАТЫ: "Алматы",
  АСТАНА: "Астана",
};

/**
 * Injects schema.org JSON-LD blocks for SEO.
 * `type="All"` renders the full @graph (default).
 * Individual types can be rendered separately if needed.
 */
export default function SchemaOrg({ type = "All" }: SchemaOrgProps) {
  useEffect(() => {
    const siteUrl =
      import.meta.env.VITE_SITE_URL || "https://herosjourney.kz/basecamp";
    const orgUrl = "https://herosjourney.kz";

    const organization = {
      "@type": "Organization",
      "@id": `${orgUrl}/#organization`,
      name: "Hero's Journey",
      alternateName: ["HJ", "Hero's Journey Almaty", "Hero's Journey Astana"],
      url: orgUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo/hj_logo.png`,
        width: 512,
        height: 512,
      },
      image: `${siteUrl}/logo/hj_logo.png`,
      description:
        "Hero's Journey — сеть фитнес-студий нового поколения в Алматы и Астане, построенная вокруг технологий, данных и реального прогресса атлета. Планшеты на каждом тренажёре, пульсометр, тренер на каждой тренировке, программа на год.",
      foundingDate: "2020",
      areaServed: [
        { "@type": "Country", name: "Kazakhstan" },
        { "@type": "City", name: "Almaty" },
        { "@type": "City", name: "Astana" },
      ],
      sameAs: [
        "https://www.instagram.com/herosjourneykz",
        "https://herosjourney.ae",
      ],
    };

    const website = {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Hero's Journey — Basecamp",
      publisher: { "@id": `${orgUrl}/#organization` },
      inLanguage: "ru-KZ",
    };

    const sharedAmenities = [
      {
        "@type": "LocationFeatureSpecification",
        name: "Планшет с рекомендациями весов на каждом тренажёре",
        value: true,
      },
      {
        "@type": "LocationFeatureSpecification",
        name: "Пульсометр и трекинг пульсовых зон",
        value: true,
      },
      {
        "@type": "LocationFeatureSpecification",
        name: "Тренер на каждой групповой тренировке",
        value: true,
      },
      {
        "@type": "LocationFeatureSpecification",
        name: "Программа тренировок на 12 месяцев",
        value: true,
      },
    ];

    // One HealthClub node per studio, generated from the same clubs.ts data
    // the site renders from — addresses stay in one place.
    const healthClubs = CLUBS.map((club) => {
      const city = CITY_NAMES[club.city] ?? club.city;
      const geo = CLUB_GEO[club.id];
      return {
        "@type": "HealthClub",
        "@id": `${orgUrl}/#studio-${club.id}`,
        name: `Hero's Journey ${club.label}`,
        url: `${siteUrl}/clubs/${club.id}`,
        image: `${siteUrl}/og-image.jpg`,
        logo: `${siteUrl}/logo/hj_logo.png`,
        description: `Фитнес-студия Hero's Journey ${club.label} в городе ${city}. Basecamp: 6 тренировок с тренером за 19 990 тг.`,
        parentOrganization: { "@id": `${orgUrl}/#organization` },
        address: {
          "@type": "PostalAddress",
          streetAddress: club.address,
          addressLocality: city,
          addressRegion: city,
          addressCountry: "KZ",
        },
        ...(geo ? { geo: { "@type": "GeoCoordinates", ...geo } } : {}),
        telephone: "+7 717 264 08 41",
        currenciesAccepted: "KZT",
        paymentAccepted: "Credit Card, Debit Card",
        areaServed: { "@type": "City", name: city },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "07:00",
            closes: "23:00",
          },
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Saturday", "Sunday"],
            opens: "09:00",
            closes: "20:00",
          },
        ],
        amenityFeature: sharedAmenities,
      };
    });

    const service = {
      "@type": "Service",
      "@id": `${siteUrl}/#service-basecamp`,
      name: "Hero's Journey Basecamp",
      provider: { "@id": `${orgUrl}/#organization` },
      areaServed: "Казахстан",
      description:
        "Пробный абонемент Basecamp: 6 групповых тренировок с тренером в выбранном клубе Hero's Journey. Тренировки длятся 50 минут. Доступно в 6 клубах Hero's Journey в Алматы и Астане.",
      serviceType: "Fitness training",
    };

    const offer = {
      "@type": "Offer",
      "@id": `${siteUrl}/#offer-basecamp`,
      name: "Basecamp — 6 тренировок",
      description:
        "Пробный абонемент Hero's Journey: 6 тренировок с тренером за 2 недели в выбранном клубе в Алматы или Астане.",
      price: "19990",
      priceCurrency: "KZT",
      availability: "https://schema.org/InStock",
      seller: { "@id": `${orgUrl}/#organization` },
      areaServed: "Казахстан",
      url: siteUrl,
    };

    const faqPage = {
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "Что будет после пробной программы?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "После 2-недельной пробной программы можно оформить полугодовую или годовую клубную карту в удобном клубе сети Hero's Journey. Пробная программа доступна один раз.",
          },
        },
        {
          "@type": "Question",
          name: "Можно ли проходить тренировки в разных клубах?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Нет. При регистрации выбирается один клуб — все 6 тренировок пробной программы проходят там. После Basecamp, при покупке полноценного абонемента, доступен любой клуб сети.",
          },
        },
        {
          "@type": "Question",
          name: "Я не в форме и боюсь не справиться",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Тренировки подбираются под уровень атлета: тренер регулирует нагрузку и вес на каждом тренажёре, а объём и сложность упражнений подстраиваются под текущую форму.",
          },
        },
        {
          "@type": "Question",
          name: "Что будет, если я отменю или пропущу тренировку?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Отмена за 8 часов до начала и раньше переносит тренировку на другое время в рамках программы. Отмена позже чем за 8 часов или неявка без отмены сжигает тренировку.",
          },
        },
        {
          "@type": "Question",
          name: "Можно ли заниматься самостоятельно, без тренера?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Нет. Все занятия проходят по расписанию и с тренером — он следит за техникой, регулирует нагрузку и помогает на каждом этапе. Запись на тренировки — через приложение.",
          },
        },
        {
          "@type": "Question",
          name: "Смогу ли я подобрать время под своё расписание?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Да. Тренировки проходят каждый час: первая начинается в 6:50–7:00 утра, последняя стартует в 21:00–21:30. Время выбирается при записи в приложении.",
          },
        },
      ],
    };

    const fullGraph = {
      "@context": "https://schema.org",
      "@graph": [organization, website, ...healthClubs, service, offer, faqPage],
    };

    const schemas: Record<string, object> = {
      All: fullGraph,
      Organization: { "@context": "https://schema.org", ...organization },
      WebSite: { "@context": "https://schema.org", ...website },
      HealthClub: { "@context": "https://schema.org", "@graph": healthClubs },
      Service: { "@context": "https://schema.org", ...service },
      Offer: { "@context": "https://schema.org", ...offer },
      FAQPage: { "@context": "https://schema.org", ...faqPage },
    };

    const schemaData = schemas[type];
    if (!schemaData) return;

    const scriptId = `schema-${type}`;
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(schemaData);

    return () => {
      const existing = document.getElementById(scriptId);
      if (existing) existing.remove();
    };
  }, [type]);

  return null;
}
