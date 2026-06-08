import { BriefcaseBusiness, Heart, BarChart3, ArrowRight, TrendingUp, User, Check, Wallet, LineChart } from "lucide-react";
import { Card, Badge, Separator, cn, Button } from "../../../shared";
import type { Career } from "../../../shared";
import { useAuth } from "../../auth";
import React from "react";

export function CareerCard({ 
  career, 
  onSelect,
  onCompareToggle,
  isComparing
}: { 
  career: Career; 
  onSelect?: () => void;
  onCompareToggle?: () => void;
  isComparing?: boolean;
}) {
  const { profile, saveProfile } = useAuth();
  
  // Calculate dynamic match score
  const matchScore = React.useMemo(() => {
    if (!profile) return 70;
    let score = 50;
    if (profile.careerInterests.includes(career.category)) score += 30;
    const matchesMajor = career.relatedMajors.some(m => 
      profile.intendedMajor.toLowerCase().includes(m.toLowerCase()) || m.toLowerCase().includes(profile.intendedMajor.toLowerCase())
    );
    if (matchesMajor) score += 20;
    return Math.min(99, score);
  }, [profile, career]);

  const matchPoints = React.useMemo(() => {
    if (career.matchExplanation) {
      let text = career.matchExplanation;
      text = text.replace(/Strong match due to |Matches your /i, '');
      const parts = text.split(/,|\band\b/).map(p => p.trim()).filter(Boolean);
      if (parts.length >= 3) {
        return [
          parts[0].charAt(0).toUpperCase() + parts[0].slice(1),
          parts[1].charAt(0).toUpperCase() + parts[1].slice(1),
          parts[2].replace(/\.$/, '').charAt(0).toUpperCase() + parts[2].replace(/\.$/, '').slice(1)
        ];
      }
    }
    // Fallbacks based on category
    if (career.category === "STEM") {
      return ["Strong interest in Coding", "Leadership in Robotics club", "Excellent STEM academic profile"];
    } else if (career.category === "Business") {
      return ["Interest in business management", "Strong presentation skills", "Highly analytic profile"];
    } else if (career.category === "Healthcare") {
      return ["Interest in clinical science", "Strong empathy and care skills", "High biology aptitude"];
    } else {
      return ["Interest in career pathways", "Excellent verbal/written skills", "High matching academic profile"];
    }
  }, [career]);

  const cardColors = {
    STEM: "border-l-[#6C8EFF]",       // Info
    Business: "border-l-[#D4A017]",   // Warning
    Healthcare: "border-l-[#4CAF50]", // Success
    Arts: "border-l-[#C94A4A]",       // Danger/Rose
    Education: "border-l-[#D4A017]",  // Amber
    Law: "border-l-[#E1DCC9]"         // Neutral Warm Ivory
  }[career.category];

  return (
    <Card 
      onClick={onSelect}
      className={cn(
        "flex flex-col justify-between h-full p-5 border-l-4 cursor-pointer text-left relative transition-all duration-200 hover:border-[rgba(76,67,205,0.22)] dark:hover:border-[rgba(225,220,201,0.12)]",
        cardColors
      )}
    >
      <div className="space-y-3">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={cn("grid size-8 place-items-center rounded-lg border",
              career.category === "STEM" && "bg-[rgba(108,142,255,0.08)] border-[rgba(108,142,255,0.15)] text-[#6C8EFF]",
              career.category === "Business" && "bg-[rgba(212,160,23,0.08)] border-[rgba(212,160,23,0.15)] text-[#D4A017]",
              career.category === "Healthcare" && "bg-[rgba(76,175,80,0.08)] border-[rgba(76,175,80,0.15)] text-[#4CAF50]",
              career.category === "Arts" && "bg-[rgba(201,74,74,0.08)] border-[rgba(201,74,74,0.15)] text-[#C94A4A]",
              career.category === "Education" && "bg-[rgba(212,160,23,0.08)] border-[rgba(212,160,23,0.15)] text-[#D4A017]",
              career.category === "Law" && "bg-[rgba(225,220,201,0.08)] border-[rgba(225,220,201,0.15)] text-[#E1DCC9]"
            )}>
              <BriefcaseBusiness size={16} />
            </span>
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-muted">
              {career.category}
            </span>
          </div>

          {/* Large Circular Match Badge */}
          <div className="relative size-14 shrink-0 flex items-center justify-center select-none">
            <svg className="absolute inset-0 size-full -rotate-90">
              <circle 
                cx="28" 
                cy="28" 
                r="24" 
                className="stroke-[rgba(0,0,0,0.06)] dark:stroke-[rgba(225,220,201,0.06)] fill-none" 
                strokeWidth="3.5" 
              />
              <circle
                cx="28"
                cy="28"
                r="24"
                className="stroke-[#4CAF50] fill-none transition-all duration-500"
                strokeWidth="3.5"
                strokeDasharray={2 * Math.PI * 24}
                strokeDashoffset={2 * Math.PI * 24 - (matchScore / 100) * (2 * Math.PI * 24)}
                strokeLinecap="round"
              />
            </svg>
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-xs font-number font-extrabold text-primary leading-none">{matchScore}%</span>
              <span className="text-[6px] text-[#4CAF50] font-sans font-bold uppercase tracking-wider mt-0.5 leading-none">Match</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-base font-heading font-extrabold text-primary leading-snug">
            {career.title}
          </h3>
        </div>

        {/* Horizontal Metadata Box */}
        <div className="grid grid-cols-3 gap-1 divide-x divide-[rgba(0,0,0,0.08)] dark:divide-[rgba(225,220,201,0.08)] border border-[rgba(0,0,0,0.06)] dark:border-[rgba(225,220,201,0.06)] bg-[#F1EEDD]/20 dark:bg-[#1F150C]/10 rounded-xl p-2.5 text-center">
          {/* Column 1: Growth */}
          <div className="flex flex-col items-center justify-center px-1">
            <div className="flex items-center gap-1 text-[#4CAF50] font-sans font-bold text-[10px]">
              <span className="p-0.5 bg-[rgba(76,175,80,0.12)] rounded-full text-[#4CAF50] flex-shrink-0">
                <TrendingUp size={9} />
              </span>
              <span>{career.growthOutlook === "High" ? "High Growth" : career.growthOutlook === "Medium" ? "Medium Growth" : "Stable Growth"}</span>
            </div>
            <span className="text-[8px] text-muted font-sans font-medium mt-0.5">{career.growthOutlook === "High" ? "Top career opportunity" : "Steady demand"}</span>
          </div>

          {/* Column 2: Salary */}
          <div className="flex flex-col items-center justify-center px-1">
            <div className="flex items-center gap-1 text-primary font-sans font-bold text-[10px]">
              <span className="p-0.5 bg-[rgba(225,220,201,0.12)] dark:bg-[rgba(225,220,201,0.05)] rounded-full text-secondary flex-shrink-0">
                <Wallet size={9} />
              </span>
              <span>{career.salaryRange}</span>
            </div>
            <span className="text-[8px] text-muted font-sans font-medium mt-0.5">Estimated Salary</span>
          </div>

          {/* Column 3: Demand */}
          <div className="flex flex-col items-center justify-center px-1">
            <div className="flex items-center gap-1 text-indigo-500 dark:text-[#6C8EFF] font-sans font-bold text-[10px]">
              <span className="p-0.5 bg-[rgba(108,142,255,0.12)] rounded-full text-indigo-500 dark:text-[#6C8EFF] flex-shrink-0">
                <LineChart size={9} />
              </span>
              <span>
                {career.projectedDemand ? `${career.projectedDemand.match(/\d+%/)?.[0] || "25%"}` : "25%"} Demand
              </span>
            </div>
            <span className="text-[8px] text-muted font-sans font-medium mt-0.5">Projected by 2030</span>
          </div>
        </div>

        <p className="line-clamp-2 text-xs text-secondary leading-relaxed mt-3">
          {career.description}
        </p>

        {/* Why it matches */}
        <div className="bg-[rgba(76,175,80,0.03)] dark:bg-[rgba(76,175,80,0.02)] p-3 rounded-xl border border-[rgba(76,175,80,0.15)] dark:border-[rgba(76,175,80,0.08)] text-[11px] space-y-2 mt-3">
          <div className="flex items-center gap-1.5 text-[#4CAF50] font-sans font-bold text-[11px]">
            <User size={13} className="text-[#4CAF50]" />
            <span>Why it's a match</span>
          </div>
          <div className="grid grid-cols-1 gap-1.5 text-secondary dark:text-[rgba(225,220,201,0.85)] leading-normal pl-0.5">
            {matchPoints.map((point, idx) => (
              <div key={idx} className="flex items-start gap-1.5">
                <span className="p-0.5 bg-[rgba(76,175,80,0.12)] text-[#4CAF50] rounded-full mt-0.5 flex-shrink-0">
                  <Check size={8} strokeWidth={3} />
                </span>
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Related Majors */}
        <div className="space-y-1.5 mt-3">
          <p className="text-xs font-sans font-bold text-primary">Related Majors</p>
          <div className="flex flex-wrap gap-1.5">
            {career.relatedMajors.slice(0, 2).map((major) => (
              <span 
                key={major} 
                className="border border-[rgba(0,0,0,0.08)] dark:border-[rgba(225,220,201,0.08)] bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(225,220,201,0.02)] text-secondary px-3 py-1 rounded-xl text-[10px] font-sans font-medium"
              >
                {major}
              </span>
            ))}
            {career.relatedMajors.length > 2 && (
              <span className="border border-[rgba(0,0,0,0.08)] dark:border-[rgba(225,220,201,0.08)] bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(225,220,201,0.02)] text-muted px-3 py-1 rounded-xl text-[10px] font-sans font-bold">
                +{career.relatedMajors.length - 2} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 mt-4 border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(225,220,201,0.06)]">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-[rgba(0,0,0,0.03)] dark:bg-[rgba(225,220,201,0.03)] rounded-lg text-secondary border border-[rgba(0,0,0,0.04)] dark:border-[rgba(225,220,201,0.04)]">
            <LineChart size={14} className="text-indigo-500 dark:text-[#6C8EFF]" />
          </span>
          <div className="flex flex-col text-left">
            <span className="text-xs font-sans font-bold text-primary">
              Demand: {career.projectedDemand ? career.projectedDemand.split(" ").slice(0, 2).join(" ") : "25% growth"}
            </span>
            <span className="text-[9px] text-muted font-sans font-medium">
              High future opportunity
            </span>
          </div>
        </div>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (onSelect) onSelect();
          }}
          className="h-8 px-4 bg-[#4C43CD] hover:bg-[#3930B8] text-white dark:bg-[#412D15] dark:hover:bg-[#5A3B19] dark:text-[#E1DCC9] border border-[#4C43CD] dark:border-[rgba(225,220,201,0.08)] font-sans font-bold text-xs rounded-xl transition-all duration-200 flex items-center gap-1 shadow-sm"
        >
          <span>Explore Career Path</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </Card>
  );
}
