import { Link, useNavigate } from "react-router-dom";
import { Heart, ChevronRight, MapPin } from "lucide-react";
import { useAuth } from "../../auth";
import { Card, Badge, cn, initials, calculateFitScore, toggleSaved } from "../../../shared";
import type { College } from "../../../shared";

export function DashboardCollegeCard({ college }: { college: College }) {
  const { profile, saveProfile } = useAuth();
  const saved = profile?.savedColleges?.includes(college.id);
  const fitScore = calculateFitScore(profile, college);
  const navigate = useNavigate();

  let fitBadgeClass = "";
  if (fitScore >= 80) {
    fitBadgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200/60";
  } else if (fitScore >= 60) {
    fitBadgeClass = "bg-amber-50 text-amber-700 border-amber-200/60";
  } else {
    fitBadgeClass = "bg-rose-50 text-rose-700 border-rose-200/60";
  }

  return (
    <Card className="p-4 hover:shadow-md transition-all duration-300 border border-slate-100 hover:border-slate-200 bg-white flex items-center justify-between gap-4 group rounded-xl">
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-blue-700 to-indigo-600 font-extrabold text-white text-xs shadow-sm flex-shrink-0">
          {initials(college.name)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors truncate">
            <Link to={`/colleges/${college.id}`}>{college.name}</Link>
          </h3>
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
            <MapPin size={11} /> {college.city}, {college.state}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="hidden md:flex flex-wrap gap-1 max-w-[200px] justify-end">
          {college.majors.slice(0, 2).map((major) => (
            <Badge key={major} tone="slate" className="text-[9px] py-0 px-1.5 border-slate-200 bg-slate-50 text-slate-500 font-medium">
              {major}
            </Badge>
          ))}
        </div>
        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 flex-shrink-0", fitBadgeClass)}>
          🎯 {fitScore}% Match
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            className="size-8 p-0 rounded-full hover:bg-rose-50"
            title={saved ? "Saved" : "Save College"}
            onClick={() => toggleSaved(profile, saveProfile, college.id)}
          >
            <Heart size={16} className={cn("transition-all duration-200", saved ? "fill-rose-500 text-rose-500 scale-110" : "text-slate-400")} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="size-8 p-0 rounded-full hover:bg-slate-100"
            onClick={() => navigate(`/colleges/${college.id}`)}
          >
            <ChevronRight size={16} className="text-slate-400" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

import { Button } from "../../../shared";
