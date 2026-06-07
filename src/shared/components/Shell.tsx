import React from "react";
import { Link, NavLink } from "react-router-dom";
import { 
  Compass, 
  LogOut, 
  LayoutDashboard, 
  BriefcaseBusiness, 
  GraduationCap, 
  BarChart3, 
  ListChecks, 
  User,
  Sun,
  Moon
} from "lucide-react";
import { useAuth } from "../../features/auth";
import { useCompare, FloatingCompareBar } from "../../features/colleges";
import { Button, Badge } from "../ui";
import { cn, daysUntil } from "../utils/utils";
import { useTheme } from "../../app/providers/ThemeContext";

const navigationGroups = [
  {
    title: "Planning",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/careers", label: "Careers", icon: BriefcaseBusiness },
      { to: "/colleges", label: "Colleges", icon: GraduationCap },
    ],
  },
  {
    title: "Decision Making",
    items: [
      { to: "/compare", label: "Compare", icon: BarChart3 },
      { to: "/tracker", label: "Tracker", icon: ListChecks },
    ],
  },
  {
    title: "Account",
    items: [
      { to: "/profile", label: "Profile", icon: User },
    ],
  },
];

const allNavItems = navigationGroups.flatMap((g) => g.items);

export function NavItem({ to, label, icon: Icon, badge }: { to: string; label: string; icon: React.ElementType; badge?: number }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-[#3B5BDB] text-white font-semibold shadow-md shadow-[#3B5BDB]/10"
            : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
        )
      }
    >
      <div className="flex items-center gap-3">
        <Icon size={18} />
        <span className="font-sans">{label}</span>
      </div>
      {badge !== undefined && (
        <span className="grid size-5 place-items-center rounded-full bg-red-500 text-[10px] font-extrabold text-white font-number">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

export function MobileNavItem({ to, label, icon: Icon, badge }: { to: string; label: string; icon: React.ElementType; badge?: number }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "grid place-items-center text-[10px] font-medium transition-all duration-150 py-1.5 relative",
          isActive ? "text-[#3B5BDB] font-bold" : "text-slate-500 hover:text-slate-800"
        )
      }
    >
      {({ isActive }) => (
        <>
          <div className="relative">
            <Icon size={20} className={cn("transition-transform duration-200", isActive && "scale-110")} />
            {badge !== undefined && (
              <span className="absolute -top-1 -right-2 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[8px] font-extrabold text-white">
                {badge}
              </span>
            )}
          </div>
          <span className="mt-0.5 font-sans">{label}</span>
        </>
      )}
    </NavLink>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const { logout, profile, isDemo, applications } = useAuth();
  const { compareIds } = useCompare();
  const { theme, toggleTheme } = useTheme();

  // Dynamic Profile Completion calculation
  const completionPct = React.useMemo(() => {
    if (!profile) return 0;
    let score = 0;
    if (profile.displayName) score += 15;
    if (profile.grade) score += 15;
    if (profile.gpa) score += 15;
    if (profile.location) score += 15;
    if (profile.satAct) score += 15;
    if (profile.intendedMajor) score += 15;
    if (profile.activities && profile.activities.length > 0) score += 5;
    if (profile.interests && profile.interests.length > 0) score += 5;
    return Math.min(100, score);
  }, [profile]);

  // Find next upcoming deadline
  const daysToNext = React.useMemo(() => {
    if (!applications || applications.length === 0) return null;
    const futureApps = applications
      .filter((app) => new Date(app.deadline).getTime() > Date.now())
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    if (futureApps.length === 0) return null;
    return daysUntil(new Date(futureApps[0].deadline));
  }, [applications]);

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPct / 100) * circumference;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] pb-20 md:pb-0 transition-colors duration-200">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 md:block text-slate-700 dark:text-slate-300">
        <Link to="/" className="flex items-center gap-2.5 text-xl font-heading font-extrabold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
          <span className="grid size-9 place-items-center rounded-lg bg-[#3B5BDB] text-white shadow-md shadow-[#3B5BDB]/20">
            <Compass size={20} />
          </span>
          CareerCompass
        </Link>

        {/* Academic Progress Widget */}
        <div className="mt-6 border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl p-3">
          <div className="flex items-center gap-3">
            <div className="relative size-11 shrink-0">
              <svg className="size-full -rotate-90">
                <circle cx="22" cy="22" r={radius} className="stroke-slate-250 dark:stroke-slate-800 fill-none" strokeWidth="2.5" />
                <circle
                  cx="22"
                  cy="22"
                  r={radius}
                  className="stroke-[#3B5BDB] fill-none transition-all duration-500"
                  strokeWidth="2.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-number font-extrabold text-[#3B5BDB] dark:text-blue-400">
                {completionPct}%
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-heading font-extrabold text-slate-900 dark:text-white text-xs truncate leading-none">{profile?.displayName || "Student"}</p>
              <p className="text-[10px] text-slate-400 font-sans font-medium mt-1 leading-none">Grade {profile?.grade || "11"}</p>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/50 grid grid-cols-2 gap-2 text-[10px] font-sans font-bold tracking-wider uppercase text-slate-400">
            <div className="min-w-0">
              <span className="block text-slate-400 dark:text-slate-500 text-[8px] font-sans font-bold tracking-widest uppercase">Target</span>
              <span className="text-slate-800 dark:text-white truncate block mt-0.5">{profile?.intendedMajor ? profile.intendedMajor.split(" ").slice(0,2).join(" ") : "Explore"}</span>
            </div>
            <div className="min-w-0 border-l border-slate-200/60 dark:border-slate-800/50 pl-2">
              <span className="block text-slate-400 dark:text-slate-500 text-[8px] font-sans font-bold tracking-widest uppercase">Deadline</span>
              <span className={cn("truncate block mt-0.5", daysToNext !== null && daysToNext <= 7 ? "text-red-500 font-extrabold urgent-pulse" : "text-slate-800 dark:text-white")}>
                {daysToNext !== null ? `${daysToNext} days` : "None"}
              </span>
            </div>
          </div>
        </div>

        {/* Grouped Navigation */}
        <div className="mt-6 space-y-4 h-[calc(100vh-270px)] overflow-y-auto pr-1">
          {navigationGroups.map((group) => (
            <div key={group.title} className="space-y-1.5">
              <h4 className="text-[10px] font-bold font-sans text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-3">
                {group.title}
              </h4>
              <nav className="grid gap-0.5">
                {group.items.map((item) => (
                  <NavItem 
                    key={item.to} 
                    {...item} 
                    badge={item.to === "/compare" && compareIds.length > 0 ? compareIds.length : undefined} 
                  />
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Sidebar Bottom Actions */}
        <div className="absolute bottom-5 left-5 right-5 space-y-2.5">
          <div className="flex items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-800/80 pt-3">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200"
              title="Toggle theme"
            >
              {theme === "light" ? (
                <>
                  <Moon size={15} />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun size={15} />
                  <span>Light Mode</span>
                </>
              )}
            </button>
            {isDemo && <Badge tone="blue" className="text-[9px] py-0 px-1 border-blue-400/30 bg-blue-500/10 text-[#3B5BDB] dark:text-blue-400 font-extrabold uppercase tracking-wide">Demo</Badge>}
          </div>

          <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-red-500 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 h-9 text-xs" onClick={logout}>
            <LogOut size={16} /> {isDemo ? "Exit Demo" : "Sign out"}
          </Button>
        </div>
      </aside>

      <main className="mx-auto max-w-7xl px-4 py-6 md:ml-64 md:px-8">
        {children}
        <FloatingCompareBar />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 grid h-16 grid-cols-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] md:hidden">
        {allNavItems.map((item) => (
          <MobileNavItem 
            key={item.to} 
            {...item} 
            badge={item.to === "/compare" && compareIds.length > 0 ? compareIds.length : undefined} 
          />
        ))}
      </nav>
    </div>
  );
}
