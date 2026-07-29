export const PERSONALITY_QUESTIONS = [
  "You regularly make new friends.",
  "Complex and novel ideas excite you more than simple and straightforward ones.",
  "You usually feel more persuaded by what resonates emotionally with you than by factual arguments.",
  "You enjoy breaking difficult problems into smaller, logical steps.",
  "You feel energized when presenting ideas to a group.",
  "You notice visual details, patterns, and aesthetics that others may miss.",
  "You like building, repairing, or experimenting with how things work.",
  "You naturally organize people and keep a shared plan moving.",
  "You are curious about why people behave the way they do.",
  "You prefer evidence and data before making an important decision.",
  "You enjoy writing, storytelling, or shaping a message for an audience.",
  "You would rather test an idea in the real world than only discuss it.",
  "You stay calm when someone needs practical help or reassurance.",
  "You enjoy negotiating, persuading, or championing a point of view.",
  "You can imagine several different solutions to the same challenge.",
  "You are motivated by work that creates a positive impact for others.",
] as const;

export const LIKERT_OPTIONS = [
  { value: 5, label: "Agree", size: "size-9" },
  { value: 4, label: "Somewhat agree", size: "size-8" },
  { value: 3, label: "Neutral", size: "size-7" },
  { value: 2, label: "Somewhat disagree", size: "size-6" },
  { value: 1, label: "Disagree", size: "size-5" },
] as const;

export const MALAYSIA_LOCATIONS = [
  "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang", "Perak", "Perlis", "Penang",
  "Sabah", "Sarawak", "Selangor", "Terengganu", "Kuala Lumpur", "Labuan", "Putrajaya", "Open to anywhere",
] as const;

export const HOUSEHOLD_INCOME_OPTIONS = [
  "Below RM 3,000",
  "RM 3,000 - RM 5,999",
  "RM 6,000 - RM 9,999",
  "RM 10,000 - RM 14,999",
  "RM 15,000 - RM 19,999",
  "RM 20,000 and above",
] as const;

export const PARENT_PREFERENCE_OPTIONS = {
  campusVibe: [
    "Public (IPTA) - Warm & Local",
    "Private (IPTS) - Modern & Vibrant",
    "International Branch - Global Exposure",
    "No preference - open to anything!",
  ],
  campusConcern: [
    "Academic rigor & faculty quality",
    "Campus safety & physical well-being",
    "Mental health & student support",
    "Networking & industry connections",
  ],
  ultimateWin: [
    "Guaranteed high-paying employment",
    "Strong professional network",
    "Character & leadership development",
    "Path to international migration/work",
  ],
  independence: [
    "Highly independent self-starter",
    "Needs some structural guidance",
    "Requires close academic monitoring",
    "Needs strong emotional/social support",
  ],
} as const;

export const SPM_SUBJECTS = [
  "Additional Mathematics", "Al-Adab wa al-Balaghah", "Al-Lughah Al-Arabiah Al-Mu'asirah", "Asas Kelestarian",
  "Asas Sains Komputer", "Bahasa Arab", "Bahasa Cina", "Bahasa Iban", "Bahasa Inggeris", "Bahasa Jepun",
  "Bahasa Kadazandusun", "Bahasa Korea", "Bahasa Melayu", "Bahasa Perancis", "Bahasa Punjabi", "Bahasa Semai",
  "Bahasa Tamil", "Bible Knowledge", "Biology", "Chemistry", "Ekonomi", "English Literature", "Fizik",
  "Geografi", "Grafik Komunikasi Teknikal", "Hifz Al-Quran", "Kesusasteraan Cina", "Kesusasteraan Melayu",
  "Kesusasteraan Tamil", "Kimia", "Lukisan Kejuruteraan", "Maharat Al-Quran", "Matematik", "Matematik Tambahan",
  "Pendidikan Al-Quran dan Al-Sunnah", "Pendidikan Islam", "Pendidikan Moral", "Pendidikan Seni Visual",
  "Pendidikan Syariah Islamiah", "Pengajian Kejuruteraan Awam", "Pengajian Kejuruteraan Elektrik dan Elektronik",
  "Pengajian Kejuruteraan Mekanikal", "Pengajian Keusahawanan", "Perdagangan", "Perniagaan", "Pertanian",
  "Physics", "Prinsip Perakaunan", "Reka Bentuk dan Teknologi", "Reka Cipta", "Sains", "Sains Komputer",
  "Sains Pertanian", "Sains Sukan", "Sejarah", "Tasawwur Islam", "Teknologi Kejuruteraan", "Turath Al-Quran dan Al-Sunnah",
  "Turath Bahasa Arab", "Usul Al-Din",
] as const;

export const VIBE_QUESTIONS = [
  { id: "fridayNight", title: "Friday Night Vibe", prompt: "Where do you recharge after a full week?", options: [{ id: "cozy", label: "Cozy Night In", tone: "mint" }, { id: "networking", label: "Campus Party / Networking", tone: "sun" }] },
  { id: "campusSetting", title: "Your Ideal Backdrop", prompt: "Which campus setting feels more like home?", options: [{ id: "nature", label: "Green & Peaceful", tone: "mint" }, { id: "city", label: "City in Motion", tone: "blue" }] },
  { id: "teamStyle", title: "Project Energy", prompt: "How do you want big assignments to feel?", options: [{ id: "solo", label: "Independent Focus", tone: "violet" }, { id: "collaborative", label: "Team Momentum", tone: "sun" }] },
  { id: "scheduleStyle", title: "Daily Rhythm", prompt: "Pick the routine that helps you thrive.", options: [{ id: "spontaneous", label: "Room to Explore", tone: "blue" }, { id: "structured", label: "Clear Structure", tone: "mint" }] },
  { id: "learningStyle", title: "Learning Mode", prompt: "Which class would you choose first?", options: [{ id: "creative", label: "Studio & Making", tone: "sun" }, { id: "research", label: "Lab & Research", tone: "violet" }] },
  { id: "futureHorizon", title: "Future Horizon", prompt: "Where should university open doors?", options: [{ id: "local", label: "Build Impact at Home", tone: "mint" }, { id: "global", label: "Explore the World", tone: "blue" }] },
] as const;

export type VibeQuestionId = (typeof VIBE_QUESTIONS)[number]["id"];

const careerSignals = [
  "People & Community", "Technology & Innovation", "Psychology & Communication", "Software & Data",
  "Business & Leadership", "Design & Creative Media", "Engineering & Technology", "Business & Leadership",
  "Psychology & Communication", "Science & Research", "Design & Creative Media", "Engineering & Technology",
  "Health & Human Services", "Business & Leadership", "Design & Creative Media", "Health & Human Services",
] as const;

export function calculateCareerSuggestions(answers: number[]): string[] {
  const scores = new Map<string, number>();
  answers.forEach((answer, index) => {
    const career = careerSignals[index];
    if (career) scores.set(career, (scores.get(career) ?? 0) + answer);
  });
  return [...scores.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([career]) => career);
}
