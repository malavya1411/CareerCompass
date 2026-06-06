import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "../../auth";
import { Card, Button, Field, Select, Input, Textarea, statuses } from "../../../shared";
import type { Application, College, AppStatus } from "../../../shared";

export function EditApplication({
  app,
  college,
  onClose
}: {
  app: Application;
  college?: College;
  onClose: () => void;
}) {
  const { updateApplication, deleteApplication } = useAuth();
  const [status, setStatus] = useState<AppStatus>(app.status);
  const [deadline, setDeadline] = useState(app.deadline.toISOString().slice(0, 10));
  const [notes, setNotes] = useState(app.notes);
  const [completeness, setCompleteness] = useState(app.completeness);
  const [decisionOutcome, setDecisionOutcome] = useState<string>(app.decisionOutcome || "");
  const [loading, setLoading] = useState(false);

  const handleStatusChange = (newStatus: AppStatus) => {
    setStatus(newStatus);
    const defaultComplete = newStatus === "Decision" ? 100 : newStatus === "Submitted" ? 90 : newStatus === "Applying" ? 50 : newStatus === "Shortlisted" ? 30 : 0;
    setCompleteness(defaultComplete);
  };

  async function save() {
    setLoading(true);
    try {
      const patch: Partial<Application> = {
        status,
        deadline: new Date(deadline),
        notes,
        completeness,
        decisionOutcome: status === "Decision" ? ((decisionOutcome as any) || undefined) : undefined
      };
      await updateApplication(app.id, patch);
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Are you sure you want to remove this college from your tracker?`)) return;
    setLoading(true);
    try {
      await deleteApplication(app.id);
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete application");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 modal-overlay">
      <Card className="w-full max-w-lg p-6 bg-white rounded-2xl shadow-xl modal-content">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xl font-extrabold text-slate-900">{college?.name || "Edit Application"}</h2>
          <Button variant="ghost" className="size-9 p-0 hover:bg-slate-100 rounded-full" onClick={onClose}>
            <X size={18} className="text-slate-500" />
          </Button>
        </div>
        <div className="grid gap-4">
          <Field label="Status">
            <Select value={status} onChange={(e) => handleStatusChange(e.target.value as AppStatus)}>
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </Field>

          {status === "Decision" && (
            <Field label="Outcome">
              <Select value={decisionOutcome} onChange={(e) => setDecisionOutcome(e.target.value)}>
                <option value="">Awaiting Decision</option>
                <option value="Accepted">Accepted 🎉</option>
                <option value="Rejected">Rejected</option>
                <option value="Waitlisted">Waitlisted</option>
              </Select>
            </Field>
          )}

          <Field label="Deadline">
            <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
          </Field>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-semibold text-slate-700">Completeness</span>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{completeness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={completeness}
              onChange={(e) => setCompleteness(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <Field label="Notes">
            <Textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Essay status, letter of recommendation details, or porting notes..."
            />
          </Field>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
            <Button variant="danger" className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 font-bold border-rose-100" onClick={remove} disabled={loading}>
              Delete
            </Button>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" className="px-4 py-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={save} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/10" disabled={loading}>
                {loading ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
