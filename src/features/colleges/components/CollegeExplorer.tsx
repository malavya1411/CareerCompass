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
import { createPortal } from "react-dom";
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
  const [showDrawer, setShowDrawer] = useState(false);
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
    function handleScroll() {
      setShowFilters(false);
    }
    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [showFilters]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowFilters(false);
        setShowDrawer(false);
      }
    }
    if (showFilters || showDrawer) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showFilters, showDrawer]);

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
      <div className="w-full">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 text-muted" size={16} />
              <Input
                className="pl-10 h-10 bg-transparent dark:bg-[#111111]"
                placeholder="Search colleges by name, location, or major..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="absolute right-3 top-3 text-muted hover:text-primary transition-colors"
                  onClick={() => setSearch("")}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-sans font-bold text-muted uppercase tracking-widest whitespace-nowrap">Sort By</label>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-10 text-xs w-44 bg-transparent dark:bg-[#111111]"
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
                      ? "bg-[#4C43CD]/10 text-[#4C43CD] border-[#4C43CD]/20 dark:bg-[#1F150C] dark:text-[#FFFFFF] dark:border-[rgba(225,220,201,0.2)] shadow-sm"
                      : "bg-[#FBFAF2] text-secondary border-[rgba(0,0,0,0.08)] hover:bg-[#F1EEDD] dark:bg-[#111111] dark:text-[#E1DCC9] dark:border-[rgba(225,220,201,0.08)] dark:hover:bg-[#1A1A1A]"
                  )}
                >
                  <SlidersHorizontal size={14} />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="grid place-items-center size-5 rounded-full bg-[#4C43CD] dark:bg-[#412D15] border border-[rgba(76,67,205,0.15)] dark:border-[rgba(225,220,201,0.15)] text-[9px] font-bold text-white dark:text-[#E1DCC9]">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {showFilters && (
                  <div className="absolute right-0 mt-2 w-72 bg-[#FBFAF2] dark:bg-[#111111] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(225,220,201,0.08)] p-5 rounded-2xl shadow-[0px_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0px_8px_32px_rgba(0,0,0,0.6)] z-50 space-y-5 text-left">
                    <div className="flex items-center justify-between pb-3 border-b border-[rgba(0,0,0,0.08)] dark:border-b-[rgba(225,220,201,0.08)]">
                      <span className="font-heading font-extrabold text-primary text-xs uppercase tracking-wider">
                        Advanced Filters
                      </span>
                      <button
                        className="text-[10px] text-muted hover:text-primary font-bold uppercase tracking-wider transition-colors"
                        onClick={clearFilters}
                      >
                        Clear All
                      </button>
                    </div>

                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-sans font-bold text-muted uppercase tracking-widest block">Location (State)</label>
                      <Select 
                        value={state} 
                        onChange={(e) => setState(e.target.value)}
                        className="h-9 text-xs w-full"
                      >
                        <option value="All">All States</option>
                        {states.map((s) => <option key={s} value={s}>{s}</option>)}
                      </Select>
                    </div>

                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-sans font-bold text-muted uppercase tracking-widest block mb-1">College Type</label>
                      <div className="space-y-2">
                        {["Public", "Private"].map((t) => (
                          <label key={t} className="flex items-center gap-2.5 text-xs text-secondary font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedTypes.includes(t)}
                              onChange={() => toggleType(t)}
                              className="rounded border-[rgba(0,0,0,0.15)] dark:border-[rgba(225,220,201,0.15)] bg-[#FBFAF2] dark:bg-[#111111] text-[#4C43CD] dark:text-[#E1DCC9] focus:ring-0 focus:ring-offset-0 size-4 cursor-pointer"
                            />
                            {t}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 text-left">
                      <div className="flex justify-between text-[10px] font-sans font-bold text-muted uppercase tracking-widest">
                        <span>Acceptance Rate</span>
                        <span className="text-primary font-number font-bold">≤ {maxAcceptanceRate}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={maxAcceptanceRate}
                        onChange={(e) => setMaxAcceptanceRate(Number(e.target.value))}
                        className="w-full h-1.5 bg-[#F1EEDD] dark:bg-[#1A1A1A] rounded-lg appearance-none cursor-pointer accent-[#4C43CD] dark:accent-[#E1DCC9] border border-[rgba(0,0,0,0.04)] dark:border-[rgba(225,220,201,0.04)]"
                      />
                    </div>

                    <div className="space-y-2 text-left">
                      <div className="flex justify-between text-[10px] font-sans font-bold text-muted uppercase tracking-widest">
                        <span>Max Cost / Yr</span>
                        <span className="text-primary font-number font-bold">{formatMoney(maxCost)}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1500000"
                        step="25000"
                        value={maxCost}
                        onChange={(e) => setMaxCost(Number(e.target.value))}
                        className="w-full h-1.5 bg-[#F1EEDD] dark:bg-[#1A1A1A] rounded-lg appearance-none cursor-pointer accent-[#4C43CD] dark:accent-[#E1DCC9] border border-[rgba(0,0,0,0.04)] dark:border-[rgba(225,220,201,0.04)]"
                      />
                    </div>

                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-sans font-bold text-muted uppercase tracking-widest block mb-1">Campus Size</label>
                      <div className="space-y-2">
                        {[
                          { name: "Small", label: "Small (< 5k)" },
                          { name: "Medium", label: "Medium (5k - 15k)" },
                          { name: "Large", label: "Large (> 15k)" }
                        ].map((sz) => (
                          <label key={sz.name} className="flex items-center gap-2.5 text-xs text-secondary font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedSizes.includes(sz.name)}
                              onChange={() => toggleSize(sz.name)}
                              className="rounded border-[rgba(0,0,0,0.15)] dark:border-[rgba(225,220,201,0.15)] bg-[#FBFAF2] dark:bg-[#111111] text-[#4C43CD] dark:text-[#E1DCC9] focus:ring-0 focus:ring-offset-0 size-4 cursor-pointer"
                            />
                            {sz.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 text-left pt-2 border-t border-[rgba(0,0,0,0.08)] dark:border-t-[rgba(225,220,201,0.08)]">
                      <label className="text-[10px] font-sans font-bold text-muted uppercase tracking-widest block">Top Majors</label>
                      <Select 
                        value={selectedMajor} 
                        onChange={(e) => setSelectedMajor(e.target.value)}
                        className="h-9 text-xs w-full"
                      >
                        <option value="All">All Majors</option>
                        {allMajors.map((m) => <option key={m} value={m}>{m}</option>)}
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Insights Slide-over Trigger */}
              <button 
                onClick={() => setShowDrawer(!showDrawer)}
                className={cn(
                  "h-10 px-4 rounded-xl text-xs font-sans font-bold transition-all duration-150 flex items-center gap-1.5 border",
                  showDrawer
                    ? "bg-[#3930B8] text-white border-[#3930B8] dark:bg-[#5A3B19] dark:text-[#FFFFFF] dark:border-[#6A4520] shadow-md"
                    : "bg-[#4C43CD] text-white hover:bg-[#3930B8] border-[#4C43CD] dark:bg-[#412D15] dark:text-[#E1DCC9] dark:border-[rgba(225,220,201,0.08)] dark:hover:bg-[#5A3B19] dark:hover:text-[#FFFFFF]"
                )}
              >
                <Sparkles size={14} className="text-[#D4A017]" />
                <span>✦ AI Insights</span>
              </button>
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between pb-2 text-xs font-sans font-bold text-muted uppercase tracking-wider pl-1">
            <span>Found {sorted.length} colleges</span>
          </div>

          {/* Desktop 3-Column Grid */}
          {sorted.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sorted.map((college) => (
                <CollegeCard 
                  key={college.id} 
                  college={college} 
                  isSelected={selectedCollegeId === college.id}
                  onSelect={() => {
                    setSelectedCollegeId(college.id);
                  }}
                />
              ))}
            </div>
          ) : (
            <Card className="grid place-items-center gap-4 p-12 text-center border-dashed border-2 border-[rgba(0,0,0,0.08)] dark:border-[rgba(225,220,201,0.08)] bg-transparent">
              <span className="grid size-14 place-items-center rounded-lg bg-[#F1EEDD] dark:bg-[#1F150C] text-muted">
                <Search size={24} />
              </span>
              <div>
                <h3 className="text-lg font-heading font-extrabold text-primary">No colleges match your filters</h3>
                <p className="text-xs text-secondary font-sans mt-1">Try relaxing your cost limits or checking different locations.</p>
              </div>
              <Button onClick={clearFilters} className="bg-[#4C43CD] dark:bg-[#412D15] text-white hover:bg-[#3930B8] dark:hover:bg-[#523A1D]">Reset Filters</Button>
            </Card>
          )}
        </div>

      </div>

      {createPortal(
        <>
          {/* Centered Modal Panel Overlay */}
          {showDrawer && (
            <div 
              className="fixed inset-0 bg-slate-950/50 z-50 backdrop-blur-sm transition-opacity duration-300 flex items-center justify-center p-4 modal-overlay"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowDrawer(false);
                }
              }}
            >
              <div 
                className="w-full max-w-[460px] bg-[#FBFAF2] dark:bg-[#111111] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(225,220,201,0.08)] rounded-2xl shadow-[0px_0px_48px_rgba(0,0,0,0.15)] dark:shadow-[0px_0px_48px_rgba(0,0,0,0.8)] flex flex-col justify-between text-left max-h-[85vh] overflow-hidden modal-content"
              >
            {selectedCollege && fitScoreDetails ? (
              <>
                {/* Drawer Header */}
                <div className="p-4 bg-[#F1EEDD] dark:bg-[#1F150C] border-b border-[rgba(0,0,0,0.08)] dark:border-b-[rgba(225,220,201,0.08)] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary">
                    <Sparkles size={16} className="text-[#D4A017]" />
                    <span className="font-heading font-extrabold text-xs uppercase tracking-wider">AI Fit Intelligence</span>
                  </div>
                  <button 
                    onClick={() => setShowDrawer(false)}
                    className="size-7 rounded-lg border border-[rgba(0,0,0,0.08)] dark:border-[rgba(225,220,201,0.08)] text-secondary dark:text-[rgba(225,220,201,0.6)] hover:bg-[#F1EEDD] dark:hover:bg-[#1A1A1A] hover:text-primary dark:hover:text-[#FFFFFF] flex items-center justify-center transition-all duration-150"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Drawer Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                  {/* College basic info */}
                  <div>
                    <h3 className="font-heading font-extrabold text-primary text-base leading-snug">{selectedCollege.name}</h3>
                    <p className="text-xs text-secondary font-sans font-semibold flex items-center gap-1 mt-0.5">
                      <MapPin size={11} className="text-muted" /> {selectedCollege.city}, {selectedCollege.state}
                    </p>
                  </div>

                  {/* Admission Outlook */}
                  <div className="space-y-3 pt-3 border-t border-[rgba(0,0,0,0.08)] dark:border-t-[rgba(225,220,201,0.08)]">
                    <h4 className="text-[10px] font-sans font-bold text-muted uppercase tracking-widest">
                      Your Admission Outlook
                    </h4>

                    <div className="relative size-24 mx-auto my-3 shrink-0">
                      <svg className="size-full -rotate-90">
                        <circle cx="48" cy="48" r="38" className="stroke-[rgba(0,0,0,0.08)] dark:stroke-[rgba(225,220,201,0.08)] fill-none" strokeWidth="6" />
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
                        <span className="text-xl font-number font-extrabold text-primary">
                          {fitScoreDetails.fitScore}
                        </span>
                        <span className="text-[7px] text-muted font-sans font-semibold uppercase tracking-wider">
                          / 100 Fit
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1 font-sans text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-secondary font-semibold">Academic Fit</span>
                        <span className="font-bold text-[#4CAF50]">{fitScoreDetails.academicFit}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-secondary font-semibold">Financial Fit</span>
                        <span className="font-bold text-[#D4A017]">{fitScoreDetails.financialFit}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-secondary font-semibold">Competition Level</span>
                        <span className="font-bold text-[#D4A017]">{fitScoreDetails.competitionLevel}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-secondary font-semibold">Recommendation</span>
                        <span className="font-bold text-[#4CAF50]">{fitScoreDetails.recommendation}</span>
                      </div>
                    </div>
                  </div>

                  {/* Top Strength Factors */}
                  <div className="space-y-3 pt-4 border-t border-[rgba(0,0,0,0.08)] dark:border-t-[rgba(225,220,201,0.08)]">
                    <h4 className="text-[10px] font-sans font-bold text-muted uppercase tracking-widest">
                      Top Strength Factors
                    </h4>

                    <div className="space-y-2.5 font-sans">
                      <div>
                        <div className="flex justify-between items-center text-[10px] mb-1">
                          <span className="text-secondary font-semibold">GPA & Academics</span>
                          <span className="font-number font-extrabold text-primary">{fitScoreDetails.scoreGpa} / 10</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#F1EEDD] dark:bg-[#1A1A1A] rounded-full overflow-hidden border border-[rgba(0,0,0,0.04)] dark:border-[rgba(225,220,201,0.04)]">
                          <div className="h-full bg-[#4CAF50]" style={{ width: `${Number(fitScoreDetails.scoreGpa) * 10}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center text-[10px] mb-1">
                          <span className="text-secondary font-semibold">Coding & Projects</span>
                          <span className="font-number font-extrabold text-primary">{fitScoreDetails.scoreCoding} / 10</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#F1EEDD] dark:bg-[#1A1A1A] rounded-full overflow-hidden border border-[rgba(0,0,0,0.04)] dark:border-[rgba(225,220,201,0.04)]">
                          <div className="h-full bg-[#4CAF50]" style={{ width: `${Number(fitScoreDetails.scoreCoding) * 10}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center text-[10px] mb-1">
                          <span className="text-secondary font-semibold">Extracurriculars</span>
                          <span className="font-number font-extrabold text-primary">{fitScoreDetails.scoreExtracurriculars} / 10</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#F1EEDD] dark:bg-[#1A1A1A] rounded-full overflow-hidden border border-[rgba(0,0,0,0.04)] dark:border-[rgba(225,220,201,0.04)]">
                          <div className="h-full bg-[#D4A017]" style={{ width: `${Number(fitScoreDetails.scoreExtracurriculars) * 10}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center text-[10px] mb-1">
                          <span className="text-secondary font-semibold">Leadership</span>
                          <span className="font-number font-extrabold text-primary">{fitScoreDetails.scoreLeadership} / 10</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#F1EEDD] dark:bg-[#1A1A1A] rounded-full overflow-hidden border border-[rgba(0,0,0,0.04)] dark:border-[rgba(225,220,201,0.04)]">
                          <div className="h-full bg-[#D4A017]" style={{ width: `${Number(fitScoreDetails.scoreLeadership) * 10}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scholarship Chances */}
                  <div className="space-y-3 pt-4 border-t border-[rgba(0,0,0,0.08)] dark:border-t-[rgba(225,220,201,0.08)]">
                    <h4 className="text-[10px] font-sans font-bold text-muted uppercase tracking-widest">
                      Scholarship Chances
                    </h4>
                    <div className="p-3 bg-[#F1EEDD]/40 dark:bg-[#1F150C]/40 border border-[rgba(0,0,0,0.06)] dark:border-[rgba(225,220,201,0.06)] rounded-xl text-xs leading-relaxed text-secondary dark:text-[rgba(225,220,201,0.85)] font-sans">
                      {selectedCollege.scholarships || "No institutional scholarships configured. Verify other general government financial aid paths."}
                    </div>
                  </div>

                  {/* Recommended Actions */}
                  <div className="space-y-3 pt-4 border-t border-[rgba(0,0,0,0.08)] dark:border-t-[rgba(225,220,201,0.08)]">
                    <h4 className="text-[10px] font-sans font-bold text-muted uppercase tracking-widest">
                      Recommended Actions
                    </h4>
                    <div className="space-y-2 text-xs font-sans">
                      {fitScoreDetails.recommendation === "Apply Early" ? (
                        <>
                          <div className="flex items-start gap-2.5">
                            <input type="checkbox" readOnly checked className="mt-0.5 rounded border-[rgba(0,0,0,0.15)] dark:border-[rgba(225,220,201,0.15)] bg-[#FBFAF2] dark:bg-[#111111] text-[#D4A017] focus:ring-0" />
                            <span className="text-secondary">Submit early application before Nov 1.</span>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <input type="checkbox" readOnly checked className="mt-0.5 rounded border-[rgba(0,0,0,0.15)] dark:border-[rgba(225,220,201,0.15)] bg-[#FBFAF2] dark:bg-[#111111] text-[#D4A017] focus:ring-0" />
                            <span className="text-secondary">Request counselor recommendations.</span>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <input type="checkbox" readOnly className="mt-0.5 rounded border-[rgba(0,0,0,0.15)] dark:border-[rgba(225,220,201,0.15)] bg-[#FBFAF2] dark:bg-[#111111] text-[#D4A017] focus:ring-0" />
                            <span className="text-secondary">Polish supplemental program essay prompt.</span>
                          </div>
                        </>
                      ) : fitScoreDetails.recommendation === "Reach School" ? (
                        <>
                          <div className="flex items-start gap-2.5">
                            <input type="checkbox" readOnly className="mt-0.5 rounded border-[rgba(0,0,0,0.15)] dark:border-[rgba(225,220,201,0.15)] bg-[#FBFAF2] dark:bg-[#111111] text-[#D4A017] focus:ring-0" />
                            <span className="text-secondary">Retake standardized tests to boost scores.</span>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <input type="checkbox" readOnly className="mt-0.5 rounded border-[rgba(0,0,0,0.15)] dark:border-[rgba(225,220,201,0.15)] bg-[#FBFAF2] dark:bg-[#111111] text-[#D4A017] focus:ring-0" />
                            <span className="text-secondary">Highlight technical portfolio or coding leadership.</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-start gap-2.5">
                            <input type="checkbox" readOnly className="mt-0.5 rounded border-[rgba(0,0,0,0.15)] dark:border-[rgba(225,220,201,0.15)] bg-[#FBFAF2] dark:bg-[#111111] text-[#D4A017] focus:ring-0" />
                            <span className="text-secondary">Organize mock interview and plan campus visit.</span>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <input type="checkbox" readOnly className="mt-0.5 rounded border-[rgba(0,0,0,0.15)] dark:border-[rgba(225,220,201,0.15)] bg-[#FBFAF2] dark:bg-[#111111] text-[#D4A017] focus:ring-0" />
                            <span className="text-secondary">Draft generic application checklist.</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Drawer Footer Actions */}
                <div className="p-4 bg-[#FBFAF2] dark:bg-[#111111] border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(225,220,201,0.08)] flex gap-3">
                  <button 
                    onClick={() => navigate(`/colleges/${selectedCollege.id}`)}
                    className="flex-1 py-2 bg-[#4C43CD] hover:bg-[#3930B8] text-white dark:bg-[#412D15] dark:hover:bg-[#5A3B19] dark:text-[#E1DCC9] border border-[#4C43CD] dark:border-[rgba(225,220,201,0.08)] font-sans font-bold text-xs rounded-xl transition-all duration-200 text-center"
                  >
                    View Detailed Analysis &rarr;
                  </button>
                  <button 
                    onClick={() => toggleSaved(profile, saveProfile, selectedCollege.id)}
                    className="px-4 py-2 border border-[rgba(0,0,0,0.08)] dark:border-[rgba(225,220,201,0.08)] hover:bg-[#F1EEDD] dark:hover:bg-[#1A1A1A] font-sans font-bold text-xs text-secondary dark:text-[#E1DCC9] hover:text-primary dark:hover:text-white rounded-xl transition-all duration-200"
                  >
                    {profile?.savedColleges?.includes(selectedCollege.id) ? "Saved" : "Save"}
                  </button>
                </div>
              </>
            ) : (
              <div className="p-6 text-center text-secondary text-xs italic">Select a college to view AI insights.</div>
            )}
          </div>
        </div>
      )}
    </>,
        document.body
      )}
    </Page>
  );
}
