import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Compass, 
  ArrowRight, 
  GraduationCap, 
  Clock, 
  Plus, 
  ListChecks, 
  BriefcaseBusiness, 
  BarChart3, 
  ChevronRight 
} from "lucide-react";
import { Button, Card, Badge, Progress, cn } from "../../../shared";

export function LandingPage() {
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
