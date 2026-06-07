import { BriefcaseBusiness, Heart, BarChart3, ArrowRight } from "lucide-react";
import { Card, Badge, Separator, GrowthBadge, cn, Button } from "../../../shared";
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

  const saved = profile?.careerInterests.includes(career.category);

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!profile) return;
    const currentInterests = profile.careerInterests || [];
    const updatedInterests = currentInterests.includes(career.category)
      ? currentInterests.filter((c) => c !== career.category)
      : [...currentInterests, career.category];
    saveProfile({ careerInterests: updatedInterests });
  };

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
        "flex flex-col justify-between h-full p-5 border-l-4 cursor-pointer text-left relative transition-all duration-200 hover:border-r hover:border-t hover:border-b hover:border-[rgba(225,220,201,0.12)]",
        cardColors
      )}
    >
      <div className="space-y-3">
        {/* Top bar */}
        <div className="flex items-start justify-between gap-3">
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
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[rgba(225,220,201,0.5)]">
              {career.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              className={cn("size-8 p-0 rounded-full", isComparing ? "bg-[#1F150C] text-[#FFFFFF]" : "text-[rgba(225,220,201,0.6)] hover:bg-[#1A1A1A]")}
              onClick={onCompareToggle}
              title="Compare Career"
            >
              <BarChart3 size={15} />
            </Button>
            <Button
              variant="ghost"
              className="size-8 p-0 rounded-full hover:bg-[rgba(201,74,74,0.08)]"
              onClick={handleSaveToggle}
              title="Save Career Category"
            >
              <Heart size={15} className={cn("transition-all", saved ? "fill-[#C94A4A] text-[#C94A4A] scale-110" : "text-[rgba(225,220,201,0.6)]")} />
            </Button>
          </div>
        </div>

        {/* Title and stats */}
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-heading font-extrabold text-[#F5F2EA] leading-snug">
              {career.title}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold bg-[rgba(76,175,80,0.12)] text-[#4CAF50] border border-[rgba(76,175,80,0.15)] shrink-0 animate-pulse">
              {matchScore}% Fit
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <GrowthBadge value={career.growthOutlook} />
            <Badge tone="slate" className="font-sans font-bold text-[9px]">{career.salaryRange}</Badge>
          </div>
        </div>

        <p className="line-clamp-2 text-xs text-[rgba(225,220,201,0.65)] leading-relaxed">
          {career.description}
        </p>

        {/* Why it matches */}
        <div className="bg-[#1F150C]/60 p-2.5 rounded-xl border border-[rgba(225,220,201,0.06)] text-[11px]">
          <span className="font-sans font-bold text-[rgba(225,220,201,0.4)] text-[9px] uppercase tracking-wide">Why Recommended</span>
          <p className="text-[rgba(225,220,201,0.85)] mt-0.5 leading-normal">
            {career.matchExplanation || "Matches your academic preferences and industry interest vectors."}
          </p>
        </div>

        <Separator className="bg-[rgba(225,220,201,0.08)]" />

        {/* Details snippet */}
        <div className="space-y-1">
          <p className="text-[9px] font-sans font-bold text-[rgba(225,220,201,0.4)] uppercase tracking-widest">Leading Majors</p>
          <div className="flex flex-wrap gap-1">
            {career.relatedMajors.slice(0, 2).map((major) => (
              <Badge key={major} tone="slate" className="text-[9px] font-bold py-0.5 px-2">
                {major}
              </Badge>
            ))}
            {career.relatedMajors.length > 2 && (
              <span className="text-[9px] text-[rgba(225,220,201,0.45)] font-bold ml-1">+{career.relatedMajors.length - 2} more</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 mt-4 border-t border-[rgba(225,220,201,0.06)]">
        <span className="text-[10px] text-[rgba(225,220,201,0.55)] font-sans font-semibold">
          Demand: {career.projectedDemand ? career.projectedDemand.split(" ").slice(0, 2).join(" ") : "Growing"}
        </span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (onSelect) onSelect();
          }}
          className="text-xs font-sans font-bold text-[#E1DCC9] hover:text-[#FFFFFF] flex items-center gap-1 transition-colors duration-150"
        >
          View Career Path <ArrowRight size={13} />
        </button>
      </div>
    </Card>
  );
}
