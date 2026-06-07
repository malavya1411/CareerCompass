import React, { useMemo, useState } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronRight, 
  MessageSquare, 
  Trash2, 
  ChevronLeft, 
  Clock, 
  ListTodo, 
  Activity, 
  ArrowUpRight,
  TrendingUp
} from "lucide-react";
import { Card, Button, Badge, cn, Progress, daysUntil, formatMoney, initials } from "../../../shared";
import type { Application, College } from "../../../shared";
import { getCollegeDetails } from "../utils/trackerUtils";

type CalendarTab = "monthly" | "weekly" | "timeline";

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
  const [viewTab, setViewTab] = useState<CalendarTab>("monthly");
  
  // Date states for Monthly view
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper: change month
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Generate calendar days for monthly grid
  const calendarDays = useMemo(() => {
    const startDay = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
    
    const days = [];
    
    // Fill previous month padding days
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(currentYear, currentMonth - 1, prevMonthDays - i)
      });
    }
    
    // Fill current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(currentYear, currentMonth, i)
      });
    }
    
    // Fill next month padding days to complete grid (multiples of 7)
    const totalCells = Math.ceil(days.length / 7) * 7;
    const paddingCount = totalCells - days.length;
    for (let i = 1; i <= paddingCount; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(currentYear, currentMonth + 1, i)
      });
    }
    
    return days;
  }, [currentMonth, currentYear]);

  // Group applications chronologically
  const sortedApps = useMemo(() => {
    return [...apps].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [apps]);

  // Weekly group compiler
  const weeklyGroups = useMemo(() => {
    const groups: { title: string; apps: Application[] }[] = [
      { title: "Due in 7 Days", apps: [] },
      { title: "Due in 14 Days", apps: [] },
      { title: "Due in 30 Days", apps: [] },
      { title: "Later Deadlines", apps: [] },
      { title: "Overdue / Past Deadlines", apps: [] }
    ];

    sortedApps.forEach(app => {
      const remaining = daysUntil(new Date(app.deadline));
      if (remaining < 0) {
        groups[4].apps.push(app);
      } else if (remaining <= 7) {
        groups[0].apps.push(app);
      } else if (remaining <= 14) {
        groups[1].apps.push(app);
      } else if (remaining <= 30) {
        groups[2].apps.push(app);
      } else {
        groups[3].apps.push(app);
      }
    });

    return groups.filter(g => g.apps.length > 0);
  }, [sortedApps]);

  if (apps.length === 0) {
    return (
      <Card className="p-8 text-center text-slate-500 dark:text-[#94A3B8] bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl">
        <CalendarIcon size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
        <p className="font-semibold">No deadlines tracked yet.</p>
        <p className="text-xs text-slate-400 mt-1">Add colleges to start visualizing your deadlines timeline.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4 text-left">
      {/* Calendar navigation/tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1E293B] p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-fit">
          <button
            onClick={() => setViewTab("monthly")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-sans font-bold rounded-lg transition-all",
              viewTab === "monthly" ? "bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setViewTab("weekly")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-sans font-bold rounded-lg transition-all",
              viewTab === "weekly" ? "bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            Weekly
          </button>
          <button
            onClick={() => setViewTab("timeline")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-sans font-bold rounded-lg transition-all",
              viewTab === "timeline" ? "bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            Timeline
          </button>
        </div>

        {/* Month controls if Monthly view */}
        {viewTab === "monthly" && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="size-8 p-0" onClick={handlePrevMonth}>
              <ChevronLeft size={16} />
            </Button>
            <span className="text-xs font-sans font-extrabold text-slate-800 dark:text-white min-w-28 text-center uppercase tracking-wider">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <Button variant="ghost" className="size-8 p-0" onClick={handleNextMonth}>
              <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </div>

      {/* View 1: Monthly View Grid */}
      {viewTab === "monthly" && (
        <Card className="p-4 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          {/* Days header */}
          <div className="grid grid-cols-7 gap-1 text-center font-sans font-bold text-slate-450 dark:text-slate-500 text-[10px] uppercase tracking-wider mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1 bg-slate-100 dark:bg-slate-850 p-px rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-800">
            {calendarDays.map((cell, idx) => {
              // Find matching deadlines on this date
              const dayApps = apps.filter(app => {
                const deadlineDate = new Date(app.deadline);
                return (
                  deadlineDate.getDate() === cell.date.getDate() &&
                  deadlineDate.getMonth() === cell.date.getMonth() &&
                  deadlineDate.getFullYear() === cell.date.getFullYear()
                );
              });

              const isToday = cell.date.toDateString() === today.toDateString();

              return (
                <div 
                  key={idx}
                  className={cn(
                    "min-h-[85px] p-2 bg-white dark:bg-[#1E293B] flex flex-col justify-between transition-colors",
                    !cell.isCurrentMonth && "opacity-40 bg-slate-50/50 dark:bg-slate-900/30",
                    isToday && "bg-blue-50/20 dark:bg-blue-950/10 border border-[#3B5BDB]/30"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span 
                      className={cn(
                        "text-xs font-number font-bold text-slate-700 dark:text-slate-350",
                        isToday && "text-brand dark:text-blue-400 font-extrabold underline"
                      )}
                    >
                      {cell.day}
                    </span>
                    {dayApps.length > 0 && (
                      <span className="size-2 bg-red-500 rounded-full" />
                    )}
                  </div>

                  <div className="space-y-1 mt-1 flex-1 flex flex-col justify-end">
                    {dayApps.map(app => {
                      const collegeName = colleges.find(c => c.id === app.collegeId)?.name || app.collegeId;
                      return (
                        <div 
                          key={app.id}
                          onClick={() => onEdit(app)}
                          className="px-1.5 py-0.5 rounded text-[8px] font-sans font-extrabold truncate bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/40 cursor-pointer hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors"
                          title={`${collegeName} (${app.status})`}
                        >
                          {collegeName.split(" ").slice(0, 2).map(w => w[0]).join("")}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* View 2: Weekly View List */}
      {viewTab === "weekly" && (
        <div className="space-y-4">
          {weeklyGroups.map((group, idx) => (
            <Card key={idx} className="p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-left space-y-3">
              <h3 className="font-heading font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Clock size={16} className="text-slate-400 dark:text-slate-500" />
                {group.title}
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-850">
                {group.apps.map(app => {
                  const college = colleges.find(c => c.id === app.collegeId);
                  const daysLeft = daysUntil(new Date(app.deadline));
                  return (
                    <div 
                      key={app.id} 
                      className="py-3 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-900/10 cursor-pointer px-2 rounded-lg transition-all"
                      onClick={() => onEdit(app)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-heading font-bold text-xs shrink-0">
                          {initials(college?.name || app.collegeId)}
                        </span>
                        <div>
                          <p className="font-heading font-bold text-sm text-slate-800 dark:text-white leading-tight">{college?.name || app.collegeId}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans mt-0.5">{app.status} • Priority {app.priority || "Medium"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-number font-extrabold text-slate-800 dark:text-white">
                          {new Date(app.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </p>
                        <p className={cn("text-[9px] font-sans font-bold mt-0.5", daysLeft < 0 ? "text-red-500" : daysLeft <= 7 ? "text-red-500 urgent-pulse" : "text-slate-400")}>
                          {daysLeft < 0 ? "Overdue" : `${daysLeft} days left`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* View 3: Timeline Roadmap */}
      {viewTab === "timeline" && (
        <Card className="p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-left">
          <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-6">
            {sortedApps.map((app, idx) => {
              const college = colleges.find(c => c.id === app.collegeId);
              const daysLeft = daysUntil(new Date(app.deadline));
              const isPast = daysLeft < 0;

              return (
                <div key={app.id} className="relative">
                  {/* Circle indicator on left line */}
                  <span 
                    className={cn(
                      "absolute -left-[31px] top-1.5 grid size-4 rounded-full border-2 border-white dark:border-[#1E293B] place-items-center shadow-sm",
                      isPast ? "bg-slate-350 dark:bg-slate-650" : daysLeft <= 3 ? "bg-red-500" : "bg-[#3B5BDB]"
                    )}
                  />

                  {/* Timeline block */}
                  <div 
                    className="p-4 bg-slate-50/50 dark:bg-slate-900/10 border border-slate-150 dark:border-slate-800/80 rounded-xl hover:border-blue-400 dark:hover:border-blue-900 cursor-pointer transition-colors space-y-2.5"
                    onClick={() => onEdit(app)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-heading font-extrabold text-sm text-slate-800 dark:text-white">{college?.name || app.collegeId}</h4>
                        <p className="text-[10px] text-slate-400 font-sans mt-0.5">Stage: {app.status}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-number font-extrabold text-xs text-slate-800 dark:text-white">
                          {new Date(app.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        <span className={cn("block text-[9px] font-sans font-bold mt-0.5", daysLeft < 0 ? "text-red-500" : daysLeft <= 7 ? "text-red-500 urgent-pulse" : "text-slate-400")}>
                          {daysLeft < 0 ? "Overdue" : `${daysLeft} days left`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-450 dark:text-slate-500 font-sans border-t border-slate-200/50 dark:border-slate-800/50 pt-2">
                      <div className="flex items-center gap-1.5">
                        <ListTodo size={13} className="text-slate-400" />
                        <span>Checklist: {app.requiredDocuments?.filter(d=>d.status === "Uploaded").length || 0}/{app.requiredDocuments?.length || 0} uploaded</span>
                      </div>
                      <div>
                        <span>Priority: <span className="font-bold text-slate-600 dark:text-slate-350">{app.priority || "Medium"}</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
