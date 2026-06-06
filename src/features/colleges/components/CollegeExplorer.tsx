import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
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
  calculateFitScore
} from "../../../shared";
import { CollegeCard } from "./CollegeCard";

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
