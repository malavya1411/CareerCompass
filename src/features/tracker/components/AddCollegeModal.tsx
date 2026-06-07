import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Card, Button, Field, Select, Input, statuses } from "../../../shared";
import type { College, AppStatus } from "../../../shared";

export function AddCollegeModal({
  colleges,
  onClose,
  onAdd
}: {
  colleges: College[];
  onClose: () => void;
  onAdd: (collegeId: string, status: AppStatus, deadline: Date) => Promise<void>;
}) {
  const [selectedCollegeId, setSelectedCollegeId] = useState(colleges[0]?.id || "");
  const [customName, setCustomName] = useState("");
  const [customType, setCustomType] = useState<"Public" | "Private">("Public");
  const [status, setStatus] = useState<AppStatus>("Researching");
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().slice(0, 10);
  });
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      let finalCollegeId = selectedCollegeId;
      if (selectedCollegeId === "custom") {
        if (!customName.trim()) {
          alert("Please enter a college name");
          setLoading(false);
          return;
        }
        finalCollegeId = `Custom:${customName.trim()}|${customType}`;
      }
      await onAdd(finalCollegeId, status, new Date(deadline));
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add college");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div ref={overlayRef} onClick={handleOverlayClick} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 modal-overlay">
      <Card className="w-full max-w-lg p-6 bg-white rounded-2xl shadow-xl modal-content">
        <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xl font-extrabold text-slate-900">Add College to Tracker</h2>
          <Button variant="ghost" className="size-9 p-0 hover:bg-slate-100 rounded-full" onClick={onClose}>
            <X size={18} className="text-slate-500" />
          </Button>
        </div>
        <form onSubmit={submit} className="grid gap-4">
          <Field label="College">
            <Select value={selectedCollegeId} onChange={(e) => setSelectedCollegeId(e.target.value)}>
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
              <option value="custom">Custom College...</option>
            </Select>
          </Field>

          {selectedCollegeId === "custom" && (
            <div className="grid gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <Field label="College Name">
                <Input placeholder="Enter college name" value={customName} onChange={(e) => setCustomName(e.target.value)} required />
              </Field>
              <Field label="Type">
                <Select value={customType} onChange={(e) => setCustomType(e.target.value as "Public" | "Private")}>
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </Select>
              </Field>
            </div>
          )}

          <Field label="Target Stage">
            <Select value={status} onChange={(e) => setStatus(e.target.value as AppStatus)}>
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </Field>

          <Field label="Application Deadline">
            <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
          </Field>

          <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" className="px-4 py-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/10" disabled={loading}>
              {loading ? "Adding..." : "Add College"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
