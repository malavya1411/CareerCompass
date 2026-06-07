import { useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  CheckCircle2, 
  Circle, 
  TrendingUp, 
  Calendar, 
  ArrowRight, 
  GraduationCap, 
  FileText,
  BarChart3,
  Award
} from "lucide-react";
import { useAuth } from "../../auth";
import { useCatalog } from "../../../shared";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";
import { cn } from "../../../shared/utils/utils";

export function Dashboard() {
  const { user, profile, applications } = useAuth();
  const { careers, colleges } = useCatalog();
  const saved = profile?.savedColleges || [];

  // Calculate milestones
  const milestones = useMemo(() => {
    const isProfileComplete = profile && profile.grade && profile.gpa && profile.intendedMajor && profile.location;
    const hasCareerMatch = profile && profile.careerInterests && profile.careerInterests.length > 0;
    const hasCollegesSaved = saved.length > 0;
    const hasAppsSubmitted = applications.some((app) => app.status === "Submitted" || app.status === "Decision" || app.status === "Accepted");
    const hasDecision = applications.some((app) => app.status === "Decision" || app.status === "Accepted" || app.status === "Rejected");

    return [
      { id: "profile", label: "Profile Complete", completed: !!isProfileComplete },
      { id: "careers", label: "Career Match Found", completed: !!hasCareerMatch },
      { id: "colleges", label: "Colleges Saved", completed: !!hasCollegesSaved },
      { id: "applications", label: "Applications Submitted", completed: !!hasAppsSubmitted },
      { id: "decision", label: "Decision Received", completed: !!hasDecision },
    ];
  }, [profile, saved, applications]);

  const completionPercentage = useMemo(() => {
    const completedCount = milestones.filter((m) => m.completed).length;
    return (completedCount / milestones.length) * 100;
  }, [milestones]);

  // Next actions list
  const nextActions = useMemo(() => {
    const actions = [];
    const isProfileComplete = profile && profile.grade && profile.gpa && profile.intendedMajor && profile.location;
    if (!isProfileComplete) {
      actions.push({
        id: "sat",
        title: "Complete SAT/GPA details in profile",
        due: "Due Today",
        priority: "High",
        type: "Required",
        to: "/profile",
        color: "border-l-red-500 bg-red-500/5 text-red-700 dark:text-red-400"
      });
    }
    const matchingColleges = colleges.filter((c) => profile?.savedColleges?.includes(c.id));
    if (matchingColleges.length === 0) {
      actions.push({
        id: "colleges",
        title: "Explore and save target colleges",
        due: "Recommended",
        priority: "Medium",
        type: "Explore",
        to: "/colleges",
        color: "border-l-blue-500 bg-blue-500/5 text-blue-700 dark:text-blue-400"
      });
    } else {
      actions.push({
        id: "research",
        title: `Research fit analysis for ${matchingColleges[0].name}`,
        due: "Recommended",
        priority: "Medium",
        type: "Research",
        to: `/colleges/${matchingColleges[0].id}`,
        color: "border-l-amber-500 bg-amber-500/5 text-amber-700 dark:text-amber-400"
      });
    }

    const unsubmittedApps = applications.filter((a) => a.status !== "Submitted" && a.status !== "Decision" && a.status !== "Accepted");
    if (unsubmittedApps.length > 0) {
      const nearestApp = [...unsubmittedApps].sort((a,b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0];
      const diffTime = new Date(nearestApp.deadline).getTime() - Date.now();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const collegeName = colleges.find(c => c.id === nearestApp.collegeId)?.name || nearestApp.collegeId;
      actions.push({
        id: "essay",
        title: `Finish Application Essay for ${collegeName}`,
        due: diffDays < 0 ? "Overdue" : `${diffDays} days left`,
        priority: "High",
        type: "Tracker",
        to: "/tracker",
        color: diffDays <= 7 ? "border-l-red-500 bg-red-500/5 text-red-700 dark:text-red-400" : "border-l-indigo-500 bg-indigo-500/5 text-indigo-700 dark:text-indigo-400"
      });
    } else {
      actions.push({
        id: "tracker-empty",
        title: "Add a college to the Application Tracker",
        due: "Next step",
        priority: "Medium",
        type: "Action",
        to: "/colleges",
        color: "border-l-indigo-500 bg-indigo-500/5 text-indigo-700 dark:text-indigo-400"
      });
    }

    return actions.slice(0, 3);
  }, [profile, colleges, applications]);

  // Smart Recommendations with Transparency
  const recommendedCareers = useMemo(() => {
    return careers
      .filter((career) => {
        if (!profile) return true;
        const matchesCategory = profile.careerInterests.includes(career.category);
        const matchesMajor = career.relatedMajors.some((m) =>
          profile.intendedMajor.toLowerCase().includes(m.toLowerCase())
        );
        return matchesCategory || matchesMajor;
      })
      .slice(0, 2);
  }, [careers, profile]);

  const recommendedColleges = useMemo(() => {
    return colleges
      .filter((college) => {
        if (!profile) return true;
        const hasMajor = college.majors.some((m) =>
          profile.intendedMajor.toLowerCase().includes(m.toLowerCase())
        );
        return hasMajor;
      })
      .slice(0, 2);
  }, [colleges, profile]);

  // Competitiveness calculation based on GPA
  const competitiveness = useMemo(() => {
    if (!profile?.gpa) return "Not Evaluated";
    if (profile.gpa >= 3.8) return "Highly Competitive";
    if (profile.gpa >= 3.4) return "Competitive";
    return "Selective";
  }, [profile]);

  // Chart data: Comparing Tuition Cost for Saved Colleges
  const chartData = useMemo(() => {
    const savedCollegesList = colleges.filter((c) => saved.includes(c.id));
    if (savedCollegesList.length === 0) {
      // Return default subset of colleges if none are saved
      return colleges.slice(0, 4).map((c) => ({
        name: c.name,
        Tuition: c.tuition,
        Salary: c.averageSalary || 800000,
      }));
    }
    return savedCollegesList.map((c) => ({
      name: c.name,
      Tuition: c.tuition,
      Salary: c.averageSalary || 800000,
    }));
  }, [colleges, saved]);

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h1 className="text-3xl font-heading font-extrabold text-slate-900 dark:text-[#F8FAFC]">
          Welcome back, {profile?.displayName || "Alex"}
        </h1>
        <p className="text-sm text-slate-500 dark:text-[#94A3B8] font-sans font-medium mt-1">
          You're <span className="font-number font-bold text-brand dark:text-blue-400">{completionPercentage}%</span> complete with your college planning journey.
        </p>

        {/* Milestone Indicator Bar */}
        <div className="mt-6">
          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div 
              className="h-full bg-brand dark:bg-blue-500 transition-all duration-750 ease-out" 
              style={{ width: `${completionPercentage}%` }} 
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
            {milestones.map((m) => (
              <div 
                key={m.id} 
                className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-[#94A3B8]"
              >
                {m.completed ? (
                  <CheckCircle2 size={16} className="text-[#16A34A] shrink-0" />
                ) : (
                  <Circle size={16} className="text-slate-350 dark:text-slate-600 shrink-0" />
                )}
                <span className="truncate">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Action Center - Left/Center Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-heading font-extrabold text-slate-900 dark:text-white mb-4">
              Recommended Next Actions
            </h2>
            <div className="space-y-3">
              {nextActions.map((action) => (
                <Link 
                  key={action.id} 
                  to={action.to}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between border-l-4 rounded-r-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm", 
                    action.color
                  )}
                >
                  <div className="space-y-1">
                    <span className="text-[9px] font-sans font-bold tracking-widest uppercase opacity-75">{action.type}</span>
                    <p className="font-heading font-bold text-sm text-slate-800 dark:text-slate-100">{action.title}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0 text-xs font-sans font-bold shrink-0 self-end sm:self-center">
                    <span>{action.due}</span>
                    <ArrowRight size={14} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recommendation Transparency */}
          <div className="space-y-4">
            <h2 className="text-lg font-heading font-extrabold text-slate-900 dark:text-white">
              Why We Recommend These Paths
            </h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              {/* Careers */}
              {recommendedCareers.map((career) => (
                <div 
                  key={career.id}
                  className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Career Match</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-blue-50 dark:bg-blue-950 text-brand dark:text-blue-400 border border-blue-100 dark:border-blue-900">High Match</span>
                    </div>
                    <h3 className="font-heading font-extrabold text-base text-slate-800 dark:text-white mt-2">
                      {career.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-sans mt-1 line-clamp-2">
                      {career.description}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-150 dark:border-slate-800/80 text-xs mt-3">
                    <span className="font-sans font-bold text-slate-400 dark:text-slate-500 block text-[9px] uppercase tracking-wide">Why Recommended</span>
                    <p className="text-slate-700 dark:text-slate-350 font-sans font-medium mt-1">
                      {career.matchExplanation || "Matches your STEM academic preferences and technical assessments."}
                    </p>
                  </div>

                  <Link 
                    to={`/careers/${career.id}`}
                    className="text-xs font-sans font-bold text-brand dark:text-blue-400 hover:text-brand-hover flex items-center gap-1.5 pt-3.5 mt-auto border-t border-slate-100 dark:border-slate-800"
                  >
                    Explore Career <ArrowRight size={14} />
                  </Link>
                </div>
              ))}

              {/* Colleges */}
              {recommendedColleges.map((college) => (
                <div 
                  key={college.id}
                  className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">College Match</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-emerald-50 dark:bg-emerald-950 text-[#16A34A] dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">Target Fit</span>
                    </div>
                    <h3 className="font-heading font-extrabold text-base text-slate-800 dark:text-white mt-2">
                      {college.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-sans mt-1 line-clamp-2">
                      {college.description}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-150 dark:border-slate-800/80 text-xs mt-3">
                    <span className="font-sans font-bold text-slate-400 dark:text-slate-500 block text-[9px] uppercase tracking-wide">Why Recommended</span>
                    <p className="text-slate-700 dark:text-slate-350 font-sans font-medium mt-1">
                      {college.whyRecommended || "Strong alignment with your GPA and intended majors."}
                    </p>
                  </div>

                  <Link 
                    to={`/colleges/${college.id}`}
                    className="text-xs font-sans font-bold text-brand dark:text-blue-400 hover:text-brand-hover flex items-center gap-1.5 pt-3.5 mt-auto border-t border-slate-100 dark:border-slate-800"
                  >
                    View Fit Analysis <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar Columns: Insights, Snapshots & Analytics */}
        <div className="space-y-6">
          {/* Academic Snapshot */}
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Award className="text-brand dark:text-blue-400" size={20} />
              <h2 className="text-lg font-heading font-extrabold text-slate-900 dark:text-white">
                Academic Snapshot
              </h2>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-850">
              <div className="py-3 flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-[#94A3B8] font-sans font-medium">Cumulative GPA</span>
                <span className="font-number font-extrabold text-lg text-slate-800 dark:text-white">
                  {profile?.gpa ? profile.gpa.toFixed(2) : "N/A"}
                </span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-[#94A3B8] font-sans font-medium">SAT / ACT Score</span>
                <span className="font-number font-extrabold text-lg text-slate-800 dark:text-white">
                  {profile?.satAct || "N/A"}
                </span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-[#94A3B8] font-sans font-medium">Saved Colleges</span>
                <span className="font-number font-extrabold text-lg text-slate-800 dark:text-white">
                  {saved.length}
                </span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-[#94A3B8] font-sans font-medium">Competitiveness</span>
                <span className="px-2 py-0.5 rounded text-xs font-sans font-bold bg-indigo-50 dark:bg-indigo-950 text-brand dark:text-indigo-400">
                  {competitiveness}
                </span>
              </div>
            </div>

            <Link to="/profile">
              <button className="w-full text-center py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-sans font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors mt-4">
                Update Profile Academics
              </button>
            </Link>
          </div>

          {/* Analytics Visualization Widget */}
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-heading font-extrabold text-slate-900 dark:text-white">
                Cost vs Potential Salary
              </h2>
              <BarChart3 className="text-slate-400 dark:text-slate-500" size={18} />
            </div>
            
            <p className="text-[10px] text-slate-400 dark:text-[#94A3B8] font-sans font-medium mb-3">
              A side-by-side comparison of annual tuition fees vs average starting salary for saved colleges.
            </p>

            <div className="h-48 w-full font-number text-[9px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#94A3B8" />
                  <YAxis tickLine={false} axisLine={false} stroke="#94A3B8" />
                  <Tooltip 
                    contentStyle={{ 
                      background: "rgba(30, 41, 59, 0.9)", 
                      border: "none", 
                      borderRadius: "8px",
                      color: "#F8FAFC",
                      fontFamily: "Inter"
                    }} 
                  />
                  <Bar dataKey="Tuition" fill="#3B5BDB" name="Tuition Cost" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Salary" fill="#16A34A" name="Starting Salary" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 mt-2 text-[10px] font-sans font-semibold text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#3B5BDB]" />
                <span>Tuition Fees</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#16A34A]" />
                <span>Est Salary</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
