import { useState } from "react";
import { useAuth } from "../../auth";
import { Page, Card, Field, Input, Select, Button, Badge, categories } from "../../../shared";
import type { StudentProfile } from "../../../shared";

function toggle<T>(items: T[], item: T) {
  return items.includes(item) ? items.filter((x) => x !== item) : [...items, item];
}

export function Profile() {
  const { profile, saveProfile } = useAuth();
  const [form, setForm] = useState<StudentProfile>(profile || {
    displayName: "",
    email: "",
    grade: "",
    gpa: 0,
    location: "",
    satAct: "",
    intendedMajor: "",
    interests: [],
    careerInterests: [],
    activities: [],
    savedColleges: []
  });
  const [saved, setSaved] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await saveProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  function updateList(key: "interests" | "activities", value: string) {
    setForm({ ...form, [key]: value.split(",").map((x) => x.trim()).filter(Boolean) });
  }

  return (
    <Page title="Student Profile" subtitle="Personalize recommendations with your goals and interests.">
      <Card className="p-5">
        <form className="grid gap-5 md:grid-cols-2" onSubmit={submit}>
          <Field label="Name">
            <Input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} required />
          </Field>
          <Field label="Grade">
            <Select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} required>
              <option value="">Select grade</option>
              <option>9</option>
              <option>10</option>
              <option>11</option>
              <option>12</option>
              <option>Graduate</option>
            </Select>
          </Field>
          <Field label="GPA">
            <Input type="number" min="0" max="5" step="0.01" value={form.gpa || ""} onChange={(e) => setForm({ ...form, gpa: Number(e.target.value) })} required />
          </Field>
          <Field label="State / Location (comma-separated)">
            <Input placeholder="e.g. Maharashtra, Delhi" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
          </Field>
          <Field label="SAT / ACT">
            <Input value={form.satAct} onChange={(e) => setForm({ ...form, satAct: e.target.value })} />
          </Field>
          <Field label="Intended Major">
            <Input value={form.intendedMajor} onChange={(e) => setForm({ ...form, intendedMajor: e.target.value })} required />
          </Field>
          <Field label="Activities, comma-separated">
            <Input value={form.activities.join(", ")} onChange={(e) => updateList("activities", e.target.value)} />
          </Field>
          <Field label="Academic Interests, comma-separated">
            <Input value={form.interests.join(", ")} onChange={(e) => updateList("interests", e.target.value)} />
          </Field>
          <div className="md:col-span-2">
            <p className="mb-2 text-sm font-medium text-slate-700">Career Interests</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  type="button"
                  variant={form.careerInterests.includes(cat) ? "primary" : "outline"}
                  onClick={() => setForm({ ...form, careerInterests: toggle(form.careerInterests, cat) })}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 md:col-span-2">
            <Button type="submit">Save profile</Button>
            {saved && <Badge tone="emerald">Saved successfully</Badge>}
          </div>
        </form>
      </Card>
    </Page>
  );
}
