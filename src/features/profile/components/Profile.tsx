import React, { useState } from "react";
import { useAuth } from "../../auth";
import { Page, Card, Field, Input, Select, Button, Badge, categories } from "../../../shared";
import type { StudentProfile } from "../../../shared";
import { GraduationCap, Award, BookOpen, Compass, ShieldCheck } from "lucide-react";
import { cn } from "../../../shared/utils/utils";

type ProfileTab = "academic" | "career" | "activities" | "preferences" | "goals";

export function Profile() {
  const { profile, saveProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>("academic");
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
    savedColleges: [],
    dreamSchool: "",
    targetSchool: "",
    safetySchool: "",
    budget: 500000,
    preferredSize: "Medium"
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

  const toggleCategory = (cat: string) => {
    const current = form.careerInterests || [];
    const updated = current.includes(cat)
      ? current.filter((x) => x !== cat)
      : [...current, cat];
    setForm({ ...form, careerInterests: updated });
  };

  const tabs: { name: ProfileTab; label: string; icon: React.ElementType }[] = [
    { name: "academic", label: "Academic Profile", icon: GraduationCap },
    { name: "career", label: "Career Interests", icon: Compass },
    { name: "activities", label: "Activities", icon: Award },
    { name: "preferences", label: "College Preferences", icon: BookOpen },
    { name: "goals", label: "Goals & Targets", icon: ShieldCheck }
  ];

  return (
    <Page title="Student Profile" subtitle="Configure your goals, academic history, preferences, and interests to refine CareerCompass recommendations.">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        
        {/* Left Side Tab Navigation */}
        <div className="flex flex-row lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 h-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.name}
                type="button"
                onClick={() => setActiveTab(tab.name)}
                className={cn(
                  "flex items-center gap-3 py-2.5 px-4 text-xs font-sans font-bold rounded-xl transition-all border text-left shrink-0",
                  activeTab === tab.name
                    ? "bg-[#3B5BDB] border-[#3B5BDB] text-white shadow-md shadow-brand/10 font-extrabold"
                    : "bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main form card container */}
        <Card className="p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-left">
          <form onSubmit={submit} className="space-y-6">
            
            {/* Tab 1: Academic Profile */}
            {activeTab === "academic" && (
              <div className="space-y-4">
                <h3 className="font-heading font-extrabold text-base text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Academic History</h3>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Full Name">
                    <Input 
                      value={form.displayName} 
                      onChange={(e) => setForm({ ...form, displayName: e.target.value })} 
                      className="bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                      required 
                    />
                  </Field>
                  <Field label="Grade Level">
                    <Select 
                      value={form.grade} 
                      onChange={(e) => setForm({ ...form, grade: e.target.value })} 
                      className="bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                      required
                    >
                      <option value="">Select Grade</option>
                      <option>9</option>
                      <option>10</option>
                      <option>11</option>
                      <option>12</option>
                      <option>Graduate</option>
                    </Select>
                  </Field>
                  <Field label="Cumulative GPA (0.00 - 5.00)">
                    <Input 
                      type="number" 
                      min="0" 
                      max="5" 
                      step="0.01" 
                      value={form.gpa || ""} 
                      onChange={(e) => setForm({ ...form, gpa: Number(e.target.value) })} 
                      className="bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                      required 
                    />
                  </Field>
                  <Field label="SAT / ACT Score (Optional)">
                    <Input 
                      placeholder="e.g. 1480" 
                      value={form.satAct} 
                      onChange={(e) => setForm({ ...form, satAct: e.target.value })} 
                      className="bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </Field>
                </div>
              </div>
            )}

            {/* Tab 2: Career Interests */}
            {activeTab === "career" && (
              <div className="space-y-4">
                <h3 className="font-heading font-extrabold text-base text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Career Mapping</h3>
                
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-350">Preferred Industries</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <Button
                        key={cat}
                        type="button"
                        variant={form.careerInterests.includes(cat) ? "primary" : "outline"}
                        className="h-9 text-xs rounded-xl font-sans"
                        onClick={() => toggleCategory(cat)}
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2 pt-2">
                  <Field label="Intended College Major">
                    <Input 
                      value={form.intendedMajor} 
                      onChange={(e) => setForm({ ...form, intendedMajor: e.target.value })} 
                      className="bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                      required 
                    />
                  </Field>
                  <Field label="Favorite Subjects (comma-separated)">
                    <Input 
                      placeholder="e.g. Mathematics, Computer Science" 
                      value={form.interests.join(", ")} 
                      onChange={(e) => updateList("interests", e.target.value)} 
                      className="bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </Field>
                </div>
              </div>
            )}

            {/* Tab 3: Activities */}
            {activeTab === "activities" && (
              <div className="space-y-4">
                <h3 className="font-heading font-extrabold text-base text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Extracurricular Activities</h3>
                <div className="space-y-2">
                  <Field label="Clubs, Leadership, Sports, Volunteering (comma-separated)">
                    <Input 
                      placeholder="e.g. Robotics Club (VP), Varsity Tennis, Hackathon Organizer" 
                      value={form.activities.join(", ")} 
                      onChange={(e) => updateList("activities", e.target.value)} 
                      className="bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </Field>
                  <p className="text-[10px] text-slate-400 font-sans mt-1">These descriptors power our automated Fit Match recommendations.</p>
                </div>
              </div>
            )}

            {/* Tab 4: College Preferences */}
            {activeTab === "preferences" && (
              <div className="space-y-4">
                <h3 className="font-heading font-extrabold text-base text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">College Settings</h3>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Location Preference (State)">
                    <Input 
                      placeholder="e.g. Maharashtra, Delhi" 
                      value={form.location} 
                      onChange={(e) => setForm({ ...form, location: e.target.value })} 
                      className="bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                      required 
                    />
                  </Field>
                  <Field label="Campus Size Preference">
                    <Select 
                      value={form.preferredSize || "Medium"} 
                      onChange={(e) => setForm({ ...form, preferredSize: e.target.value })} 
                      className="bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    >
                      <option>Small</option>
                      <option>Medium</option>
                      <option>Large</option>
                    </Select>
                  </Field>
                  <Field label="Max Annual Cost (Tuition limit in INR)">
                    <Input 
                      type="number" 
                      min="0"
                      step="10000"
                      value={form.budget || 500000} 
                      onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })} 
                      className="bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </Field>
                </div>
              </div>
            )}

            {/* Tab 5: Goals & Targets */}
            {activeTab === "goals" && (
              <div className="space-y-4">
                <h3 className="font-heading font-extrabold text-base text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Target Schools Goals</h3>
                <div className="grid gap-5 md:grid-cols-3">
                  <Field label="Dream School">
                    <Input 
                      placeholder="e.g. IIT Bombay" 
                      value={form.dreamSchool || ""} 
                      onChange={(e) => setForm({ ...form, dreamSchool: e.target.value })} 
                      className="bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </Field>
                  <Field label="Target School">
                    <Input 
                      placeholder="e.g. BITS Pilani" 
                      value={form.targetSchool || ""} 
                      onChange={(e) => setForm({ ...form, targetSchool: e.target.value })} 
                      className="bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </Field>
                  <Field label="Safety School">
                    <Input 
                      placeholder="e.g. VIT Vellore" 
                      value={form.safetySchool || ""} 
                      onChange={(e) => setForm({ ...form, safetySchool: e.target.value })} 
                      className="bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </Field>
                </div>
              </div>
            )}

            {/* Form actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
              <Button type="submit" className="bg-[#3B5BDB] hover:bg-brand-hover text-white rounded-xl h-10 px-6 font-heading font-bold text-xs shadow-md shadow-brand/10">
                Save Profile Configuration
              </Button>
              {saved && <Badge tone="emerald" className="py-1 px-3 text-xs font-sans font-bold rounded-lg">Saved Successfully</Badge>}
            </div>
          </form>
        </Card>
      </div>
    </Page>
  );
}
