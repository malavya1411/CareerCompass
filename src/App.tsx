import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { collection, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { BarChart3, BookOpen, BriefcaseBusiness, CalendarClock, Check, Compass, GraduationCap, Heart, LayoutDashboard, ListChecks, LogOut, MapPin, Plus, Search, SlidersHorizontal, User, X } from "lucide-react";
import { db, firebaseReady } from "./lib/firebase";
import { careerSeeds, collegeSeeds, seedDataIfNeeded } from "./lib/seedData";
import type { Application, AppStatus, Career, College, StudentProfile } from "./lib/types";
import { categories, cn, daysUntil, formatMoney, growthScore, initials, majorOverlap, profileIncomplete, statuses, calculateFitScore } from "./lib/utils";
import { useAuth } from "./state/AuthContext";
import { useCompare } from "./state/CompareContext";
import { Badge, Button, Card, Field, Input, Progress, Select, Separator } from "./components/ui";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/careers", label: "Careers", icon: BriefcaseBusiness },
  { to: "/colleges", label: "Colleges", icon: GraduationCap },
  { to: "/compare", label: "Compare", icon: BarChart3 },
  { to: "/tracker", label: "Tracker", icon: ListChecks },
  { to: "/profile", label: "Profile", icon: User },
];

function useCatalog() {
  const [careers, setCareers] = useState<Career[]>(careerSeeds);
  const [colleges, setColleges] = useState<College[]>(collegeSeeds);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!firebaseReady) return;
    setLoading(true);
    seedDataIfNeeded().finally(() => setLoading(false));
    const offCareers = onSnapshot(collection(db, "careers"), (snap) => {
      if (!snap.empty) setCareers(snap.docs.map((d) => d.data() as Career));
    });
    const offColleges = onSnapshot(collection(db, "colleges"), (snap) => {
      if (!snap.empty) setColleges(snap.docs.map((d) => d.data() as College));
    });
    return () => {
      offCareers();
      offColleges();
    };
  }, []);

  return { careers, colleges, loading };
}

function useApplications(userId?: string) {
  const { isDemo, applications: demoApplications } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isDemo) {
      setApplications(demoApplications);
      return;
    }
    if (!firebaseReady || !userId) return;
    setLoading(true);
    return onSnapshot(query(collection(db, "applications"), where("userId", "==", userId)), (snap) => {
      setApplications(snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          userId: data.userId,
          collegeId: data.collegeId,
          status: data.status,
          deadline: data.deadline?.toDate ? data.deadline.toDate() : new Date(data.deadline),
          notes: data.notes || "",
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        } as Application;
      }));
      setLoading(false);
    });
  }, [userId, isDemo, demoApplications]);

  return { applications, loading };
}

function Shell({ children }: { children: React.ReactNode }) {
  const { logout, profile, isDemo } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-800 bg-[#0f172a] p-5 md:block text-slate-300">
        <Link to="/" className="flex items-center gap-3 text-xl font-extrabold text-white tracking-tight">
          <span className="grid size-10 place-items-center rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20"><Compass size={22} /></span>
          CareerCompass
        </Link>
        <nav className="mt-8 grid gap-1">
          {navItems.map((item) => <NavItem key={item.to} {...item} />)}
        </nav>
        <div className="absolute bottom-5 left-5 right-5">
          <div className={cn("rounded-xl p-3.5 text-sm border transition-all duration-200", isDemo ? "bg-slate-900/50 border-blue-500/20" : "bg-slate-900/30 border-slate-800")}>
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold text-white truncate">{profile?.displayName || "Student"}</p>
              {isDemo && <Badge tone="blue" className="text-[9px] py-0 px-1 border-blue-400/30 bg-blue-500/10 text-blue-400 font-extrabold uppercase tracking-wide">Demo</Badge>}
            </div>
            <p className="truncate text-slate-400 text-xs mt-1">{profile?.email}</p>
          </div>
          <Button variant="ghost" className="mt-3 w-full justify-start text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/10" onClick={logout}><LogOut size={17} /> {isDemo ? "Exit Demo" : "Sign out"}</Button>
        </div>
      </aside>
      <main className="mx-auto max-w-7xl px-4 py-6 md:ml-64 md:px-8">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 z-20 grid h-16 grid-cols-6 border-t border-slate-200 bg-white md:hidden">
        {navItems.map((item) => <MobileNavItem key={item.to} {...item} />)}
      </nav>
    </div>
  );
}

function NavItem({ to, label, icon: Icon }: { to: string; label: string; icon: React.ElementType }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/10"
            : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
        )
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  );
}

