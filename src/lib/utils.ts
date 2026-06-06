import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AppStatus, College, GrowthOutlook, StudentProfile } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const statuses: AppStatus[] = ["Researching", "Shortlisted", "Applying", "Submitted", "Decision"];
export const categories = ["STEM", "Business", "Healthcare", "Arts", "Education", "Law"] as const;

export function growthScore(outlook: GrowthOutlook) {
  return outlook === "High" ? 3 : outlook === "Medium" ? 2 : 1;
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
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

export function calculateFitScore(profile: StudentProfile | null, college: College): number {
  if (!profile) return 75;
  let score = 55;

  if (profile.intendedMajor) {
    const intended = profile.intendedMajor.toLowerCase();
    const matchesMajor = college.majors.some((m) => 
      m.toLowerCase().includes(intended) || intended.includes(m.toLowerCase())
    );
    if (matchesMajor) {
      score += 20;
    }
  }

  if (profile.location && college.state) {
    if (profile.location.toUpperCase() === college.state.toUpperCase()) {
      score += 15;
    }
  }

  if (profile.gpa) {
    if (college.acceptanceRate < 5) {
      score += profile.gpa >= 3.8 ? 10 : (profile.gpa >= 3.4 ? 0 : -15);
    } else if (college.acceptanceRate < 15) {
      score += profile.gpa >= 3.5 ? 10 : (profile.gpa >= 3.0 ? 5 : -10);
    } else {
      score += 5;
    }
  }

  if (profile.careerInterests && profile.careerInterests.length > 0) {
    const overlaps = college.majors.some((major) => {
      const lowerMajor = major.toLowerCase();
      return profile.careerInterests.some((cat) => {
        const lowerCat = cat.toLowerCase();
        if (lowerCat === "stem" && (lowerMajor.includes("computer") || lowerMajor.includes("engineer") || lowerMajor.includes("science") || lowerMajor.includes("math") || lowerMajor.includes("physics") || lowerMajor.includes("robotics"))) return true;
        if (lowerCat === "business" && (lowerMajor.includes("business") || lowerMajor.includes("finance") || lowerMajor.includes("marketing") || lowerMajor.includes("accounting") || lowerMajor.includes("economics"))) return true;
        if (lowerCat === "healthcare" && (lowerMajor.includes("nursing") || lowerMajor.includes("biology") || lowerMajor.includes("health") || lowerMajor.includes("medicine"))) return true;
        if (lowerCat === "arts" && (lowerMajor.includes("design") || lowerMajor.includes("art") || lowerMajor.includes("graphic") || lowerMajor.includes("music") || lowerMajor.includes("human-computer"))) return true;
        if (lowerCat === "law" && (lowerMajor.includes("law") || lowerMajor.includes("political"))) return true;
        if (lowerCat === "education" && lowerMajor.includes("education")) return true;
        return false;
      });
    });
    if (overlaps) {
      score += 10;
    }
  }

  return Math.min(99, Math.max(30, score));
}
