import { Building2 } from "lucide-react";
import { cn } from "../../../shared";
import type { Application, College, AppStatus } from "../../../shared";
import { KanbanCard } from "./KanbanCard";

export function KanbanColumn({
  status,
  apps,
  colleges,
  onEdit,
  onAddNote,
  onMoveStage,
  onRemove
}: {
  status: AppStatus;
  apps: Application[];
  colleges: College[];
  onEdit: (app: Application) => void;
  onAddNote: (app: Application) => void;
  onMoveStage: (app: Application) => void;
  onRemove: (app: Application) => void;
}) {
  const config = {
    Researching: {
      bg: "bg-slate-50/50 dark:bg-slate-900/10 border-slate-200 dark:border-slate-800",
      accent: "bg-slate-500",
      text: "text-slate-800 dark:text-slate-200",
      border: "border-slate-200 dark:border-slate-800",
      tagTone: "slate" as const
    },
    Interested: {
      bg: "bg-sky-50/20 dark:bg-sky-950/5 border-sky-100/50 dark:border-sky-900/20",
      accent: "bg-sky-500",
      text: "text-sky-850 dark:text-sky-300",
      border: "border-sky-200 dark:border-sky-900/50",
      tagTone: "blue" as const
    },
    Shortlisted: {
      bg: "bg-amber-50/30 dark:bg-amber-950/5 border-amber-100/50 dark:border-amber-900/20",
      accent: "bg-amber-500",
      text: "text-amber-800 dark:text-amber-300",
      border: "border-amber-200 dark:border-amber-900/50",
      tagTone: "amber" as const
    },
    Applying: {
      bg: "bg-orange-50/30 dark:bg-orange-950/5 border-orange-100/50 dark:border-orange-900/20",
      accent: "bg-orange-500",
      text: "text-orange-800 dark:text-orange-300",
      border: "border-orange-200 dark:border-orange-900/50",
      tagTone: "rose" as const
    },
    Submitted: {
      bg: "bg-indigo-50/20 dark:bg-indigo-950/5 border-indigo-100/50 dark:border-indigo-900/20",
      accent: "bg-indigo-500",
      text: "text-indigo-800 dark:text-indigo-300",
      border: "border-indigo-200 dark:border-indigo-900/50",
      tagTone: "blue" as const
    },
    Interview: {
      bg: "bg-pink-50/20 dark:bg-pink-950/5 border-pink-100/50 dark:border-pink-900/20",
      accent: "bg-pink-500",
      text: "text-pink-800 dark:text-pink-300",
      border: "border-pink-200 dark:border-pink-900/50",
      tagTone: "rose" as const
    },
    Decision: {
      bg: "bg-purple-50/20 dark:bg-purple-950/5 border-purple-100/50 dark:border-purple-900/20",
      accent: "bg-purple-500",
      text: "text-purple-800 dark:text-purple-300",
      border: "border-purple-200 dark:border-purple-900/50",
      tagTone: "rose" as const
    },
    Accepted: {
      bg: "bg-emerald-50/20 dark:bg-emerald-950/5 border-emerald-100/40 dark:border-emerald-900/20",
      accent: "bg-emerald-500",
      text: "text-emerald-800 dark:text-emerald-300",
      border: "border-emerald-200 dark:border-emerald-900/50",
      tagTone: "emerald" as const
    },
    Rejected: {
      bg: "bg-rose-50/20 dark:bg-rose-950/5 border-rose-100/40 dark:border-rose-900/20",
      accent: "bg-rose-500",
      text: "text-rose-800 dark:text-rose-300",
      border: "border-rose-200 dark:border-rose-900/50",
      tagTone: "rose" as const
    },
    Enrolled: {
      bg: "bg-blue-50/30 dark:bg-blue-950/10 border-blue-100/50 dark:border-blue-900/20",
      accent: "bg-[#3B5BDB]",
      text: "text-[#3B5BDB] dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-900/50",
      tagTone: "blue" as const
    }
  }[status];

  return (
    <div className={cn("p-4 rounded-2xl border flex flex-col h-full min-h-[500px]", config.bg)}>
      <div className="mb-4 flex items-center justify-between px-1.5 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className={cn("size-2 rounded-full", config.accent)} />
          <h3 className="font-extrabold text-slate-800 text-sm tracking-wide">{status}</h3>
        </div>
        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white shadow-sm border text-slate-500">
          {apps.length}
        </span>
      </div>

      <div className="flex flex-col gap-3.5 overflow-y-auto max-h-[70vh] pr-1 flex-1">
        {apps.map((app) => (
          <KanbanCard
            key={app.id}
            app={app}
            colleges={colleges}
            onEdit={onEdit}
            onAddNote={onAddNote}
            onMoveStage={onMoveStage}
            onRemove={onRemove}
          />
        ))}
        {apps.length === 0 && (
          <div className="border border-dashed border-slate-200/80 rounded-2xl py-12 text-center text-xs text-slate-400 font-bold bg-white/40 flex flex-col items-center justify-center gap-2 flex-1">
            <Building2 size={24} className="text-slate-300" />
            <span>No schools here</span>
          </div>
        )}
      </div>
    </div>
  );
}
