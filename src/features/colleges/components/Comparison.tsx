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
          <Card className="p-6 bg-[#111111] border border-[rgba(225,220,201,0.06)] shadow-[0px_12px_32px_rgba(0,0,0,0.35)] rounded-2xl flex flex-col md:flex-row items-center gap-6">
            <span className="grid size-16 place-items-center rounded-2xl bg-[#1F150C] border border-[rgba(225,220,201,0.1)] text-[#E1DCC9] shrink-0 shadow-sm">
              <BarChart3 size={32} />
            </span>
            <div className="space-y-2">
              <h3 className="text-lg font-heading font-extrabold text-[#F5F2EA]">
                Side-by-Side College Analytics
              </h3>
              <p className="text-xs text-[rgba(225,220,201,0.65)] font-sans leading-relaxed">
                Compare up to 4 saved colleges at once. Evaluate critical benchmarks like average placement rates, CS rankings, tuition fees, starting salaries, student-faculty ratios, and fit match percentages.
              </p>
            </div>
          </Card>

          {/* Selector widget */}
          <Card className="p-6 bg-[#111111] border border-[rgba(225,220,201,0.06)] shadow-[0px_12px_32px_rgba(0,0,0,0.35)] rounded-2xl text-center space-y-4 relative z-10">
            <div>
              <h4 className="font-heading font-extrabold text-sm text-[#F5F2EA]">Select colleges to compare</h4>
              <p className="text-xs text-[rgba(225,220,201,0.45)] font-sans mt-0.5">Choose colleges from your saved list or browse the catalog.</p>
            </div>
            
            <div className="max-w-md mx-auto">
              <CollegeCompareSelector />
            </div>

            <div className="flex items-center justify-center gap-2 mt-2 font-sans">
              <span className="text-[10px] text-[rgba(225,220,201,0.4)] font-bold uppercase tracking-wider">Or</span>
              <Link to="/colleges" className="text-xs text-[#E1DCC9] hover:text-[#FFFFFF] font-bold flex items-center gap-0.5 transition-colors">
                Browse college explorer <ArrowRight size={13} />
              </Link>
            </div>
          </Card>

          {/* Benefits bullets list */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 bg-[#1F150C]/60 rounded-xl border border-[rgba(225,220,201,0.06)] space-y-1">
              <span className="text-[10px] font-sans font-bold text-[rgba(225,220,201,0.4)] uppercase tracking-widest block">Cost & Affordability</span>
              <p className="text-xs font-sans text-[rgba(225,220,201,0.65)] leading-relaxed">Filter and view tuition fee differences and available aid guidelines.</p>
            </div>
            <div className="p-4 bg-[#1F150C]/60 rounded-xl border border-[rgba(225,220,201,0.06)] space-y-1">
              <span className="text-[10px] font-sans font-bold text-[rgba(225,220,201,0.4)] uppercase tracking-widest block">Academic Prestige</span>
              <p className="text-xs font-sans text-[rgba(225,220,201,0.65)] leading-relaxed">Check national rankings, median admitted GPA requirements, and class ratios.</p>
            </div>
            <div className="p-4 bg-[#1F150C]/60 rounded-xl border border-[rgba(225,220,201,0.06)] space-y-1">
              <span className="text-[10px] font-sans font-bold text-[rgba(225,220,201,0.4)] uppercase tracking-widest block">Career Outcomes</span>
              <p className="text-xs font-sans text-[rgba(225,220,201,0.65)] leading-relaxed">Analyze placement statistics, average starting salaries, and top programs.</p>
            </div>
          </div>

        </div>
      </Page>
    );
  }

  // Render the matrix rows
  const matrixRows: { label: string; getVal: (c: College) => React.ReactNode; isNumber?: boolean }[] = [
    { label: "Fit Score", getVal: (c) => <span className="font-extrabold text-[#4CAF50]">{calculateFitScore(profile, c)}% Match</span>, isNumber: true },
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111111] p-3 rounded-2xl border border-[rgba(225,220,201,0.06)] shadow-sm mb-4 relative z-20">
        <Button variant="outline" className="w-fit border-[rgba(225,220,201,0.08)] bg-transparent text-[#E1DCC9] hover:bg-[#1A1A1A] hover:text-[#FFFFFF] text-xs transition-colors duration-200" onClick={clearCompare}>
          <X size={15} /> Clear comparison
        </Button>
        <div className="max-w-xs w-full">
          <CollegeCompareSelector />
        </div>
      </div>

      <Card className="overflow-x-auto bg-[#111111] border border-[rgba(225,220,201,0.06)]">
        <table className="w-full min-w-[800px] text-left text-sm border-collapse font-sans">
          <thead>
            <tr className="border-b border-[rgba(225,220,201,0.08)] bg-[#1A1A1A]/80">
              <th className="p-4 w-48 text-xs font-sans font-bold text-[rgba(225,220,201,0.4)] uppercase tracking-widest">Metric</th>
              {selected.map((c) => {
                const isAffordable = highlights.mostAffordableId === c.id;
                const isMatch = highlights.highestMatchId === c.id;
                const isCompetitive = highlights.mostCompetitiveId === c.id;
                const isBestValue = highlights.bestValueId === c.id;

                return (
                  <th className="p-4 relative group align-top border-l border-[rgba(225,220,201,0.08)]" key={c.id}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-heading font-extrabold text-sm text-[#F5F2EA] truncate max-w-[150px]" title={c.name}>
                          {c.name}
                        </span>
                        <button
                          type="button"
                          className="size-5 rounded-full hover:bg-[rgba(201,74,74,0.08)] text-[rgba(225,220,201,0.6)] hover:text-[#C94A4A] flex items-center justify-center transition-colors shrink-0"
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
          <tbody className="divide-y divide-[rgba(225,220,201,0.06)]">
            {matrixRows.map(({ label, getVal, isNumber }) => (
              <tr className="hover:bg-[#1A1A1A]/40 transition-colors" key={label}>
                <td className="p-4 font-semibold text-[rgba(225,220,201,0.75)]">{label}</td>
                {selected.map((college) => (
                  <td 
                    className={cn(
                      "p-4 align-top text-[rgba(225,220,201,0.65)] border-l border-[rgba(225,220,201,0.06)]",
                      isNumber && "font-number font-medium text-[#FFFFFF]"
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
