import { useParams, useNavigate } from "react-router-dom";
import { Heart, BarChart3, Plus, GraduationCap, SlidersHorizontal, User, MapPin } from "lucide-react";
import { useAuth } from "../../auth";
import {
  useCatalog,
  Page,
  Card,
  Button,
  Stat,
  BadgeList,
  CardGrid,
  CollegeMark,
  Missing,
  formatMoney,
  toggleSaved
} from "../../../shared";
import { useCompare } from "../state/CompareContext";
import { CareerCard } from "../../careers";

export function CollegeDetails() {
  const { id } = useParams();
  const { profile, saveProfile, addApplication } = useAuth();
  const { careers, colleges } = useCatalog();
  const { compareIds, toggleCompare } = useCompare();
  const college = colleges.find((item) => item.id === id);
  const navigate = useNavigate();

  if (!college) return <Missing label="college" />;

  const saved = profile?.savedColleges?.includes(college.id);
  const relatedCareers = careers.filter((career) => career.relatedMajors.some((major) => college.majors.includes(major))).slice(0, 4);

  async function addToTracker() {
    try {
      await addApplication(college!.id);
      navigate("/tracker");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add application");
    }
  }

  return (
    <Page title={college.name} subtitle={`${college.city}, ${college.state} • ${college.type}`}>
      <Card className="grid gap-5 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <CollegeMark college={college} />
          <Button variant={saved ? "primary" : "outline"} onClick={() => toggleSaved(profile, saveProfile, college.id)}>
            <Heart size={17} />{saved ? "Saved" : "Save"}
          </Button>
          <Button variant={compareIds.includes(college.id) ? "primary" : "outline"} onClick={() => toggleCompare(college.id)}>
            <BarChart3 size={17} />Compare
          </Button>
          <Button onClick={addToTracker}>
            <Plus size={17} />Add to Tracker
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Stat label="Tuition" value={formatMoney(college.tuition)} icon={GraduationCap} />
          <Stat label="Acceptance" value={`${college.acceptanceRate}%`} icon={SlidersHorizontal} />
          <Stat label="Enrollment" value={college.enrollment.toLocaleString()} icon={User} />
          <Stat label="Type" value={college.type} icon={MapPin} />
        </div>
        <p className="text-slate-600">{college.description}</p>
        <BadgeList title="Available Majors" items={college.majors} />
      </Card>
      <SectionWrapper title="Popular Careers for Graduates">
        <CardGrid items={relatedCareers} render={(career) => <CareerCard career={career} />} />
      </SectionWrapper>
    </Page>
  );
}

// Simple local wrapper or we can use Section from shared
import { Section } from "../../../shared";
function SectionWrapper({ title, children }: { title: string; children: React.ReactNode }) {
  return <Section title={title}>{children}</Section>;
}