function MobileNavItem({ to, label, icon: Icon }: { to: string; label: string; icon: React.ElementType }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "grid place-items-center text-[10px] font-medium transition-all duration-150 py-1.5",
          isActive ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-800"
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={20} className={cn("transition-transform duration-200", isActive && "scale-110")} />
          <span className="mt-0.5">{label}</span>
        </>
      )}
    </NavLink>
  );
}

function App() {
  const auth = useAuth();
  if (auth.loading) return <LoadingScreen />;
  if (!auth.user) return <AuthPage />;
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/careers" element={<CareerExplorer />} />
        <Route path="/careers/:id" element={<CareerDetails />} />
        <Route path="/colleges" element={<CollegeExplorer />} />
        <Route path="/colleges/:id" element={<CollegeDetails />} />
        <Route path="/compare" element={<Comparison />} />
        <Route path="/tracker" element={<Tracker />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Shell>
  );
}

function LoadingScreen() {
  return <div className="grid min-h-screen place-items-center bg-slate-50"><div className="grid gap-4 text-center"><div className="mx-auto grid size-14 place-items-center rounded-lg bg-blue-700 text-white"><Compass /></div><p className="font-semibold text-slate-600">Loading CareerCompass</p></div></div>;
}

function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, register, authError, startDemo } = useAuth();
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    try {
      if (mode === "register") {
        await register(email, password, name);
        navigate("/profile");
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-2xl font-bold"><span className="grid size-12 place-items-center rounded-lg bg-blue-700 text-white"><Compass /></span>CareerCompass</div>
          <h1 className="max-w-2xl text-4xl font-bold tracking-normal text-slate-950 md:text-6xl">Plan careers, colleges, and applications in one focused workspace.</h1>
          <p className="max-w-xl text-lg text-slate-600">Explore realistic paths, save colleges, compare options, and keep deadlines visible from the first demo click.</p>
          <div className="grid max-w-xl grid-cols-3 gap-3">
            {["Careers", "Colleges", "Tracker"].map((item) => <Card key={item} className="p-4"><p className="text-2xl font-bold text-blue-700">✓</p><p className="font-semibold">{item}</p></Card>)}
          </div>
        </section>
        <Card className="p-6">
          <div className="mb-6 grid grid-cols-2 rounded-md bg-slate-100 p-1">
            <button className={cn("rounded-md py-2 text-sm font-semibold", mode === "login" && "bg-white shadow-sm")} onClick={() => setMode("login")}>Login</button>
            <button className={cn("rounded-md py-2 text-sm font-semibold", mode === "register" && "bg-white shadow-sm")} onClick={() => setMode("register")}>Register</button>
          </div>
          <form className="grid gap-4" onSubmit={submit}>
            {mode === "register" && <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} required /></Field>}
            <Field label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
            <Field label="Password"><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></Field>
            {(error || authError) && <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">{error || authError}</p>}
            {!firebaseReady && (
              <div className="rounded-md bg-blue-50/80 p-3.5 border border-blue-100 text-sm text-blue-900">
                <p className="font-semibold mb-1">Firebase is currently running with mock values.</p>
                <p className="text-xs text-blue-700/90 leading-relaxed mb-2.5">
                  Add real keys in <code>src/lib/firebase.ts</code> or a Vite <code>.env</code> file to enable email auth and persistent cloud databases.
                </p>
                <Button 
                  type="button" 
                  variant="primary" 
                  className="w-full h-9 bg-blue-700 hover:bg-blue-800 text-xs font-bold text-white shadow-sm transition-all"
                  onClick={startDemo}
                >
                  Quick Start: Explore Demo Mode
                </Button>
              </div>
            )}
            {firebaseReady && <Button type="submit">{mode === "register" ? "Create account" : "Sign in"}</Button>}
          </form>
          {firebaseReady && (
            <>
              <div className="my-4 flex items-center justify-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Or</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full border-blue-200 bg-blue-50/50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                onClick={startDemo}
              >
                Explore Demo Mode (No Login)
              </Button>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user, profile } = useAuth();
  const { careers, colleges } = useCatalog();
  const { applications } = useApplications(user?.uid);
  const saved = profile?.savedColleges || [];
  const recommendedCareers = useMemo(() => careers
    .filter((career) => !profile || profile.careerInterests.includes(career.category) || career.relatedMajors.some((m) => profile.intendedMajor.toLowerCase().includes(m.toLowerCase()) || m.toLowerCase().includes(profile.intendedMajor.toLowerCase())))
    .sort((a, b) => growthScore(b.growthOutlook) - growthScore(a.growthOutlook)).slice(0, 3), [careers, profile]);
  const recommendedColleges = useMemo(() => colleges
    .filter((college) => college.state.toLowerCase() === profile?.location.toLowerCase() || majorOverlap(profile, college) > 0)
    .sort((a, b) => b.acceptanceRate - a.acceptanceRate).slice(0, 3), [colleges, profile]);
  const upcoming = applications.sort((a, b) => a.deadline.getTime() - b.deadline.getTime()).slice(0, 3);
  const dueThisWeek = applications.filter((app) => daysUntil(app.deadline) <= 7 && daysUntil(app.deadline) >= 0).length;

  return (
    <Page title={`Welcome back, ${profile?.displayName || "Student"}`} subtitle="Your college and career plan is ready to move.">
      {profileIncomplete(profile) && <Banner to="/profile" text="Complete your profile to get personalized recommendations." />}
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Saved Colleges" value={saved.length} icon={Heart} />
        <Stat label="Active Applications" value={applications.length} icon={ListChecks} />
        <Stat label="Upcoming This Week" value={dueThisWeek} icon={CalendarClock} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Section title="Recommended Careers" cta="/careers">
          <CardGrid items={recommendedCareers.length ? recommendedCareers : careers.slice(0, 3)} render={(career) => <CareerCard career={career} />} />
        </Section>
        <Section title="Recommended Colleges" cta="/colleges">
          <CardGrid items={recommendedColleges.length ? recommendedColleges : colleges.slice(0, 3)} render={(college) => <CollegeCard college={college} />} />
        </Section>
      </div>
      <Section title="Upcoming Deadlines" cta="/tracker">
        {upcoming.length ? <div className="grid gap-3">{upcoming.map((app) => <DeadlineRow key={app.id} app={app} college={colleges.find((c) => c.id === app.collegeId)} />)}</div> : <Empty icon={CalendarClock} title="No deadlines yet" action="Add a college to the tracker" to="/colleges" />}
      </Section>
    </Page>
  );
}

function CareerExplorer() {
  const { careers } = useCatalog();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const filtered = careers.filter((career) => (category === "All" || career.category === category) && `${career.title} ${career.description}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <Page title="Career Explorer" subtitle="Search career paths and map them to majors and colleges.">
      <Toolbar>
        <div className="relative flex-1"><Search className="absolute left-3 top-2.5 text-slate-400" size={18} /><Input className="pl-10" placeholder="Search careers" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      </Toolbar>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["All", ...categories].map((cat) => <Button key={cat} variant={category === cat ? "primary" : "outline"} onClick={() => setCategory(cat)}>{cat}</Button>)}
      </div>
      <CardGrid items={filtered} render={(career) => <CareerCard career={career} />} />
    </Page>
  );
}

function CareerDetails() {
  const { id } = useParams();
  const { profile, saveProfile } = useAuth();
  const { careers, colleges } = useCatalog();
  const career = careers.find((item) => item.id === id);
  if (!career) return <Missing label="career" />;
  const related = colleges.filter((college) => college.majors.some((major) => career.relatedMajors.includes(major))).slice(0, 6);
  const saved = profile?.careerInterests.includes(career.category);
  return (
    <Page title={career.title} subtitle={career.description}>
      <Card className="grid gap-5 p-5">
        <div className="flex flex-wrap gap-2"><Badge tone="blue">{career.category}</Badge><GrowthBadge value={career.growthOutlook} /><Badge>{career.educationLevel}</Badge></div>
        <div className="grid gap-4 md:grid-cols-3"><Stat label="Salary Range" value={career.salaryRange} icon={BriefcaseBusiness} /><Stat label="Skills" value={career.skills.length} icon={Check} /><Stat label="Majors" value={career.relatedMajors.length} icon={BookOpen} /></div>
        <BadgeList title="Core Skills" items={career.skills} />
        <BadgeList title="Recommended Majors" items={career.relatedMajors} />
        <Button className="w-fit" onClick={() => saveProfile({ careerInterests: Array.from(new Set([...(profile?.careerInterests || []), career.category])) })}>{saved ? "Saved to Interests" : "Save to Interests"}</Button>
      </Card>
      <Section title="Colleges Offering These Programs">
        <CardGrid items={related} render={(college) => <CollegeCard college={college} />} />
      </Section>
    </Page>
  );
}

function CollegeExplorer() {
  const { profile } = useAuth();
  const { colleges } = useCatalog();
  const [search, setSearch] = useState("");
  const [state, setState] = useState("All");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [maxAcceptanceRate, setMaxAcceptanceRate] = useState<number>(100);
  const [maxCost, setMaxCost] = useState<number>(1500000);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("Fit Score");

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const states = Array.from(new Set(colleges.map((c) => c.state))).sort();

  const filtered = colleges.filter((college) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || 
      college.name.toLowerCase().includes(q) ||
      college.city.toLowerCase().includes(q) ||
      college.state.toLowerCase().includes(q) ||
      college.majors.some(m => m.toLowerCase().includes(q));

    const matchesState = state === "All" || college.state === state;
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(college.type);
    const matchesAcceptance = college.acceptanceRate <= maxAcceptanceRate;
    const matchesCost = college.tuition <= maxCost;

    const sizeCategory = college.enrollment < 5000 ? "Small" : college.enrollment <= 15000 ? "Medium" : "Large";
    const matchesSize = selectedSizes.length === 0 || selectedSizes.includes(sizeCategory);

    return matchesSearch && matchesState && matchesType && matchesAcceptance && matchesCost && matchesSize;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "Fit Score") {
      return calculateFitScore(profile, b) - calculateFitScore(profile, a);
    }
    if (sortBy === "Acceptance Rate") {
      return a.acceptanceRate - b.acceptanceRate;
    }
    if (sortBy === "Cost") {
      return a.tuition - b.tuition;
    }
    if (sortBy === "Name") {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  const clearFilters = () => {
    setSearch("");
    setState("All");
    setSelectedTypes([]);
    setMaxAcceptanceRate(100);
    setMaxCost(1500000);
    setSelectedSizes([]);
    setSortBy("Fit Score");
  };

  return (
    <Page title="College Explorer" subtitle="Browse, save, compare, and add schools to your application tracker.">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="p-5 h-fit space-y-6 bg-white border border-slate-200/60 shadow-sm rounded-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 flex items-center gap-2 text-base">
              <SlidersHorizontal size={18} /> Filters
            </h2>
            <button 
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
              onClick={clearFilters}
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location (State)</label>
            <Select value={state} onChange={(e) => setState(e.target.value)}>
              <option value="All">All States</option>
              {states.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">College Type</label>
            <div className="space-y-2">
              {["Public", "Private"].map((t) => (
                <label key={t} className="flex items-center gap-2 text-sm text-slate-600 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(t)}
                    onChange={() => toggleType(t)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Acceptance Rate</span>
              <span className="text-blue-600 font-bold">≤ {maxAcceptanceRate}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              step="1" 
              value={maxAcceptanceRate} 
              onChange={(e) => setMaxAcceptanceRate(Number(e.target.value))} 
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Max Annual Cost</span>
              <span className="text-blue-600 font-bold">{formatMoney(maxCost)}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1500000" 
              step="25000" 
              value={maxCost} 
              onChange={(e) => setMaxCost(Number(e.target.value))} 
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Campus Size</label>
            <div className="space-y-2">
              {[
                { name: "Small", label: "Small (< 5k)" },
                { name: "Medium", label: "Medium (5k - 15k)" },
                { name: "Large", label: "Large (> 15k)" }
              ].map((sz) => (
                <label key={sz.name} className="flex items-center gap-2 text-sm text-slate-600 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSizes.includes(sz.name)}
                    onChange={() => toggleSize(sz.name)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  {sz.label}
                </label>
              ))}
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <Input 
                className="pl-10 h-10 border-slate-200/80 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                placeholder="Search colleges by name, location, or major" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
              {search && (
                <button 
                  type="button"
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  onClick={() => setSearch("")}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 min-w-48">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Sort By</label>
              <Select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 border-slate-200/80 bg-white"
              >
                <option value="Fit Score">Fit Match Score</option>
                <option value="Acceptance Rate">Acceptance Rate</option>
                <option value="Cost">Cost (Low to High)</option>
                <option value="Name">Name</option>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wide px-1">
            <span>Found {sorted.length} colleges</span>
          </div>

          {sorted.length > 0 ? (
            <CardGrid items={sorted} render={(college) => <CollegeCard college={college} />} />
          ) : (
            <Card className="grid place-items-center gap-4 p-12 text-center border-dashed border-2 border-slate-200 bg-slate-50/20">
              <span className="grid size-14 place-items-center rounded-lg bg-slate-100 text-slate-400">
                <Search size={24} />
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-800">No colleges match your filters</h3>
                <p className="text-sm text-slate-500 mt-1">Try relaxing your cost limits or checking different locations.</p>
              </div>
              <Button onClick={clearFilters}>Reset Filters</Button>
            </Card>
          )}
        </div>
      </div>
    </Page>
  );
}

function CollegeDetails() {
  const { id } = useParams();
  const { user, profile, saveProfile } = useAuth();
  const { careers, colleges } = useCatalog();
  const { compareIds, toggleCompare } = useCompare();
  const college = colleges.find((item) => item.id === id);
  const navigate = useNavigate();
  if (!college) return <Missing label="college" />;
  const saved = profile?.savedColleges?.includes(college.id);
  const relatedCareers = careers.filter((career) => career.relatedMajors.some((major) => college.majors.includes(major))).slice(0, 4);

  const { addApplication } = useAuth();

  async function addToTracker() {
    try {
      await addApplication(college!.id);
      navigate("/tracker");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add application");
    }
  }

  return (
    <Page title={college.name} subtitle={`${college.city}, ${college.state} • ${college.type}`}>
      <Card className="grid gap-5 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <CollegeMark college={college} />
          <Button variant={saved ? "primary" : "outline"} onClick={() => toggleSaved(profile, saveProfile, college.id)}><Heart size={17} />{saved ? "Saved" : "Save"}</Button>
          <Button variant={compareIds.includes(college.id) ? "primary" : "outline"} onClick={() => toggleCompare(college.id)}><BarChart3 size={17} />Compare</Button>
          <Button onClick={addToTracker}><Plus size={17} />Add to Tracker</Button>
        </div>
        <div className="grid gap-4 md:grid-cols-4"><Stat label="Tuition" value={formatMoney(college.tuition)} icon={GraduationCap} /><Stat label="Acceptance" value={`${college.acceptanceRate}%`} icon={SlidersHorizontal} /><Stat label="Enrollment" value={college.enrollment.toLocaleString()} icon={User} /><Stat label="Type" value={college.type} icon={MapPin} /></div>
        <p className="text-slate-600">{college.description}</p>
        <BadgeList title="Available Majors" items={college.majors} />
      </Card>
      <Section title="Popular Careers for Graduates">
        <CardGrid items={relatedCareers} render={(career) => <CareerCard career={career} />} />
      </Section>
    </Page>
  );
}

function Comparison() {
  const { colleges } = useCatalog();
  const { compareIds, clearCompare } = useCompare();
  const selected = colleges.filter((college) => compareIds.includes(college.id));
  if (selected.length < 2) return <Page title="College Comparison" subtitle="Compare up to four saved schools side-by-side."><Empty icon={BarChart3} title="Choose at least two colleges" action="Browse colleges" to="/colleges" /></Page>;
  const rows = [
    ["Tuition", (c: College) => formatMoney(c.tuition)],
    ["Acceptance Rate", (c: College) => `${c.acceptanceRate}%`],
    ["Enrollment", (c: College) => c.enrollment.toLocaleString()],
    ["Type", (c: College) => c.type],
    ["Majors", (c: College) => c.majors.join(", ")],
  ];
  return (
    <Page title="College Comparison" subtitle={`${selected.length} of 4 colleges selected.`}>
      <Button variant="outline" className="w-fit" onClick={clearCompare}><X size={17} />Clear comparison</Button>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead><tr className="border-b bg-slate-50"><th className="p-4">Metric</th>{selected.map((c) => <th className="p-4" key={c.id}>{c.name}</th>)}</tr></thead>
          <tbody>{rows.map(([label, get]) => <tr className="border-b last:border-0" key={label as string}><td className="p-4 font-semibold">{label as string}</td>{selected.map((college) => <td className="max-w-72 p-4 align-top text-slate-600" key={college.id}>{(get as (c: College) => string)(college)}</td>)}</tr>)}</tbody>
        </table>
      </Card>
    </Page>
  );
}

function Tracker() {
  const { user, isDemo } = useAuth();
  const { colleges } = useCatalog();
  const { applications } = useApplications(user?.uid);
  const [editing, setEditing] = useState<Application | null>(null);
  return (
    <Page title="Application Tracker" subtitle="Follow each school from research through decisions.">
      {(!firebaseReady && !isDemo) && <Banner text="Firebase config is required for real-time tracker updates." />}
      {isDemo && <div className="mb-4 rounded-lg bg-blue-50/50 border border-blue-100 p-3.5 text-xs text-blue-800 font-medium">✨ Demo Mode Active: Your application tracker is simulated locally in browser memory.</div>}
      {applications.length ? <div className="grid gap-4 xl:grid-cols-5">{statuses.map((status) => <TrackerColumn key={status} status={status} apps={applications.filter((app) => app.status === status)} colleges={colleges} onEdit={setEditing} />)}</div> : <Empty icon={ListChecks} title="Your tracker is empty" action="Add colleges from discovery" to="/colleges" />}
      {editing && <EditApplication app={editing} college={colleges.find((c) => c.id === editing.collegeId)} onClose={() => setEditing(null)} />}
    </Page>
  );
}

function Profile() {
  const { profile, saveProfile } = useAuth();
  const [form, setForm] = useState<StudentProfile>(profile || { displayName: "", email: "", grade: "", gpa: 0, location: "", satAct: "", intendedMajor: "", interests: [], careerInterests: [], activities: [], savedColleges: [] });
  const [saved, setSaved] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await saveProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }
  function updateList(key: "interests" | "activities", value: string) {
    setForm({ ...form, [key]: value.split(",").map((x) => x.trim()).filter(Boolean) });
  }
  return (
    <Page title="Student Profile" subtitle="Personalize recommendations with your goals and interests.">
      <Card className="p-5">
        <form className="grid gap-5 md:grid-cols-2" onSubmit={submit}>
          <Field label="Name"><Input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} required /></Field>
          <Field label="Grade"><Select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} required><option value="">Select grade</option><option>9</option><option>10</option><option>11</option><option>12</option></Select></Field>
          <Field label="GPA"><Input type="number" min="0" max="5" step="0.01" value={form.gpa || ""} onChange={(e) => setForm({ ...form, gpa: Number(e.target.value) })} required /></Field>
          <Field label="State / Location"><Input placeholder="CA" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value.toUpperCase().slice(0, 2) })} required /></Field>
          <Field label="SAT / ACT"><Input value={form.satAct} onChange={(e) => setForm({ ...form, satAct: e.target.value })} /></Field>
          <Field label="Intended Major"><Input value={form.intendedMajor} onChange={(e) => setForm({ ...form, intendedMajor: e.target.value })} required /></Field>
          <Field label="Activities, comma-separated"><Input value={form.activities.join(", ")} onChange={(e) => updateList("activities", e.target.value)} /></Field>
          <Field label="Academic Interests, comma-separated"><Input value={form.interests.join(", ")} onChange={(e) => updateList("interests", e.target.value)} /></Field>
          <div className="md:col-span-2">
            <p className="mb-2 text-sm font-medium text-slate-700">Career Interests</p>
            <div className="flex flex-wrap gap-2">{categories.map((cat) => <Button key={cat} type="button" variant={form.careerInterests.includes(cat) ? "primary" : "outline"} onClick={() => setForm({ ...form, careerInterests: toggle(form.careerInterests, cat) })}>{cat}</Button>)}</div>
          </div>
          <div className="flex items-center gap-3 md:col-span-2"><Button type="submit">Save profile</Button>{saved && <Badge tone="emerald">Saved successfully</Badge>}</div>
        </form>
      </Card>
    </Page>
  );
}

function CareerCard({ career }: { career: Career }) {
  return (
    <Link to={`/careers/${career.id}`}>
      <Card className={cn("grid h-full gap-3 p-5 card-hover border-l-4", 
        career.category === "STEM" && "border-l-blue-500",
        career.category === "Business" && "border-l-violet-500",
        career.category === "Healthcare" && "border-l-emerald-500",
        career.category === "Arts" && "border-l-pink-500",
        career.category === "Education" && "border-l-amber-500",
        career.category === "Law" && "border-l-slate-400"
      )}>
        <div className="flex items-start justify-between gap-3">
          <span className={cn("grid size-9 place-items-center rounded-lg text-white",
            career.category === "STEM" && "bg-blue-500/10 text-blue-600",
            career.category === "Business" && "bg-violet-500/10 text-violet-600",
            career.category === "Healthcare" && "bg-emerald-500/10 text-emerald-600",
            career.category === "Arts" && "bg-pink-500/10 text-pink-600",
            career.category === "Education" && "bg-amber-500/10 text-amber-600",
            career.category === "Law" && "bg-slate-500/10 text-slate-600"
          )}><BriefcaseBusiness size={18} /></span>
          <GrowthBadge value={career.growthOutlook} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mt-1">{career.title}</h3>
        <p className="line-clamp-2 text-sm text-slate-500 leading-relaxed">{career.description}</p>
        <Separator />
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge>{career.salaryRange}</Badge>
          <Badge tone="blue">{career.educationLevel}</Badge>
        </div>
      </Card>
    </Link>
  );
}

function CollegeCard({ college }: { college: College }) {
  const { profile, saveProfile } = useAuth();
  const saved = profile?.savedColleges?.includes(college.id);
  const fitScore = calculateFitScore(profile, college);
  const navigate = useNavigate();

  let fitBadgeClass = "";
  if (fitScore >= 80) {
    fitBadgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200/60";
  } else if (fitScore >= 60) {
    fitBadgeClass = "bg-amber-50 text-amber-700 border-amber-200/60";
  } else {
    fitBadgeClass = "bg-rose-50 text-rose-700 border-rose-200/60";
  }

  return (
    <Card className="flex flex-col justify-between h-full p-5 card-hover relative overflow-hidden bg-white border border-slate-100">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-lg bg-gradient-to-br from-blue-700 to-indigo-600 font-extrabold text-white text-sm shadow-sm">
              {initials(college.name)}
            </span>
            <div className="max-w-[170px]">
              <h3 className="font-extrabold text-slate-800 leading-snug hover:text-blue-600 transition-colors truncate" title={college.name}>
                <Link to={`/colleges/${college.id}`}>{college.name}</Link>
              </h3>
              <p className="text-xs text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                <MapPin size={12} /> {college.city}, {college.state}
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            className="size-9 p-0 rounded-full hover:bg-rose-50"
            title={saved ? "Saved" : "Save College"}
            onClick={() => toggleSaved(profile, saveProfile, college.id)}
          >
            <Heart size={18} className={cn("transition-all duration-200", saved ? "fill-rose-500 text-rose-500 scale-110" : "text-slate-400")} />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1", fitBadgeClass)}>
            🎯 {fitScore}% Match
          </span>
          <Badge tone="blue" className="text-[9px] font-bold py-0.5">{college.type}</Badge>
          <Badge tone="slate" className="text-[9px] font-bold py-0.5">{college.acceptanceRate}% Acc.</Badge>
        </div>

        <div className="pt-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Avg Cost / Year</p>
          <p className="text-base font-extrabold text-slate-900 mt-0.5">{formatMoney(college.tuition)}</p>
        </div>

        <div className="pt-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Top Majors</p>
          <div className="flex flex-wrap gap-1">
            {college.majors.slice(0, 3).map((major) => (
              <Badge key={major} tone="slate" className="text-[9px] py-0 px-1.5 border-slate-200 bg-slate-50 text-slate-600 font-bold">
                {major}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-5 pt-3.5 border-t border-slate-100">
        <Button 
          variant="outline" 
          className="text-xs font-bold py-1.5 hover:bg-slate-50 border-slate-200 text-slate-700 h-9"
          onClick={() => navigate(`/colleges/${college.id}`)}
        >
          View Details
        </Button>
        <Button
          variant={saved ? "primary" : "outline"}
          className={cn("text-xs font-bold py-1.5 transition-all duration-200 h-9", saved ? "bg-rose-600 border-rose-600 text-white hover:bg-rose-700" : "border-slate-200 hover:bg-slate-50")}
          onClick={() => toggleSaved(profile, saveProfile, college.id)}
        >
          {saved ? "Saved" : "Save"}
        </Button>
      </div>
    </Card>
  );
}

function EditApplication({ app, college, onClose }: { app: Application; college?: College; onClose: () => void }) {
  const { updateApplication, deleteApplication } = useAuth();
  const [status, setStatus] = useState<AppStatus>(app.status);
  const [deadline, setDeadline] = useState(app.deadline.toISOString().slice(0, 10));
  const [notes, setNotes] = useState(app.notes);
  async function save() {
    try {
      await updateApplication(app.id, { status, deadline: new Date(deadline), notes });
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save changes");
    }
  }
  async function remove() {
    try {
      await deleteApplication(app.id);
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete application");
    }
  }
  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-slate-950/40 p-4">
      <Card className="w-full max-w-lg p-5">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">{college?.name || "Application"}</h2><Button variant="ghost" className="size-9 p-0" onClick={onClose}><X size={18} /></Button></div>
        <div className="grid gap-4"><Field label="Status"><Select value={status} onChange={(e) => setStatus(e.target.value as AppStatus)}>{statuses.map((s) => <option key={s}>{s}</option>)}</Select></Field><Field label="Deadline"><Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></Field><Field label="Notes"><Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Essay draft, financial aid, visit notes" /></Field><div className="flex justify-between"><Button variant="danger" onClick={remove}>Delete</Button><Button onClick={save}>Save changes</Button></div></div>
      </Card>
    </div>
  );
}

function TrackerColumn({ status, apps, colleges, onEdit }: { status: AppStatus; apps: Application[]; colleges: College[]; onEdit: (app: Application) => void }) {
  const bgClass = cn(
    "p-4 min-h-[300px] border border-slate-200/50 rounded-2xl transition-all",
    status === "Researching" && "bg-slate-50/60",
    status === "Interested" && "bg-blue-50/10 border-blue-100/30",
    status === "Applying" && "bg-purple-50/10 border-purple-100/30",
    status === "Submitted" && "bg-amber-50/10 border-amber-100/30",
    status === "Decision Received" && "bg-emerald-50/10 border-emerald-100/30"
  );

  const headerBadgeTone = 
    status === "Researching" ? "slate" :
    status === "Interested" ? "blue" :
    status === "Applying" ? "rose" :
    status === "Submitted" ? "amber" : "emerald";

  return (
    <div className={bgClass}>
      <div className="mb-4 flex items-center justify-between px-1">
        <h3 className="font-bold text-slate-800 text-sm tracking-wide">{status}</h3>
        <Badge tone={headerBadgeTone} className="px-2 py-0">{apps.length}</Badge>
      </div>
      <div className="grid gap-3.5">
        {apps.map((app) => {
          const college = colleges.find((c) => c.id === app.collegeId);
          const daysLeft = daysUntil(app.deadline);
          const isOverdue = daysLeft < 0;
          return (
            <button
              key={app.id}
              className="w-full rounded-xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400/70 hover:shadow-md active:scale-[0.99]"
              onClick={() => onEdit(app)}
            >
              <p className="font-bold text-slate-800 text-sm truncate">{college?.name || app.collegeId}</p>
              <p className={cn("text-xs font-semibold mt-1", isOverdue ? "text-rose-600" : daysLeft <= 14 ? "text-amber-600" : "text-slate-400")}>
                {isOverdue ? "Overdue" : `${daysLeft} days remaining`}
              </p>
              {app.notes && (
                <p className="mt-2.5 line-clamp-2 text-xs text-slate-500/95 leading-relaxed border-t border-slate-50 pt-2 font-medium">
                  {app.notes}
                </p>
              )}
            </button>
          );
        })}
        {apps.length === 0 && (
          <div className="border border-dashed border-slate-200/60 rounded-xl py-10 text-center text-xs text-slate-400/80 font-medium bg-slate-50/20">
            No applications
          </div>
        )}
      </div>
    </div>
  );
}

function Page({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-6 animate-fade-in">
      <header className="space-y-1 md:space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 bg-clip-text text-transparent">{title}</h1>
        {subtitle && <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed">{subtitle}</p>}
      </header>
      {children}
    </div>
  );
}

function Section({ title, cta, children }: { title: string; cta?: string; children: React.ReactNode }) {
  return <section className="grid gap-3"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">{title}</h2>{cta && <Link className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" to={cta}>View all</Link>}</div>{children}</section>;
}

function CardGrid<T>({ items, render }: { items: T[]; render: (item: T) => React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{items.map((item, index) => <div key={(item as { id?: string }).id || index}>{render(item)}</div>)}</div>;
}

function Toolbar({ children }: { children: React.ReactNode }) {
  return <Card className="flex flex-col gap-3 p-3 lg:flex-row lg:items-end">{children}</Card>;
}

function Stat({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) {
  return <Card className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></div><span className="grid size-11 place-items-center rounded-lg bg-blue-50 text-blue-700"><Icon size={21} /></span></div></Card>;
}

function GrowthBadge({ value }: { value: Career["growthOutlook"] }) {
  return <Badge tone={value === "High" ? "emerald" : value === "Medium" ? "amber" : "slate"}>{value} growth</Badge>;
}

function BadgeList({ title, items }: { title: string; items: string[] }) {
  return <div><h3 className="mb-2 font-bold">{title}</h3><div className="flex flex-wrap gap-2">{items.map((item) => <Badge key={item} tone="blue">{item}</Badge>)}</div></div>;
}

function CollegeMark({ college }: { college: College }) {
  return <div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-lg bg-gradient-to-br from-blue-700 to-emerald-500 text-sm font-bold text-white">{initials(college.name)}</span><div><p className="font-semibold">{college.city}, {college.state}</p><p className="text-sm text-slate-500">{college.type}</p></div></div>;
}

function DeadlineRow({ app, college }: { app: Application; college?: College }) {
  const days = daysUntil(app.deadline);
  return <Card className="p-4"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><p className="font-bold">{college?.name || app.collegeId}</p><p className="text-sm text-slate-500">{app.status}</p></div><div className="min-w-52"><div className="mb-1 flex justify-between text-sm"><span>{days} days left</span><span>{app.deadline.toLocaleDateString()}</span></div><Progress value={Math.max(5, Math.min(100, 100 - days))} /></div></div></Card>;
}

function Empty({ icon: Icon, title, action, to }: { icon: React.ElementType; title: string; action: string; to: string }) {
  return <Card className="grid place-items-center gap-4 p-10 text-center"><span className="grid size-14 place-items-center rounded-lg bg-slate-100 text-slate-500"><Icon /></span><h3 className="text-lg font-bold">{title}</h3><Button><Link to={to}>{action}</Link></Button></Card>;
}

function Banner({ text, to }: { text: string; to?: string }) {
  return <div className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 md:flex-row md:items-center md:justify-between"><p className="font-medium">{text}</p>{to && <Button><Link to={to}>Complete profile</Link></Button>}</div>;
}

function Missing({ label }: { label: string }) {
  return <Page title={`Missing ${label}`} subtitle="That record was not found."><Button><Link to="/">Back to dashboard</Link></Button></Page>;
}

function toggle<T>(items: T[], item: T) {
  return items.includes(item) ? items.filter((x) => x !== item) : [...items, item];
}

function toggleSaved(profile: StudentProfile | null, saveProfile: (patch: Partial<StudentProfile>) => Promise<void>, collegeId: string) {
  const saved = profile?.savedColleges || [];
  saveProfile({ savedColleges: toggle(saved, collegeId) });
}

export default App;
