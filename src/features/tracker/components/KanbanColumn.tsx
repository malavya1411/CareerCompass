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
      bg: "bg-blue-50/30 border-blue-100/50",
      accent: "bg-blue-500",
      text: "text-blue-800",
      border: "border-blue-200",
      tagTone: "blue" as const
    },
    Shortlisted: {
      bg: "bg-amber-50/30 border-amber-100/50",
      accent: "bg-amber-500",
      text: "text-amber-800",
      border: "border-amber-200",
      tagTone: "amber" as const
    },
    Applying: {
      bg: "bg-orange-50/30 border-orange-100/50",
      accent: "bg-orange-500",
      text: "text-orange-800",
      border: "border-orange-200",
      tagTone: "rose" as const
    },
    Submitted: {
      bg: "bg-purple-50/30 border-purple-100/50",
      accent: "bg-purple-500",
      text: "text-purple-800",
      border: "border-purple-200",
      tagTone: "rose" as const
    },
    Decision: {
      bg: "bg-emerald-50/20 border-emerald-100/40",
      accent: "bg-emerald-500",
      text: "text-emerald-800",
      border: "border-emerald-200",
      tagTone: "emerald" as const
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
