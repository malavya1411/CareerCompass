export type GrowthOutlook = "High" | "Medium" | "Low";
export type AppStatus = 
  | "Researching" 
  | "Interested" 
  | "Shortlisted" 
  | "Applying" 
  | "Submitted" 
  | "Interview" 
  | "Decision" 
  | "Accepted" 
  | "Rejected" 
  | "Enrolled";

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
  dreamSchool?: string;
  targetSchool?: string;
  safetySchool?: string;
  budget?: number;
  preferredSize?: string;
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
  projectedDemand?: string;
  dayInLife?: string;
  salaryProgression?: { level: string; salary: string }[];
  careerRoadmap?: string[];
  matchExplanation?: string;
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
  averageSalary?: number;
  placementRate?: number;
  csRanking?: number;
  scholarships?: string;
  campusSize?: string;
  studentFacultyRatio?: string;
  applicationDeadline?: string;
  admissionsGpaMedian?: number;
  admissionsSatMedian?: number;
  whyRecommended?: string;
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
  priority?: "Low" | "Medium" | "High";
  requiredDocuments?: { name: string; status: "Missing" | "Uploaded" }[];
  lastUpdated?: Date;
};
