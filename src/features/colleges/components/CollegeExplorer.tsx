import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X, BarChart3, MapPin, Award, GraduationCap } from "lucide-react";
import { useAuth } from "../../auth";
import {
  useCatalog,
  Page,
  Card,
  Select,
  Input,
  Button,
  CardGrid,
  formatMoney,
  calculateFitScore,
  Badge
} from "../../../shared";
import { CollegeCard } from "./CollegeCard";
import { useNavigate } from "react-router-dom";

export function CollegeExplorer() {
  const { profile } = useAuth();
  const { colleges } = useCatalog();
  const [search, setSearch] = useState("");
  const [state, setState] = useState("All");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [maxAcceptanceRate, setMaxAcceptanceRate] = useState<number>(100);
  const [maxCost, setMaxCost] = useState<number>(1500000);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("Fit Score");
  const navigate = useNavigate();

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

  const states = useMemo(() => {
    return Array.from(new Set(colleges.map((c) => c.state))).sort();
  }, [colleges]);

  const filtered = useMemo(() => {
    return colleges.filter((college) => {
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
  }, [colleges, search, state, selectedTypes, maxAcceptanceRate, maxCost, selectedSizes]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
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
  }, [filtered, sortBy, profile]);

  // Dynamic Selection Insights
  const selectionInsights = useMemo(() => {
    if (filtered.length === 0) {
      return { avgTuition: 0, avgAcceptance: 0, topStates: [], bestMatches: [] };
    }
    const totalTuition = filtered.reduce((acc, c) => acc + c.tuition, 0);
    const totalAcceptance = filtered.reduce((acc, c) => acc + c.acceptanceRate, 0);
    
    // Calculate top states represented
    const stateCounts: Record<string, number> = {};
    filtered.forEach(c => {
      stateCounts[c.state] = (stateCounts[c.state] || 0) + 1;
    });
    const topStates = Object.entries(stateCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(item => item[0]);

    // Top 3 fits
    const bestMatches = [...filtered]
      .sort((a, b) => calculateFitScore(profile, b) - calculateFitScore(profile, a))
      .slice(0, 3);

    return {
      avgTuition: totalTuition / filtered.length,
      avgAcceptance: totalAcceptance / filtered.length,
      topStates,
      bestMatches
    };
  }, [filtered, profile]);

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
    <Page title="College Explorer" subtitle="Browse target schools, compare tuition rates, analyze fit metrics, and check admissions status.">
      <div className="grid gap-6 xl:grid-cols-[260px_1fr_280px]">
        
        {/* Left Panel: Advanced Filters */}
        <Card className="p-5 h-fit space-y-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
            <h2 className="font-heading font-extrabold text-slate-800 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
              <SlidersHorizontal size={16} /> Filters
            </h2>
            <button
              className="text-xs text-brand dark:text-blue-400 hover:text-brand-hover font-semibold"
              onClick={clearFilters}
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-[10px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Location (State)</label>
            <Select 
              value={state} 
              onChange={(e) => setState(e.target.value)}
              className="bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 h-9 text-xs"
            >
              <option value="All">All States</option>
              {states.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-[10px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">College Type</label>
            <div className="space-y-2">
              {["Public", "Private"].map((t) => (
                <label key={t} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(t)}
                    onChange={() => toggleType(t)}
                    className="rounded border-slate-350 dark:border-slate-700 bg-white dark:bg-[#111827] text-[#3B5BDB] focus:ring-[#3B5BDB]"
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2 text-left">
            <div className="flex justify-between text-[10px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              <span>Acceptance Rate</span>
              <span className="text-[#3B5BDB] dark:text-blue-400 font-number font-bold">≤ {maxAcceptanceRate}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={maxAcceptanceRate}
              onChange={(e) => setMaxAcceptanceRate(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#3B5BDB]"
            />
          </div>

          <div className="space-y-2 text-left">
            <div className="flex justify-between text-[10px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              <span>Max Cost / Yr</span>
              <span className="text-[#3B5BDB] dark:text-blue-400 font-number font-bold">{formatMoney(maxCost)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1500000"
              step="25000"
              value={maxCost}
              onChange={(e) => setMaxCost(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#3B5BDB]"
            />
          </div>

          <div className="space-y-2 text-left">
            <label className="text-[10px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Campus Size</label>
            <div className="space-y-2">
              {[
                { name: "Small", label: "Small (< 5k)" },
                { name: "Medium", label: "Medium (5k - 15k)" },
                { name: "Large", label: "Large (> 15k)" }
              ].map((sz) => (
                <label key={sz.name} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSizes.includes(sz.name)}
                    onChange={() => toggleSize(sz.name)}
                    className="rounded border-slate-350 dark:border-slate-700 bg-white dark:bg-[#111827] text-[#3B5BDB] focus:ring-[#3B5BDB]"
                  />
                  {sz.label}
                </label>
              ))}
            </div>
          </div>
        </Card>

        {/* Center Panel: Results */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-slate-450 dark:text-slate-500" size={18} />
              <Input
                className="pl-10 h-10 bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
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

            <div className="flex items-center gap-2 min-w-48 shrink-0">
              <label className="text-[10px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">Sort By</label>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs"
              >
                <option value="Fit Score">Fit Match Score</option>
                <option value="Acceptance Rate">Acceptance Rate</option>
                <option value="Cost">Cost (Low to High)</option>
                <option value="Name">Name</option>
              </Select>
            </div>
          </div>

          <div className="text-xs font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1 text-left">
            <span>Found {sorted.length} colleges</span>
          </div>

          {sorted.length > 0 ? (
            <CardGrid items={sorted} render={(college) => <CollegeCard college={college} />} />
          ) : (
            <Card className="grid place-items-center gap-4 p-12 text-center border-dashed border-2 border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10">
              <span className="grid size-14 place-items-center rounded-lg bg-slate-100 dark:bg-slate-850 text-slate-400 dark:text-slate-500">
                <Search size={24} />
              </span>
              <div>
                <h3 className="text-lg font-heading font-extrabold text-slate-800 dark:text-white">No colleges match your filters</h3>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-sans mt-1">Try relaxing your cost limits or checking different locations.</p>
              </div>
              <Button onClick={clearFilters}>Reset Filters</Button>
            </Card>
          )}
        </div>

        {/* Right Panel: Selection Insights */}
        <div className="space-y-6">
          <Card className="p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl text-left space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-850">
              <BarChart3 size={18} className="text-[#3B5BDB] dark:text-blue-400" />
              <h2 className="font-heading font-extrabold text-slate-800 dark:text-white text-sm uppercase tracking-wider">
                Selection Insights
              </h2>
            </div>

            <div className="space-y-4">
              {/* Avg Tuition */}
              <div>
                <span className="text-[10px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Average Tuition</span>
                <p className="text-base font-number font-extrabold text-slate-900 dark:text-white mt-1">
                  {formatMoney(selectionInsights.avgTuition)} / yr
                </p>
              </div>

              {/* Avg Acceptance Rate */}
              <div>
                <span className="text-[10px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Avg Acceptance Rate</span>
                <p className="text-base font-number font-extrabold text-slate-900 dark:text-white mt-1">
                  {selectionInsights.avgAcceptance.toFixed(1)}%
                </p>
              </div>

              {/* Top States */}
              <div>
                <span className="text-[10px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Top Locations</span>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {selectionInsights.topStates.map(st => (
                    <Badge key={st} tone="blue" className="text-[9px] font-bold py-0.5 px-2">{st}</Badge>
                  ))}
                  {selectionInsights.topStates.length === 0 && <span className="text-xs text-slate-400 dark:text-slate-500 italic">None</span>}
                </div>
              </div>

              {/* Best Matches */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-850 space-y-3">
                <span className="text-[10px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Top Matches</span>
                <div className="space-y-2">
                  {selectionInsights.bestMatches.map(c => {
                    const score = calculateFitScore(profile, c);
                    return (
                      <div 
                        key={c.id} 
                        onClick={() => navigate(`/colleges/${c.id}`)}
                        className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/10 cursor-pointer hover:border-blue-300 dark:hover:border-blue-900 flex items-center justify-between gap-2 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="font-heading font-bold text-xs text-slate-850 dark:text-white truncate">{c.name}</p>
                          <p className="text-[9px] text-slate-400 dark:text-[#94A3B8] font-sans mt-0.5">{c.city}, {c.state}</p>
                        </div>
                        <span className="text-[10px] font-number font-extrabold text-[#3B5BDB] dark:text-blue-400 shrink-0">
                          {score}% Match
                        </span>
                      </div>
                    );
                  })}
                  {selectionInsights.bestMatches.length === 0 && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic">No fits available.</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </Page>
  );
}
