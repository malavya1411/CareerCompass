import { Clock, MessageSquare, Trash2, ArrowRight, Building2, AlertTriangle, CheckSquare, Square, RefreshCw } from "lucide-react";
import { Card, Button, Badge, cn, Progress, daysUntil } from "../../../shared";
import type { Application, College } from "../../../shared";
import { getCollegeDetails } from "../utils/trackerUtils";
import React from "react";

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

  // Documents checks
  const docs = app.requiredDocuments || [];
  const missingEssay = docs.some(d => d.name === "Personal Essay" && d.status === "Missing");
  const missingTranscript = docs.some(d => d.name === "Transcript" && d.status === "Missing");
  const deadlineRisk = daysLeft >= 0 && daysLeft <= 3;

  // Last Updated formatting
  const formattedUpdated = React.useMemo(() => {
    if (!app.lastUpdated) return "Recently";
    return new Date(app.lastUpdated).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric"
    });
  }, [app.lastUpdated]);

  let borderClass = "border-slate-200/85 hover:border-brand dark:border-slate-800 dark:hover:border-blue-900";
  let bgClass = "bg-white dark:bg-[#1E293B]";
  let outcomeBadge = null;

  if (app.status === "Decision" || app.status === "Accepted" || app.status === "Rejected") {
    if (app.decisionOutcome === "Accepted") {
      borderClass = "border-emerald-300 dark:border-emerald-900/60 hover:border-emerald-500";
      bgClass = "bg-emerald-50/20 dark:bg-emerald-950/5";
      outcomeBadge = <Badge tone="emerald" className="font-extrabold text-[8px] uppercase tracking-widest">Accepted 🎉</Badge>;
    } else if (app.decisionOutcome === "Rejected") {
      borderClass = "border-rose-200 dark:border-rose-900/40 hover:border-rose-400";
      bgClass = "bg-rose-50/10 dark:bg-rose-950/5";
      outcomeBadge = <Badge tone="rose" className="font-extrabold text-[8px] uppercase tracking-widest">Rejected</Badge>;
    } else if (app.decisionOutcome === "Waitlisted") {
      borderClass = "border-amber-300 dark:border-amber-900/60 hover:border-amber-500";
      bgClass = "bg-amber-50/20 dark:bg-amber-950/5";
      outcomeBadge = <Badge tone="amber" className="font-extrabold text-[8px] uppercase tracking-widest">Waitlisted</Badge>;
    } else {
      borderClass = "border-slate-350 dark:border-slate-850 hover:border-slate-400";
      outcomeBadge = <Badge tone="slate" className="font-extrabold text-[8px] uppercase tracking-widest">Awaiting Decision</Badge>;
    }
  }

  const priorityColors = {
    High: "bg-red-50 dark:bg-red-950/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50",
    Medium: "bg-amber-50 dark:bg-amber-950/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50",
    Low: "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
  }[app.priority || "Medium"];

  return (
    <Card
      className={cn(
        "kanban-card-enter p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col border relative group",
        borderClass,
        bgClass
      )}
    >
      {/* Clickable body */}
      <div onClick={() => onEdit(app)} className="cursor-pointer space-y-3 pb-3">
        {/* Title / Badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="max-w-[80%] min-w-0">
            <h4 className="font-heading font-extrabold text-slate-800 dark:text-white text-sm leading-snug truncate" title={name}>
              {name}
            </h4>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <Badge tone="blue" className="text-[8px] font-bold py-0.2 px-1.5">{type}</Badge>
              <Badge className={cn("text-[8px] font-bold py-0.2 px-1.5", priorityColors)}>
                {app.priority || "Medium"}
              </Badge>
              {outcomeBadge}
            </div>
          </div>
          <span className="grid size-7 place-items-center rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 group-hover:text-[#3B5BDB] dark:group-hover:text-blue-400 transition-colors shrink-0">
            <Building2 size={13} />
          </span>
        </div>

        {/* Risk Alerts */}
        {(missingEssay || missingTranscript || deadlineRisk) && (
          <div className="bg-red-50/70 dark:bg-red-950/10 border border-red-100 dark:border-red-900/40 rounded-xl p-2.5 space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-sans font-bold text-red-600 dark:text-red-400">
              <AlertTriangle size={12} className="shrink-0" />
              <span>Risk Factors Detected</span>
            </div>
            <div className="space-y-0.5 text-[9px] font-sans font-semibold text-red-600/90 dark:text-red-400/90 pl-3">
              {missingEssay && <p>• Personal Essay is missing</p>}
              {missingTranscript && <p>• High School Transcript is missing</p>}
              {deadlineRisk && <p>• Deadline is in less than 3 days!</p>}
            </div>
          </div>
        )}

        {/* Calendar details */}
        <div className="flex items-center gap-1.5 font-sans">
          <Clock size={13} className={cn(isOverdue || isUrgent ? "text-red-500" : "text-slate-400")} />
          <p className={cn("text-xs font-bold",
            isOverdue ? "text-red-600" :
            isUrgent ? "text-red-500 urgent-pulse" :
            "text-slate-500 dark:text-[#94A3B8]"
          )}>
            {app.deadline.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            <span className="text-[9px] font-medium ml-1">
              ({isOverdue ? "Overdue" : `${daysLeft} days remaining`})
            </span>
          </p>
        </div>

        {/* Required Documents list */}
        {docs.length > 0 && (
          <div className="space-y-1 pt-1">
            <span className="text-[9px] font-sans font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest block">Checklist</span>
            <div className="grid gap-1">
              {docs.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between text-[10px] font-sans font-semibold text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    {doc.status === "Uploaded" ? (
                      <CheckSquare size={11} className="text-[#16A34A] shrink-0" />
                    ) : (
                      <Square size={11} className="text-slate-350 dark:text-slate-600 shrink-0" />
                    )}
                    <span className={cn(doc.status === "Uploaded" && "line-through text-slate-400")}>{doc.name}</span>
                  </div>
                  <span className={cn("text-[8px] font-sans uppercase font-bold px-1 rounded-sm shrink-0",
                    doc.status === "Uploaded" ? "bg-emerald-50 dark:bg-emerald-950/20 text-[#16A34A]" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  )}>
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[9px] font-sans font-bold text-slate-400">
            <span>Completeness</span>
            <span className="text-slate-600 dark:text-slate-400 font-number">{app.completeness}%</span>
          </div>
          <Progress value={app.completeness} />
        </div>

        {/* Note snippet */}
        {app.notes && (
          <div className="bg-slate-50 dark:bg-slate-900/40 p-2 rounded-lg border border-slate-100 dark:border-slate-850 flex items-start gap-1.5">
            <MessageSquare size={12} className="text-slate-400 shrink-0 mt-0.5" />
            <p className="line-clamp-2 text-[10px] text-slate-500 dark:text-slate-450 leading-normal font-medium font-sans">
              {app.notes}
            </p>
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="flex items-center justify-between gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-2.5 mt-auto shrink-0 font-sans">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            title="Add Note"
            className="size-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 dark:text-slate-500 hover:text-slate-700 rounded-lg"
            onClick={() => onAddNote(app)}
          >
            <MessageSquare size={14} />
          </Button>
          <Button
            variant="ghost"
            title="Remove"
            className="size-8 p-0 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-450 dark:text-slate-500 hover:text-[#DC2626] rounded-lg"
            onClick={() => onRemove(app)}
          >
            <Trash2 size={14} />
          </Button>
        </div>

        {/* Last updated indicator */}
        <div className="flex items-center gap-1 text-[9px] text-slate-450 dark:text-slate-500">
          <RefreshCw size={10} />
          <span>Updated {formattedUpdated}</span>
        </div>

        {app.status !== "Enrolled" && app.status !== "Rejected" && (
          <Button
            variant="outline"
            className="flex items-center justify-center gap-0.5 text-[10px] font-extrabold h-7 px-2 rounded-lg border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-brand dark:hover:text-blue-400 hover:border-blue-200 ml-auto shrink-0"
            onClick={() => onMoveStage(app)}
          >
            Advance <ArrowRight size={11} />
          </Button>
        )}
      </div>
    </Card>
  );
}
