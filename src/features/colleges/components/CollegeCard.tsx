import { Link, useNavigate } from "react-router-dom";
import { MapPin, BarChart3, Heart } from "lucide-react";
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

export function CollegeCard({ college }: { college: College }) {
  const { profile, saveProfile } = useAuth();
  const { compareIds, toggleCompare } = useCompare();
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
    <Card className="flex flex-col justify-between h-full p-5 card-hover relative overflow-hidden bg-white border border-slate-100">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-grow min-w-0">
            <span className="grid size-11 place-items-center rounded-lg bg-gradient-to-br from-blue-700 to-indigo-600 font-extrabold text-white text-sm shadow-sm flex-shrink-0">
              {initials(college.name)}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-slate-800 leading-snug hover:text-blue-600 transition-colors truncate" title={college.name}>
                <Link to={`/colleges/${college.id}`}>{college.name}</Link>
              </h3>
              <p className="text-xs text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                <MapPin size={12} /> {college.city}, {college.state}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              className={cn(
                "size-9 p-0 rounded-full",
                compareIds.includes(college.id) ? "bg-blue-50 text-blue-600 hover:bg-blue-100" : "hover:bg-slate-100 text-slate-400"
              )}
              title={compareIds.includes(college.id) ? "Remove from Compare" : "Compare"}
              onClick={() => toggleCompare(college.id)}
            >
              <BarChart3 size={18} className={cn("transition-all duration-200", compareIds.includes(college.id) ? "scale-110" : "")} />
            </Button>
            <Button
              variant="ghost"
              className="size-9 p-0 rounded-full hover:bg-rose-50"
              title={saved ? "Saved" : "Save College"}
              onClick={() => toggleSaved(profile, saveProfile, college.id)}
            >
              <Heart size={18} className={cn("transition-all duration-200", saved ? "fill-rose-500 text-rose-500 scale-110" : "text-slate-400")} />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1", fitBadgeClass)}>
            🎯 {fitScore}% Match
          </span>
          <Badge tone="blue" className="text-[9px] font-bold py-0.5">{college.type}</Badge>
          <Badge tone="slate" className="text-[9px] font-bold py-0.5">{college.acceptanceRate}% Acc.</Badge>
        </div>

        <div className="pt-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Avg Cost / Year</p>
          <p className="text-base font-extrabold text-slate-900 mt-0.5">{formatMoney(college.tuition)}</p>
        </div>

        <div className="pt-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Top Majors</p>
          <div className="flex flex-wrap gap-1">
            {college.majors.slice(0, 3).map((major) => (
              <Badge key={major} tone="slate" className="text-[9px] py-0 px-1.5 border-slate-200 bg-slate-50 text-slate-600 font-bold">
                {major}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-5 pt-3.5 border-t border-slate-100">
        <Button 
          variant="outline" 
          className="text-xs font-bold py-1.5 hover:bg-slate-50 border-slate-200 text-slate-700 h-9"
          onClick={() => navigate(`/colleges/${college.id}`)}
        >
          View Details
        </Button>
        <Button
          variant={saved ? "primary" : "outline"}
          className={cn("text-xs font-bold py-1.5 transition-all duration-200 h-9", saved ? "bg-rose-600 border-rose-600 text-white hover:bg-rose-700" : "border-slate-200 hover:bg-slate-50")}
          onClick={() => toggleSaved(profile, saveProfile, college.id)}
        >
          {saved ? "Saved" : "Save"}
        </Button>
      </div>
    </Card>
  );
}
