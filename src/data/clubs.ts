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
  /** Marketing description of the branch shown on the club page. */
  description?: string;
  /** Opening hours split into rows for the club page. */
  schedule?: { weekday: string; weekend: string; sales: string };
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
    photo: asset("/photos/club_villa.jpg"),
    address: "Аль-Фараби 140а, Villa Restaurant & Boutiques",
    description:
      "HJ Villa — современное пространство Hero's Journey в МФК VILLA на Аль-Фараби, оснащённое премиальными тренажерами TechnoGym и Matrix. 3 зала групповых программ — Bootcamp, Full Body и Reshape, где представлено более 30 видов тренировок: от интервальных до силовых на всё тело.",
    schedule: { weekday: "06:30–23:00", weekend: "08:00–20:00", sales: "10:00–20:00" },
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
    photo: asset("/photos/club_4you.jpg"),
    address: "Ескараева 3",
    description:
      "HJ 4YOU — флагманское пространство Hero's Journey в Алматы, оснащённое тренажерами Matrix топовой линейки. 5 залов групповых программ — Bootcamp, Upper Body, Legs, Metcon и Reshape, где представлено более 40 видов тренировок под каждую фитнес-цель: от жиросжигания до построения атлетичного тела. Собственный центр оценки тела, где атлеты проходят физическую диагностику тела на силу, мощность, выносливость и состав тела.",
    schedule: { weekday: "06:00–23:00", weekend: "08:00–20:00", sales: "10:00–20:00" },
    trainings: {
      strength: ["2× Upper Body", "1× Legs / Glute", "1× Reshape", "Assessment"],
      hiit: ["1× Bootcamp", "1× Metcon"],
      mindBody: [],
    },
  },
  {
    id: "colibri",
    backendId: CLUB_BACKEND_IDS.colibri,
    label: "COLIBRI",
    city: "АЛМАТЫ",
    photo: asset("/photos/club_colibri.jpg"),
    address: "Уалиханова 170/1",
    description:
      "HJ Colibri — современное пространство Hero's Journey, оснащённое премиальными тренажерами TechnoGym. 4 зала групповых программ — Bootcamp, Metcon, Upper Body и Legs, где представлено более 25 видов тренировок: силовые, HIIT, кардио-силовые со свободными весами и другие.",
    schedule: { weekday: "06:30–23:00", weekend: "08:00–20:00", sales: "10:00–20:00" },
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
    photo: asset("/photos/club_promenade.jpg"),
    address: "Абая 44а, ТРЦ Promenade",
    description:
      "HJ Promenade — современное пространство Hero's Journey в самом центре Алматы, оснащённое передовыми тренажерами от ведущих мировых производителей. 4 зала групповых программ — Bootcamp, Metcon, Full Body и Legs, где представлено более 25 видов тренировок: силовые, HIIT, кардио-силовые со свободными весами и другие.",
    schedule: { weekday: "06:30–23:00", weekend: "08:00–20:00", sales: "10:00–20:00" },
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
    photo: asset("/photos/club_nurlyorda.jpg"),
    address: "Кабанбай батыра 11/5",
    description:
      "HJ Nurly Orda — современное пространство Hero's Journey в Астане, оснащённое премиальными тренажерами TechnoGym. 3 зала групповых программ — Bootcamp, Full Body и Legs, где представлено более 20 видов тренировок: силовые, HIIT и кардио-форматы под каждую фитнес-цель.",
    schedule: { weekday: "06:30–23:00", weekend: "08:00–20:00", sales: "10:00–20:00" },
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
    photo: asset("/photos/club_europecity.jpg"),
    address: "Улица Акмешит, 1/2",
    description:
      "HJ Europe City — самое большое пространство Hero's Journey в Астане, оснащённое передовыми тренажерами от ведущих мировых производителей. 5 залов групповых программ — Bootcamp, Metcon, Full Body, Legs и Mind&Body, где представлено более 30 видов тренировок: от интервальных до йоги и восстановительных практик.",
    schedule: { weekday: "06:30–23:00", weekend: "08:00–20:00", sales: "10:00–20:00" },
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
    photo: asset("/photos/club_nyc_nomad.jpg"),
  },
  dubai: {
    country: "ОАЭ",
    label: "ДУБАЙ",
    addressLines: ["Warehouse No. 9, 7B Street", "Al Quoz Industrial Area 1"],
    badge: "Скоро открытие",
    note: "Обладателям клубных карт Hero's Journey студия будет доступна для посещения.",
    photo: asset("/photos/club_alserkal.jpg"),
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
  {
    title: string;
    photo: string;
    body: string;
    photoBottom?: string;
    bonus?: boolean;
    /** Two-option "choose one" slot: renders a colored card with a kicker,
     * description and two labelled half-images (e.g. Upper Body / Reshape). */
    combo?: { label: string; photo: string }[];
    comboBg?: string;
  }
> = {
  "Upper Body": {
    title: "UPPER BODY",
    photo: asset("/photos/upper.jpg"),
    body: "Тренировка на верхнюю часть тела: грудь, спина, плечи и руки. Тренер ставит технику и подбирает нагрузку под тебя.",
  },
  "Upper Body / Reshape": {
    title: "UPPER BODY / RESHAPE",
    photo: asset("/photos/upperbody_half.jpg"),
    body: "Upper Body или Reshape в одном слоте — силовая на верх тела либо работа на реформерах.",
    comboBg: "#8097af",
    combo: [
      { label: "UPPER BODY", photo: asset("/photos/upperbody_half.jpg") },
      { label: "RESHAPE", photo: asset("/photos/reshape_half.jpg") },
    ],
  },
  "Upper": {
    title: "UPPER",
    photo: asset("/photos/upper.jpg"),
    body: "Тренировка на верхнюю часть тела: грудь, спина, плечи, руки.",
  },
  "Legs": {
    title: "LEGS",
    photo: asset("/photos/legs.jpg"),
    body: "Тренировка на ноги. Приседы, выпады, тяги — движения, которые формируют силовую базу.",
  },
  "Leg Day": {
    title: "LEG DAY",
    photo: asset("/photos/legs.jpg"),
    body: "День ног — приседы, выпады, тяги. Работа на силу и объём.",
  },
  "Legs / Glute": {
    title: "LEGS / GLUTE",
    photo: asset("/photos/legs.jpg"),
    body: "Ноги и ягодицы. Развитие силы, объёма и формы.",
  },
  "Legs / Glutes": {
    title: "LEGS / GLUTES",
    photo: asset("/photos/legs.jpg"),
    body: "Ноги и ягодицы. Развитие силы, объёма и формы.",
  },
  "Bootcamp": {
    title: "BOOTCAMP",
    photo: asset("/photos/bootcamo.jpg"),
    body: "Интервальная кардио тренировка на беговых дорожках и упражнения на фит-бенчах с гантелями и своим весом.",
  },
  "Metcon": {
    title: "METCON",
    photo: asset("/photos/metcon.jpg"),
    body: "Metabolic conditioning — интервалы на выносливость и жиросжигание. Кардио и сила в одном формате.",
  },
  "Reshape": {
    title: "RESHAPE",
    photo: asset("/photos/reshape.jpg"),
    body: "Работа на реформерах: упражнения для проработки глубоких мышц и укрепления кора.",
  },
  "Mind & Body": {
    title: "MIND & BODY",
    photo: asset("/photos/mindandbody.jpg"),
    body: "Восстановление, растяжка, подвижность. Тело переваривает нагрузку недели.",
  },
  "Full Body": {
    title: "FULL BODY",
    photo: asset("/photos/upper.jpg"),
    body: "Тренировка на всё тело за один сет. Универсальный формат для баланса силы и кардио.",
  },
  "Assessment": {
    title: "ASSESSMENT",
    photo: asset("/photos/assessment.jpg"),
    body: "30-минутное тестирование тела, где замеряются 6 показателей: состав тела, жимовую силу, тяговую силу, силу ног, выносливость и мощность.",
    bonus: true,
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
  "Assessment",
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
      photo: asset("/photos/upper.jpg"),
      body: "Тренировка входит в абонемент Basecamp.",
    };
    const n = entry.count;
    const mod10 = n % 10;
    const mod100 = n % 100;
    const noun =
      mod10 === 1 && mod100 !== 11
        ? "тренировка"
        : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
          ? "тренировки"
          : "тренировок";
    return {
      key: `${club.id}-${idx}-${entry.type}`,
      count: entry.count,
      bonus: !!info.bonus,
      countLabel: info.bonus ? "Бонус" : `${n} ${noun}`,
      title: info.title,
      photo: info.photo,
      photoBottom: info.photoBottom,
      combo: info.combo,
      comboBg: info.comboBg,
      body: info.body,
    };
  });
}

export function getClub(id: string): Club | undefined {
  return CLUBS.find((c) => c.id === id);
}
