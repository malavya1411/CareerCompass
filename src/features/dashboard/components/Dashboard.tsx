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
  Award,
  Activity,
  Heart,
  Clock,
  Sparkles
} from "lucide-react";
import { useAuth } from "../../auth";
import { useCatalog } from "../../../shared";
import { Badge, Progress } from "../../../shared/ui";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";
import { cn, daysUntil } from "../../../shared/utils/utils";

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
        color: "border-l-[#C94A4A] bg-[rgba(201,74,74,0.04)] text-[#E1DCC9]"
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
        color: "border-l-[#6C8EFF] bg-[rgba(108,142,255,0.04)] text-[#E1DCC9]"
      });
    } else {
      actions.push({
        id: "research",
        title: `Research fit analysis for ${matchingColleges[0].name}`,
        due: "Recommended",
        priority: "Medium",
        type: "Research",
        to: `/colleges/${matchingColleges[0].id}`,
        color: "border-l-[#D4A017] bg-[rgba(212,160,23,0.04)] text-[#E1DCC9]"
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
        color: diffDays <= 7 ? "border-l-[#C94A4A] bg-[rgba(201,74,74,0.04)] text-[#E1DCC9]" : "border-l-[#6C8EFF] bg-[rgba(108,142,255,0.04)] text-[#E1DCC9]"
      });
    } else {
      actions.push({
        id: "tracker-empty",
        title: "Add a college to the Application Tracker",
        due: "Next step",
        priority: "Medium",
        type: "Action",
        to: "/colleges",
        color: "border-l-[#6C8EFF] bg-[rgba(108,142,255,0.04)] text-[#E1DCC9]"
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
      return colleges.slice(0, 4).map((c) => ({
        name: c.name.split(" ").slice(0, 2).join(" "),
        Tuition: c.tuition,
        Salary: c.averageSalary || 80000,
      }));
    }
    return savedCollegesList.map((c) => ({
      name: c.name.split(" ").slice(0, 2).join(" "),
      Tuition: c.tuition,
      Salary: c.averageSalary || 80000,
    }));
  }, [colleges, saved]);

  // Upcoming Deadlines
  const upcomingDeadlines = useMemo(() => {
    return [...applications]
      .filter((app) => app.status !== "Submitted" && app.status !== "Decision" && app.status !== "Accepted")
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .map((app) => {
        const college = colleges.find((c) => c.id === app.collegeId);
        const daysLeft = daysUntil(new Date(app.deadline));
        return {
          id: app.id,
          collegeName: college?.name || app.collegeId,
          daysLeft,
          status: app.status,
          deadlineDate: new Date(app.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        };
      })
      .slice(0, 3);
  }, [applications, colleges]);

  // Application Health Score calculation
  const applicationHealth = useMemo(() => {
    if (!applications || applications.length === 0) return { score: 0, label: "No Applications Added" };
    const avgCompleteness = Math.round(
      applications.reduce((acc, app) => acc + (app.completeness || 0), 0) / applications.length
    );
    let label = "Needs Attention";
    if (avgCompleteness >= 75) label = "Excellent";
    else if (avgCompleteness >= 45) label = "On Track";
    return { score: avgCompleteness, label };
  }, [applications]);

  // College Readiness Score calculation
  const readinessScore = useMemo(() => {
    let score = 0;
    if (profile?.gpa) score += 25;
    if (profile?.satAct) score += 25;
    const savedCount = saved.length;
    score += Math.min(25, savedCount * 8);
    if (profile?.intendedMajor) score += 15;
    if (profile?.activities && profile.activities.length > 0) score += 10;
    
    let label = "Developing";
    if (score >= 75) label = "Ready / Competitive";
    else if (score >= 50) label = "On Track";
    return { score, label };
  }, [profile, saved]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#E1DCC9]">
      <div className="grid grid-cols-12 gap-6">
        
        {/* Row 1: Journey Progress (Espresso background with walnut gradient) */}
        <div className="col-span-12 lg:col-span-8 bg-gradient-to-br from-[#1F150C] to-[#2B1E10] border border-[rgba(225,220,201,0.08)] rounded-2xl p-6 shadow-[0px_12px_32px_rgba(0,0,0,0.35)] flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-heading font-extrabold text-[#F5F2EA]">
              Welcome back, {profile?.displayName || "Student"}
            </h1>
            <p className="text-sm text-[rgba(225,220,201,0.7)] font-sans mt-1">
              You're <span className="font-number font-bold text-[#FFFFFF]">{completionPercentage}%</span> complete with your college planning journey.
            </p>
          </div>

          <div className="mt-6">
            <div className="h-2.5 w-full rounded-full bg-[#000000]/40 overflow-hidden border border-[rgba(225,220,201,0.04)] mb-4">
              <div 
                className="h-full bg-gradient-to-r from-[#E1DCC9] to-[#FFFFFF] transition-all duration-750 ease-out" 
                style={{ width: `${completionPercentage}%` }} 
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {milestones.map((m) => (
                <div 
                  key={m.id} 
                  className="flex items-center gap-2 text-[11px] font-semibold text-[rgba(225,220,201,0.75)]"
                >
                  {m.completed ? (
                    <CheckCircle2 size={14} className="text-[#4CAF50] shrink-0" />
                  ) : (
                    <Circle size={14} className="text-[rgba(225,220,201,0.25)] shrink-0" />
                  )}
                  <span className="truncate">{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 1: Academic Snapshot */}
        <div className="col-span-12 lg:col-span-4 bg-[#111111] border border-[rgba(225,220,201,0.06)] rounded-2xl p-6 shadow-[0px_12px_32px_rgba(0,0,0,0.35)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Award className="text-[#E1DCC9]" size={18} />
              <h2 className="text-sm font-heading font-extrabold text-[#F5F2EA] uppercase tracking-wider">
                Academic Snapshot
              </h2>
            </div>
            
            <div className="divide-y divide-[rgba(225,220,201,0.08)]">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-xs text-[rgba(225,220,201,0.65)] font-sans">Cumulative GPA</span>
                <span className="font-number font-extrabold text-sm text-[#FFFFFF]">
                  {profile?.gpa ? profile.gpa.toFixed(2) : "N/A"}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-xs text-[rgba(225,220,201,0.65)] font-sans">SAT / ACT Score</span>
                <span className="font-number font-extrabold text-sm text-[#FFFFFF]">
                  {profile?.satAct || "N/A"}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-xs text-[rgba(225,220,201,0.65)] font-sans">Saved Colleges</span>
                <span className="font-number font-extrabold text-sm text-[#FFFFFF]">
                  {saved.length}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-xs text-[rgba(225,220,201,0.65)] font-sans">Competitiveness</span>
                <Badge tone={competitiveness === "Highly Competitive" ? "emerald" : competitiveness === "Competitive" ? "blue" : "slate"}>
                  {competitiveness}
                </Badge>
              </div>
            </div>
          </div>

          <Link to="/profile" className="mt-4">
            <button className="w-full text-center py-2 bg-[#412D15] text-[#E1DCC9] border border-[rgba(225,220,201,0.08)] font-sans font-bold text-xs rounded-xl hover:bg-[#523A1D] transition-all duration-200">
              Update Profile Academics
            </button>
          </Link>
        </div>

        {/* Row 2: Recommended Next Actions */}
        <div className="col-span-12 lg:col-span-8 bg-[#111111] border border-[rgba(225,220,201,0.06)] rounded-2xl p-6 shadow-[0px_12px_32px_rgba(0,0,0,0.35)]">
          <h2 className="text-base font-heading font-extrabold text-[#F5F2EA] mb-4">
            Recommended Next Actions
          </h2>
          <div className="space-y-3">
            {nextActions.map((action) => (
              <Link 
                key={action.id} 
                to={action.to}
                className={cn(
                  "flex flex-col sm:flex-row sm:items-center justify-between border rounded-xl p-4 transition-all duration-200 hover:bg-[#1A1A1A] hover:-translate-y-0.5 shadow-sm", 
                  action.color
                )}
              >
                <div className="space-y-1">
                  <span className="text-[9px] font-sans font-bold tracking-widest uppercase opacity-75">{action.type}</span>
                  <p className="font-heading font-bold text-sm text-[#FFFFFF]">{action.title}</p>
                </div>
                <div className="flex items-center gap-2 mt-2 sm:mt-0 text-xs font-sans font-bold shrink-0 self-end sm:self-center">
                  <span>{action.due}</span>
                  <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Row 2: Upcoming Deadlines */}
        <div className="col-span-12 lg:col-span-4 bg-[#111111] border border-[rgba(225,220,201,0.06)] rounded-2xl p-6 shadow-[0px_12px_32px_rgba(0,0,0,0.35)] flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-heading font-extrabold text-[#F5F2EA] uppercase tracking-wider mb-4">
              Upcoming Deadlines
            </h2>
            
            {upcomingDeadlines.length === 0 ? (
              <div className="py-6 text-center text-xs text-[rgba(225,220,201,0.5)] font-sans">
                No active application deadlines. Save colleges and shortlist them to track dates.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((dead) => (
                  <div 
                    key={dead.id} 
                    className="p-3 bg-[#1A1A1A]/60 border border-[rgba(225,220,201,0.04)] rounded-xl flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-heading font-bold text-[#FFFFFF] truncate">{dead.collegeName}</p>
                      <p className="text-[10px] text-[rgba(225,220,201,0.5)] font-sans mt-0.5">{dead.deadlineDate} • {dead.status}</p>
                    </div>
                    <div className={cn(
                      "shrink-0 px-2 py-1 rounded text-[10px] font-sans font-bold",
                      dead.daysLeft <= 7 ? "bg-[rgba(201,74,74,0.15)] text-[#C94A4A] animate-pulse" : "bg-[#1F150C] text-[#E1DCC9]"
                    )}>
                      {dead.daysLeft !== null ? (dead.daysLeft < 0 ? "Overdue" : `${dead.daysLeft}d left`) : "TBD"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link to="/tracker" className="mt-4">
            <button className="w-full text-center py-2 bg-[#412D15] text-[#E1DCC9] border border-[rgba(225,220,201,0.08)] font-sans font-bold text-xs rounded-xl hover:bg-[#523A1D] transition-all duration-200">
              View Tracker Calendar
            </button>
          </Link>
        </div>

        {/* Row 3: Career Matches */}
        <div className="col-span-12 lg:col-span-8 bg-[#111111] border border-[rgba(225,220,201,0.06)] rounded-2xl p-6 shadow-[0px_12px_32px_rgba(0,0,0,0.35)]">
          <h2 className="text-base font-heading font-extrabold text-[#F5F2EA] mb-4">
            Career Matches & Strategic Rationale
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            {recommendedCareers.map((career) => (
              <div 
                key={career.id}
                className="bg-[#1A1A1A]/40 border border-[rgba(225,220,201,0.05)] rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-[rgba(225,220,201,0.5)]">Career Match</span>
                    <Badge tone="emerald">High Match</Badge>
                  </div>
                  <h3 className="font-heading font-extrabold text-sm text-[#FFFFFF] mt-2">
                    {career.title}
                  </h3>
                  <p className="text-xs text-[rgba(225,220,201,0.65)] font-sans mt-1 line-clamp-2">
                    {career.description}
                  </p>
                </div>

                <div className="bg-[#1F150C]/60 p-3 rounded-xl border border-[rgba(225,220,201,0.06)] text-[11px] mt-3">
                  <span className="font-sans font-bold text-[rgba(225,220,201,0.4)] block text-[9px] uppercase tracking-wide">Why Recommended</span>
                  <p className="text-[rgba(225,220,201,0.8)] font-sans font-medium mt-1 leading-relaxed">
                    {career.matchExplanation || "Matches your STEM academic preferences and technical assessments."}
                  </p>
                </div>

                <Link 
                  to={`/careers/${career.id}`}
                  className="text-xs font-sans font-bold text-[#E1DCC9] hover:text-[#FFFFFF] flex items-center gap-1.5 pt-3 mt-auto border-t border-[rgba(225,220,201,0.06)]"
                >
                  View Career Path <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Row 3: College Insights (Cost vs Salary Chart) */}
        <div className="col-span-12 lg:col-span-4 bg-[#111111] border border-[rgba(225,220,201,0.06)] rounded-2xl p-6 shadow-[0px_12px_32px_rgba(0,0,0,0.35)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-heading font-extrabold text-[#F5F2EA] uppercase tracking-wider">
                College ROI Insights
              </h2>
              <BarChart3 className="text-[rgba(225,220,201,0.5)]" size={16} />
            </div>
            
            <p className="text-[10px] text-[rgba(225,220,201,0.6)] font-sans font-medium mb-3">
              Side-by-side: Tuition fees vs average starting salary for saved colleges.
            </p>

            <div className="h-44 w-full font-number text-[8px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <CartesianGrid stroke="rgba(225,220,201,0.08)" strokeDasharray="3 3" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="rgba(225,220,201,0.4)" tick={{ fill: '#E1DCC9' }} />
                  <YAxis tickLine={false} axisLine={false} stroke="rgba(225,220,201,0.4)" tick={{ fill: '#E1DCC9' }} />
                  <Tooltip 
                    contentStyle={{ 
                      background: "#111111", 
                      border: "1px solid rgba(225,220,201,0.1)", 
                      borderRadius: "12px",
                      color: "#E1DCC9",
                      fontFamily: "Inter"
                    }} 
                  />
                  <Bar dataKey="Tuition" fill="#D4A017" name="Tuition Cost" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Salary" fill="#4CAF50" name="Starting Salary" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 mt-2 text-[10px] font-sans font-semibold text-[rgba(225,220,201,0.6)]">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#D4A017]" />
                <span>Tuition Fees</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#4CAF50]" />
                <span>Starting Salary</span>
              </div>
            </div>
          </div>
        </div>

        {/* Row 4: Application Health Score */}
        <div className="col-span-12 lg:col-span-6 bg-[#111111] border border-[rgba(225,220,201,0.06)] rounded-2xl p-6 shadow-[0px_12px_32px_rgba(0,0,0,0.35)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-heading font-extrabold text-[#F5F2EA]">
                Application Health Score
              </h2>
              <Badge tone={applicationHealth.score >= 75 ? "emerald" : applicationHealth.score >= 45 ? "blue" : "rose"}>
                {applicationHealth.label}
              </Badge>
            </div>
            
            <p className="text-xs text-[rgba(225,220,201,0.65)] font-sans mb-4">
              An aggregate health check of documents, essays, and references for all tracked applications.
            </p>

            <div className="flex items-center gap-6 py-2">
              <div className="relative size-20 shrink-0">
                <svg className="size-full -rotate-90">
                  <circle cx="40" cy="40" r="34" className="stroke-[rgba(225,220,201,0.08)] fill-none" strokeWidth="5.5" />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    className={cn(
                      "fill-none transition-all duration-500",
                      applicationHealth.score >= 75 ? "stroke-[#4CAF50]" : applicationHealth.score >= 45 ? "stroke-[#6C8EFF]" : "stroke-[#C94A4A]"
                    )}
                    strokeWidth="5.5"
                    strokeDasharray={2 * Math.PI * 34}
                    strokeDashoffset={2 * Math.PI * 34 - (applicationHealth.score / 100) * (2 * Math.PI * 34)}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-number font-extrabold text-[#FFFFFF]">
                  {applicationHealth.score}%
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-sans w-full">
                <div className="flex justify-between items-center text-[11px] border-b border-[rgba(225,220,201,0.05)] pb-1">
                  <span className="text-[rgba(225,220,201,0.6)]">Shortlisted targets</span>
                  <span className="font-semibold text-[#FFFFFF]">{applications.length} Colleges</span>
                </div>
                <div className="flex justify-between items-center text-[11px] border-b border-[rgba(225,220,201,0.05)] pb-1">
                  <span className="text-[rgba(225,220,201,0.6)]">Document completeness</span>
                  <span className="font-semibold text-[#FFFFFF]">
                    {applications.filter(a => a.completeness && a.completeness >= 80).length} / {applications.length} ready
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] border-b border-[rgba(225,220,201,0.05)] pb-1">
                  <span className="text-[rgba(225,220,201,0.6)]">Next milestone deadline</span>
                  <span className="font-semibold text-[#FFFFFF]">
                    {applications.length > 0 ? "Tracked" : "No active deadlines"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 4: College Readiness Score */}
        <div className="col-span-12 lg:col-span-6 bg-[#111111] border border-[rgba(225,220,201,0.06)] rounded-2xl p-6 shadow-[0px_12px_32px_rgba(0,0,0,0.35)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-heading font-extrabold text-[#F5F2EA]">
                College Readiness Score
              </h2>
              <Badge tone={readinessScore.score >= 75 ? "emerald" : readinessScore.score >= 50 ? "blue" : "slate"}>
                {readinessScore.label}
              </Badge>
            </div>

            <p className="text-xs text-[rgba(225,220,201,0.65)] font-sans mb-4">
              Calculates structural preparedness based on your academic markers, targets, and activity completeness.
            </p>

            <div className="flex items-center gap-6 py-2">
              <div className="relative size-20 shrink-0">
                <svg className="size-full -rotate-90">
                  <circle cx="40" cy="40" r="34" className="stroke-[rgba(225,220,201,0.08)] fill-none" strokeWidth="5.5" />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    className={cn(
                      "fill-none transition-all duration-500",
                      readinessScore.score >= 75 ? "stroke-[#4CAF50]" : readinessScore.score >= 50 ? "stroke-[#6C8EFF]" : "stroke-[#D4A017]"
                    )}
                    strokeWidth="5.5"
                    strokeDasharray={2 * Math.PI * 34}
                    strokeDashoffset={2 * Math.PI * 34 - (readinessScore.score / 100) * (2 * Math.PI * 34)}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-number font-extrabold text-[#FFFFFF]">
                  {readinessScore.score}
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-sans w-full">
                <div className="flex justify-between items-center text-[11px] border-b border-[rgba(225,220,201,0.05)] pb-1">
                  <span className="text-[rgba(225,220,201,0.6)]">Academic details linked</span>
                  <span className="font-semibold text-[#FFFFFF]">{(profile?.gpa && profile?.grade) ? "Complete" : "Incomplete"}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] border-b border-[rgba(225,220,201,0.05)] pb-1">
                  <span className="text-[rgba(225,220,201,0.6)]">Standardized tests recorded</span>
                  <span className="font-semibold text-[#FFFFFF]">{profile?.satAct ? "Complete" : "Incomplete"}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] border-b border-[rgba(225,220,201,0.05)] pb-1">
                  <span className="text-[rgba(225,220,201,0.6)]">Extracurricular mapping</span>
                  <span className="font-semibold text-[#FFFFFF]">{(profile?.activities && profile.activities.length > 0) ? "Active" : "None"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
