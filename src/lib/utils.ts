import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AppStatus, College, GrowthOutlook, StudentProfile } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const statuses: AppStatus[] = ["Researching", "Interested", "Applying", "Submitted", "Decision Received"];
export const categories = ["STEM", "Business", "Healthcare", "Arts", "Education", "Law"] as const;

export function growthScore(outlook: GrowthOutlook) {
  return outlook === "High" ? 3 : outlook === "Medium" ? 2 : 1;
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export function daysUntil(date: Date) {
  return Math.ceil((date.getTime() - Date.now()) / 86_400_000);
}

export function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 3).toUpperCase();
}

export function profileIncomplete(profile: StudentProfile | null) {
  return !profile || !profile.grade || !profile.gpa || !profile.location || !profile.intendedMajor;
}

export function majorOverlap(profile: StudentProfile | null, college: College) {
  if (!profile) return 0;
  const tokens = [profile.intendedMajor, ...profile.interests, ...profile.careerInterests].map((x) => x.toLowerCase());
  return college.majors.filter((major) => tokens.some((token) => major.toLowerCase().includes(token) || token.includes(major.toLowerCase()))).length;
}
