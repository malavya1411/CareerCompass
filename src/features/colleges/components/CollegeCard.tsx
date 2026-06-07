import { Link, useNavigate } from "react-router-dom";
import { MapPin, BarChart3, Heart, Calendar, Award, GraduationCap } from "lucide-react";
import { useAuth } from "../../auth";
import { useCompare } from "../state/CompareContext";
import { 
  Card, 
  Button, 
  Badge, 
  cn, 
  initials, 
  calculateFitScore, 
  formatMoney, 
  toggleSaved 
} from "../../../shared";
import type { College } from "../../../shared";
import React from "react";

export function CollegeCard({ college }: { college: College }) {
  const { profile, saveProfile } = useAuth();
  const { compareIds, toggleCompare } = useCompare();
  const saved = profile?.savedColleges?.includes(college.id);
  const fitScore = calculateFitScore(profile, college);
  const navigate = useNavigate();

  const fitBadgeClass = React.useMemo(() => {
    if (fitScore >= 80) return "bg-emerald-50 dark:bg-emerald-950/20 text-[#16A34A] dark:text-emerald-400 border-emerald-100 dark:border-emerald-900";
    if (fitScore >= 65) return "bg-amber-50 dark:bg-amber-950/20 text-[#F59E0B] dark:text-amber-400 border-amber-100 dark:border-amber-900";
    return "bg-rose-50 dark:bg-rose-950/20 text-[#DC2626] dark:text-rose-400 border-rose-100 dark:border-rose-900";
  }, [fitScore]);

  const acceptanceChance = React.useMemo(() => {
    if (!profile) return "Target";
    if (college.acceptanceRate <= 1.5) return "Hard Reach";
    if (college.acceptanceRate <= 5) return "Reach";
    if (fitScore >= 82) return "Target (High Chance)";
    if (fitScore >= 68) return "Target (Moderate Chance)";
    return "Safety";
  }, [profile, college, fitScore]);

  return (
    <Card className="flex flex-col justify-between h-full p-5 card-hover bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 text-left relative overflow-hidden">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="grid size-11 place-items-center rounded-lg bg-gradient-to-br from-[#3B5BDB] to-indigo-600 font-heading font-extrabold text-white text-sm shadow-sm shrink-0">
              {initials(college.name)}
            </span>
            <div className="min-w-0">
              <h3 className="font-heading font-extrabold text-slate-800 dark:text-white leading-snug hover:text-brand transition-colors truncate" title={college.name}>
                <Link to={`/colleges/${college.id}`}>{college.name}</Link>
              </h3>
              <p className="text-xs text-slate-400 dark:text-[#94A3B8] font-sans font-semibold flex items-center gap-1 mt-0.5">
                <MapPin size={12} /> {college.city}, {college.state}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              className={cn(
                "size-8 p-0 rounded-full",
                compareIds.includes(college.id) ? "bg-blue-50 dark:bg-blue-950/20 text-[#3B5BDB] dark:text-blue-400" : "text-slate-400 dark:text-slate-500"
              )}
              title={compareIds.includes(college.id) ? "Remove from Compare" : "Compare"}
              onClick={() => toggleCompare(college.id)}
            >
              <BarChart3 size={16} />
            </Button>
            <Button
              variant="ghost"
              className="size-8 p-0 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/20"
              title={saved ? "Saved" : "Save College"}
              onClick={() => toggleSaved(profile, saveProfile, college.id)}
            >
              <Heart size={16} className={cn("transition-all", saved ? "fill-rose-500 text-rose-500 scale-110" : "text-slate-400 dark:text-slate-500")} />
            </Button>
          </div>
        </div>

        {/* Fit and acceptance badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className={cn("text-[10px] font-sans font-bold px-2 py-0.5 rounded-full border flex items-center gap-1", fitBadgeClass)}>
            🎯 {fitScore}% Match
          </span>
          <Badge tone={acceptanceChance.includes("Reach") ? "rose" : "emerald"} className="text-[9px] font-bold py-0.5">
            {acceptanceChance}
          </Badge>
          <Badge tone="blue" className="text-[9px] font-bold py-0.5">{college.type}</Badge>
        </div>

        {/* Costs & Deadlines */}
        <div className="grid grid-cols-2 gap-4 pt-1.5 font-sans">
          <div>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Est. Annual Tuition</p>
            <p className="text-sm font-number font-extrabold text-slate-900 dark:text-white mt-0.5">{formatMoney(college.tuition)}</p>
          </div>
          <div>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Deadline</p>
            <p className="text-sm font-number font-extrabold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1">
              <Calendar size={13} className="text-slate-400" />
              {college.applicationDeadline || "June 15"}
            </p>
          </div>
        </div>

        {/* Recommendation Transparency */}
        <div className="bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 text-[11px] font-sans leading-relaxed">
          <span className="font-bold text-slate-400 dark:text-slate-500 text-[9px] uppercase tracking-wide">Why Recommended</span>
          <p className="text-slate-600 dark:text-slate-350 mt-0.5">
            {college.whyRecommended || "Strong match because your academic scores match historical admissions averages."}
          </p>
        </div>

        {/* Scholarships */}
        {college.scholarships && (
          <div className="flex items-start gap-1 text-[10px] text-[#16A34A] dark:text-emerald-400 font-sans font-semibold">
            <Award size={13} className="shrink-0 mt-0.5" />
            <span>Aid: {college.scholarships.split(".")[0]}.</span>
          </div>
        )}

        {/* Top majors list */}
        <div className="space-y-1">
          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Top Programs</p>
          <div className="flex flex-wrap gap-1">
            {college.majors.slice(0, 3).map((major) => (
              <Badge key={major} tone="slate" className="text-[9px] py-0 px-1.5 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 font-bold">
                {major}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800">
        <Button 
          variant="outline" 
          className="text-xs font-bold py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 h-9 rounded-lg"
          onClick={() => navigate(`/colleges/${college.id}`)}
        >
          Details
        </Button>
        <Button
          variant={saved ? "primary" : "outline"}
          className={cn("text-xs font-bold py-1.5 transition-all duration-200 h-9 rounded-lg", saved ? "bg-rose-600 border-rose-600 hover:bg-rose-700 text-white" : "border-slate-200 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800")}
          onClick={() => toggleSaved(profile, saveProfile, college.id)}
        >
          {saved ? "Saved" : "Save"}
        </Button>
      </div>
    </Card>
  );
}
