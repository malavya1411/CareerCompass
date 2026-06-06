import { useParams } from "react-router-dom";
import { BriefcaseBusiness, Check, BookOpen } from "lucide-react";
import { useAuth } from "../../auth";
import { CollegeCard } from "../../colleges";
import { 
  useCatalog, 
  Page, 
  Card, 
  Badge, 
  GrowthBadge, 
  Stat, 
  BadgeList, 
  Button, 
  Section, 
  CardGrid, 
  Missing 
} from "../../../shared";

export function CareerDetails() {
  const { id } = useParams();
  const { profile, saveProfile } = useAuth();
  const { careers, colleges } = useCatalog();

  const career = careers.find((item) => item.id === id);
  if (!career) return <Missing label="career" />;

  const related = colleges
    .filter((college) => college.majors.some((major) => career.relatedMajors.includes(major)))
    .slice(0, 6);

  const saved = profile?.careerInterests.includes(career.category);

  return (
    <Page title={career.title} subtitle={career.description}>
      <Card className="grid gap-5 p-5">
        <div className="flex flex-wrap gap-2">
          <Badge tone="blue">{career.category}</Badge>
          <GrowthBadge value={career.growthOutlook} />
          <Badge>{career.educationLevel}</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Stat label="Salary Range" value={career.salaryRange} icon={BriefcaseBusiness} />
          <Stat label="Skills" value={career.skills.length} icon={Check} />
          <Stat label="Majors" value={career.relatedMajors.length} icon={BookOpen} />
        </div>
        <BadgeList title="Core Skills" items={career.skills} />
        <BadgeList title="Recommended Majors" items={career.relatedMajors} />
        <Button 
          className="w-fit" 
          onClick={() => 
            saveProfile({ 
              careerInterests: Array.from(new Set([...(profile?.careerInterests || []), career.category])) 
            })
          }
        >
          {saved ? "Saved to Interests" : "Save to Interests"}
        </Button>
      </Card>
      <Section title="Colleges Offering These Programs">
        <CardGrid items={related} render={(college) => <CollegeCard college={college} />} />
      </Section>
    </Page>
  );
}
