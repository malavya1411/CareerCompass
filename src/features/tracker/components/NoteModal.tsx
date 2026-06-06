import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "../../auth";
import { Card, Button, Field, Textarea } from "../../../shared";
import type { Application } from "../../../shared";

export function NoteModal({
  app,
  collegeName,
  onClose
}: {
  app: Application;
  collegeName: string;
  onClose: () => void;
}) {
  const { updateApplication } = useAuth();
  const [notes, setNotes] = useState(app.notes);
  const [loading, setLoading] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateApplication(app.id, { notes });
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save note");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 modal-overlay">
      <Card className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl modal-content">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Application Notes</h2>
            <p className="text-xs text-slate-500 font-medium">{collegeName}</p>
          </div>
          <Button variant="ghost" className="size-9 p-0 hover:bg-slate-100 rounded-full" onClick={onClose}>
            <X size={18} className="text-slate-500" />
          </Button>
        </div>
        <form onSubmit={save} className="grid gap-4">
          <Field label="Notes">
            <Textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record notes on essay drafts, application checklist, recommendations, etc."
              autoFocus
            />
          </Field>
          <div className="flex items-center justify-end gap-3 mt-2">
            <Button type="button" variant="outline" className="px-4 py-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md" disabled={loading}>
              {loading ? "Saving..." : "Save Note"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
