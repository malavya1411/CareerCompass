import { useState, useMemo } from "react";
import { Building2, Calendar, Check, LayoutDashboard, Plus } from "lucide-react";
import { useAuth } from "../../auth";
import { useCatalog, Page, Card, Button, Banner, Empty, statuses, cn } from "../../../shared";
import { firebaseReady } from "../../../services/firebase";
import { useApplications } from "../hooks/useApplications";
import { getCollegeDetails } from "../utils/trackerUtils";
import { KanbanColumn } from "./KanbanColumn";
import { DeadlineCalendarView } from "./DeadlineCalendarView";
import { EditApplication } from "./EditApplication";
import { NoteModal } from "./NoteModal";
import { AddCollegeModal } from "./AddCollegeModal";
import type { Application } from "../../../shared";

export function Tracker() {
  const { user, isDemo, deleteApplication, updateApplication, addApplication } = useAuth();
  const { colleges } = useCatalog();
  const { applications } = useApplications(user?.uid);
  const [editing, setEditing] = useState<Application | null>(null);
  const [noting, setNoting] = useState<Application | null>(null);
  const [addingCollege, setAddingCollege] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "calendar">("kanban");

  const stats = useMemo(() => {
    const total = applications.length;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const deadlinesThisMonth = applications.filter((app) => {
      const d = new Date(app.deadline);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;
    const submittedCount = applications.filter((app) => app.status === "Submitted" || app.status === "Decision").length;
    return { total, deadlinesThisMonth, submitted: submittedCount };
  }, [applications]);

  async function handleRemove(app: Application) {
    if (!window.confirm(`Are you sure you want to remove this college from your tracker?`)) return;
    try {
      await deleteApplication(app.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete application");
    }
  }

  async function handleMoveStage(app: Application) {
    const currentIndex = statuses.indexOf(app.status);
    if (currentIndex >= 0 && currentIndex < statuses.length - 1) {
      const nextStatus = statuses[currentIndex + 1];
      const nextCompleteness = nextStatus === "Decision" ? 100 : nextStatus === "Submitted" ? 90 : nextStatus === "Applying" ? 50 : nextStatus === "Shortlisted" ? 30 : 0;
      try {
        await updateApplication(app.id, { status: nextStatus, completeness: nextCompleteness });
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to move stage");
      }
    }
  }

  return (
    <Page title="Application Tracker" subtitle="Follow each school from research through decisions.">
      {(!firebaseReady && !isDemo) && <Banner text="Firebase config is required for real-time tracker updates." />}

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5 border border-slate-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-blue-200/60 transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-semibold">Colleges Tracked</p>
            <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{stats.total}</p>
          </div>
          <span className="grid size-12 place-items-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm shadow-blue-500/5">
            <Building2 size={24} />
          </span>
        </Card>

        <Card className="p-5 border border-slate-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-amber-200/60 transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-semibold">Deadlines This Month</p>
            <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">{stats.deadlinesThisMonth}</p>
          </div>
          <span className="grid size-12 place-items-center rounded-xl bg-amber-50 text-amber-600 group-hover:bg-gradient-to-br group-hover:from-amber-500 group-hover:to-orange-600 group-hover:text-white transition-all duration-300 shadow-sm shadow-amber-500/5">
            <Calendar size={24} />
          </span>
        </Card>

        <Card className="p-5 border border-slate-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-purple-200/60 transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-semibold">Submitted Applications</p>
            <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">{stats.submitted}</p>
          </div>
          <span className="grid size-12 place-items-center rounded-xl bg-purple-50 text-purple-600 group-hover:bg-gradient-to-br group-hover:from-purple-500 group-hover:to-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm shadow-purple-500/5">
            <Check size={24} />
          </span>
        </Card>
      </div>

      {/* Top Bar with view toggles & add button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm mt-2">
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setViewMode("kanban")}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all flex-1 sm:flex-none",
              viewMode === "kanban" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-950"
            )}
          >
            <LayoutDashboard size={14} /> Kanban Board
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all flex-1 sm:flex-none",
              viewMode === "calendar" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-950"
            )}
          >
            <Calendar size={14} /> Deadline Calendar
          </button>
        </div>
        <Button onClick={() => setAddingCollege(true)} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-4 rounded-xl shadow-md shadow-blue-500/10">
          <Plus size={18} /> Add College
        </Button>
      </div>

      {/* Main content display based on viewMode */}
      {applications.length ? (
        viewMode === "kanban" ? (
          <div className="grid gap-4 xl:grid-cols-5 mt-2">
            {statuses.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                apps={applications.filter((app) => app.status === status)}
                colleges={colleges}
                onEdit={setEditing}
                onAddNote={setNoting}
                onMoveStage={handleMoveStage}
                onRemove={handleRemove}
              />
            ))}
          </div>
        ) : (
          <div className="mt-2">
            <DeadlineCalendarView
              apps={applications}
              colleges={colleges}
              onEdit={setEditing}
              onAddNote={setNoting}
              onRemove={handleRemove}
            />
          </div>
        )
      ) : (
        <Empty icon={Building2} title="Your tracker is empty" action="Add colleges from discovery" to="/colleges" />
      )}

      {/* Modals */}
      {editing && (
        <EditApplication
          app={editing}
          college={colleges.find((c) => c.id === editing.collegeId)}
          onClose={() => setEditing(null)}
        />
      )}
      {noting && (
        <NoteModal
          app={noting}
          collegeName={getCollegeDetails(noting.collegeId, colleges).name}
          onClose={() => setNoting(null)}
        />
      )}
      {addingCollege && (
        <AddCollegeModal
          colleges={colleges}
          onClose={() => setAddingCollege(false)}
          onAdd={addApplication}
        />
      )}
    </Page>
  );
}
