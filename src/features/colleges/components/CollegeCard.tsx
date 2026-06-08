import { Link, useNavigate } from "react-router-dom";
import { MapPin, Heart } from "lucide-react";
import { useAuth } from "../../auth";
import { useCompare } from "../state/CompareContext";
import { 
  Card, 
  Button, 
  cn, 
  calculateFitScore, 
  formatMoney, 
  toggleSaved 
} from "../../../shared";
import type { College } from "../../../shared";
import React from "react";

export function CollegeCard({ 
  college,
  isSelected,
  onSelect
}: { 
  college: College;
  isSelected?: boolean;
  onSelect?: () => void;
}) {
  const { profile, saveProfile } = useAuth();
  const saved = profile?.savedColleges?.includes(college.id);
  const fitScore = calculateFitScore(profile, college);
  const navigate = useNavigate();

  const acceptanceChance = React.useMemo(() => {
    if (!profile) return "Target";
    if (college.acceptanceRate <= 1.5) return "Hard Reach";
    if (college.acceptanceRate <= 5) return "Reach";
    if (fitScore >= 82) return "Target (High)";
    if (fitScore >= 68) return "Target (Mod)";
    return "Safety";
  }, [profile, college, fitScore]);

  return (
    <Card 
      onClick={() => onSelect?.()}
      className={cn(
        "flex flex-col justify-between h-[270px] p-4 cursor-pointer text-left relative overflow-hidden transition-all duration-200 border",
        isSelected 
          ? "border-[#4C43CD] dark:border-[#5A3B19] shadow-[0px_4px_20px_rgba(76,67,205,0.15)] dark:shadow-[0px_4px_20px_rgba(90,59,25,0.2)] bg-[#4C43CD]/8 dark:bg-[#1F150C]/25" 
          : "border-[rgba(0,0,0,0.08)] hover:border-[#4C43CD]/30 dark:border-[rgba(225,220,201,0.06)] dark:hover:border-[rgba(225,220,201,0.15)] hover:bg-[#F1EEDD]/40 dark:hover:bg-[#16110B]/30"
      )}
    >
      <div className="flex flex-col justify-between h-full">
        {/* Header Row */}
        <div className="flex justify-between items-start gap-2 min-w-0">
          <div className="min-w-0">
            <h3 
              className="font-heading font-extrabold text-primary leading-tight text-[13px] hover:text-[#4C43CD] dark:hover:text-[#FFFFFF] transition-colors truncate" 
              title={college.name}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/colleges/${college.id}`);
              }}
            >
              {college.name}
            </h3>
            <p className="text-[10px] text-muted font-sans font-semibold flex items-center gap-1 mt-0.5">
              <MapPin size={10} className="text-muted" /> {college.city}, {college.state}
            </p>
          </div>

          {/* Circular Match Badge */}
          <div className="flex flex-col items-center justify-center size-10 rounded-full bg-gradient-to-br from-[#4C43CD] to-[#5C53DD] dark:from-[#412D15] dark:to-[#5A3B19] border border-[rgba(76,67,205,0.15)] dark:border-[rgba(225,220,201,0.12)] shrink-0 text-center select-none shadow-sm">
            <span className="text-[10px] font-number font-extrabold text-white leading-none">{fitScore}%</span>
            <span className="text-[6px] text-[rgba(255,255,255,0.7)] dark:text-[rgba(225,220,201,0.65)] font-sans font-bold uppercase tracking-wider mt-0.5 leading-none">Match</span>
          </div>
        </div>

        {/* Content Metadata Rows */}
        <div className="space-y-1.5 mt-3 text-[11px] font-sans">
          <div className="flex items-center justify-between">
            <span className="text-muted font-semibold">Outlook</span>
            <span className={cn(
              "font-bold px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide",
              acceptanceChance.includes("Reach") ? "bg-[rgba(201,74,74,0.12)] text-[#C94A4A]" : "bg-[rgba(76,175,80,0.12)] text-[#4CAF50]"
            )}>
              {acceptanceChance}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted font-semibold">Est. Tuition</span>
            <span className="font-number font-extrabold text-primary">{formatMoney(college.tuition)}/yr</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted font-semibold">Deadline</span>
            <span className="font-bold text-primary">{college.applicationDeadline || "June 20"}</span>
          </div>
        </div>

        {/* Short explanation (max 2 lines) */}
        <p className="text-[11px] leading-relaxed text-secondary font-sans mt-3 line-clamp-2 italic h-[34px] min-h-[34px]">
          "{college.whyRecommended?.split(".")[0] || "Strong academic profile match for core coursework"}."
        </p>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-2 mt-3 pt-3.5 border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(225,220,201,0.05)]" onClick={(e) => e.stopPropagation()}>
          <Button 
            className="text-[11px] font-bold py-1 h-8 px-3.5 bg-transparent hover:bg-[#F1EEDD] dark:hover:bg-[#1A1A1A] border border-[rgba(0,0,0,0.08)] dark:border-[rgba(225,220,201,0.08)] text-secondary dark:text-[#E1DCC9] hover:text-primary dark:hover:text-[#FFFFFF] rounded-lg transition-all duration-200 flex items-center gap-1"
            onClick={() => navigate(`/colleges/${college.id}`)}
          >
            Explore &rarr;
          </Button>

          <Button
            className={cn(
              "text-[11px] font-bold py-1 h-8 px-3.5 transition-all duration-200 rounded-lg border",
              saved 
                ? "bg-[#C94A4A]/10 border-[#C94A4A]/20 text-[#C94A4A] hover:bg-[#C94A4A]/25" 
                : "border-[rgba(0,0,0,0.08)] dark:border-[rgba(225,220,201,0.08)] bg-transparent text-secondary dark:text-[#E1DCC9] hover:bg-[#F1EEDD] dark:hover:bg-[#1A1A1A] hover:text-primary dark:hover:text-white"
            )}
            onClick={() => toggleSaved(profile, saveProfile, college.id)}
          >
            {saved ? "Saved" : "Save"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
