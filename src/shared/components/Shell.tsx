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
          "flex items-center justify-between py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-[#1F150C] text-[#FFFFFF] font-semibold border-l-4 border-[#E1DCC9] rounded-r-lg pl-2"
            : "text-[rgba(225,220,201,0.65)] hover:bg-[#1A1A1A] hover:text-[#FFFFFF] border-l-4 border-transparent pl-3"
        )
      }
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className="text-inherit" />
        <span className="font-sans">{label}</span>
      </div>
      {badge !== undefined && (
        <span className="grid size-5 place-items-center rounded-full bg-[#C94A4A] text-[10px] font-extrabold text-white font-number animate-pulse">
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
          isActive ? "text-[#FFFFFF] font-bold bg-[#1F150C]/40" : "text-[rgba(225,220,201,0.65)] hover:text-[#FFFFFF]"
        )
      }
    >
      {({ isActive }) => (
        <>
          <div className="relative">
            <Icon size={20} className={cn("transition-transform duration-200", isActive ? "scale-110 text-[#E1DCC9]" : "text-[rgba(225,220,201,0.65)]")} />
            {badge !== undefined && (
              <span className="absolute -top-1 -right-2 grid h-4 min-w-4 place-items-center rounded-full bg-[#C94A4A] px-1 text-[8px] font-extrabold text-white">
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
    <div className="min-h-screen bg-transparent pb-20 md:pb-0 transition-colors duration-200">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-[rgba(225,220,201,0.08)] bg-[#0A0A0A] p-5 md:block text-[#E1DCC9]">
        <Link to="/" className="flex items-center gap-2.5 text-xl font-heading font-extrabold text-[#F5F2EA] tracking-tight">
          <span className="grid size-9 place-items-center rounded-lg bg-[#412D15] text-[#E1DCC9] border border-[rgba(225,220,201,0.15)] shadow-md shadow-black">
            <Compass size={20} />
          </span>
          CareerCompass
        </Link>

        {/* Academic Progress Widget */}
        <div className="mt-6 border border-[rgba(225,220,201,0.08)] bg-[#1F150C] rounded-xl p-3">
          <div className="flex items-center gap-3">
            <div className="relative size-11 shrink-0">
              <svg className="size-full -rotate-90">
                <circle cx="22" cy="22" r={radius} className="stroke-[rgba(225,220,201,0.08)] fill-none" strokeWidth="2.5" />
                <circle
                  cx="22"
                  cy="22"
                  r={radius}
                  className="stroke-[#E1DCC9] fill-none transition-all duration-500"
                  strokeWidth="2.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-number font-extrabold text-[#E1DCC9]">
                {completionPct}%
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-heading font-extrabold text-[#F5F2EA] text-xs truncate leading-none">{profile?.displayName || "Student"}</p>
              <p className="text-[10px] text-[rgba(225,220,201,0.6)] font-sans font-medium mt-1 leading-none">Grade {profile?.grade || "11"}</p>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-[rgba(225,220,201,0.08)] grid grid-cols-2 gap-2 text-[10px] font-sans font-bold tracking-wider uppercase text-[rgba(225,220,201,0.6)]">
            <div className="min-w-0">
              <span className="block text-[rgba(225,220,201,0.4)] text-[8px] font-sans font-bold tracking-widest uppercase">Target</span>
              <span className="text-[#E1DCC9] truncate block mt-0.5">{profile?.intendedMajor ? profile.intendedMajor.split(" ").slice(0,2).join(" ") : "Explore"}</span>
            </div>
            <div className="min-w-0 border-l border-[rgba(225,220,201,0.08)] pl-2">
              <span className="block text-[rgba(225,220,201,0.4)] text-[8px] font-sans font-bold tracking-widest uppercase">Deadline</span>
              <span className={cn("truncate block mt-0.5", daysToNext !== null && daysToNext <= 7 ? "text-[#C94A4A] font-extrabold urgent-pulse" : "text-[#E1DCC9]")}>
                {daysToNext !== null ? `${daysToNext} days` : "None"}
              </span>
            </div>
          </div>
        </div>

        {/* Grouped Navigation */}
        <div className="mt-6 space-y-4 h-[calc(100vh-270px)] overflow-y-auto pr-1">
          {navigationGroups.map((group) => (
            <div key={group.title} className="space-y-1.5">
              <h4 className="text-[10px] font-bold font-sans text-[rgba(225,220,201,0.4)] uppercase tracking-widest pl-3">
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
          <div className="flex items-center justify-between gap-2 border-t border-[rgba(225,220,201,0.08)] pt-3">
            {isDemo && <Badge tone="blue" className="text-[9px] py-0 px-1 border-[rgba(108,142,255,0.2)] bg-[rgba(108,142,255,0.12)] text-[#6C8EFF] font-extrabold uppercase tracking-wide">Demo</Badge>}
          </div>

          <Button variant="ghost" className="w-full justify-start text-[rgba(225,220,201,0.6)] hover:text-[#C94A4A] hover:bg-[rgba(201,74,74,0.05)] border border-transparent hover:border-[rgba(201,74,74,0.1)] h-9 text-xs" onClick={logout}>
            <LogOut size={16} /> {isDemo ? "Exit Demo" : "Sign out"}
          </Button>
        </div>
      </aside>

      <main className="mx-auto max-w-7xl px-4 py-6 md:ml-64 md:px-8">
        {children}
        <FloatingCompareBar />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 grid h-16 grid-cols-6 border-t border-[rgba(225,220,201,0.08)] bg-[#0A0A0A] md:hidden">
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
