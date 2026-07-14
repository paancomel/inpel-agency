import type { Tables } from "@repo/database";

export interface UniversityMatch {
  id: string;
  name: string;
  location: string;
  tuition: number;
  livingCost: number;
  matchScore: number;
  acceptanceRate: string;
  program: string;
  career: string;
  why: string[];
  scholarship: {
    title: string;
    value: string;
    guideId: string;
  };
}

export interface RoiInputs {
  annualTuition: number;
  annualLivingCost: number;
  years: number;
  startingSalary: number;
}

export function calculateRoi(inputs: RoiInputs) {
  const totalCost = (inputs.annualTuition + inputs.annualLivingCost) * inputs.years;
  const annualRecovery = Math.max(inputs.startingSalary * 0.35, 1);
  return {
    totalCost,
    paybackYears: Math.round((totalCost / annualRecovery) * 10) / 10,
    fiveYearEarnings: Math.round(inputs.startingSalary * 5 * 1.092),
  };
}

export const fallbackMatches: UniversityMatch[] = [
  {
    id: "utm",
    name: "Universiti Teknologi Malaysia",
    location: "Johor Bahru, Johor",
    tuition: 28_000,
    livingCost: 14_000,
    matchScore: 94,
    acceptanceRate: "Selective",
    program: "Bachelor of Computer Science (Software Engineering)",
    career: "Software & product engineering",
    why: ["Strong fit for analytical and practical strengths", "Established engineering employer network", "Cost sits within your family range"],
    scholarship: { title: "UTM Merit Excellence Award", value: "Up to RM 12,000", guideId: "merit-excellence" },
  },
  {
    id: "um",
    name: "Universiti Malaya",
    location: "Kuala Lumpur",
    tuition: 34_000,
    livingCost: 20_000,
    matchScore: 91,
    acceptanceRate: "Highly selective",
    program: "Bachelor of Computer Science (Information Systems)",
    career: "Technology consulting & analytics",
    why: ["Excellent research and industry exposure", "Broad elective pathway for varied interests", "High projected early-career mobility"],
    scholarship: { title: "Future Leaders Bursary", value: "Up to RM 15,000", guideId: "future-leaders" },
  },
  {
    id: "sunway",
    name: "Sunway University",
    location: "Bandar Sunway, Selangor",
    tuition: 42_000,
    livingCost: 18_000,
    matchScore: 87,
    acceptanceRate: "Moderate",
    program: "BSc (Hons) Computer Science",
    career: "Data products & digital platforms",
    why: ["Project-based learning matches practical profile", "Accessible from your preferred region", "Strong internship and dual-award options"],
    scholarship: { title: "Sunway Entrance Scholarship", value: "Up to 50% tuition", guideId: "entrance-scholarship" },
  },
];

export function mapUniversityRows(rows: Tables<"universities">[]): UniversityMatch[] {
  return rows.map((row, index) => ({
    id: row.id,
    name: row.name,
    location: row.location ?? "Malaysia",
    tuition: row.tuition_fees ?? 32_000,
    livingCost: row.living_costs ?? 16_000,
    matchScore: Math.max(72, 92 - index * 4),
    acceptanceRate: row.acceptance_rate ?? "Contact admissions",
    program: "Recommended programme pathway",
    career: "Graduate career pathway",
    why: ["Aligned with the submitted student profile", "Fits the selected family priorities", "Included in the shared university catalogue"],
    scholarship: { title: "University merit scholarship", value: "Check current intake", guideId: "merit-excellence" },
  }));
}
