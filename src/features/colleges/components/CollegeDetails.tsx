import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Heart, 
  BarChart3, 
  Plus, 
  GraduationCap, 
  MapPin, 
  Award,
  ChevronLeft,
  Building,
  Users,
  Compass,
  FileText,
  BookmarkCheck
} from "lucide-react";
import { useAuth } from "../../auth";
import {
  useCatalog,
  Page,
  Card,
  Button,
  Stat,
  Badge,
  Missing,
  formatMoney,
  initials,
  toggleSaved,
  calculateFitScore,
  cn
} from "../../../shared";
import { useCompare } from "../state/CompareContext";
import { CareerCard } from "../../careers";

type TabName = "overview" | "academics" | "admissions" | "costs" | "outcomes";

export function CollegeDetails() {
  const { id } = useParams();
  const { profile, saveProfile, addApplication, applications } = useAuth();
  const { careers, colleges } = useCatalog();
  const { compareIds, toggleCompare } = useCompare();
  const college = colleges.find((item) => item.id === id);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabName>("overview");

  if (!college) return <Missing label="college" />;

  const saved = profile?.savedColleges?.includes(college.id);
  const fitScore = calculateFitScore(profile, college);
  const isAddedToTracker = applications.some((app) => app.collegeId === college.id);

  // Find related careers
  const relatedCareers = careers
    .filter((career) => career.relatedMajors.some((major) => college.majors.includes(major)))
    .slice(0, 3);

  // Find similar colleges
  const similarColleges = colleges
    .filter((c) => c.id !== college.id && (c.state === college.state || c.type === college.type))
    .slice(0, 3);

  async function addToTracker() {
    try {
      await addApplication(college!.id);
      navigate("/tracker");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add application");
    }
  }

  // Admissions comparison details
  const fitReasons = React.useMemo(() => {
    const reasons = [];
    if (!profile) return ["Register or log in to check your academic fit guidelines."];

    if (profile.gpa && college.admissionsGpaMedian) {
      if (profile.gpa >= college.admissionsGpaMedian) {
        reasons.push(`Your GPA (${profile.gpa.toFixed(2)}) is higher than their median GPA (${college.admissionsGpaMedian}).`);
      } else {
        reasons.push(`Your GPA (${profile.gpa.toFixed(2)}) is slightly below their median GPA (${college.admissionsGpaMedian}).`);
      }
    }

    if (profile.satAct && college.admissionsSatMedian) {
      const satVal = parseInt(profile.satAct);
      if (!isNaN(satVal)) {
        if (satVal >= college.admissionsSatMedian) {
          reasons.push(`Your SAT/ACT score (${satVal}) meets or exceeds their admitted median (${college.admissionsSatMedian}).`);
        } else {
          reasons.push(`Your SAT/ACT score (${satVal}) is below their admitted median (${college.admissionsSatMedian}).`);
        }
      }
    }

    const matchingMajors = college.majors.filter(m => 
      profile.intendedMajor.toLowerCase().includes(m.toLowerCase()) || m.toLowerCase().includes(profile.intendedMajor.toLowerCase())
    );
    if (matchingMajors.length > 0) {
      reasons.push(`They offer programs directly matching your target Major choice (${profile.intendedMajor}).`);
    }

    // Check interests
    const overlapCategories = profile.careerInterests.filter(cat => {
      const lower = cat.toLowerCase();
      if (lower === "stem" && college.majors.some(m => m.includes("Science") || m.includes("Engineering") || m.includes("Robotics"))) return true;
      if (lower === "business" && college.majors.some(m => m.includes("Administration") || m.includes("Finance"))) return true;
      return false;
    });
    if (overlapCategories.length > 0) {
      reasons.push(`Matches your structural career interest in ${overlapCategories.join(" and ")}.`);
    }

    if (reasons.length === 0) {
      reasons.push("Recommended based on location availability and overall enrollment suitability.");
    }
    return reasons;
  }, [profile, college]);

  const tabs: { name: TabName; label: string }[] = [
    { name: "overview", label: "Overview" },
    { name: "academics", label: "Academics" },
    { name: "admissions", label: "Admissions" },
    { name: "costs", label: "Costs" },
    { name: "outcomes", label: "Campus & Outcomes" }
  ];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <div className="flex items-center">
        <button 
          onClick={() => navigate(-1)}
          className="text-xs font-sans font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5"
        >
          <ChevronLeft size={16} /> Back to Explorer
        </button>
      </div>

      {/* College Profile Header Card */}
      <Card className="p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="grid size-16 place-items-center rounded-xl bg-gradient-to-br from-[#3B5BDB] to-indigo-600 font-heading font-extrabold text-white text-2xl shadow-md shadow-brand/10 shrink-0">
              {initials(college.name)}
            </span>
            <div>
              <h1 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-white leading-tight">
                {college.name}
              </h1>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-sans font-semibold flex items-center gap-1 mt-1">
                <MapPin size={13} className="text-slate-400" /> {college.city}, {college.state} • {college.type} University
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button 
              variant={saved ? "primary" : "outline"} 
              className="h-9 text-xs rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20"
              onClick={() => toggleSaved(profile, saveProfile, college.id)}
            >
              <Heart size={15} className={cn("transition-all", saved ? "fill-rose-500 text-rose-500 scale-110" : "text-slate-400")} />
              {saved ? "Saved" : "Save School"}
            </Button>
            
            <Button 
              variant={compareIds.includes(college.id) ? "primary" : "outline"} 
              className="h-9 text-xs rounded-xl"
              onClick={() => toggleCompare(college.id)}
            >
              <BarChart3 size={15} />
              Compare
            </Button>

            {isAddedToTracker ? (
              <Badge tone="emerald" className="h-9 inline-flex items-center gap-1 px-3 border-emerald-100 bg-emerald-50 dark:bg-emerald-950/20 text-[#16A34A] dark:text-emerald-400 font-sans font-bold rounded-xl">
                <BookmarkCheck size={14} /> Added to Tracker
              </Badge>
            ) : (
              <Button onClick={addToTracker} className="h-9 text-xs rounded-xl bg-[#3B5BDB] hover:bg-brand-hover text-white">
                <Plus size={15} /> Add to Tracker
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 dark:border-slate-800/80 overflow-x-auto pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={cn(
              "py-2 px-4 text-xs font-sans font-bold border-b-2 transition-all shrink-0 -mb-px",
              activeTab === tab.name 
                ? "border-[#3B5BDB] text-brand dark:text-blue-400 font-extrabold" 
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-350"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="text-left">
        {activeTab === "overview" && (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Overview & Fit Analysis */}
            <div className="md:col-span-2 space-y-6">
              <Card className="p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                <h2 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                  About {college.name}
                </h2>
                <p className="text-sm text-slate-600 dark:text-[#94A3B8] font-sans leading-relaxed">
                  {college.description}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                  <div>
                    <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-widest block">Type</span>
                    <span className="text-sm font-sans font-bold text-slate-800 dark:text-white mt-1 block">{college.type}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-widest block">Enrollment</span>
                    <span className="text-sm font-number font-bold text-slate-800 dark:text-white mt-1 block">{college.enrollment.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-widest block">Acceptance Rate</span>
                    <span className="text-sm font-number font-bold text-slate-800 dark:text-white mt-1 block">{college.acceptanceRate}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-widest block">Deadline</span>
                    <span className="text-sm font-sans font-bold text-slate-800 dark:text-white mt-1 block">{college.applicationDeadline || "June 15"}</span>
                  </div>
                </div>
              </Card>

              {/* Fit Analysis Widget */}
              <Card className="p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                    Fit Analysis
                  </h2>
                  <span className="px-3 py-1 rounded-full text-xs font-sans font-bold bg-indigo-50 dark:bg-indigo-950/20 text-[#3B5BDB] dark:text-blue-400 border border-blue-100 dark:border-blue-900">
                    🎯 {fitScore}% Match score
                  </span>
                </div>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans leading-relaxed">
                  Our calculations measure this college against your GPA, SAT/ACT results, academic major preference, and extracurricular keywords.
                </p>

                <div className="space-y-2.5 pt-2">
                  {fitReasons.map((reason, idx) => (
                    <div key={idx} className="flex gap-2 text-xs font-sans font-medium text-slate-700 dark:text-slate-350">
                      <span className="text-[#16A34A] shrink-0 font-bold">✓</span>
                      <p>{reason}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar quick facts */}
            <div className="space-y-6">
              <Card className="p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-xs font-sans space-y-4">
                <h3 className="font-heading font-extrabold text-slate-900 dark:text-white uppercase tracking-wider block">At a Glance</h3>
                <div className="divide-y divide-slate-100 dark:divide-slate-850">
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 dark:text-[#94A3B8] font-medium">CS Ranking</span>
                    <span className="font-number font-bold text-slate-850 dark:text-white">#{college.csRanking || "N/A"}</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 dark:text-[#94A3B8] font-medium">Placement Rate</span>
                    <span className="font-number font-bold text-slate-850 dark:text-white">{college.placementRate || 85}%</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 dark:text-[#94A3B8] font-medium">Avg Graduate Salary</span>
                    <span className="font-number font-bold text-slate-850 dark:text-white">{formatMoney(college.averageSalary || 800000)}</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 dark:text-[#94A3B8] font-medium">Campus Size</span>
                    <span className="font-sans font-bold text-slate-850 dark:text-white">{college.campusSize || "Medium"}</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 dark:text-[#94A3B8] font-medium">Student-Faculty Ratio</span>
                    <span className="font-sans font-bold text-slate-850 dark:text-white">{college.studentFacultyRatio || "14:1"}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Academics Tab */}
        {activeTab === "academics" && (
          <Card className="p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
            <h2 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
              Academic Infrastructure
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <span className="text-[10px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Available Programs & Majors</span>
                <div className="flex flex-wrap gap-2">
                  {college.majors.map(major => (
                    <Badge key={major} tone="blue" className="font-semibold text-xs py-1 px-3">{major}</Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-4 text-xs font-sans">
                <span className="text-[10px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Scholastic Environment</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-400 block mb-0.5">Faculty Ratio</span>
                    <span className="text-base font-bold text-slate-800 dark:text-white">{college.studentFacultyRatio || "12:1"}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-400 block mb-0.5">CS Ranking</span>
                    <span className="text-base font-bold text-slate-800 dark:text-white">#{college.csRanking || 15}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Admissions Tab */}
        {activeTab === "admissions" && (
          <Card className="p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-5">
            <h2 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
              Admissions Criteria & Medians
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
                <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-widest block">Acceptance Rate</span>
                <span className="text-2xl font-number font-extrabold text-slate-850 dark:text-white block mt-1">{college.acceptanceRate}%</span>
                <span className="text-[10px] text-slate-400 block mt-1">Highly selective application process.</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
                <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-widest block">Admissions GPA Median</span>
                <span className="text-2xl font-number font-extrabold text-slate-850 dark:text-white block mt-1">{college.admissionsGpaMedian || "3.85"}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Average GPA score of admitted class.</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
                <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-widest block">Admissions SAT Median</span>
                <span className="text-2xl font-number font-extrabold text-slate-850 dark:text-white block mt-1">{college.admissionsSatMedian || "1450"}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Admitted student SAT score median.</span>
              </div>
            </div>
          </Card>
        )}

        {/* Costs Tab */}
        {activeTab === "costs" && (
          <Card className="p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
            <h2 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
              Tuition Fees & Scholarships
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-widest block">Annual Tuition</span>
                  <p className="text-2xl font-number font-extrabold text-[#3B5BDB] dark:text-blue-400 mt-1">
                    {formatMoney(college.tuition)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Exclude housing, textbooks, and health care additions.</p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-150 dark:border-slate-800/80 space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <Award size={18} />
                  <span className="font-heading font-extrabold text-sm uppercase tracking-wide">Scholarships & Financial Aid</span>
                </div>
                <p className="text-xs font-sans font-medium text-slate-700 dark:text-slate-350 leading-relaxed">
                  {college.scholarships || "No merit aid listed. Needs-based aid plans cover partial amounts."}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Outcomes Tab */}
        {activeTab === "outcomes" && (
          <Card className="p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-5">
            <h2 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
              Campus Environment & Career Outcomes
            </h2>
            <div className="grid gap-4 sm:grid-cols-3 text-xs font-sans">
              <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
                <span className="text-slate-400 block mb-0.5">Campus Size</span>
                <span className="text-base font-bold text-slate-800 dark:text-white">{college.campusSize || "Medium (320 acres)"}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
                <span className="text-slate-400 block mb-0.5">Placement Rate</span>
                <span className="text-base font-bold text-slate-800 dark:text-white">{college.placementRate || 90}%</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
                <span className="text-slate-400 block mb-0.5">Average starting salary</span>
                <span className="text-base font-bold text-slate-850 dark:text-white">{formatMoney(college.averageSalary || 950000)}</span>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Popular Careers */}
      {relatedCareers.length > 0 && (
        <div className="space-y-3 text-left">
          <h2 className="text-lg font-heading font-extrabold text-slate-900 dark:text-white">
            Matching Career Pathways
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedCareers.map(c => (
              <CareerCard 
                key={c.id} 
                career={c} 
                onSelect={() => navigate("/careers")} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Similar Colleges */}
      {similarColleges.length > 0 && (
        <div className="space-y-3 text-left">
          <h2 className="text-lg font-heading font-extrabold text-slate-900 dark:text-white">
            Similar Colleges
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {similarColleges.map(c => (
              <Card 
                key={c.id} 
                onClick={() => navigate(`/colleges/${c.id}`)}
                className="p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E293B] cursor-pointer hover:border-blue-400 transition-colors flex items-center justify-between"
              >
                <div>
                  <h4 className="font-heading font-bold text-xs text-slate-850 dark:text-white">{c.name}</h4>
                  <p className="text-[10px] text-slate-450 dark:text-[#94A3B8] font-sans mt-0.5">{c.city}, {c.state} • {c.type}</p>
                </div>
                <span className="text-[10px] font-sans font-bold text-brand dark:text-blue-400">View</span>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
