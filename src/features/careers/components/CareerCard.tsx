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
    STEM: "border-l-blue-500",
    Business: "border-l-violet-500",
    Healthcare: "border-l-emerald-500",
    Arts: "border-l-pink-500",
    Education: "border-l-amber-500",
    Law: "border-l-slate-400"
  }[career.category];

  return (
    <Card 
      onClick={onSelect}
      className={cn(
        "flex flex-col justify-between h-full p-5 border-l-4 card-hover bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#334155] cursor-pointer text-left relative",
        cardColors
      )}
    >
      <div className="space-y-3">
        {/* Top bar */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={cn("grid size-8 place-items-center rounded-lg text-white",
              career.category === "STEM" && "bg-blue-500/10 text-blue-600 dark:text-blue-400",
              career.category === "Business" && "bg-violet-500/10 text-violet-600 dark:text-violet-400",
              career.category === "Healthcare" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              career.category === "Arts" && "bg-pink-500/10 text-pink-600 dark:text-pink-400",
              career.category === "Education" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
              career.category === "Law" && "bg-slate-500/10 text-slate-600 dark:text-slate-400"
            )}>
              <BriefcaseBusiness size={16} />
            </span>
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {career.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              className={cn("size-8 p-0 rounded-full", isComparing ? "bg-blue-50 text-brand" : "text-slate-400 hover:text-slate-600")}
              onClick={onCompareToggle}
              title="Compare Career"
            >
              <BarChart3 size={15} />
            </Button>
            <Button
              variant="ghost"
              className="size-8 p-0 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/20"
              onClick={handleSaveToggle}
              title="Save Career Category"
            >
              <Heart size={15} className={cn("transition-all", saved ? "fill-rose-500 text-rose-500 scale-110" : "text-slate-400")} />
            </Button>
          </div>
        </div>

        {/* Title and stats */}
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-heading font-extrabold text-slate-800 dark:text-white leading-snug">
              {career.title}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-number font-bold bg-blue-50 dark:bg-blue-950 text-brand dark:text-blue-400 border border-blue-100 dark:border-blue-900 shrink-0">
              {matchScore}% Fit
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <GrowthBadge value={career.growthOutlook} />
            <Badge className="font-number font-semibold text-[10px]">{career.salaryRange}</Badge>
          </div>
        </div>

        <p className="line-clamp-2 text-xs text-slate-500 dark:text-[#94A3B8] leading-relaxed">
          {career.description}
        </p>

        {/* Why it matches */}
        <div className="bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 text-[11px]">
          <span className="font-sans font-bold text-slate-400 dark:text-slate-500 text-[9px] uppercase tracking-wide">Why Recommended</span>
          <p className="text-slate-600 dark:text-slate-350 mt-0.5 leading-normal">
            {career.matchExplanation || "Matches your academic preferences and industry interest vectors."}
          </p>
        </div>

        <Separator className="bg-slate-100 dark:bg-slate-850" />

        {/* Details snippet */}
        <div className="space-y-1">
          <p className="text-[9px] font-sans font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Leading Majors</p>
          <div className="flex flex-wrap gap-1">
            {career.relatedMajors.slice(0, 2).map((major) => (
              <Badge key={major} tone="slate" className="text-[9px] py-0 px-1.5 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 font-semibold">
                {major}
              </Badge>
            ))}
            {career.relatedMajors.length > 2 && (
              <span className="text-[9px] text-slate-400 font-bold ml-1">+{career.relatedMajors.length - 2} more</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 dark:border-slate-800">
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans font-medium">
          Demand: {career.projectedDemand ? career.projectedDemand.split(" ").slice(0, 2).join(" ") : "Growing"}
        </span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (onSelect) onSelect();
          }}
          className="text-xs font-sans font-bold text-brand dark:text-blue-400 hover:text-brand-hover flex items-center gap-1"
        >
          View Path <ArrowRight size={13} />
        </button>
      </div>
    </Card>
  );
}
