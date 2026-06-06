import { Link } from "react-router-dom";
import { BriefcaseBusiness, ChevronRight } from "lucide-react";
import { Card, GrowthBadge, cn } from "../../../shared";
import type { Career } from "../../../shared";

export function DashboardCareerCard({ career }: { career: Career }) {
  return (
    <Link to={`/careers/${career.id}`}>
      <Card className={cn(
        "p-4 hover:shadow-md transition-all duration-300 border border-slate-100 hover:border-slate-200 bg-white flex items-center justify-between gap-4 group rounded-xl border-l-4",
        career.category === "STEM" && "border-l-blue-500",
        career.category === "Business" && "border-l-violet-500",
        career.category === "Healthcare" && "border-l-emerald-500",
        career.category === "Arts" && "border-l-pink-500",
        career.category === "Education" && "border-l-amber-500",
        career.category === "Law" && "border-l-slate-400"
      )}>
        <div className="flex items-center gap-3.5 min-w-0">
          <span className={cn("grid size-10 place-items-center rounded-xl transition-colors flex-shrink-0",
            career.category === "STEM" && "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
            career.category === "Business" && "bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white",
            career.category === "Healthcare" && "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
            career.category === "Arts" && "bg-pink-50 text-pink-600 group-hover:bg-pink-600 group-hover:text-white",
            career.category === "Education" && "bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white",
            career.category === "Law" && "bg-slate-50 text-slate-600 group-hover:bg-slate-600 group-hover:text-white"
          )}>
            <BriefcaseBusiness size={20} />
          </span>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors truncate">{career.title}</h3>
            <span className="text-[10px] text-slate-400 font-bold tracking-wide uppercase mt-0.5 block">{career.category}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Salary</p>
            <p className="text-xs font-extrabold text-slate-700 mt-0.5">{career.salaryRange}</p>
          </div>
          <GrowthBadge value={career.growthOutlook} />
          <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
        </div>
      </Card>
    </Link>
  );
}
