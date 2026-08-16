import type { Ratings, University } from "./types";

const names = [
  ["taylors", "Taylor's University", "Subang Jaya", "TU"], ["sunway", "Sunway University", "Bandar Sunway", "SU"],
  ["apu", "Asia Pacific University", "Bukit Jalil", "APU"], ["help", "HELP University", "Subang Bestari", "HELP"],
  ["ucsi", "UCSI University", "Cheras", "UCSI"], ["segi", "SEGi University", "Kota Damansara", "SEGi"],
  ["mmu", "Multimedia University", "Cyberjaya", "MMU"], ["uniten", "Universiti Tenaga Nasional", "Kajang", "UNITEN"],
  ["imu", "IMU University", "Bukit Jalil", "IMU"], ["inti", "INTI International College", "Subang Jaya", "INTI"],
  ["monash", "Monash University Malaysia", "Bandar Sunway", "Monash"], ["nottingham", "University of Nottingham Malaysia", "Semenyih", "UNM"],
  ["mahsa", "MAHSA University", "Jenjarom", "MAHSA"], ["msu", "Management & Science University", "Shah Alam", "MSU"],
  ["iukl", "Infrastructure University Kuala Lumpur", "Kajang", "IUKL"], ["unisel", "Universiti Selangor", "Shah Alam", "UNISEL"],
  ["bac", "Brickfields Asia College", "Kuala Lumpur", "BAC"], ["berjaya", "BERJAYA University College", "Bukit Bintang", "BUC"],
  ["first-city", "First City University College", "Bandar Utama", "FCUC"], ["limkokwing", "Limkokwing University", "Cyberjaya", "LUCT"],
] as const;

const score = (base: number): Ratings => ({ facilities: base, teaching: Math.max(1, base - .3), classes: Math.max(1, base - .5), safety: Math.min(10, base + .4), value: Math.max(1, base - .7), transport: Math.min(10, base + .2), campusLife: Math.min(10, base + .5), career: Math.min(10, base + .1) });

export const UNIVERSITIES: University[] = names.map(([id, name, location, shortName], index) => {
  return { id, name, location, shortName, type: index % 4 === 1 ? "University college" : "Private university", address: `${location}, Kuala Lumpur & Selangor`, website: "", mapUrl: `https://maps.google.com/?q=${encodeURIComponent(name)}`, rating: 0, ratings: score(0), reviewCount: 0, latestReviewAt: "", courses: [], strengths: [], weaknesses: [] };
});
