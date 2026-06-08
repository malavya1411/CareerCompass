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
    <div className="mx-auto max-w-7xl space-y-10 text-[#111111] dark:text-[#E1DCC9]">
      <section className="border-b border-[rgba(0,0,0,0.08)] pb-8 dark:border-[rgba(225,220,201,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8B8B8B] dark:text-[rgba(225,220,201,0.45)]">Academic Workspace</p>
        <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <h1 className="font-heading text-5xl font-extrabold leading-[0.95] md:text-6xl">
              Good Morning, {profile?.displayName?.split(" ")[0] || "Alex"}
            </h1>
            <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-[#5A5A5A] dark:text-[rgba(225,220,201,0.7)]">
              Your college readiness score improved by <span className="font-number font-semibold text-[#4C43CD] dark:text-[#E1DCC9]">6%</span> this month.
            </p>
          </div>
          <div className="rounded-xl border border-[rgba(0,0,0,0.08)] bg-[#FBFAF2] p-5 dark:border-[rgba(225,220,201,0.08)] dark:bg-[#111111]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8B8B8B] dark:text-[rgba(225,220,201,0.45)]">Readiness</span>
              <Badge tone={readinessScore.score >= 75 ? "emerald" : readinessScore.score >= 50 ? "blue" : "slate"}>{readinessScore.label}</Badge>
            </div>
            <div className="mt-4 flex items-end gap-2">
              <span className="font-number text-5xl font-semibold leading-none">{readinessScore.score}</span>
              <span className="pb-1 text-sm font-semibold text-[#8B8B8B] dark:text-[rgba(225,220,201,0.5)]">/ 100</span>
            </div>
            <Progress value={readinessScore.score} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-2xl font-bold">Journey Progress</h2>
          <span className="font-number text-sm font-semibold text-[#4C43CD] dark:text-[#E1DCC9]">{completionPercentage}% complete</span>
        </div>
        <div className="relative grid gap-4 md:grid-cols-5">
          <div className="absolute left-0 right-0 top-4 hidden h-px bg-[rgba(0,0,0,0.08)] md:block dark:bg-[rgba(225,220,201,0.08)]" />
          {milestones.map((m) => (
            <div key={m.id} className="relative flex gap-3 md:block">
              <span className={cn("relative z-10 grid size-8 shrink-0 place-items-center rounded-full border bg-[#F7F5E8] dark:bg-black", m.completed ? "border-[#4CAF50] text-[#4CAF50]" : "border-[rgba(0,0,0,0.12)] text-[#8B8B8B] dark:border-[rgba(225,220,201,0.16)]")}>
                {m.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
              </span>
              <p className="mt-1 text-sm font-semibold text-[#5A5A5A] dark:text-[rgba(225,220,201,0.68)]">{m.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <div>
            <h2 className="font-heading text-2xl font-bold">Academic Snapshot</h2>
            <div className="mt-4 grid border-y border-[rgba(0,0,0,0.08)] dark:border-[rgba(225,220,201,0.08)] sm:grid-cols-5">
              {[
                ["GPA", profile?.gpa ? profile.gpa.toFixed(2) : "N/A"],
                ["SAT / ACT", profile?.satAct || "N/A"],
                ["Target Major", profile?.intendedMajor || "Exploring"],
                ["Top Match", recommendedColleges[0]?.name || "TBD"],
                ["Applications", applications.length],
              ].map(([label, value]) => (
                <div key={label} className="border-b border-[rgba(0,0,0,0.08)] py-4 sm:border-b-0 sm:border-r sm:px-4 sm:first:pl-0 sm:last:pr-0 sm:last:border-r-0 dark:border-[rgba(225,220,201,0.08)]">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8B8B8B] dark:text-[rgba(225,220,201,0.45)]">{label}</p>
                  <p className="mt-2 truncate font-number text-xl font-semibold text-[#111111] dark:text-[#F5F2EA]" title={String(value)}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-heading text-2xl font-bold">Recommended Actions</h2>
            <div className="mt-3 divide-y divide-[rgba(0,0,0,0.08)] border-y border-[rgba(0,0,0,0.08)] dark:divide-[rgba(225,220,201,0.08)] dark:border-[rgba(225,220,201,0.08)]">
              {nextActions.map((action) => (
                <Link key={action.id} to={action.to} className="group flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8B8B8B] dark:text-[rgba(225,220,201,0.45)]">{action.type}</p>
                    <p className="mt-1 font-heading text-lg font-bold text-[#111111] dark:text-[#F5F2EA]">{action.title}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 text-sm font-semibold text-[#4C43CD] dark:text-[#E1DCC9]">
                    <span>{action.due}</span>
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-heading text-2xl font-bold">Career Matches & Strategic Rationale</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {recommendedCareers.map((career) => (
                <div key={career.id} className="rounded-xl border border-[rgba(0,0,0,0.08)] bg-[#FBFAF2] p-5 dark:border-[rgba(225,220,201,0.08)] dark:bg-[#111111]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8B8B8B] dark:text-[rgba(225,220,201,0.45)]">Career Match</p>
                      <h3 className="mt-1 font-heading text-lg font-bold text-[#111111] dark:text-[#F5F2EA]">{career.title}</h3>
                    </div>
                    <Badge tone="emerald">High Match</Badge>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[#5A5A5A] dark:text-[rgba(225,220,201,0.68)]">{career.description}</p>
                  <p className="mt-4 border-t border-[rgba(0,0,0,0.08)] pt-4 text-xs font-medium leading-relaxed text-[#5A5A5A] dark:border-[rgba(225,220,201,0.08)] dark:text-[rgba(225,220,201,0.72)]">
                    {career.matchExplanation || "Matches your academic preferences and industry interests."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-[rgba(0,0,0,0.08)] bg-[#FBFAF2] p-5 dark:border-[rgba(225,220,201,0.08)] dark:bg-[#111111]">
            <h2 className="font-heading text-xl font-bold">Upcoming Deadlines</h2>
            <div className="mt-4 divide-y divide-[rgba(0,0,0,0.08)] dark:divide-[rgba(225,220,201,0.08)]">
              {upcomingDeadlines.length === 0 ? (
                <p className="py-6 text-sm text-[#8B8B8B] dark:text-[rgba(225,220,201,0.5)]">No active application deadlines.</p>
              ) : upcomingDeadlines.map((dead) => (
                <div key={dead.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#111111] dark:text-[#F5F2EA]">{dead.collegeName}</p>
                    <p className="text-xs text-[#8B8B8B] dark:text-[rgba(225,220,201,0.5)]">{dead.deadlineDate} / {dead.status}</p>
                  </div>
                  <Badge tone={dead.daysLeft <= 7 ? "rose" : "slate"}>{dead.daysLeft < 0 ? "Overdue" : `${dead.daysLeft}d`}</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[rgba(0,0,0,0.08)] bg-[#FBFAF2] p-5 dark:border-[rgba(225,220,201,0.08)] dark:bg-[#111111]">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold">College ROI Insights</h2>
              <BarChart3 className="text-[#8B8B8B] dark:text-[rgba(225,220,201,0.5)]" size={16} />
            </div>
            <div className="mt-4 h-48 w-full font-number text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 4, left: -26, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(0,0,0,0.08)" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#8B8B8B" />
                  <YAxis tickLine={false} axisLine={false} stroke="#8B8B8B" />
                  <Tooltip contentStyle={{ background: "#FBFAF2", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", color: "#111111", fontFamily: "Inter" }} />
                  <Bar dataKey="Tuition" fill="#D4A017" name="Tuition Cost" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Salary" fill="#4CAF50" name="Starting Salary" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
