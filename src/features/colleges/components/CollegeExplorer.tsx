import { useState, useMemo, useEffect } from "react";
import { Search, SlidersHorizontal, X, BarChart3, MapPin, Award, GraduationCap, Bookmark, Sparkles, Heart, ArrowRight } from "lucide-react";
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
  Badge,
  cn,
  toggleSaved,
  initials
} from "../../../shared";
import { CollegeCard } from "./CollegeCard";
import { useNavigate, Link } from "react-router-dom";
import React from "react";

export function CollegeExplorer() {
  const { profile, saveProfile } = useAuth();
  const { colleges } = useCatalog();
  const [search, setSearch] = useState("");
  const [state, setState] = useState("All");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [maxAcceptanceRate, setMaxAcceptanceRate] = useState<number>(100);
  const [maxCost, setMaxCost] = useState<number>(1500000);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedMajor, setSelectedMajor] = useState("All");
  const [sortBy, setSortBy] = useState<string>("Fit Score");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>("");
  const navigate = useNavigate();

  const [showFilters, setShowFilters] = useState(false);
  const filterRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    }
    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilters]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (state !== "All") count++;
    if (selectedTypes.length > 0) count += selectedTypes.length;
    if (maxAcceptanceRate < 100) count++;
    if (maxCost < 1500000) count++;
    if (selectedSizes.length > 0) count += selectedSizes.length;
    if (selectedMajor !== "All") count++;
    return count;
  }, [state, selectedTypes, maxAcceptanceRate, maxCost, selectedSizes, selectedMajor]);

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

  const allMajors = useMemo(() => {
    const majorsSet = new Set<string>();
    colleges.forEach((c) => {
      c.majors.forEach((m) => majorsSet.add(m));
    });
    return Array.from(majorsSet).sort();
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
      const matchesMajor = selectedMajor === "All" || college.majors.includes(selectedMajor);

      const sizeCategory = college.enrollment < 5000 ? "Small" : college.enrollment <= 15000 ? "Medium" : "Large";
      const matchesSize = selectedSizes.length === 0 || selectedSizes.includes(sizeCategory);

      return matchesSearch && matchesState && matchesType && matchesAcceptance && matchesCost && matchesSize && matchesMajor;
    });
  }, [colleges, search, state, selectedTypes, maxAcceptanceRate, maxCost, selectedSizes, selectedMajor]);

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

  // Set the default selected college whenever list updates
  useEffect(() => {
    if (sorted.length > 0) {
      if (!sorted.some(c => c.id === selectedCollegeId)) {
        setSelectedCollegeId(sorted[0].id);
      }
    } else {
      setSelectedCollegeId("");
    }
  }, [sorted, selectedCollegeId]);

  // Find currently selected college details
  const selectedCollege = useMemo(() => {
    return colleges.find(c => c.id === selectedCollegeId) || sorted[0];
  }, [colleges, selectedCollegeId, sorted]);

  // Dynamic Selection Insights (for Grid view or fallback)
  const selectionInsights = useMemo(() => {
    if (filtered.length === 0) {
      return { avgTuition: 0, avgAcceptance: 0, topStates: [], bestMatches: [] };
    }
    const totalTuition = filtered.reduce((acc, c) => acc + c.tuition, 0);
    const totalAcceptance = filtered.reduce((acc, c) => acc + c.acceptanceRate, 0);
    
    const stateCounts: Record<string, number> = {};
    filtered.forEach(c => {
      stateCounts[c.state] = (stateCounts[c.state] || 0) + 1;
    });
    const topStates = Object.entries(stateCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(item => item[0]);

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

  // Dynamic Admissions Outlook calculations for the AI panel
  const fitScoreDetails = useMemo(() => {
    if (!selectedCollege) return null;
    const fitScore = calculateFitScore(profile, selectedCollege);
    
    // Academic Fit
    let academicFit = "Good";
    const gpa = profile?.gpa || 3.92;
    if (gpa >= 3.8) academicFit = "Excellent";
    else if (gpa < 3.3) academicFit = "Fair";

    // Financial Fit
    let financialFit = "Good";
    if (selectedCollege.tuition <= 250000) financialFit = "Excellent";
    else if (selectedCollege.tuition > 600000) financialFit = "Moderate";

    // Competition Level
    let competitionLevel = "Moderate";
    if (selectedCollege.acceptanceRate <= 8) competitionLevel = "Extreme";
    else if (selectedCollege.acceptanceRate <= 18) competitionLevel = "High";
    else if (selectedCollege.acceptanceRate > 40) competitionLevel = "Low";

    // Recommendation
    let recommendation = "Target Fit";
    if (fitScore >= 85) recommendation = "Apply Early";
    else if (fitScore < 60) recommendation = "Reach School";

    // Probability Distribution
    const highChance = Math.max(10, Math.min(95, Math.round(fitScore * 0.72)));
    const modChance = Math.max(5, Math.min(30, Math.round((100 - fitScore) * 0.6)));
    const lowChance = 100 - highChance - modChance;

    // Strength Factors
    const scoreGpa = (profile?.gpa ? (profile.gpa / 4.0) * 10 : 9.4).toFixed(1);
    const scoreCoding = (profile?.activities?.length ? Math.min(10, 7.5 + profile.activities.length * 0.8) : 9.1).toFixed(1);
    const scoreExtracurriculars = (profile?.activities?.length ? Math.min(10, 6.8 + profile.activities.length * 0.9) : 8.7).toFixed(1);
    const scoreLeadership = (profile?.activities?.some(a => a.toLowerCase().includes("president") || a.toLowerCase().includes("vp") || a.toLowerCase().includes("lead") || a.toLowerCase().includes("organizer")) ? 9.2 : 8.3).toFixed(1);

    return {
      fitScore,
      academicFit,
      financialFit,
      competitionLevel,
      recommendation,
      highChance,
      modChance,
      lowChance,
      scoreGpa,
      scoreCoding,
      scoreExtracurriculars,
      scoreLeadership
    };
  }, [profile, selectedCollege]);

  const clearFilters = () => {
    setSearch("");
    setState("All");
    setSelectedTypes([]);
    setMaxAcceptanceRate(100);
    setMaxCost(1500000);
    setSelectedSizes([]);
    setSelectedMajor("All");
    setSortBy("Fit Score");
  };

  return (
    <Page title="College Explorer" subtitle="Browse target schools, compare tuition rates, analyze fit metrics, and check admissions status.">
      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        
        {/* Center Panel: Results */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 text-[rgba(225,220,201,0.4)]" size={16} />
              <Input
                className="pl-10 h-10 bg-[#111111] border-[rgba(225,220,201,0.08)] text-[#FFFFFF] focus:border-[#412D15]"
                placeholder="Search colleges by name, location, or major..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="absolute right-3 top-3 text-[rgba(225,220,201,0.5)] hover:text-[#FFFFFF] transition-colors"
                  onClick={() => setSearch("")}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-sans font-bold text-[rgba(225,220,201,0.4)] uppercase tracking-widest whitespace-nowrap">Sort By</label>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-10 bg-[#111111] border-[rgba(225,220,201,0.08)] text-[#FFFFFF] text-xs"
                >
                  <option value="Fit Score">Fit Match Score</option>
                  <option value="Acceptance Rate">Acceptance Rate</option>
                  <option value="Cost">Cost (Low to High)</option>
                  <option value="Name">Name</option>
                </Select>
              </div>

              {/* Popover Advanced Filters */}
              <div className="relative" ref={filterRef}>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "h-10 px-4 rounded-xl text-xs font-sans font-bold transition-all duration-150 flex items-center gap-2 border",
                    showFilters || activeFiltersCount > 0
                      ? "bg-[#1F150C] text-[#FFFFFF] border-[rgba(225,220,201,0.2)] shadow-md"
                      : "bg-[#111111] text-[#E1DCC9] border-[rgba(225,220,201,0.08)] hover:bg-[#1A1A1A]"
                  )}
                >
                  <SlidersHorizontal size={14} />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="grid place-items-center size-5 rounded-full bg-[#412D15] border border-[rgba(225,220,201,0.15)] text-[9px] font-bold text-[#E1DCC9]">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {showFilters && (
                  <div className="absolute right-0 mt-2 w-72 bg-[#111111] border border-[rgba(225,220,201,0.08)] p-5 rounded-2xl shadow-[0px_8px_32px_rgba(0,0,0,0.6)] z-50 space-y-5 text-left">
                    <div className="flex items-center justify-between pb-3 border-b border-[rgba(225,220,201,0.08)]">
                      <span className="font-heading font-extrabold text-[#F5F2EA] text-xs uppercase tracking-wider">
                        Advanced Filters
                      </span>
                      <button
                        className="text-[10px] text-[rgba(225,220,201,0.5)] hover:text-[#FFFFFF] font-bold uppercase tracking-wider transition-colors"
                        onClick={clearFilters}
                      >
                        Clear All
                      </button>
                    </div>

                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-sans font-bold text-[rgba(225,220,201,0.4)] uppercase tracking-widest block">Location (State)</label>
                      <Select 
                        value={state} 
                        onChange={(e) => setState(e.target.value)}
                        className="bg-[#111111] border-[rgba(225,220,201,0.08)] text-[#FFFFFF] h-9 text-xs w-full"
                      >
                        <option value="All">All States</option>
                        {states.map((s) => <option key={s} value={s}>{s}</option>)}
                      </Select>
                    </div>

                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-sans font-bold text-[rgba(225,220,201,0.4)] uppercase tracking-widest block mb-1">College Type</label>
                      <div className="space-y-2">
                        {["Public", "Private"].map((t) => (
                          <label key={t} className="flex items-center gap-2.5 text-xs text-[rgba(225,220,201,0.75)] font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedTypes.includes(t)}
                              onChange={() => toggleType(t)}
                              className="rounded border-[rgba(225,220,201,0.15)] bg-[#111111] text-[#E1DCC9] focus:ring-0 focus:ring-offset-0 size-4 cursor-pointer"
                            />
                            {t}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 text-left">
                      <div className="flex justify-between text-[10px] font-sans font-bold text-[rgba(225,220,201,0.4)] uppercase tracking-widest">
                        <span>Acceptance Rate</span>
                        <span className="text-[#E1DCC9] font-number font-bold">≤ {maxAcceptanceRate}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={maxAcceptanceRate}
                        onChange={(e) => setMaxAcceptanceRate(Number(e.target.value))}
                        className="w-full h-1.5 bg-[#1A1A1A] rounded-lg appearance-none cursor-pointer accent-[#E1DCC9] border border-[rgba(225,220,201,0.04)]"
                      />
                    </div>

                    <div className="space-y-2 text-left">
                      <div className="flex justify-between text-[10px] font-sans font-bold text-[rgba(225,220,201,0.4)] uppercase tracking-widest">
                        <span>Max Cost / Yr</span>
                        <span className="text-[#E1DCC9] font-number font-bold">{formatMoney(maxCost)}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1500000"
                        step="25000"
                        value={maxCost}
                        onChange={(e) => setMaxCost(Number(e.target.value))}
                        className="w-full h-1.5 bg-[#1A1A1A] rounded-lg appearance-none cursor-pointer accent-[#E1DCC9] border border-[rgba(225,220,201,0.04)]"
                      />
                    </div>

                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-sans font-bold text-[rgba(225,220,201,0.4)] uppercase tracking-widest block mb-1">Campus Size</label>
                      <div className="space-y-2">
                        {[
                          { name: "Small", label: "Small (< 5k)" },
                          { name: "Medium", label: "Medium (5k - 15k)" },
                          { name: "Large", label: "Large (> 15k)" }
                        ].map((sz) => (
                          <label key={sz.name} className="flex items-center gap-2.5 text-xs text-[rgba(225,220,201,0.75)] font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedSizes.includes(sz.name)}
                              onChange={() => toggleSize(sz.name)}
                              className="rounded border-[rgba(225,220,201,0.15)] bg-[#111111] text-[#E1DCC9] focus:ring-0 focus:ring-offset-0 size-4 cursor-pointer"
                            />
                            {sz.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 text-left pt-2 border-t border-[rgba(225,220,201,0.08)]">
                      <label className="text-[10px] font-sans font-bold text-[rgba(225,220,201,0.4)] uppercase tracking-widest block">Top Majors</label>
                      <Select 
                        value={selectedMajor} 
                        onChange={(e) => setSelectedMajor(e.target.value)}
                        className="bg-[#111111] border-[rgba(225,220,201,0.08)] text-[#FFFFFF] h-9 text-xs w-full"
                      >
                        <option value="All">All Majors</option>
                        {allMajors.map((m) => <option key={m} value={m}>{m}</option>)}
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pb-2 text-xs font-sans font-bold text-[rgba(225,220,201,0.4)] uppercase tracking-wider pl-1">
            <span>Found {sorted.length} colleges</span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setViewMode("list")}
                className={cn(
                  "px-3 py-1.5 rounded-lg border text-[10px] uppercase font-sans font-bold tracking-wider transition-all duration-150",
                  viewMode === "list" 
                    ? "bg-[#1F150C] text-[#FFFFFF] border-[rgba(225,220,201,0.15)] shadow-md" 
                    : "text-[rgba(225,220,201,0.6)] border-transparent hover:bg-[#1A1A1A] hover:text-[#FFFFFF]"
                )}
              >
                List View
              </button>
              <button 
                onClick={() => setViewMode("grid")}
                className={cn(
                  "px-3 py-1.5 rounded-lg border text-[10px] uppercase font-sans font-bold tracking-wider transition-all duration-150",
                  viewMode === "grid" 
                    ? "bg-[#1F150C] text-[#FFFFFF] border-[rgba(225,220,201,0.15)] shadow-md" 
                    : "text-[rgba(225,220,201,0.6)] border-transparent hover:bg-[#1A1A1A] hover:text-[#FFFFFF]"
                )}
              >
                Grid View
              </button>
            </div>
          </div>

          {sorted.length > 0 ? (
            viewMode === "list" ? (
              <div className="space-y-4">
                {sorted.map((college) => {
                  const fit = calculateFitScore(profile, college);
                  const isSaved = profile?.savedColleges?.includes(college.id);
                  const isSelected = selectedCollegeId === college.id;

                  return (
                    <Card 
                      key={college.id}
                      onClick={() => setSelectedCollegeId(college.id)}
                      className={cn(
                        "relative overflow-hidden bg-[#111111] border p-5 rounded-2xl flex flex-col justify-between gap-4 transition-all duration-200 cursor-pointer text-left",
                        isSelected 
                          ? "border-[#412D15] shadow-[0px_4px_24px_rgba(65,45,21,0.25)]" 
                          : "border-[rgba(225,220,201,0.06)] hover:border-[rgba(225,220,201,0.12)]"
                      )}
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span className="grid size-11 place-items-center rounded-lg bg-[#1F150C] border border-[rgba(225,220,201,0.1)] font-heading font-extrabold text-[#E1DCC9] text-sm shrink-0">
                            {initials(college.name)}
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-heading font-extrabold text-[#F5F2EA] leading-snug hover:text-[#FFFFFF] transition-colors truncate flex items-center gap-1.5">
                              {college.name} 
                              {fit >= 90 && <Award className="text-[#D4A017] shrink-0" size={13} />}
                            </h3>
                            <p className="text-xs text-[rgba(225,220,201,0.6)] font-sans font-semibold flex items-center gap-1 mt-0.5">
                              <MapPin size={12} className="text-[rgba(225,220,201,0.45)]" /> {college.city}, {college.state}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 self-stretch md:self-center justify-between md:justify-end border-t border-b md:border-none border-[rgba(225,220,201,0.04)] py-2 md:py-0">
                          <div className="text-left md:text-right shrink-0">
                            <span className="text-[10px] font-sans font-bold text-[rgba(225,220,201,0.45)] uppercase tracking-widest block">Est. Cost</span>
                            <span className="text-sm font-number font-extrabold text-[#FFFFFF] mt-0.5 block">{formatMoney(college.tuition)}</span>
                          </div>
                          
                          <div className="text-left md:text-right shrink-0">
                            <span className="text-[10px] font-sans font-bold text-[rgba(225,220,201,0.45)] uppercase tracking-widest block">Deadline</span>
                            <span className="text-sm font-number font-extrabold text-[#FFFFFF] mt-0.5 block">{college.applicationDeadline || "20 June 2025"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-1.5">
                        <div className="w-full sm:max-w-xs">
                          <div className="flex justify-between items-center text-[10px] font-sans font-bold text-[rgba(225,220,201,0.45)] tracking-wider uppercase mb-1">
                            <span>Fit Score</span>
                            <span className="text-[#4CAF50]">{fit}% Match</span>
                          </div>
                          <div className="h-1.5 w-full bg-[#1A1A1A] rounded-full overflow-hidden border border-[rgba(225,220,201,0.04)]">
                            <div 
                              className="h-full bg-gradient-to-r from-[#4CAF50]/80 to-[#4CAF50] transition-all duration-300"
                              style={{ width: `${fit}%` }}
                            />
                          </div>
                        </div>

                        <div className="text-xs text-[rgba(225,220,201,0.65)] font-sans sm:text-right w-full sm:w-auto">
                          You are academically stronger than <span className="font-semibold text-white">{fit - 17}%</span> of admitted students.
                        </div>
                      </div>

                      <div className="bg-[#1F150C]/60 p-3 rounded-xl border border-[rgba(225,220,201,0.06)] text-[11px] text-left leading-relaxed">
                        <span className="font-sans font-bold text-[rgba(225,220,201,0.4)] text-[9px] uppercase tracking-wide">Why Recommended</span>
                        <p className="text-[rgba(225,220,201,0.85)] mt-0.5 font-sans">
                          {college.whyRecommended || "Strong match because your GPA, coding profile, and test vectors align cleanly."}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-[rgba(225,220,201,0.06)] pt-3.5 mt-1">
                        <div className="flex gap-2">
                          {college.majors.slice(0, 2).map((m) => (
                            <Badge key={m} tone="slate" className="text-[9px] py-0 px-2 font-bold">{m}</Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => toggleSaved(profile, saveProfile, college.id)}
                            className="size-9 rounded-xl border border-[rgba(225,220,201,0.08)] text-[rgba(225,220,201,0.6)] hover:text-[#C94A4A] hover:bg-[rgba(201,74,74,0.05)] flex items-center justify-center transition-all duration-150"
                            title={isSaved ? "Saved" : "Save College"}
                          >
                            <Heart size={15} className={cn(isSaved && "fill-[#C94A4A] text-[#C94A4A] scale-110")} />
                          </button>
                          
                          <Button 
                            className="text-xs font-bold py-1.5 px-4 bg-[#412D15] text-[#E1DCC9] border border-[rgba(225,220,201,0.08)] hover:bg-[#523A1D] h-9 rounded-xl flex items-center gap-1.5 transition-all duration-200"
                            onClick={() => navigate(`/colleges/${college.id}`)}
                          >
                            Explore <ArrowRight size={13} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <CardGrid items={sorted} render={(college) => <CollegeCard college={college} />} />
            )
          ) : (
            <Card className="grid place-items-center gap-4 p-12 text-center border-dashed border-2 border-[rgba(225,220,201,0.08)] bg-[#111111]">
              <span className="grid size-14 place-items-center rounded-lg bg-[#1F150C] text-[rgba(225,220,201,0.4)]">
                <Search size={24} />
              </span>
              <div>
                <h3 className="text-lg font-heading font-extrabold text-[#F5F2EA]">No colleges match your filters</h3>
                <p className="text-xs text-[rgba(225,220,201,0.65)] font-sans mt-1">Try relaxing your cost limits or checking different locations.</p>
              </div>
              <Button onClick={clearFilters} className="bg-[#412D15] text-[#E1DCC9] hover:bg-[#523A1D]">Reset Filters</Button>
            </Card>
          )}
        </div>

        {/* Right Panel */}
        <div className="space-y-6">
          {(viewMode === "list" && fitScoreDetails) ? (
            <Card className="p-5 bg-[#111111] border border-[rgba(225,220,201,0.06)] shadow-lg rounded-2xl text-left space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-[rgba(225,220,201,0.08)]">
                <Sparkles size={16} className="text-[#D4A017]" />
                <h2 className="font-heading font-extrabold text-[#F5F2EA] text-xs uppercase tracking-wider">
                  AI Fit Intelligence
                </h2>
              </div>

              <div className="space-y-3">
                <h3 className="text-[10px] font-sans font-bold text-[rgba(225,220,201,0.45)] uppercase tracking-widest">
                  Your Admission Outlook
                </h3>
                
                <div className="relative size-24 mx-auto my-3 shrink-0">
                  <svg className="size-full -rotate-90">
                    <circle cx="48" cy="48" r="38" className="stroke-[rgba(225,220,201,0.08)] fill-none" strokeWidth="6" />
                    <circle
                      cx="48"
                      cy="48"
                      r="38"
                      className="stroke-[#D4A017] fill-none transition-all duration-500"
                      strokeWidth="6"
                      strokeDasharray={2 * Math.PI * 38}
                      strokeDashoffset={2 * Math.PI * 38 - (fitScoreDetails.fitScore / 100) * (2 * Math.PI * 38)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-number font-extrabold text-[#FFFFFF]">
                      {fitScoreDetails.fitScore}
                    </span>
                    <span className="text-[7px] text-[rgba(225,220,201,0.5)] font-sans font-semibold uppercase tracking-wider">
                      / 100 Fit
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[rgba(225,220,201,0.6)]">Academic Fit</span>
                    <span className="font-bold text-[#4CAF50]">{fitScoreDetails.academicFit}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[rgba(225,220,201,0.6)]">Financial Fit</span>
                    <span className="font-bold text-[#D4A017]">{fitScoreDetails.financialFit}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[rgba(225,220,201,0.6)]">Competition Level</span>
                    <span className="font-bold text-[#D4A017]">{fitScoreDetails.competitionLevel}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[rgba(225,220,201,0.6)]">Recommendation</span>
                    <span className="font-bold text-[#4CAF50]">{fitScoreDetails.recommendation}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-[rgba(225,220,201,0.08)]">
                <h3 className="text-[10px] font-sans font-bold text-[rgba(225,220,201,0.45)] uppercase tracking-widest">
                  Probability Distribution
                </h3>

                <div className="flex items-center gap-4">
                  <div className="relative size-16 shrink-0 rotate-90">
                    <svg className="size-full">
                      <circle
                        cx="32"
                        cy="32"
                        r="22"
                        className="stroke-[#4CAF50] fill-none"
                        strokeWidth="5"
                        strokeDasharray={2 * Math.PI * 22}
                        strokeDashoffset={2 * Math.PI * 22 - (fitScoreDetails.highChance / 100) * (2 * Math.PI * 22)}
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="22"
                        className="stroke-[#D4A017] fill-none"
                        strokeWidth="5"
                        strokeDasharray={2 * Math.PI * 22}
                        strokeDashoffset={2 * Math.PI * 22 - (fitScoreDetails.modChance / 100) * (2 * Math.PI * 22)}
                        style={{ transform: `rotate(${(fitScoreDetails.highChance / 100) * 360}deg)`, transformOrigin: "32px 32px" }}
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="22"
                        className="stroke-[#C94A4A] fill-none"
                        strokeWidth="5"
                        strokeDasharray={2 * Math.PI * 22}
                        strokeDashoffset={2 * Math.PI * 22 - (fitScoreDetails.lowChance / 100) * (2 * Math.PI * 22)}
                        style={{ transform: `rotate(${((fitScoreDetails.highChance + fitScoreDetails.modChance) / 100) * 360}deg)`, transformOrigin: "32px 32px" }}
                      />
                    </svg>
                  </div>

                  <div className="space-y-1 text-[11px] font-semibold w-full">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-[#4CAF50]" />
                        <span className="text-[rgba(225,220,201,0.7)]">High Chance</span>
                      </div>
                      <span className="text-white">{fitScoreDetails.highChance}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-[#D4A017]" />
                        <span className="text-[rgba(225,220,201,0.7)]">Moderate</span>
                      </div>
                      <span className="text-white">{fitScoreDetails.modChance}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-[#C94A4A]" />
                        <span className="text-[rgba(225,220,201,0.7)]">Low Chance</span>
                      </div>
                      <span className="text-white">{fitScoreDetails.lowChance}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-[rgba(225,220,201,0.08)]">
                <h3 className="text-[10px] font-sans font-bold text-[rgba(225,220,201,0.45)] uppercase tracking-widest">
                  Top Strength Factors
                </h3>

                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between items-center text-[10px] mb-1">
                      <span className="text-[rgba(225,220,201,0.7)] font-sans">GPA & Academics</span>
                      <span className="font-number font-extrabold text-[#FFFFFF]">{fitScoreDetails.scoreGpa} / 10</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1A1A1A] rounded-full overflow-hidden">
                      <div className="h-full bg-[#4CAF50]" style={{ width: `${Number(fitScoreDetails.scoreGpa) * 10}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-[10px] mb-1">
                      <span className="text-[rgba(225,220,201,0.7)] font-sans">Coding & Projects</span>
                      <span className="font-number font-extrabold text-[#FFFFFF]">{fitScoreDetails.scoreCoding} / 10</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1A1A1A] rounded-full overflow-hidden">
                      <div className="h-full bg-[#4CAF50]" style={{ width: `${Number(fitScoreDetails.scoreCoding) * 10}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-[10px] mb-1">
                      <span className="text-[rgba(225,220,201,0.7)] font-sans">Extracurriculars</span>
                      <span className="font-number font-extrabold text-[#FFFFFF]">{fitScoreDetails.scoreExtracurriculars} / 10</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1A1A1A] rounded-full overflow-hidden">
                      <div className="h-full bg-[#D4A017]" style={{ width: `${Number(fitScoreDetails.scoreExtracurriculars) * 10}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-[10px] mb-1">
                      <span className="text-[rgba(225,220,201,0.7)] font-sans">Leadership</span>
                      <span className="font-number font-extrabold text-[#FFFFFF]">{fitScoreDetails.scoreLeadership} / 10</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1A1A1A] rounded-full overflow-hidden">
                      <div className="h-full bg-[#D4A017]" style={{ width: `${Number(fitScoreDetails.scoreLeadership) * 10}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate(`/colleges/${selectedCollegeId}`)}
                className="w-full text-center py-2 bg-[#412D15] hover:bg-[#523A1D] text-[#E1DCC9] border border-[rgba(225,220,201,0.08)] font-sans font-bold text-xs rounded-xl transition-all duration-200"
              >
                View Detailed Analysis &nearr;
              </button>

            </Card>
          ) : (
            <Card className="p-5 bg-[#111111] border border-[rgba(225,220,201,0.06)] shadow-lg rounded-2xl text-left space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-[rgba(225,220,201,0.08)]">
                <BarChart3 size={18} className="text-[#E1DCC9]" />
                <h2 className="font-heading font-extrabold text-[#F5F2EA] text-xs uppercase tracking-wider">
                  Selection Insights
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-sans font-bold text-[rgba(225,220,201,0.45)] uppercase tracking-widest block">Average Tuition</span>
                  <p className="text-base font-number font-extrabold text-[#FFFFFF] mt-1">
                    {formatMoney(selectionInsights.avgTuition)} / yr
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-sans font-bold text-[rgba(225,220,201,0.45)] uppercase tracking-widest block">Avg Acceptance Rate</span>
                  <p className="text-base font-number font-extrabold text-[#FFFFFF] mt-1">
                    {selectionInsights.avgAcceptance.toFixed(1)}%
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-sans font-bold text-[rgba(225,220,201,0.45)] uppercase tracking-widest block">Top Locations</span>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {selectionInsights.topStates.map(st => (
                      <Badge key={st} tone="blue" className="text-[9px] font-bold py-0.5 px-2">{st}</Badge>
                    ))}
                    {selectionInsights.topStates.length === 0 && <span className="text-xs text-slate-400 dark:text-slate-500 italic">None</span>}
                  </div>
                </div>

                <div className="pt-2 border-t border-[rgba(225,220,201,0.08)] space-y-3">
                  <span className="text-[10px] font-sans font-bold text-[rgba(225,220,201,0.45)] uppercase tracking-widest block">Top Matches</span>
                  <div className="space-y-2">
                    {selectionInsights.bestMatches.map(c => {
                      const score = calculateFitScore(profile, c);
                      return (
                        <div 
                          key={c.id} 
                          onClick={() => navigate(`/colleges/${c.id}`)}
                          className="p-2.5 rounded-lg border border-[rgba(225,220,201,0.05)] bg-[#1A1A1A]/40 cursor-pointer hover:border-[rgba(225,220,201,0.15)] flex items-center justify-between gap-2 transition-all duration-200"
                        >
                          <div className="min-w-0">
                            <p className="font-heading font-bold text-xs text-[#FFFFFF] truncate">{c.name}</p>
                            <p className="text-[9px] text-[rgba(225,220,201,0.5)] font-sans mt-0.5">{c.city}, {c.state}</p>
                          </div>
                          <span className="text-[10px] font-number font-extrabold text-[#4CAF50] shrink-0">
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
          )}
        </div>

      </div>
    </Page>
  );
}
