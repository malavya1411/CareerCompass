import { useMemo } from "react";
import { Calendar, ChevronRight, MessageSquare, Trash2 } from "lucide-react";
import { Card, Button, Badge, cn, Progress, daysUntil } from "../../../shared";
import type { Application, College } from "../../../shared";
import { getCollegeDetails } from "../utils/trackerUtils";

export function DeadlineCalendarView({
  apps,
  colleges,
  onEdit,
  onAddNote,
  onRemove
}: {
  apps: Application[];
  colleges: College[];
  onEdit: (app: Application) => void;
  onAddNote: (app: Application) => void;
  onRemove: (app: Application) => void;
}) {
  const sortedApps = useMemo(() => {
    return [...apps].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [apps]);

  if (sortedApps.length === 0) {
    return (
      <Card className="p-8 text-center text-slate-500 bg-white border border-slate-100 rounded-2xl">
        <Calendar size={32} className="mx-auto text-slate-300 mb-3" />
        <p className="font-semibold">No deadlines tracked yet.</p>
        <p className="text-xs text-slate-400 mt-1">Add colleges to start visualizing your deadlines timeline.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-white border border-slate-100 rounded-2xl shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold">
              <th className="p-4 pl-6 text-xs uppercase tracking-wider font-semibold">College</th>
              <th className="p-4 text-xs uppercase tracking-wider font-semibold">Status</th>
              <th className="p-4 text-xs uppercase tracking-wider font-semibold">Deadline</th>
              <th className="p-4 text-xs uppercase tracking-wider font-semibold">Completeness</th>
              <th className="p-4 text-xs uppercase tracking-wider font-semibold">Notes</th>
              <th className="p-4 pr-6 text-right text-xs uppercase tracking-wider font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedApps.map((app) => {
              const { name, type, isCustom } = getCollegeDetails(app.collegeId, colleges);
              const daysLeft = daysUntil(app.deadline);
              const isUrgent = daysLeft >= 0 && daysLeft <= 14;
              const isOverdue = daysLeft < 0;

              const statusColors = {
                Researching: "bg-blue-50 text-blue-700 border-blue-100",
                Shortlisted: "bg-amber-50 text-amber-800 border-amber-100",
                Applying: "bg-orange-50 text-orange-800 border-orange-100",
                Submitted: "bg-purple-50 text-purple-700 border-purple-100",
                Decision: "bg-emerald-50 text-emerald-700 border-emerald-100"
              }[app.status];

              return (
                <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6">
                    <div>
                      <span className="font-extrabold text-slate-900 text-sm hover:text-blue-600 transition-colors cursor-pointer" onClick={() => onEdit(app)}>
                        {name}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold text-slate-400">{type}</span>
                        {isCustom && <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1 py-0.2 rounded">Custom</span>}
                        {app.status === "Decision" && app.decisionOutcome && (
                          <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded uppercase tracking-wider">
                            {app.decisionOutcome}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold border", statusColors)}>
                      {app.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className={cn("font-bold text-sm flex items-center gap-1",
                        isOverdue ? "text-rose-600" : isUrgent ? "text-rose-500 urgent-pulse" : "text-slate-700"
                      )}>
                        {app.deadline.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span className="text-xs text-slate-400 mt-0.5">
                        {isOverdue ? "Overdue" : `${daysLeft} days left`}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 w-44">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <Progress value={app.completeness} />
                      </div>
                      <span className="text-xs font-bold text-slate-600 shrink-0 w-8">{app.completeness}%</span>
                    </div>
                  </td>
                  <td className="p-4 max-w-xs">
                    {app.notes ? (
                      <span className="text-xs text-slate-500 font-medium line-clamp-1 cursor-pointer hover:text-slate-800" onClick={() => onAddNote(app)}>
                        {app.notes}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300 italic font-medium cursor-pointer hover:text-slate-500" onClick={() => onAddNote(app)}>
                        Add note...
                      </span>
                    )}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button variant="ghost" className="size-8 p-0 rounded-lg text-slate-400 hover:text-slate-600" onClick={() => onAddNote(app)} title="Edit Note">
                        <MessageSquare size={14} />
                      </Button>
                      <Button variant="ghost" className="size-8 p-0 rounded-lg text-slate-400 hover:text-slate-600" onClick={() => onEdit(app)} title="Edit details">
                        <ChevronRight size={16} />
                      </Button>
                      <Button variant="ghost" className="size-8 p-0 rounded-lg text-slate-400 hover:text-rose-600" onClick={() => onRemove(app)} title="Remove">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
