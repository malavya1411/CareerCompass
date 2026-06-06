export type GrowthOutlook = "High" | "Medium" | "Low";
export type AppStatus = "Researching" | "Shortlisted" | "Applying" | "Submitted" | "Decision";

export type StudentProfile = {
  displayName: string;
  email: string;
  grade: string;
  gpa: number;
  location: string;
  satAct: string;
  intendedMajor: string;
  interests: string[];
  careerInterests: string[];
  activities: string[];
  savedColleges?: string[];
};

export type Career = {
  id: string;
  title: string;
  description: string;
  category: "STEM" | "Business" | "Healthcare" | "Arts" | "Education" | "Law";
  skills: string[];
  educationLevel: string;
  salaryRange: string;
  growthOutlook: GrowthOutlook;
  relatedMajors: string[];
};

export type College = {
  id: string;
  name: string;
  state: string;
  city: string;
  type: "Public" | "Private";
  tuition: number;
  acceptanceRate: number;
  enrollment: number;
  majors: string[];
  description: string;
  logoUrl?: string;
};

export type Application = {
  id: string;
  userId: string;
  collegeId: string;
  status: AppStatus;
  deadline: Date;
  notes: string;
  completeness: number;
  decisionOutcome?: "Accepted" | "Rejected" | "Waitlisted";
  createdAt: Date;
};
