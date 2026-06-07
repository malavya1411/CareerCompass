import { useState, useMemo, useEffect } from "react";
import { Search, X, BriefcaseBusiness, GraduationCap, CheckCircle2, TrendingUp } from "lucide-react";
import { CareerCard } from "./CareerCard";
import { 
  useCatalog, 
  Page, 
  Toolbar, 
  CardGrid, 
  Input, 
  Button, 
  categories,
  Badge,
  cn
} from "../../../shared";
import { useAuth } from "../../auth";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { useNavigate } from "react-router-dom";

export function CareerExplorer() {
  const { profile } = useAuth();
  const { careers, colleges } = useCatalog();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedCareerId, setSelectedCareerId] = useState<string | null>(null);
  const [comparingIds, setComparingIds] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSelectedCareerId(null);
      }
    }
    if (selectedCareerId) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedCareerId]);

  const filtered = careers.filter(
    (career) => 
      (category === "All" || career.category === category) && 
      `${career.title} ${career.description} ${career.skills.join(" ")}`.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCareer = useMemo(() => {
    return careers.find(c => c.id === selectedCareerId) || null;
  }, [selectedCareerId, careers]);

  // Colleges matching selected career's majors
  const recommendedColleges = useMemo(() => {
    if (!selectedCareer) return [];
    return colleges.filter(c => 
      c.majors.some(major => selectedCareer.relatedMajors.includes(major))
    ).slice(0, 3);
  }, [selectedCareer, colleges]);

  // Salary graph parser
  const salaryGraphData = useMemo(() => {
    if (!selectedCareer || !selectedCareer.salaryProgression) return [];
    return selectedCareer.salaryProgression.map(lvl => {
      const numbers = lvl.salary.match(/\d+/g);
      let val = 0;
      if (numbers && numbers.length > 0) {
        val = numbers.map(Number).reduce((a, b) => a + b, 0) / numbers.length;
      }
      return {
        level: lvl.level,
        Lakhs: val,
        range: lvl.salary
      };
    });
  }, [selectedCareer]);

  const handleCompareToggle = (id: string) => {
    setComparingIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const handleCompareClear = () => {
    setComparingIds([]);
  };

  const comparedCareers = useMemo(() => {
    return careers.filter(c => comparingIds.includes(c.id));
  }, [comparingIds, careers]);

  return (
    <Page title="Career Explorer" subtitle="Search career paths, evaluate matches, and explore academic trajectories.">
      {/* Search Toolbar */}
      <Toolbar>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" size={18} />
          <Input 
            className="pl-10 bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white" 
            placeholder="Search careers by title, descriptions, or core skills" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        {comparingIds.length > 0 && (
          <Button variant="outline" className="text-xs h-10 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={handleCompareClear}>
            Clear Career Compare ({comparingIds.length})
          </Button>
        )}
      </Toolbar>

      {/* Category selection */}
      <div className="flex gap-2 overflow-x-auto pb-1 mt-1">
        {["All", ...categories].map((cat) => (
          <Button 
            key={cat} 
            variant={category === cat ? "primary" : "outline"} 
            className="h-9 px-3 text-xs shrink-0 font-sans"
            onClick={() => setCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Comparison Panel (Horizontal overlay) */}
      {comparedCareers.length > 1 && (
        <div className="bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4 mt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-extrabold text-sm text-slate-800 dark:text-white">Career Comparison Matrix</h3>
            <button className="text-[11px] font-sans font-bold text-red-500 hover:underline" onClick={handleCompareClear}>Close Matrix</button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {comparedCareers.map(c => (
              <div key={c.id} className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-3 relative">
                <button 
                  className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
                  onClick={() => handleCompareToggle(c.id)}
                >
                  <X size={14} />
                </button>
                <h4 className="font-heading font-bold text-sm text-slate-800 dark:text-white">{c.title}</h4>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <p><span className="font-sans font-semibold text-slate-400 dark:text-slate-500">Category:</span> {c.category}</p>
                  <p><span className="font-sans font-semibold text-slate-400 dark:text-slate-500">Growth:</span> {c.growthOutlook}</p>
                  <p><span className="font-sans font-semibold text-slate-400 dark:text-slate-500">Salary:</span> {c.salaryRange}</p>
                  <p><span className="font-sans font-semibold text-slate-400 dark:text-slate-500">Demand:</span> {c.projectedDemand}</p>
                  <p><span className="font-sans font-semibold text-slate-400 dark:text-slate-500">Education:</span> {c.educationLevel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Career Grid */}
      <CardGrid 
        items={filtered} 
        render={(career) => (
          <CareerCard 
            career={career} 
            onSelect={() => setSelectedCareerId(career.id)}
            onCompareToggle={() => handleCompareToggle(career.id)}
            isComparing={comparingIds.includes(career.id)}
          />
        )} 
      />

      {/* Right Drawer Backdrop */}
      {selectedCareer && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setSelectedCareerId(null)}
        />
      )}

      <div 
        className={cn(
          "fixed top-0 right-0 h-screen w-full sm:w-[500px] bg-white dark:bg-[#111827] border-l border-slate-200 dark:border-slate-800 z-50 shadow-2xl flex flex-col transition-transform duration-300 transform",
          selectedCareer ? "translate-x-0" : "translate-x-full invisible pointer-events-none"
        )}
      >
        {selectedCareer && (
          <>
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-lg bg-blue-50 dark:bg-blue-950 text-brand dark:text-blue-400">
                  <BriefcaseBusiness size={18} />
                </span>
                <div>
                  <h2 className="font-heading font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                    {selectedCareer.title}
                  </h2>
                  <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-widest block mt-0.5">
                    {selectedCareer.category} Path
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCareerId(null)}
                className="size-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-850"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-left">
              {/* Why recommended */}
              <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] font-sans font-bold text-brand dark:text-blue-400 uppercase tracking-wider block">Fit Explanation</span>
                <p className="text-xs font-sans text-slate-700 dark:text-slate-350 leading-relaxed font-medium">
                  {selectedCareer.matchExplanation || "Recommended because of your STEM interests, analytical test scores, and match with robotics club activities."}
                </p>
              </div>

              {/* Day in life */}
              <div className="space-y-2">
                <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wide">A Day in the Life</h3>
                <p className="text-xs text-slate-600 dark:text-[#94A3B8] font-sans leading-relaxed">
                  {selectedCareer.dayInLife}
                </p>
              </div>

              {/* Salary curves */}
              {selectedCareer.salaryProgression && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wide">Salary Progression</h3>
                    <span className="text-[10px] font-sans font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1"><TrendingUp size={12} /> INR / Lakhs p.a.</span>
                  </div>
                  <div className="h-44 w-full font-number text-[9px] bg-slate-50 dark:bg-slate-900/30 p-3 rounded-2xl border border-slate-150 dark:border-slate-800/80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salaryGraphData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                        <XAxis dataKey="level" stroke="#94A3B8" tickLine={false} />
                        <YAxis stroke="#94A3B8" tickLine={false} />
                        <Tooltip 
                          contentStyle={{ 
                            background: "rgba(30, 41, 59, 0.9)", 
                            border: "none", 
                            borderRadius: "8px",
                            color: "#F8FAFC",
                            fontFamily: "Inter"
                          }}
                        />
                        <Area type="monotone" dataKey="Lakhs" stroke="#3B5BDB" fill="rgba(59, 91, 219, 0.1)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Skills required */}
              <div className="space-y-2.5">
                <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wide">Required Competencies</h3>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCareer.skills.map(skill => (
                    <Badge key={skill} tone="blue" className="font-semibold text-xs py-0.5 px-2.5">{skill}</Badge>
                  ))}
                </div>
              </div>

              {/* Recommended majors */}
              <div className="space-y-2.5">
                <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wide">Leading College Majors</h3>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCareer.relatedMajors.map(major => (
                    <Badge key={major} tone="slate" className="font-semibold text-xs py-0.5 px-2.5">{major}</Badge>
                  ))}
                </div>
              </div>

              {/* Recommended colleges offering majors */}
              {recommendedColleges.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wide">Best Matching Colleges</h3>
                  <div className="grid gap-2">
                    {recommendedColleges.map(c => (
                      <div 
                        key={c.id}
                        onClick={() => navigate(`/colleges/${c.id}`)}
                        className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex items-center justify-between cursor-pointer hover:border-blue-400 transition-colors"
                      >
                        <div>
                          <p className="font-heading font-bold text-xs text-slate-800 dark:text-white">{c.name}</p>
                          <p className="text-[10px] text-slate-400 font-sans mt-0.5">{c.city}, {c.state} • {c.type}</p>
                        </div>
                        <span className="text-[10px] font-sans font-bold text-brand dark:text-blue-400">View details</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Roadmap */}
              {selectedCareer.careerRoadmap && (
                <div className="space-y-3">
                  <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wide">Career Roadmap</h3>
                  <div className="space-y-3">
                    {selectedCareer.careerRoadmap.map((step, idx) => (
                      <div key={idx} className="flex gap-3">
                        <span className="grid size-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold font-number place-items-center shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-sans leading-relaxed pt-0.5">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex gap-2 shrink-0">
              <Button 
                className="flex-1 font-heading text-xs font-bold"
                onClick={() => setSelectedCareerId(null)}
              >
                Done
              </Button>
            </div>
          </>
        )}
      </div>
    </Page>
  );
}
