import { Link } from "react-router-dom";
import { ArrowRight, X, BarChart3, Trash2, Award, Heart, CheckCircle2 } from "lucide-react";
import { useCatalog, Page, Card, Button, formatMoney, initials, calculateFitScore, Badge, cn } from "../../../shared";
import { useCompare } from "../state/CompareContext";
import { CollegeCompareSelector } from "./CollegeCompareSelector";
import type { College } from "../../../shared";
import React, { useMemo } from "react";
import { useAuth } from "../../auth";

export function Comparison() {
  const { profile } = useAuth();
  const { colleges } = useCatalog();
  const { compareIds, clearCompare, toggleCompare } = useCompare();
  const selected = colleges.filter((college) => compareIds.includes(college.id));

  // Dynamic Highlights Calculations
  const highlights = useMemo(() => {
    if (selected.length === 0) return {};
    
    let mostAffordable = selected[0];
    let highestMatch = selected[0];
    let mostCompetitive = selected[0];
    let bestValue = selected[0];

    let highestRatio = (selected[0].averageSalary || 800000) / (selected[0].tuition || 1);

    selected.forEach((c) => {
      // Most Affordable: lowest tuition
      if (c.tuition < mostAffordable.tuition) {
        mostAffordable = c;
      }
      // Highest Match: highest fit score
      if (calculateFitScore(profile, c) > calculateFitScore(profile, highestMatch)) {
        highestMatch = c;
      }
      // Most Competitive: lowest acceptance rate
      if (c.acceptanceRate < mostCompetitive.acceptanceRate) {
        mostCompetitive = c;
      }
      // Best Value: highest starting salary to tuition ratio
      const ratio = (c.averageSalary || 800000) / (c.tuition || 1);
      if (ratio > highestRatio) {
        highestRatio = ratio;
        bestValue = c;
      }
    });

    return {
      mostAffordableId: mostAffordable.id,
      highestMatchId: highestMatch.id,
      mostCompetitiveId: mostCompetitive.id,
      bestValueId: bestValue.id
    };
  }, [selected, profile]);

  if (selected.length === 0) {
    return (
      <Page title="College Comparison" subtitle="Compare cost details, admission chances, CS rankings, and salary outcomes.">
        <div className="mx-auto max-w-3xl py-6 space-y-8 text-left">
          
          {/* Comparison Benefits Info Card */}
          <Card className="p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl flex flex-col md:flex-row items-center gap-6">
            <span className="grid size-16 place-items-center rounded-2xl bg-blue-50 dark:bg-blue-950 text-brand dark:text-blue-400 shrink-0 shadow-sm">
              <BarChart3 size={32} />
            </span>
            <div className="space-y-2">
              <h3 className="text-lg font-heading font-extrabold text-slate-800 dark:text-white">
                Side-by-Side College Analytics
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-sans leading-relaxed">
                Compare up to 4 saved colleges at once. Evaluate critical benchmarks like average placement rates, CS rankings, tuition fees, starting salaries, student-faculty ratios, and fit match percentages.
              </p>
            </div>
          </Card>

          {/* Selector widget */}
          <Card className="p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl text-center space-y-4 relative z-10">
            <div>
              <h4 className="font-heading font-extrabold text-sm text-slate-800 dark:text-white">Select colleges to compare</h4>
              <p className="text-xs text-slate-400 dark:text-[#94A3B8] font-sans mt-0.5">Choose colleges from your saved list or browse the catalog.</p>
            </div>
            
            <div className="max-w-md mx-auto">
              <CollegeCompareSelector />
            </div>

            <div className="flex items-center justify-center gap-2 mt-2 font-sans">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Or</span>
              <Link to="/colleges" className="text-xs text-brand dark:text-blue-400 hover:text-brand-hover font-bold flex items-center gap-0.5">
                Browse college explorer <ArrowRight size={13} />
              </Link>
            </div>
          </Card>

          {/* Benefits bullets list */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-850 space-y-1">
              <span className="text-[10px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Cost & Affordability</span>
              <p className="text-xs font-sans text-slate-600 dark:text-[#94A3B8] leading-relaxed">Filter and view tuition fee differences and available aid guidelines.</p>
            </div>
            <div className="p-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-850 space-y-1">
              <span className="text-[10px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Academic Prestige</span>
              <p className="text-xs font-sans text-slate-600 dark:text-[#94A3B8] leading-relaxed">Check national rankings, median admitted GPA requirements, and class ratios.</p>
            </div>
            <div className="p-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-850 space-y-1">
              <span className="text-[10px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Career Outcomes</span>
              <p className="text-xs font-sans text-slate-600 dark:text-[#94A3B8] leading-relaxed">Analyze placement statistics, average starting salaries, and top programs.</p>
            </div>
          </div>

        </div>
      </Page>
    );
  }

  // Render the matrix rows
  const matrixRows: { label: string; getVal: (c: College) => React.ReactNode; isNumber?: boolean }[] = [
    { label: "Fit Score", getVal: (c) => <span className="font-extrabold text-brand dark:text-blue-400">{calculateFitScore(profile, c)}% Match</span>, isNumber: true },
    { label: "Acceptance Rate", getVal: (c) => `${c.acceptanceRate}%`, isNumber: true },
    { label: "Tuition / yr", getVal: (c) => formatMoney(c.tuition), isNumber: true },
    { label: "CS Ranking", getVal: (c) => `#${c.csRanking || "N/A"}`, isNumber: true },
    { label: "Placement Rate", getVal: (c) => `${c.placementRate || 85}%`, isNumber: true },
    { label: "Avg starting salary", getVal: (c) => formatMoney(c.averageSalary || 800000), isNumber: true },
    { label: "Campus Size", getVal: (c) => c.campusSize || "Medium" },
    { label: "Student-Faculty Ratio", getVal: (c) => c.studentFacultyRatio || "14:1" },
    { label: "Scholarships", getVal: (c) => c.scholarships || "No merit aid listed." },
    { label: "Application Deadline", getVal: (c) => c.applicationDeadline || "June 15" },
    { label: "Location", getVal: (c) => `${c.city}, ${c.state}` },
  ];

  return (
    <Page title="College Comparison" subtitle={`${selected.length} of 4 colleges selected for comparison.`}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#1E293B] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-4 relative z-20">
        <Button variant="outline" className="w-fit border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs" onClick={clearCompare}>
          <X size={15} /> Clear comparison
        </Button>
        <div className="max-w-xs w-full">
          <CollegeCompareSelector />
        </div>
      </div>

      <Card className="overflow-x-auto bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800">
        <table className="w-full min-w-[800px] text-left text-sm border-collapse font-sans">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <th className="p-4 w-48 text-xs font-sans font-bold text-slate-400 uppercase tracking-widest">Metric</th>
              {selected.map((c) => {
                const isAffordable = highlights.mostAffordableId === c.id;
                const isMatch = highlights.highestMatchId === c.id;
                const isCompetitive = highlights.mostCompetitiveId === c.id;
                const isBestValue = highlights.bestValueId === c.id;

                return (
                  <th className="p-4 relative group align-top border-l border-slate-100 dark:border-slate-800/80" key={c.id}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-heading font-extrabold text-sm text-slate-800 dark:text-white truncate max-w-[150px]" title={c.name}>
                          {c.name}
                        </span>
                        <button
                          type="button"
                          className="size-5 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-[#DC2626] flex items-center justify-center transition-colors shrink-0"
                          onClick={() => toggleCompare(c.id)}
                          title="Remove from comparison"
                        >
                          <X size={12} />
                        </button>
                      </div>

                      {/* Dynamic highlights tags */}
                      <div className="flex flex-col gap-1.5 pt-0.5">
                        {isMatch && (
                          <Badge tone="blue" className="text-[8px] py-0 px-1.5 uppercase font-bold tracking-widest w-fit">Highest Match</Badge>
                        )}
                        {isBestValue && (
                          <Badge tone="emerald" className="text-[8px] py-0 px-1.5 uppercase font-bold tracking-widest w-fit">Best Value</Badge>
                        )}
                        {isCompetitive && (
                          <Badge tone="rose" className="text-[8px] py-0 px-1.5 uppercase font-bold tracking-widest w-fit">Competitive</Badge>
                        )}
                        {isAffordable && (
                          <Badge tone="amber" className="text-[8px] py-0 px-1.5 uppercase font-bold tracking-widest w-fit">Most Affordable</Badge>
                        )}
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {matrixRows.map(({ label, getVal, isNumber }) => (
              <tr className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition-colors" key={label}>
                <td className="p-4 font-semibold text-slate-700 dark:text-slate-350">{label}</td>
                {selected.map((college) => (
                  <td 
                    className={cn(
                      "p-4 align-top text-slate-600 dark:text-slate-450 border-l border-slate-100 dark:border-slate-800/80",
                      isNumber && "font-number font-medium text-[#0F172A] dark:text-white"
                    )} 
                    key={college.id}
                  >
                    {getVal(college)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </Page>
  );
}
