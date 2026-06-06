import { Clock, MessageSquare, Trash2, ArrowRight, Building2 } from "lucide-react";
import { Card, Button, Badge, cn, Progress, daysUntil } from "../../../shared";
import type { Application, College } from "../../../shared";
import { getCollegeDetails } from "../utils/trackerUtils";

export function KanbanCard({
  app,
  colleges,
  onEdit,
  onAddNote,
  onMoveStage,
  onRemove
}: {
  app: Application;
  colleges: College[];
  onEdit: (app: Application) => void;
  onAddNote: (app: Application) => void;
  onMoveStage: (app: Application) => void;
  onRemove: (app: Application) => void;
}) {
  const { name, type, isCustom } = getCollegeDetails(app.collegeId, colleges);
  const daysLeft = daysUntil(app.deadline);
  const isUrgent = daysLeft >= 0 && daysLeft <= 14;
  const isOverdue = daysLeft < 0;

  let borderClass = "border-slate-200/80 hover:border-blue-400";
  let bgClass = "bg-white";
  let outcomeBadge = null;

  if (app.status === "Decision") {
    if (app.decisionOutcome === "Accepted") {
      borderClass = "border-emerald-300 hover:border-emerald-500";
      bgClass = "bg-emerald-50/20";
      outcomeBadge = <Badge tone="emerald" className="font-extrabold text-[9px] uppercase tracking-wider">Accepted 🎉</Badge>;
    } else if (app.decisionOutcome === "Rejected") {
      borderClass = "border-rose-200 hover:border-rose-400";
      bgClass = "bg-rose-50/10";
      outcomeBadge = <Badge tone="rose" className="font-extrabold text-[9px] uppercase tracking-wider">Rejected</Badge>;
    } else if (app.decisionOutcome === "Waitlisted") {
      borderClass = "border-amber-300 hover:border-amber-500";
      bgClass = "bg-amber-50/20";
      outcomeBadge = <Badge tone="amber" className="font-extrabold text-[9px] uppercase tracking-wider">Waitlisted</Badge>;
    } else {
      borderClass = "border-slate-300 hover:border-slate-400";
      outcomeBadge = <Badge tone="slate" className="font-extrabold text-[9px] uppercase tracking-wider">Awaiting Decision</Badge>;
    }
  }

  return (
    <Card
      className={cn(
        "kanban-card-enter p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col border relative group",
        borderClass,
        bgClass
      )}
    >
      <div onClick={() => onEdit(app)} className="cursor-pointer space-y-2.5 pb-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="max-w-[80%]">
            <h4 className="font-extrabold text-slate-800 text-sm leading-snug truncate" title={name}>{name}</h4>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <Badge tone="blue" className="text-[9px] font-bold py-0 px-1.5">{type}</Badge>
              {isCustom && <Badge tone="slate" className="text-[9px] font-bold py-0 px-1.5">Custom</Badge>}
              {outcomeBadge}
            </div>
          </div>
          <span className="grid size-7 place-items-center rounded-lg bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
            <Building2 size={14} />
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock size={13} className={cn(isOverdue || isUrgent ? "text-rose-500" : "text-slate-400")} />
          <p className={cn("text-xs font-bold",
            isOverdue ? "text-rose-600" :
            isUrgent ? "text-rose-500 urgent-pulse" :
            "text-slate-500"
          )}>
            {app.deadline.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            <span className="text-[10px] font-medium ml-1.5">
              ({isOverdue ? "Overdue" : `${daysLeft} days remaining`})
            </span>
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
            <span>Completeness</span>
            <span className="text-slate-600">{app.completeness}%</span>
          </div>
          <Progress value={app.completeness} />
        </div>

        {app.notes && (
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-start gap-1.5 mt-1">
            <MessageSquare size={12} className="text-slate-400 shrink-0 mt-0.5" />
            <p className="line-clamp-2 text-[10px] text-slate-500 leading-normal font-medium">
              {app.notes}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-1.5 border-t border-slate-100 pt-2.5 mt-1.5 shrink-0">
        <Button
          variant="ghost"
          title="Add Note"
          className="size-8 p-0 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg"
          onClick={() => onAddNote(app)}
        >
          <MessageSquare size={14} />
        </Button>
        <Button
          variant="ghost"
          title="Remove"
          className="size-8 p-0 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg"
          onClick={() => onRemove(app)}
        >
          <Trash2 size={14} />
        </Button>

        {app.status !== "Decision" ? (
          <Button
            variant="outline"
            className="flex items-center justify-center gap-1 text-[11px] font-extrabold h-8 px-2.5 rounded-lg border-slate-200/80 text-slate-700 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 ml-auto"
            onClick={() => onMoveStage(app)}
          >
            Move Stage <ArrowRight size={12} />
          </Button>
        ) : (
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => onEdit(app)}
              className="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition-colors"
            >
              Outcome
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
