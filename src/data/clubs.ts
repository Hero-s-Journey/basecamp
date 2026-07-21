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
  address?: string;
  phone?: string;
  hours?: string;
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
    photo: asset("/photos/club_villa.png"),
    address: "Аль-Фараби 140, Villa Restaurant & Boutiques",
    trainings: {
      strength: ["2× Upper Body / Reshape", "2× Legs"],
      hiit: ["2× Bootcamp"],
      mindBody: [],
    },
  },
  {
    id: "4you",
    backendId: CLUB_BACKEND_IDS["4you"],
    label: "4YOU",
    city: "АЛМАТЫ",
    photo: asset("/photos/club_4you.png"),
    address: "Ескараева 3",
    trainings: {
      strength: ["2× Upper Body", "1× Legs / Glute", "1× Reshape"],
      hiit: ["1× Bootcamp", "1× Metcon"],
      mindBody: [],
    },
  },
  {
    id: "colibri",
    backendId: CLUB_BACKEND_IDS.colibri,
    label: "COLIBRI",
    city: "АЛМАТЫ",
    photo: asset("/photos/club_colibri.png"),
    address: "Уалиханова 170/1",
    trainings: {
      strength: ["2× Upper", "1× Legs / Glutes"],
      hiit: ["2× Bootcamp", "1× Metcon"],
      mindBody: [],
    },
  },
  {
    id: "promenade",
    backendId: CLUB_BACKEND_IDS.promenade,
    label: "PROMENADE",
    city: "АЛМАТЫ",
    photo: asset("/photos/club_promenade.png"),
    address: "Абая 44а, ТРЦ Promenade",
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
    photo: asset("/photos/club_nurlyorda.png"),
    address: "Кабанбай батыра 11/5",
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
    photo: asset("/photos/club_europecity.png"),
    address: "Акмешит 1",
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

/** Upcoming (not yet opened) locations shown as placeholder cards on the
 * landing. Photos are optional — until added the card falls back to the
 * brand-blue background. */
export interface UpcomingClub {
  country: string;
  label: string;
  addressLines: string[];
  badge: string;
  note: string;
  photo?: string;
}

export const UPCOMING_CLUBS: Partial<Record<"dubai" | "ny", UpcomingClub>> = {
  ny: {
    country: "США",
    label: "НЬЮ-ЙОРК",
    addressLines: ["225 5th Avenue"],
    badge: "Открытие в 2027",
    note: "Обладателям клубных карт Hero's Journey студия будет доступна для посещения.",
    photo: asset("/photos/club_ny.png"),
  },
  dubai: {
    country: "ОАЭ",
    label: "ДУБАЙ",
    addressLines: ["Warehouse No. 9, 7B Street", "Al Quoz Industrial Area 1"],
    badge: "Скоро открытие",
    note: "Обладателям клубных карт Hero's Journey студия будет доступна для посещения.",
    photo: asset("/photos/club_dubai.png"),
  },
};

/** City tabs shown on the landing "Выбери свой клуб" section. Cities without
 * clubs render a "скоро откроется" placeholder. */
export type CityId = "almaty" | "astana" | "dubai" | "ny";
export const CITIES: { id: CityId; label: string; clubCity?: Club["city"] }[] = [
  { id: "almaty", label: "АЛМАТЫ",   clubCity: "АЛМАТЫ" },
  { id: "astana", label: "АСТАНА",   clubCity: "АСТАНА" },
  { id: "dubai",  label: "ДУБАЙ" },
  { id: "ny",     label: "НЬЮ-ЙОРК" },
];

/** Descriptions and imagery for each training type. Keyed by the canonical
 * type string used inside `Club.trainings.*`. Photos live in /public/photos. */
export const TRAINING_INFO: Record<
  string,
  { title: string; photo: string; body: string }
> = {
  "Upper Body": {
    title: "UPPER BODY",
    photo: asset("/photos/upper.png"),
    body: "Тренировка на верхнюю часть тела: грудь, спина, плечи и руки. Тренер ставит технику и подбирает нагрузку под тебя.",
  },
  "Upper Body / Reshape": {
    title: "UPPER BODY / RESHAPE",
    photo: asset("/photos/upper.png"),
    body: "Верхняя часть тела с элементами формообразующей работы. Комбинация силы и рельефа.",
  },
  "Upper": {
    title: "UPPER",
    photo: asset("/photos/upper.png"),
    body: "Тренировка на верхнюю часть тела: грудь, спина, плечи, руки.",
  },
  "Legs": {
    title: "LEGS",
    photo: asset("/photos/legs.png"),
    body: "Тренировка на ноги. Приседы, выпады, тяги — движения, которые формируют силовую базу.",
  },
  "Leg Day": {
    title: "LEG DAY",
    photo: asset("/photos/legs.png"),
    body: "День ног — приседы, выпады, тяги. Работа на силу и объём.",
  },
  "Legs / Glute": {
    title: "LEGS / GLUTE",
    photo: asset("/photos/legs.png"),
    body: "Ноги и ягодицы. Развитие силы, объёма и формы.",
  },
  "Legs / Glutes": {
    title: "LEGS / GLUTES",
    photo: asset("/photos/legs.png"),
    body: "Ноги и ягодицы. Развитие силы, объёма и формы.",
  },
  "Bootcamp": {
    title: "BOOTCAMP",
    photo: asset("/photos/bootcamo.png"),
    body: "Функциональная тренировка высокой интенсивности. Работа с собственным весом и лёгкими снарядами.",
  },
  "Metcon": {
    title: "METCON",
    photo: asset("/photos/metcon.png"),
    body: "Metabolic conditioning — интервалы на выносливость и жиросжигание. Кардио и сила в одном формате.",
  },
  "Reshape": {
    title: "RESHAPE",
    photo: asset("/photos/reshape.png"),
    body: "Работа на реформерах: упражнения для проработки глубоких мышц и укрепления кора.",
  },
  "Mind & Body": {
    title: "MIND & BODY",
    photo: asset("/photos/mindandbody.png"),
    body: "Восстановление, растяжка, подвижность. Тело переваривает нагрузку недели.",
  },
  "Full Body": {
    title: "FULL BODY",
    photo: asset("/photos/upper.png"),
    body: "Тренировка на всё тело за один сет. Универсальный формат для баланса силы и кардио.",
  },
};

/** Canonical display order of training types on the club page. Upper Body
 * variants first, then Legs, then Bootcamp, then optional Reshape / Metcon /
 * Mind & Body. Types not in this list fall to the end. */
const CANONICAL_TYPE_ORDER = [
  "Upper Body",
  "Upper Body / Reshape",
  "Upper",
  "Legs",
  "Legs / Glutes",
  "Legs / Glute",
  "Leg Day",
  "Full Body",
  "Bootcamp",
  "Reshape",
  "Reshape + Assessment",
  "Metcon",
  "Mind & Body",
];

/** Flatten a club's trainings into one card per unique type (no duplication
 * for count > 1) in canonical order. Each card carries its `count` so the UI
 * can render "1× тренировка" / "2× тренировки". */
export function expandClubTrainings(club: Club) {
  const categories: ClubCategory[] = ["strength", "hiit", "mindBody"];
  const entries: { type: string; count: number }[] = [];
  for (const cat of categories) {
    for (const raw of club.trainings[cat]) {
      const m = raw.match(/^(\d+)\s*[×x]\s*(.+)$/);
      const count = m ? parseInt(m[1], 10) : 1;
      const type = (m ? m[2] : raw).trim();
      entries.push({ type, count });
    }
  }

  entries.sort((a, b) => {
    const ai = CANONICAL_TYPE_ORDER.indexOf(a.type);
    const bi = CANONICAL_TYPE_ORDER.indexOf(b.type);
    const aRank = ai === -1 ? 999 : ai;
    const bRank = bi === -1 ? 999 : bi;
    return aRank - bRank;
  });

  return entries.map((entry, idx) => {
    const info = TRAINING_INFO[entry.type] ?? {
      title: entry.type.toUpperCase(),
      photo: asset("/photos/upper.png"),
      body: "Тренировка входит в абонемент Basecamp.",
    };
    const noun = entry.count === 1 ? "тренировка" : "тренировок";
    return {
      key: `${club.id}-${idx}-${entry.type}`,
      count: entry.count,
      countLabel: `${entry.count}× ${noun}`,
      title: info.title,
      photo: info.photo,
      body: info.body,
    };
  });
}

export function getClub(id: string): Club | undefined {
  return CLUBS.find((c) => c.id === id);
}
