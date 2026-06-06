import { Link } from "react-router-dom";
import { BriefcaseBusiness } from "lucide-react";
import { Card, Badge, Separator, GrowthBadge, cn } from "../../../shared";
import type { Career } from "../../../shared";

export function CareerCard({ career }: { career: Career }) {
  return (
    <Link to={`/careers/${career.id}`}>
      <Card className={cn("grid h-full gap-3 p-5 card-hover border-l-4", 
        career.category === "STEM" && "border-l-blue-500",
        career.category === "Business" && "border-l-violet-500",
        career.category === "Healthcare" && "border-l-emerald-500",
        career.category === "Arts" && "border-l-pink-500",
        career.category === "Education" && "border-l-amber-500",
        career.category === "Law" && "border-l-slate-400"
      )}>
        <div className="flex items-start justify-between gap-3">
          <span className={cn("grid size-9 place-items-center rounded-lg text-white",
            career.category === "STEM" && "bg-blue-500/10 text-blue-600",
            career.category === "Business" && "bg-violet-500/10 text-violet-600",
            career.category === "Healthcare" && "bg-emerald-500/10 text-emerald-600",
            career.category === "Arts" && "bg-pink-500/10 text-pink-600",
            career.category === "Education" && "bg-amber-500/10 text-amber-600",
            career.category === "Law" && "bg-slate-500/10 text-slate-600"
          )}><BriefcaseBusiness size={18} /></span>
          <GrowthBadge value={career.growthOutlook} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mt-1">{career.title}</h3>
        <p className="line-clamp-2 text-sm text-slate-500 leading-relaxed">{career.description}</p>
        <Separator />
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge>{career.salaryRange}</Badge>
          <Badge tone="blue">{career.educationLevel}</Badge>
        </div>
      </Card>
    </Link>
  );
}
