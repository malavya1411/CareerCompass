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
    if (fitScore >= 80) return "bg-[rgba(76,175,80,0.12)] text-[#4CAF50] border-[rgba(76,175,80,0.15)]";
    if (fitScore >= 65) return "bg-[rgba(212,160,23,0.12)] text-[#D4A017] border-[rgba(212,160,23,0.15)]";
    return "bg-[rgba(201,74,74,0.12)] text-[#C94A4A] border-[rgba(201,74,74,0.15)]";
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
    <Card className="flex flex-col justify-between h-full p-5 cursor-pointer text-left relative overflow-hidden transition-all duration-200 hover:border-r hover:border-t hover:border-b hover:border-[rgba(225,220,201,0.12)]">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="grid size-11 place-items-center rounded-lg bg-[#1F150C] border border-[rgba(225,220,201,0.1)] font-heading font-extrabold text-[#E1DCC9] text-sm shrink-0">
              {initials(college.name)}
            </span>
            <div className="min-w-0">
              <h3 className="font-heading font-extrabold text-[#F5F2EA] leading-snug hover:text-[#FFFFFF] transition-colors truncate" title={college.name}>
                <Link to={`/colleges/${college.id}`}>{college.name}</Link>
              </h3>
              <p className="text-xs text-[rgba(225,220,201,0.6)] font-sans font-semibold flex items-center gap-1 mt-0.5">
                <MapPin size={12} className="text-[rgba(225,220,201,0.45)]" /> {college.city}, {college.state}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              className={cn(
                "size-8 p-0 rounded-full",
                compareIds.includes(college.id) ? "bg-[#1F150C] text-[#FFFFFF]" : "text-[rgba(225,220,201,0.6)] hover:bg-[#1A1A1A]"
              )}
              title={compareIds.includes(college.id) ? "Remove from Compare" : "Compare"}
              onClick={() => toggleCompare(college.id)}
            >
              <BarChart3 size={16} />
            </Button>
            <Button
              variant="ghost"
              className="size-8 p-0 rounded-full hover:bg-[rgba(201,74,74,0.08)]"
              title={saved ? "Saved" : "Save College"}
              onClick={() => toggleSaved(profile, saveProfile, college.id)}
            >
              <Heart size={16} className={cn("transition-all", saved ? "fill-[#C94A4A] text-[#C94A4A] scale-110" : "text-[rgba(225,220,201,0.6)]")} />
            </Button>
          </div>
        </div>

        {/* Fit and acceptance badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className={cn("text-[10px] font-sans font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1", fitBadgeClass)}>
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
            <p className="text-[9px] text-[rgba(225,220,201,0.45)] font-bold uppercase tracking-wider">Est. Annual Tuition</p>
            <p className="text-sm font-number font-extrabold text-[#FFFFFF] mt-0.5">{formatMoney(college.tuition)}</p>
          </div>
          <div>
            <p className="text-[9px] text-[rgba(225,220,201,0.45)] font-bold uppercase tracking-wider">Deadline</p>
            <p className="text-sm font-number font-extrabold text-[#FFFFFF] mt-0.5 flex items-center gap-1">
              <Calendar size={13} className="text-[rgba(225,220,201,0.45)]" />
              {college.applicationDeadline || "June 15"}
            </p>
          </div>
        </div>

        {/* Recommendation Transparency */}
        <div className="bg-[#1F150C]/60 p-2.5 rounded-xl border border-[rgba(225,220,201,0.06)] text-[11px] font-sans leading-relaxed">
          <span className="font-bold text-[rgba(225,220,201,0.4)] text-[9px] uppercase tracking-wide">Why Recommended</span>
          <p className="text-[rgba(225,220,201,0.85)] mt-0.5">
            {college.whyRecommended || "Strong match because your academic scores match historical admissions averages."}
          </p>
        </div>

        {/* Scholarships */}
        {college.scholarships && (
          <div className="flex items-start gap-1 text-[10px] text-[#4CAF50] font-sans font-semibold">
            <Award size={13} className="shrink-0 mt-0.5" />
            <span>Aid: {college.scholarships.split(".")[0]}.</span>
          </div>
        )}

        {/* Top majors list */}
        <div className="space-y-1">
          <p className="text-[9px] text-[rgba(225,220,201,0.45)] font-bold uppercase tracking-wider">Top Programs</p>
          <div className="flex flex-wrap gap-1">
            {college.majors.slice(0, 3).map((major) => (
              <Badge key={major} tone="slate" className="text-[9px] font-bold py-0.5 px-2">
                {major}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-5 pt-3.5 border-t border-[rgba(225,220,201,0.06)]">
        <Button 
          variant="outline" 
          className="text-xs font-bold py-1.5 bg-transparent hover:bg-[#1A1A1A] border-[rgba(225,220,201,0.08)] text-[#E1DCC9] hover:text-[#FFFFFF] h-9 rounded-xl transition-all duration-200"
          onClick={() => navigate(`/colleges/${college.id}`)}
        >
          Details
        </Button>
        <Button
          variant={saved ? "primary" : "outline"}
          className={cn(
            "text-xs font-bold py-1.5 transition-all duration-200 h-9 rounded-xl", 
            saved 
              ? "bg-[#C94A4A] border-[#C94A4A] hover:bg-[#D95A5A] text-white" 
              : "border-[rgba(225,220,201,0.08)] bg-transparent text-[#E1DCC9] hover:bg-[#1A1A1A]"
          )}
          onClick={() => toggleSaved(profile, saveProfile, college.id)}
        >
          {saved ? "Saved" : "Save"}
        </Button>
      </div>
    </Card>
  );
}
