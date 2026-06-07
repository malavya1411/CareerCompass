import { useState } from "react";
import { X, CheckSquare, Square } from "lucide-react";
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
  const [deadline, setDeadline] = useState(
    app.deadline instanceof Date 
      ? app.deadline.toISOString().slice(0, 10) 
      : new Date(app.deadline).toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState(app.notes);
  const [completeness, setCompleteness] = useState(app.completeness);
  const [decisionOutcome, setDecisionOutcome] = useState<string>(app.decisionOutcome || "");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">(app.priority || "Medium");
  
  // Checklist states
  const [essayUploaded, setEssayUploaded] = useState(
    app.requiredDocuments?.find(d => d.name === "Personal Essay")?.status === "Uploaded" || false
  );
  const [transcriptUploaded, setTranscriptUploaded] = useState(
    app.requiredDocuments?.find(d => d.name === "Transcript")?.status === "Uploaded" || false
  );
  const [recLetterUploaded, setRecLetterUploaded] = useState(
    app.requiredDocuments?.find(d => d.name === "Recommendation Letter")?.status === "Uploaded" || false
  );

  const [loading, setLoading] = useState(false);

  const handleStatusChange = (newStatus: AppStatus) => {
    setStatus(newStatus);
    const defaultComplete = 
      newStatus === "Enrolled" || newStatus === "Accepted" || newStatus === "Rejected" ? 100 :
      newStatus === "Decision" ? 90 :
      newStatus === "Interview" ? 80 :
      newStatus === "Submitted" ? 70 :
      newStatus === "Applying" ? 45 :
      newStatus === "Shortlisted" ? 30 :
      newStatus === "Interested" ? 20 : 10;
    setCompleteness(defaultComplete);
    
    // Autofill decision outcomes
    if (newStatus === "Accepted") setDecisionOutcome("Accepted");
    else if (newStatus === "Rejected") setDecisionOutcome("Rejected");
  };

  async function save() {
    setLoading(true);
    try {
      const patch: Partial<Application> = {
        status,
        deadline: new Date(deadline),
        notes,
        completeness,
        priority,
        requiredDocuments: [
          { name: "Personal Essay", status: essayUploaded ? "Uploaded" : "Missing" },
          { name: "Transcript", status: transcriptUploaded ? "Uploaded" : "Missing" },
          { name: "Recommendation Letter", status: recLetterUploaded ? "Uploaded" : "Missing" }
        ],
        decisionOutcome: (status === "Decision" || status === "Accepted" || status === "Rejected" || status === "Interview") 
          ? ((decisionOutcome as any) || undefined) 
          : undefined,
        lastUpdated: new Date()
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
      <Card className="w-full max-w-lg p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl modal-content text-left">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
          <h2 className="text-lg font-heading font-extrabold text-slate-900 dark:text-white">{college?.name || "Edit Application"}</h2>
          <Button variant="ghost" className="size-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full" onClick={onClose}>
            <X size={18} className="text-slate-500" />
          </Button>
        </div>
        
        <div className="grid gap-4 overflow-y-auto max-h-[75vh] pr-1">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Status">
              <Select 
                value={status} 
                onChange={(e) => handleStatusChange(e.target.value as AppStatus)}
                className="bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs h-9"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </Field>

            <Field label="Priority Level">
              <Select 
                value={priority} 
                onChange={(e) => setPriority(e.target.value as any)}
                className="bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs h-9"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </Select>
            </Field>
          </div>

          {(status === "Decision" || status === "Accepted" || status === "Rejected" || status === "Interview") && (
            <Field label="Outcome Details">
              <Select 
                value={decisionOutcome} 
                onChange={(e) => setDecisionOutcome(e.target.value)}
                className="bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs h-9"
              >
                <option value="">Awaiting Decision</option>
                <option value="Accepted">Accepted 🎉</option>
                <option value="Rejected">Rejected</option>
                <option value="Waitlisted">Waitlisted</option>
              </Select>
            </Field>
          )}

          <Field label="Application Deadline">
            <Input 
              type="date" 
              value={deadline} 
              onChange={(e) => setDeadline(e.target.value)} 
              className="bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs h-9"
              required 
            />
          </Field>

          {/* Checklist Toggles */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-350 block">Application Checklist</span>
            <div className="grid gap-2 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
              <label className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 font-medium cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={essayUploaded} 
                  onChange={(e) => setEssayUploaded(e.target.checked)}
                  className="rounded border-slate-350 text-[#3B5BDB] focus:ring-[#3B5BDB]"
                />
                Personal Statement / Essay uploaded
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 font-medium cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={transcriptUploaded} 
                  onChange={(e) => setTranscriptUploaded(e.target.checked)}
                  className="rounded border-slate-350 text-[#3B5BDB] focus:ring-[#3B5BDB]"
                />
                High School Transcript uploaded
              </label>
              <label className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 font-medium cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={recLetterUploaded} 
                  onChange={(e) => setRecLetterUploaded(e.target.checked)}
                  className="rounded border-slate-350 text-[#3B5BDB] focus:ring-[#3B5BDB]"
                />
                Recommendation Letter uploaded
              </label>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5 font-sans">
              <span className="text-xs font-semibold text-slate-750 dark:text-slate-350">Completeness</span>
              <span className="text-[10px] font-bold text-[#3B5BDB] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded-full">{completeness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={completeness}
              onChange={(e) => setCompleteness(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#3B5BDB]"
            />
          </div>

          <Field label="Personal Notes">
            <Textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g. cutoff JEE ranks, specific campus preferences, scholarship applications status..."
              className="bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs"
            />
          </Field>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-850">
            <Button variant="danger" className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 font-bold border-rose-100 h-9 text-xs rounded-xl" onClick={remove} disabled={loading}>
              Delete
            </Button>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" className="px-4 py-2 border-slate-200 text-slate-750 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 h-9 text-xs rounded-xl" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={save} className="px-5 py-2 bg-[#3B5BDB] hover:bg-brand-hover text-white font-bold shadow-md shadow-brand/10 h-9 text-xs rounded-xl" disabled={loading}>
                {loading ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
