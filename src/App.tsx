import { useEffect, useMemo, useState, useRef } from "react";
import { Link, NavLink, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { collection, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { ArrowRight, BarChart3, BookOpen, BriefcaseBusiness, Building2, Calendar, CalendarClock, Check, ChevronRight, Clock, Compass, GraduationCap, Heart, LayoutDashboard, ListChecks, LogOut, MapPin, MessageSquare, Plus, Search, SlidersHorizontal, Trash2, User, X } from "lucide-react";
import { db, firebaseReady } from "./lib/firebase";
import { careerSeeds, collegeSeeds, seedDataIfNeeded } from "./lib/seedData";
import type { Application, AppStatus, Career, College, StudentProfile } from "./lib/types";
import { categories, cn, daysUntil, formatMoney, growthScore, initials, majorOverlap, profileIncomplete, statuses, calculateFitScore } from "./lib/utils";
import { useAuth } from "./state/AuthContext";
import { useCompare } from "./state/CompareContext";
import { Badge, Button, Card, Field, Input, Progress, Select, Separator, Textarea } from "./components/ui";

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
          completeness: data.completeness || 0,
          decisionOutcome: data.decisionOutcome || undefined,
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
  
  if (!auth.user) {
    return (
      <Routes>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    );
  }

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
        <Route path="/signin" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}

function LoadingScreen() {
  return <div className="grid min-h-screen place-items-center bg-slate-50"><div className="grid gap-4 text-center"><div className="mx-auto grid size-14 place-items-center rounded-lg bg-blue-700 text-white"><Compass /></div><p className="font-semibold text-slate-600">Loading CareerCompass</p></div></div>;
}

function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const navigate = useNavigate();

  const faqs = [
    {
      q: "Is CareerCompass free to use?",
      a: "Yes, CareerCompass is completely free. You can use our Demo Mode to explore all features locally in browser memory without signing up, or create a free account to sync and persist your data."
    },
    {
      q: "Do I need a Firebase database setup to run the website?",
      a: "No database setup is required to explore! CareerCompass runs with a simulated memory state by default (Demo Mode). Setting up Firebase is optional and only needed if you want persistent cloud storage across devices."
    },
    {
      q: "How does the Kanban board tracker work?",
      a: "The Kanban board visualizes your applications across 5 stages: Researching, Shortlisted, Applying, Submitted, and Decision. You can easily click 'Move Stage' to advance colleges, track checklist progress, and see color-coded alerts for approaching deadlines."
    },
    {
      q: "Can I track custom colleges not in the catalog?",
      a: "Absolutely! The tracker includes an 'Add College' form where you can choose colleges from our catalog or type a custom college name and select its type (Public or Private) to begin tracking instantly."
    }
  ];

  return (
    <div className="min-h-screen mesh-bg flex flex-col font-sans antialiased text-slate-800">
      {/* Landing Navbar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/70 backdrop-blur-md border-b border-slate-100/80 px-4 py-3">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-lg font-extrabold text-slate-900 select-none">
            <span className="grid size-9 place-items-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/10">
              <Compass size={18} />
            </span>
            <span>CareerCompass</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-500">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#showcase" className="hover:text-slate-900 transition-colors">Live Preview</a>
            <a href="#faqs" className="hover:text-slate-900 transition-colors">FAQs</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => navigate("/signin")} 
              variant="outline"
              className="h-8.5 text-xs font-bold border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="mx-auto max-w-6xl space-y-24">
          
          {/* Hero Section */}
          <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
            
            {/* Left Column: Hero Text */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 bg-blue-50/70 border border-blue-100 rounded-full px-3.5 py-1 text-xs font-extrabold text-blue-700 tracking-wide">
                <span>🚀</span> Redefining College Prep
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.1]">
                Plan careers, discover colleges, & navigate <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">applications.</span>
              </h1>
              <p className="max-w-xl text-base sm:text-lg text-slate-500 leading-relaxed font-medium">
                Ditch the messy spreadsheets. Organize your college journey on an interactive Kanban board with automated checklist metrics, career path exploration, and timeline roadmaps.
              </p>
              <div className="flex flex-wrap gap-4 pt-1">
                <Button 
                  onClick={() => navigate("/signin")}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-1.5"
                >
                  Get Started <ArrowRight size={16} />
                </Button>
              </div>
            </div>

            {/* Right Column: Premium Mock Workspace Graphic */}
            <div className="w-full max-w-md mx-auto aspect-[4/3] rounded-2xl bg-white/40 backdrop-blur-xl border border-white/40 shadow-2xl p-6 overflow-hidden flex flex-col justify-between relative">
              {/* Abstract light circles in bg */}
              <div className="absolute -right-8 -top-8 size-40 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -left-10 -bottom-10 size-40 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none" />

              {/* Header of mock card */}
              <div className="relative flex justify-between items-center pb-4 border-b border-slate-200/50">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-rose-400" />
                  <div className="size-3 rounded-full bg-amber-400" />
                  <div className="size-3 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">Workspace Preview</span>
              </div>

              {/* Content of mock card */}
              <div className="relative flex-grow flex flex-col justify-center gap-4 py-4">
                {/* Floating Widget 1 - Progress widget */}
                <div className="animate-float-1 bg-white/80 backdrop-blur-md p-4 rounded-xl border border-slate-100 shadow-md flex items-center gap-4">
                  <div className="size-12 rounded-full border-4 border-indigo-500 border-t-indigo-100 flex items-center justify-center font-extrabold text-xs text-indigo-600">
                    75%
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-800">Application Completeness</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">IIT Bombay • 3 of 4 tasks done</p>
                  </div>
                </div>

                {/* Floating Widget 2 - Fit score card */}
                <div className="animate-float-2 bg-white/80 backdrop-blur-md p-4 rounded-xl border border-slate-100 shadow-md flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                      <GraduationCap size={18} />
                    </span>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800">BITS Pilani</h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">Computer Science</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-100">
                      94% Fit
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer of mock card */}
              <div className="relative pt-3 border-t border-slate-200/50 flex items-center justify-between text-[10px] font-bold text-slate-400">
                <span>CareerCompass Workspace v1.0</span>
                <span className="text-blue-500">Live system status</span>
              </div>
            </div>

          </section>

          {/* Stats Bar */}
          <section className="grid grid-cols-3 gap-4 bg-white/60 border border-slate-100 rounded-3xl p-6 shadow-sm text-center">
            <div>
              <p className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">150+</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Careers Mapped</p>
            </div>
            <div className="border-x border-slate-100">
              <p className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">4,000+</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Colleges Indexed</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">10k+</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Deadlines Scheduled</p>
            </div>
          </section>

          {/* Visual Showcase: Interactive Mock Kanban Board */}
          <section id="showcase" className="space-y-6 text-center">
            <div className="space-y-2 max-w-2xl mx-auto">
              <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full">Interactive Workspace</span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Visualize your application roadmaps</h2>
              <p className="text-slate-500 font-medium text-sm">See exactly how your target colleges progress from early interest to final decisions.</p>
            </div>
            
            {/* Mock Kanban Layout */}
            <Card className="p-4 bg-slate-50/50 border border-slate-100/70 rounded-3xl shadow-sm text-left overflow-x-auto">
              <div className="min-w-[800px] grid grid-cols-3 gap-4 select-none pointer-events-none">
                
                {/* Column 1: Shortlisted */}
                <div className="bg-amber-50/30 border border-amber-100/50 p-3.5 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-amber-500" />
                      <span className="font-extrabold text-xs text-slate-700">Shortlisted</span>
                    </div>
                    <span className="text-[10px] font-bold bg-white px-1.5 py-0.5 rounded border">1</span>
                  </div>
                  {/* Card 1 */}
                  <Card className="p-3 border border-slate-200/80 shadow-sm space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-extrabold text-slate-800 text-xs truncate">BITS Pilani</h4>
                      <Badge tone="blue" className="text-[8px] py-0 px-1 font-bold">Private</Badge>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                      <Clock size={11} />
                      <span>Dec 15 (45 days remaining)</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[8px] font-bold text-slate-400">
                        <span>Completeness</span>
                        <span>40%</span>
                      </div>
                      <Progress value={40} />
                    </div>
                  </Card>
                </div>

                {/* Column 2: Applying */}
                <div className="bg-orange-50/30 border border-orange-100/50 p-3.5 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-orange-500" />
                      <span className="font-extrabold text-xs text-slate-700">Applying</span>
                    </div>
                    <span className="text-[10px] font-bold bg-white px-1.5 py-0.5 rounded border">1</span>
                  </div>
                  {/* Card 2 */}
                  <Card className="p-3 border-orange-200 bg-white shadow-sm space-y-2 relative border-l-4 border-l-orange-500">
                    <div className="flex justify-between items-start">
                      <h4 className="font-extrabold text-slate-800 text-xs truncate">IIT Bombay</h4>
                      <Badge tone="blue" className="text-[8px] py-0 px-1 font-bold">Public</Badge>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-rose-500 urgent-pulse">
                      <Clock size={11} />
                      <span>Nov 10 (10 days remaining)</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[8px] font-bold text-slate-400">
                        <span>Completeness</span>
                        <span>65%</span>
                      </div>
                      <Progress value={65} />
                    </div>
                  </Card>
                </div>

                {/* Column 3: Decision */}
                <div className="bg-emerald-50/20 border border-emerald-100/40 p-3.5 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-emerald-500" />
                      <span className="font-extrabold text-xs text-slate-700">Decision</span>
                    </div>
                    <span className="text-[10px] font-bold bg-white px-1.5 py-0.5 rounded border">1</span>
                  </div>
                  {/* Card 3 */}
                  <Card className="p-3 border-emerald-300 bg-emerald-50/10 shadow-sm space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-extrabold text-slate-800 text-xs truncate">NIT Trichy</h4>
                      <Badge tone="emerald" className="text-[8px] py-0 px-1 font-extrabold uppercase tracking-wider">Accepted 🎉</Badge>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                      <Clock size={11} />
                      <span>Oct 15 (Decided)</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[8px] font-bold text-slate-400">
                        <span>Completeness</span>
                        <span>100%</span>
                      </div>
                      <Progress value={100} />
                    </div>
                  </Card>
                </div>

              </div>
            </Card>
          </section>

          {/* Features Grid Section */}
          <section id="features" className="space-y-10">
            <div className="space-y-2 text-center max-w-2xl mx-auto">
              <span className="text-xs font-extrabold text-purple-600 uppercase tracking-wider bg-purple-50 px-2.5 py-1 rounded-full">Core Features</span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Discover your customized checklist</h2>
              <p className="text-slate-500 font-medium text-sm">Everything you need to successfully design your pathway from high school onward.</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Feature 1 */}
              <Card className="p-5 flex flex-col justify-between items-start border-slate-100 glow-card-blue transition-all duration-300 group">
                <div className="space-y-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <ListChecks size={20} />
                  </span>
                  <h3 className="font-extrabold text-slate-800 text-base leading-tight">Visual Kanban tracker</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Organize your applications from researching status to final decisions, updating checkmarks effortlessly.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-extrabold text-blue-600">
                  Track stages <ChevronRight size={14} />
                </div>
              </Card>

              {/* Feature 2 */}
              <Card className="p-5 flex flex-col justify-between items-start border-slate-100 glow-card-purple transition-all duration-300 group">
                <div className="space-y-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                    <BriefcaseBusiness size={20} />
                  </span>
                  <h3 className="font-extrabold text-slate-800 text-base leading-tight">Career mapping</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Explore high-growth careers across categories, outlining necessary skills and related collegiate majors.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-extrabold text-purple-600">
                  Explore paths <ChevronRight size={14} />
                </div>
              </Card>

              {/* Feature 3 */}
              <Card className="p-5 flex flex-col justify-between items-start border-slate-100 glow-card-emerald transition-all duration-300 group">
                <div className="space-y-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                    <GraduationCap size={20} />
                  </span>
                  <h3 className="font-extrabold text-slate-800 text-base leading-tight">Colleges explorer</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Search public/private colleges, evaluate tuition costs, acceptance rates, and majors to build your list.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-extrabold text-emerald-600">
                  Find colleges <ChevronRight size={14} />
                </div>
              </Card>

              {/* Feature 4 */}
              <Card className="p-5 flex flex-col justify-between items-start border-slate-100 glow-card-amber transition-all duration-300 group">
                <div className="space-y-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                    <BarChart3 size={20} />
                  </span>
                  <h3 className="font-extrabold text-slate-800 text-base leading-tight">Colleges comparison</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Compare up to four saved schools side-by-side on metrics to evaluate cost, size, and fit.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-extrabold text-amber-600">
                  Compare schools <ChevronRight size={14} />
                </div>
              </Card>
            </div>
          </section>

          {/* Interactive Accordion FAQs */}
          <section id="faqs" className="space-y-8 max-w-3xl mx-auto">
            <div className="space-y-2 text-center">
              <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full">Frequently Asked Questions</span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Got questions? We've got answers.</h2>
            </div>
            
            <div className="grid gap-3">
              {faqs.map((faq, index) => {
                const isOpen = activeFaq === index;
                return (
                  <Card 
                    key={index}
                    className="overflow-hidden border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFaq(isOpen ? null : index)}
                      className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-800 text-sm select-none"
                    >
                      <span>{faq.q}</span>
                      <span className={cn("text-slate-400 transition-transform duration-300", isOpen && "rotate-45")}>
                        <Plus size={16} />
                      </span>
                    </button>
                    <div 
                      className={cn(
                        "faq-transition overflow-hidden text-xs text-slate-500 font-medium leading-relaxed bg-slate-50/50",
                        isOpen ? "max-h-36 p-5 pt-0 border-t border-slate-100/60 opacity-100" : "max-h-0 opacity-0"
                      )}
                    >
                      {faq.a}
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>

        </div>
      </main>

      {/* Landing Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 px-4 text-slate-400 text-xs">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 text-white font-extrabold text-sm select-none">
            <span className="grid size-8 place-items-center rounded-lg bg-blue-600 text-white">
              <Compass size={16} />
            </span>
            <span>CareerCompass</span>
          </div>
          <p className="font-medium">© {new Date().getFullYear()} CareerCompass. Plan your future with confidence.</p>
          <div className="flex items-center gap-5 font-bold text-slate-500 hover:text-slate-400">
            <button onClick={() => navigate("/signin")} className="hover:text-white transition-colors">Sign In</button>
            <button onClick={() => navigate("/signin")} className="hover:text-white transition-colors">Sandbox Demo</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SignInPage() {
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
        navigate("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    }
  }

  const handleDemoMode = () => {
    startDemo();
    navigate("/");
  };

  return (
    <div className="min-h-screen mesh-bg flex flex-col font-sans antialiased text-slate-800">
      {/* Navbar */}
      <header className="bg-white/70 backdrop-blur-md border-b border-slate-100/80 px-4 py-3">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-lg font-extrabold text-slate-900 select-none">
            <span className="grid size-9 place-items-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/10">
              <Compass size={18} />
            </span>
            <span>CareerCompass</span>
          </Link>
          <Link 
            to="/" 
            className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main content centered */}
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="glass-card p-6 sm:p-8 shadow-xl border border-white/60 relative overflow-hidden rounded-2xl">
            {/* Decorative gradients */}
            <div className="absolute -right-12 -top-12 size-36 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 size-36 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="text-center mb-6">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {mode === "register" ? "Create your workspace" : "Welcome back"}
              </h2>
              <p className="text-slate-500 font-medium text-xs mt-1">
                {mode === "register" ? "Join CareerCompass for free today." : "Access your colleges and career pathways."}
              </p>
            </div>

            <div className="relative mb-5 flex bg-slate-100 p-1 rounded-xl">
              <button 
                type="button"
                className={cn(
                  "flex-grow rounded-lg py-2 text-xs font-bold transition-all", 
                  mode === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                )} 
                onClick={() => { setMode("login"); setError(""); }}
              >
                Log In
              </button>
              <button 
                type="button"
                className={cn(
                  "flex-grow rounded-lg py-2 text-xs font-bold transition-all", 
                  mode === "register" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                )} 
                onClick={() => { setMode("register"); setError(""); }}
              >
                Register
              </button>
            </div>
            
            <form className="relative grid gap-4" onSubmit={submit}>
              {mode === "register" && (
                <Field label="Full Name">
                  <Input 
                    placeholder="Alex Morgan"
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    className="bg-white/80 border-slate-200/80 focus:bg-white"
                  />
                </Field>
              )}
              <Field label="Email Address">
                <Input 
                  type="email" 
                  placeholder="alex@example.com"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="bg-white/80 border-slate-200/80 focus:bg-white"
                />
              </Field>
              <Field label="Password">
                <Input 
                  type="password" 
                  placeholder="••••••••"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="bg-white/80 border-slate-200/80 focus:bg-white"
                />
              </Field>
              
              {(error || authError) && (
                <p className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-800 font-bold leading-normal">
                  ⚠️ {error || authError}
                </p>
              )}

              {!firebaseReady && (
                <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-3 text-xs text-blue-900 leading-normal space-y-2">
                  <p className="font-extrabold">✨ Sandbox Mode Enabled</p>
                  <p className="text-slate-500 font-medium text-[11px] leading-relaxed">
                    Firebase is currently bypassed. Explore fully featured tracker state saved securely in browser storage.
                  </p>
                  <Button 
                    type="button" 
                    variant="primary" 
                    className="w-full h-8.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm"
                    onClick={handleDemoMode}
                  >
                    Explore Sandbox Demo
                  </Button>
                </div>
              )}
              
              {firebaseReady && (
                <Button type="submit" className="w-full h-10 mt-2 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/10">
                  {mode === "register" ? "Create Account" : "Access Workspace"}
                </Button>
              )}
            </form>

            {firebaseReady && (
              <div className="relative mt-4">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="h-px flex-grow bg-slate-200/60" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Or</span>
                  <div className="h-px flex-grow bg-slate-200/60" />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-9 border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 font-bold rounded-xl text-xs"
                  onClick={handleDemoMode}
                >
                  Continue in Demo Mode
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function DashboardCareerCard({ career }: { career: Career }) {
  return (
    <Link to={`/careers/${career.id}`}>
      <Card className={cn(
        "p-4 hover:shadow-md transition-all duration-300 border border-slate-100 hover:border-slate-200 bg-white flex items-center justify-between gap-4 group rounded-xl border-l-4",
        career.category === "STEM" && "border-l-blue-500",
        career.category === "Business" && "border-l-violet-500",
        career.category === "Healthcare" && "border-l-emerald-500",
        career.category === "Arts" && "border-l-pink-500",
        career.category === "Education" && "border-l-amber-500",
        career.category === "Law" && "border-l-slate-400"
      )}>
        <div className="flex items-center gap-3.5 min-w-0">
          <span className={cn("grid size-10 place-items-center rounded-xl transition-colors flex-shrink-0",
            career.category === "STEM" && "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
            career.category === "Business" && "bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white",
            career.category === "Healthcare" && "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
            career.category === "Arts" && "bg-pink-50 text-pink-600 group-hover:bg-pink-600 group-hover:text-white",
            career.category === "Education" && "bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white",
            career.category === "Law" && "bg-slate-50 text-slate-600 group-hover:bg-slate-600 group-hover:text-white"
          )}>
            <BriefcaseBusiness size={20} />
          </span>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors truncate">{career.title}</h3>
            <span className="text-[10px] text-slate-400 font-bold tracking-wide uppercase mt-0.5 block">{career.category}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Salary</p>
            <p className="text-xs font-extrabold text-slate-700 mt-0.5">{career.salaryRange}</p>
          </div>
          <GrowthBadge value={career.growthOutlook} />
          <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
        </div>
      </Card>
    </Link>
  );
}

function DashboardCollegeCard({ college }: { college: College }) {
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
    <Card className="p-4 hover:shadow-md transition-all duration-300 border border-slate-100 hover:border-slate-200 bg-white flex items-center justify-between gap-4 group rounded-xl">
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-blue-700 to-indigo-600 font-extrabold text-white text-xs shadow-sm flex-shrink-0">
          {initials(college.name)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors truncate">
            <Link to={`/colleges/${college.id}`}>{college.name}</Link>
          </h3>
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
            <MapPin size={11} /> {college.city}, {college.state}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="hidden md:flex flex-wrap gap-1 max-w-[200px] justify-end">
          {college.majors.slice(0, 2).map((major) => (
            <Badge key={major} tone="slate" className="text-[9px] py-0 px-1.5 border-slate-200 bg-slate-50 text-slate-500 font-medium">
              {major}
            </Badge>
          ))}
        </div>
        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 flex-shrink-0", fitBadgeClass)}>
          🎯 {fitScore}% Match
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            className="size-8 p-0 rounded-full hover:bg-rose-50"
            title={saved ? "Saved" : "Save College"}
            onClick={() => toggleSaved(profile, saveProfile, college.id)}
          >
            <Heart size={16} className={cn("transition-all duration-200", saved ? "fill-rose-500 text-rose-500 scale-110" : "text-slate-400")} />
          </Button>
          <Button 
            variant="ghost" 
            className="size-8 p-0 rounded-full hover:bg-slate-100"
            onClick={() => navigate(`/colleges/${college.id}`)}
          >
            <ChevronRight size={16} className="text-slate-400" />
          </Button>
        </div>
      </div>
    </Card>
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
    .filter((college) => {
      if (!profile?.location) return false;
      const userStates = profile.location.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
      return userStates.includes(college.state.toLowerCase()) || majorOverlap(profile, college) > 0;
    })
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
      <Section title="Recommended Careers" cta="/careers">
        <CardGrid items={recommendedCareers.length ? recommendedCareers : careers.slice(0, 3)} render={(career) => <CareerCard career={career} />} />
      </Section>
      <Section title="Recommended Colleges" cta="/colleges">
        <CardGrid items={recommendedColleges.length ? recommendedColleges : colleges.slice(0, 3)} render={(college) => <CollegeCard college={college} />} />
      </Section>
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

function getCollegeDetails(collegeId: string, colleges: College[]) {
  if (collegeId.startsWith("Custom:")) {
    const separatorIndex = collegeId.indexOf("|");
    const name = separatorIndex !== -1 ? collegeId.substring(7, separatorIndex) : collegeId.substring(7);
    const type = separatorIndex !== -1 ? (collegeId.substring(separatorIndex + 1) as "Public" | "Private") : "Public";
    return { name, type, isCustom: true };
  }
  const college = colleges.find((c) => c.id === collegeId);
  return {
    name: college?.name || collegeId,
    type: college?.type || "Public",
    isCustom: false
  };
}

function Tracker() {
  const { user, isDemo, deleteApplication, updateApplication, addApplication } = useAuth();
  const { colleges } = useCatalog();
  const { applications } = useApplications(user?.uid);
  const [editing, setEditing] = useState<Application | null>(null);
  const [noting, setNoting] = useState<Application | null>(null);
  const [addingCollege, setAddingCollege] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "calendar">("kanban");

  const stats = useMemo(() => {
    const total = applications.length;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const deadlinesThisMonth = applications.filter((app) => {
      const d = new Date(app.deadline);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;
    const submittedCount = applications.filter((app) => app.status === "Submitted" || app.status === "Decision").length;
    return { total, deadlinesThisMonth, submitted: submittedCount };
  }, [applications]);

  async function handleRemove(app: Application) {
    if (!window.confirm(`Are you sure you want to remove this college from your tracker?`)) return;
    try {
      await deleteApplication(app.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete application");
    }
  }

  async function handleMoveStage(app: Application) {
    const currentIndex = statuses.indexOf(app.status);
    if (currentIndex >= 0 && currentIndex < statuses.length - 1) {
      const nextStatus = statuses[currentIndex + 1];
      const nextCompleteness = nextStatus === "Decision" ? 100 : nextStatus === "Submitted" ? 90 : nextStatus === "Applying" ? 50 : nextStatus === "Shortlisted" ? 30 : 0;
      try {
        await updateApplication(app.id, { status: nextStatus, completeness: nextCompleteness });
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to move stage");
      }
    }
  }

  return (
    <Page title="Application Tracker" subtitle="Follow each school from research through decisions.">
      {(!firebaseReady && !isDemo) && <Banner text="Firebase config is required for real-time tracker updates." />}
      {isDemo && <div className="mb-4 rounded-lg bg-blue-50/50 border border-blue-100 p-3.5 text-xs text-blue-800 font-medium">✨ Demo Mode Active: Your application tracker is simulated locally in browser memory.</div>}
      
      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4 border border-slate-100 bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-semibold">Colleges Tracked</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{stats.total}</p>
          </div>
          <span className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
            <Building2 size={22} />
          </span>
        </Card>
        <Card className="p-4 border border-slate-100 bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-semibold">Deadlines This Month</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{stats.deadlinesThisMonth}</p>
          </div>
          <span className="grid size-11 place-items-center rounded-xl bg-amber-50 text-amber-600">
            <Calendar size={22} />
          </span>
        </Card>
        <Card className="p-4 border border-slate-100 bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-semibold">Submitted Applications</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{stats.submitted}</p>
          </div>
          <span className="grid size-11 place-items-center rounded-xl bg-purple-50 text-purple-600">
            <Check size={22} />
          </span>
        </Card>
      </div>

      {/* Top Bar with view toggles & add button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm mt-2">
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setViewMode("kanban")}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all flex-1 sm:flex-none",
              viewMode === "kanban" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-950"
            )}
          >
            <LayoutDashboard size={14} /> Kanban Board
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all flex-1 sm:flex-none",
              viewMode === "calendar" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-950"
            )}
          >
            <Calendar size={14} /> Deadline Calendar
          </button>
        </div>
        <Button onClick={() => setAddingCollege(true)} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-4 rounded-xl shadow-md shadow-blue-500/10">
          <Plus size={18} /> Add College
        </Button>
      </div>

      {/* Main content display based on viewMode */}
      {applications.length ? (
        viewMode === "kanban" ? (
          <div className="grid gap-4 xl:grid-cols-5 mt-2">
            {statuses.map((status) => (
              <KanbanColumn 
                key={status} 
                status={status} 
                apps={applications.filter((app) => app.status === status)} 
                colleges={colleges} 
                onEdit={setEditing}
                onAddNote={setNoting}
                onMoveStage={handleMoveStage}
                onRemove={handleRemove}
              />
            ))}
          </div>
        ) : (
          <div className="mt-2">
            <DeadlineCalendarView 
              apps={applications} 
              colleges={colleges} 
              onEdit={setEditing} 
              onAddNote={setNoting}
              onRemove={handleRemove}
            />
          </div>
        )
      ) : (
        <Empty icon={ListChecks} title="Your tracker is empty" action="Add colleges from discovery" to="/colleges" />
      )}

      {/* Modals */}
      {editing && (
        <EditApplication 
          app={editing} 
          college={colleges.find((c) => c.id === editing.collegeId)} 
          onClose={() => setEditing(null)} 
        />
      )}
      {noting && (
        <NoteModal 
          app={noting} 
          collegeName={getCollegeDetails(noting.collegeId, colleges).name} 
          onClose={() => setNoting(null)} 
        />
      )}
      {addingCollege && (
        <AddCollegeModal 
          colleges={colleges} 
          onClose={() => setAddingCollege(false)} 
          onAdd={addApplication} 
        />
      )}
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
          <Field label="Grade"><Select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} required><option value="">Select grade</option><option>9</option><option>10</option><option>11</option><option>12</option><option>Graduate</option></Select></Field>
          <Field label="GPA"><Input type="number" min="0" max="5" step="0.01" value={form.gpa || ""} onChange={(e) => setForm({ ...form, gpa: Number(e.target.value) })} required /></Field>
          <Field label="State / Location (comma-separated)"><Input placeholder="e.g. Maharashtra, Delhi" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required /></Field>
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
          <div className="flex items-center gap-3 flex-grow min-w-0">
            <span className="grid size-11 place-items-center rounded-lg bg-gradient-to-br from-blue-700 to-indigo-600 font-extrabold text-white text-sm shadow-sm flex-shrink-0">
              {initials(college.name)}
            </span>
            <div className="min-w-0 flex-1">
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

function AddCollegeModal({ colleges, onClose, onAdd }: { colleges: College[]; onClose: () => void; onAdd: (collegeId: string, status: AppStatus, deadline: Date) => Promise<void> }) {
  const [selectedCollegeId, setSelectedCollegeId] = useState(colleges[0]?.id || "");
  const [customName, setCustomName] = useState("");
  const [customType, setCustomType] = useState<"Public" | "Private">("Public");
  const [status, setStatus] = useState<AppStatus>("Researching");
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().slice(0, 10);
  });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      let finalCollegeId = selectedCollegeId;
      if (selectedCollegeId === "custom") {
        if (!customName.trim()) {
          alert("Please enter a college name");
          setLoading(false);
          return;
        }
        finalCollegeId = `Custom:${customName.trim()}|${customType}`;
      }
      await onAdd(finalCollegeId, status, new Date(deadline));
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add college");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 modal-overlay">
      <Card className="w-full max-w-lg p-6 bg-white rounded-2xl shadow-xl modal-content">
        <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xl font-extrabold text-slate-900">Add College to Tracker</h2>
          <Button variant="ghost" className="size-9 p-0 hover:bg-slate-100 rounded-full" onClick={onClose}>
            <X size={18} className="text-slate-500" />
          </Button>
        </div>
        <form onSubmit={submit} className="grid gap-4">
          <Field label="College">
            <Select value={selectedCollegeId} onChange={(e) => setSelectedCollegeId(e.target.value)}>
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
              <option value="custom">Custom College...</option>
            </Select>
          </Field>

          {selectedCollegeId === "custom" && (
            <div className="grid gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <Field label="College Name">
                <Input placeholder="Enter college name" value={customName} onChange={(e) => setCustomName(e.target.value)} required />
              </Field>
              <Field label="Type">
                <Select value={customType} onChange={(e) => setCustomType(e.target.value as "Public" | "Private")}>
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </Select>
              </Field>
            </div>
          )}

          <Field label="Target Stage">
            <Select value={status} onChange={(e) => setStatus(e.target.value as AppStatus)}>
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </Field>

          <Field label="Application Deadline">
            <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
          </Field>

          <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" className="px-4 py-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/10" disabled={loading}>
              {loading ? "Adding..." : "Add College"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function NoteModal({ app, collegeName, onClose }: { app: Application; collegeName: string; onClose: () => void }) {
  const { updateApplication } = useAuth();
  const [notes, setNotes] = useState(app.notes);
  const [loading, setLoading] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateApplication(app.id, { notes });
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save note");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 modal-overlay">
      <Card className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl modal-content">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Application Notes</h2>
            <p className="text-xs text-slate-500 font-medium">{collegeName}</p>
          </div>
          <Button variant="ghost" className="size-9 p-0 hover:bg-slate-100 rounded-full" onClick={onClose}>
            <X size={18} className="text-slate-500" />
          </Button>
        </div>
        <form onSubmit={save} className="grid gap-4">
          <Field label="Notes">
            <Textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record notes on essay drafts, application checklist, recommendations, etc."
              autoFocus
            />
          </Field>
          <div className="flex items-center justify-end gap-3 mt-2">
            <Button type="button" variant="outline" className="px-4 py-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md" disabled={loading}>
              {loading ? "Saving..." : "Save Note"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function EditApplication({ app, college, onClose }: { app: Application; college?: College; onClose: () => void }) {
  const { updateApplication, deleteApplication } = useAuth();
  const [status, setStatus] = useState<AppStatus>(app.status);
  const [deadline, setDeadline] = useState(app.deadline.toISOString().slice(0, 10));
  const [notes, setNotes] = useState(app.notes);
  const [completeness, setCompleteness] = useState(app.completeness);
  const [decisionOutcome, setDecisionOutcome] = useState<string>(app.decisionOutcome || "");
  const [loading, setLoading] = useState(false);

  const handleStatusChange = (newStatus: AppStatus) => {
    setStatus(newStatus);
    const defaultComplete = newStatus === "Decision" ? 100 : newStatus === "Submitted" ? 90 : newStatus === "Applying" ? 50 : newStatus === "Shortlisted" ? 30 : 0;
    setCompleteness(defaultComplete);
  };

  async function save() {
    setLoading(true);
    try {
      const patch: Partial<Application> = {
        status,
        deadline: new Date(deadline),
        notes,
        completeness,
        decisionOutcome: status === "Decision" ? (decisionOutcome as any || null) : null
      };
      await updateApplication(app.id, patch);
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Are you sure you want to remove this college from your tracker?`)) return;
    setLoading(true);
    try {
      await deleteApplication(app.id);
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete application");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 modal-overlay">
      <Card className="w-full max-w-lg p-6 bg-white rounded-2xl shadow-xl modal-content">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xl font-extrabold text-slate-900">{college?.name || "Edit Application"}</h2>
          <Button variant="ghost" className="size-9 p-0 hover:bg-slate-100 rounded-full" onClick={onClose}>
            <X size={18} className="text-slate-500" />
          </Button>
        </div>
        <div className="grid gap-4">
          <Field label="Status">
            <Select value={status} onChange={(e) => handleStatusChange(e.target.value as AppStatus)}>
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </Field>

          {status === "Decision" && (
            <Field label="Outcome">
              <Select value={decisionOutcome} onChange={(e) => setDecisionOutcome(e.target.value)}>
                <option value="">Awaiting Decision</option>
                <option value="Accepted">Accepted 🎉</option>
                <option value="Rejected">Rejected</option>
                <option value="Waitlisted">Waitlisted</option>
              </Select>
            </Field>
          )}

          <Field label="Deadline">
            <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
          </Field>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-semibold text-slate-700">Completeness</span>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{completeness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={completeness}
              onChange={(e) => setCompleteness(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <Field label="Notes">
            <Textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Essay status, letter of recommendation details, or porting notes..."
            />
          </Field>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
            <Button variant="danger" className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 font-bold border-rose-100" onClick={remove} disabled={loading}>
              Delete
            </Button>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" className="px-4 py-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={save} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/10" disabled={loading}>
                {loading ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function KanbanCard({
  app,
  colleges,
  onEdit,
  onAddNote,
  onMoveStage,
  onRemove
}: {
  app: Application;
  colleges: College[];
  onEdit: (app: Application) => void;
  onAddNote: (app: Application) => void;
  onMoveStage: (app: Application) => void;
  onRemove: (app: Application) => void;
}) {
  const { name, type, isCustom } = getCollegeDetails(app.collegeId, colleges);
  const daysLeft = daysUntil(app.deadline);
  const isUrgent = daysLeft >= 0 && daysLeft <= 14;
  const isOverdue = daysLeft < 0;

  let borderClass = "border-slate-200/80 hover:border-blue-400";
  let bgClass = "bg-white";
  let outcomeBadge = null;

  if (app.status === "Decision") {
    if (app.decisionOutcome === "Accepted") {
      borderClass = "border-emerald-300 hover:border-emerald-500";
      bgClass = "bg-emerald-50/20";
      outcomeBadge = <Badge tone="emerald" className="font-extrabold text-[9px] uppercase tracking-wider">Accepted 🎉</Badge>;
    } else if (app.decisionOutcome === "Rejected") {
      borderClass = "border-rose-200 hover:border-rose-400";
      bgClass = "bg-rose-50/10";
      outcomeBadge = <Badge tone="rose" className="font-extrabold text-[9px] uppercase tracking-wider">Rejected</Badge>;
    } else if (app.decisionOutcome === "Waitlisted") {
      borderClass = "border-amber-300 hover:border-amber-500";
      bgClass = "bg-amber-50/20";
      outcomeBadge = <Badge tone="amber" className="font-extrabold text-[9px] uppercase tracking-wider">Waitlisted</Badge>;
    } else {
      borderClass = "border-slate-300 hover:border-slate-400";
      outcomeBadge = <Badge tone="slate" className="font-extrabold text-[9px] uppercase tracking-wider">Awaiting Decision</Badge>;
    }
  }

  return (
    <Card 
      className={cn(
        "kanban-card-enter p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between border relative group", 
        borderClass, 
        bgClass
      )}
    >
      <div onClick={() => onEdit(app)} className="cursor-pointer space-y-3 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="max-w-[80%]">
            <h4 className="font-extrabold text-slate-800 text-sm leading-snug truncate" title={name}>{name}</h4>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <Badge tone="blue" className="text-[9px] font-bold py-0 px-1.5">{type}</Badge>
              {isCustom && <Badge tone="slate" className="text-[9px] font-bold py-0 px-1.5">Custom</Badge>}
              {outcomeBadge}
            </div>
          </div>
          <span className="grid size-7 place-items-center rounded-lg bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
            <Building2 size={14} />
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock size={13} className={cn(isOverdue || isUrgent ? "text-rose-500" : "text-slate-400")} />
          <p className={cn("text-xs font-bold", 
            isOverdue ? "text-rose-600" : 
            isUrgent ? "text-rose-500 urgent-pulse" : 
            "text-slate-500"
          )}>
            {app.deadline.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            <span className="text-[10px] font-medium ml-1.5">
              ({isOverdue ? "Overdue" : `${daysLeft} days remaining`})
            </span>
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
            <span>Completeness</span>
            <span className="text-slate-600">{app.completeness}%</span>
          </div>
          <Progress value={app.completeness} />
        </div>

        {app.notes && (
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-start gap-1.5 mt-1">
            <MessageSquare size={12} className="text-slate-400 shrink-0 mt-0.5" />
            <p className="line-clamp-2 text-[10px] text-slate-500 leading-normal font-medium">
              {app.notes}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-1.5 border-t border-slate-100 pt-3 mt-2 shrink-0">
        <Button 
          variant="ghost" 
          title="Add Note"
          className="size-8 p-0 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg"
          onClick={() => onAddNote(app)}
        >
          <MessageSquare size={14} />
        </Button>
        <Button 
          variant="ghost" 
          title="Remove"
          className="size-8 p-0 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg"
          onClick={() => onRemove(app)}
        >
          <Trash2 size={14} />
        </Button>
        
        {app.status !== "Decision" ? (
          <Button 
            variant="outline" 
            className="flex items-center justify-center gap-1 text-[11px] font-extrabold h-8 px-2.5 rounded-lg border-slate-200/80 text-slate-700 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 ml-auto"
            onClick={() => onMoveStage(app)}
          >
            Move Stage <ArrowRight size={12} />
          </Button>
        ) : (
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => onEdit(app)}
              className="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition-colors"
            >
              Outcome
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}

function KanbanColumn({ 
  status, 
  apps, 
  colleges, 
  onEdit, 
  onAddNote, 
  onMoveStage, 
  onRemove 
}: { 
  status: AppStatus; 
  apps: Application[]; 
  colleges: College[]; 
  onEdit: (app: Application) => void;
  onAddNote: (app: Application) => void;
  onMoveStage: (app: Application) => void;
  onRemove: (app: Application) => void;
}) {
  const config = {
    Researching: {
      bg: "bg-blue-50/30 border-blue-100/50",
      accent: "bg-blue-500",
      text: "text-blue-800",
      border: "border-blue-200",
      tagTone: "blue" as const
    },
    Shortlisted: {
      bg: "bg-amber-50/30 border-amber-100/50",
      accent: "bg-amber-500",
      text: "text-amber-800",
      border: "border-amber-200",
      tagTone: "amber" as const
    },
    Applying: {
      bg: "bg-orange-50/30 border-orange-100/50",
      accent: "bg-orange-500",
      text: "text-orange-800",
      border: "border-orange-200",
      tagTone: "rose" as const
    },
    Submitted: {
      bg: "bg-purple-50/30 border-purple-100/50",
      accent: "bg-purple-500",
      text: "text-purple-800",
      border: "border-purple-200",
      tagTone: "rose" as const
    },
    Decision: {
      bg: "bg-emerald-50/20 border-emerald-100/40",
      accent: "bg-emerald-500",
      text: "text-emerald-800",
      border: "border-emerald-200",
      tagTone: "emerald" as const
    }
  }[status];

  return (
    <div className={cn("p-4 rounded-2xl border flex flex-col h-full min-h-[500px]", config.bg)}>
      <div className="mb-4 flex items-center justify-between px-1.5 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className={cn("size-2 rounded-full", config.accent)} />
          <h3 className="font-extrabold text-slate-800 text-sm tracking-wide">{status}</h3>
        </div>
        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white shadow-sm border text-slate-500">
          {apps.length}
        </span>
      </div>

      <div className="grid gap-3.5 overflow-y-auto max-h-[70vh] pr-1 flex-1">
        {apps.map((app) => (
          <KanbanCard
            key={app.id}
            app={app}
            colleges={colleges}
            onEdit={onEdit}
            onAddNote={onAddNote}
            onMoveStage={onMoveStage}
            onRemove={onRemove}
          />
        ))}
        {apps.length === 0 && (
          <div className="border border-dashed border-slate-200/80 rounded-2xl py-12 text-center text-xs text-slate-400 font-bold bg-white/40 flex flex-col items-center justify-center gap-2">
            <Building2 size={24} className="text-slate-300" />
            <span>No schools here</span>
          </div>
        )}
      </div>
    </div>
  );
}

function DeadlineCalendarView({ 
  apps, 
  colleges, 
  onEdit, 
  onAddNote, 
  onRemove 
}: { 
  apps: Application[]; 
  colleges: College[]; 
  onEdit: (app: Application) => void;
  onAddNote: (app: Application) => void;
  onRemove: (app: Application) => void;
}) {
  const sortedApps = useMemo(() => {
    return [...apps].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [apps]);

  if (sortedApps.length === 0) {
    return (
      <Card className="p-8 text-center text-slate-500 bg-white border border-slate-100 rounded-2xl">
        <Calendar size={32} className="mx-auto text-slate-300 mb-3" />
        <p className="font-semibold">No deadlines tracked yet.</p>
        <p className="text-xs text-slate-400 mt-1">Add colleges to start visualizing your deadlines timeline.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-white border border-slate-100 rounded-2xl shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold">
              <th className="p-4 pl-6 text-xs uppercase tracking-wider font-semibold">College</th>
              <th className="p-4 text-xs uppercase tracking-wider font-semibold">Status</th>
              <th className="p-4 text-xs uppercase tracking-wider font-semibold">Deadline</th>
              <th className="p-4 text-xs uppercase tracking-wider font-semibold">Completeness</th>
              <th className="p-4 text-xs uppercase tracking-wider font-semibold">Notes</th>
              <th className="p-4 pr-6 text-right text-xs uppercase tracking-wider font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedApps.map((app) => {
              const { name, type, isCustom } = getCollegeDetails(app.collegeId, colleges);
              const daysLeft = daysUntil(app.deadline);
              const isUrgent = daysLeft >= 0 && daysLeft <= 14;
              const isOverdue = daysLeft < 0;

              const statusColors = {
                Researching: "bg-blue-50 text-blue-700 border-blue-100",
                Shortlisted: "bg-amber-50 text-amber-800 border-amber-100",
                Applying: "bg-orange-50 text-orange-800 border-orange-100",
                Submitted: "bg-purple-50 text-purple-700 border-purple-100",
                Decision: "bg-emerald-50 text-emerald-700 border-emerald-100"
              }[app.status];

              return (
                <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6">
                    <div>
                      <span className="font-extrabold text-slate-900 text-sm hover:text-blue-600 transition-colors cursor-pointer" onClick={() => onEdit(app)}>
                        {name}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold text-slate-400">{type}</span>
                        {isCustom && <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1 py-0.2 rounded">Custom</span>}
                        {app.status === "Decision" && app.decisionOutcome && (
                          <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded uppercase tracking-wider">
                            {app.decisionOutcome}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold border", statusColors)}>
                      {app.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className={cn("font-bold text-sm flex items-center gap-1", 
                        isOverdue ? "text-rose-600" : isUrgent ? "text-rose-500 urgent-pulse" : "text-slate-700"
                      )}>
                        {app.deadline.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span className="text-xs text-slate-400 mt-0.5">
                        {isOverdue ? "Overdue" : `${daysLeft} days left`}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 w-44">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <Progress value={app.completeness} />
                      </div>
                      <span className="text-xs font-bold text-slate-600 shrink-0 w-8">{app.completeness}%</span>
                    </div>
                  </td>
                  <td className="p-4 max-w-xs">
                    {app.notes ? (
                      <span className="text-xs text-slate-500 font-medium line-clamp-1 cursor-pointer hover:text-slate-800" onClick={() => onAddNote(app)}>
                        {app.notes}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300 italic font-medium cursor-pointer hover:text-slate-500" onClick={() => onAddNote(app)}>
                        Add note...
                      </span>
                    )}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button variant="ghost" className="size-8 p-0 rounded-lg text-slate-400 hover:text-slate-600" onClick={() => onAddNote(app)} title="Edit Note">
                        <MessageSquare size={14} />
                      </Button>
                      <Button variant="ghost" className="size-8 p-0 rounded-lg text-slate-400 hover:text-slate-600" onClick={() => onEdit(app)} title="Edit details">
                        <ChevronRight size={16} />
                      </Button>
                      <Button variant="ghost" className="size-8 p-0 rounded-lg text-slate-400 hover:text-rose-600" onClick={() => onRemove(app)} title="Remove">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
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
