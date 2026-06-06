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
  User 
} from "lucide-react";
import { useAuth } from "../../features/auth";
import { useCompare, FloatingCompareBar } from "../../features/colleges";
import { Button, Badge } from "../ui";
import { cn } from "../utils/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/careers", label: "Careers", icon: BriefcaseBusiness },
  { to: "/colleges", label: "Colleges", icon: GraduationCap },
  { to: "/compare", label: "Compare", icon: BarChart3 },
  { to: "/tracker", label: "Tracker", icon: ListChecks },
  { to: "/profile", label: "Profile", icon: User },
];

export function NavItem({ to, label, icon: Icon, badge }: { to: string; label: string; icon: React.ElementType; badge?: number }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/10"
            : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
        )
      }
    >
      <div className="flex items-center gap-3">
        <Icon size={18} />
        {label}
      </div>
      {badge !== undefined && (
        <span className="grid size-5 place-items-center rounded-full bg-blue-500 text-[10px] font-extrabold text-white">
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
          isActive ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-800"
        )
      }
    >
      {({ isActive }) => (
        <>
          <div className="relative">
            <Icon size={20} className={cn("transition-transform duration-200", isActive && "scale-110")} />
            {badge !== undefined && (
              <span className="absolute -top-1 -right-2 grid h-4 min-w-4 place-items-center rounded-full bg-blue-500 px-1 text-[8px] font-extrabold text-white">
                {badge}
              </span>
            )}
          </div>
          <span className="mt-0.5">{label}</span>
        </>
      )}
    </NavLink>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const { logout, profile, isDemo } = useAuth();
  const { compareIds } = useCompare();

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-800 bg-[#0f172a] p-5 md:block text-slate-300">
        <Link to="/" className="flex items-center gap-3 text-xl font-extrabold text-white tracking-tight">
          <span className="grid size-10 place-items-center rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
            <Compass size={22} />
          </span>
          CareerCompass
        </Link>
        <nav className="mt-8 grid gap-1">
          {navItems.map((item) => (
            <NavItem 
              key={item.to} 
              {...item} 
              badge={item.to === "/compare" && compareIds.length > 0 ? compareIds.length : undefined} 
            />
          ))}
        </nav>
        <div className="absolute bottom-5 left-5 right-5">
          <div className={cn("rounded-xl p-3.5 text-sm border transition-all duration-200", isDemo ? "bg-slate-900/50 border-blue-500/20" : "bg-slate-900/30 border-slate-800")}>
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold text-white truncate">{profile?.displayName || "Student"}</p>
              {isDemo && <Badge tone="blue" className="text-[9px] py-0 px-1 border-blue-400/30 bg-blue-500/10 text-blue-400 font-extrabold uppercase tracking-wide">Demo</Badge>}
            </div>
            <p className="truncate text-slate-400 text-xs mt-1">{profile?.email}</p>
          </div>
          <Button variant="ghost" className="mt-3 w-full justify-start text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/10" onClick={logout}>
            <LogOut size={17} /> {isDemo ? "Exit Demo" : "Sign out"}
          </Button>
        </div>
      </aside>
      <main className="mx-auto max-w-7xl px-4 py-6 md:ml-64 md:px-8">
        {children}
        <FloatingCompareBar />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-20 grid h-16 grid-cols-6 border-t border-slate-200 bg-white md:hidden">
        {navItems.map((item) => (
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
