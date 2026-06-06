import { useMemo } from "react";
import { Heart, ListChecks, CalendarClock } from "lucide-react";
import { useAuth } from "../../auth";
import { useCatalog } from "../../../shared";
import { useApplications } from "../../tracker";
import {
  Page,
  Stat,
  Banner,
  Section,
  CardGrid,
  Empty,
  DeadlineRow,
  profileIncomplete,
  growthScore,
  majorOverlap
} from "../../../shared";
import { CareerCard } from "../../careers";
import { CollegeCard } from "../../colleges";

export function Dashboard() {
  const { user, profile } = useAuth();
  const { careers, colleges } = useCatalog();
  const { applications } = useApplications(user?.uid);
  const saved = profile?.savedColleges || [];

  const recommendedCareers = useMemo(() => careers
    .filter((career) => !profile || profile.careerInterests.includes(career.category) || career.relatedMajors.some((m) => profile.intendedMajor.toLowerCase().includes(m.toLowerCase()) || m.toLowerCase().includes(profile.intendedMajor.toLowerCase())))
    .sort((a, b) => growthScore(b.growthOutlook) - growthScore(a.growthOutlook)).slice(0, 3), [careers, profile]);

  const recommendedColleges = useMemo(() => colleges
    .filter((college) => {
      if (!profile?.location) return false;
      const userStates = profile.location.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
      return userStates.includes(college.state.toLowerCase()) || majorOverlap(profile, college) > 0;
    })
    .sort((a, b) => b.acceptanceRate - a.acceptanceRate).slice(0, 3), [colleges, profile]);

  const upcoming = applications.sort((a, b) => a.deadline.getTime() - b.deadline.getTime()).slice(0, 3);
  const dueThisWeek = applications.filter((app) => {
    const timeDiff = app.deadline.getTime() - new Date().getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysLeft <= 7 && daysLeft >= 0;
  }).length;

  return (
    <Page title={`Welcome back, ${profile?.displayName || "Student"}`} subtitle="Your college and career plan is ready to move.">
      {profileIncomplete(profile) && <Banner to="/profile" text="Complete your profile to get personalized recommendations." />}
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Saved Colleges" value={saved.length} icon={Heart} />
        <Stat label="Active Applications" value={applications.length} icon={ListChecks} />
        <Stat label="Upcoming This Week" value={dueThisWeek} icon={CalendarClock} />
      </div>
      <Section title="Recommended Careers" cta="/careers">
        <CardGrid items={recommendedCareers.length ? recommendedCareers : careers.slice(0, 3)} render={(career) => <CareerCard career={career} />} />
      </Section>
      <Section title="Recommended Colleges" cta="/colleges">
        <CardGrid items={recommendedColleges.length ? recommendedColleges : colleges.slice(0, 3)} render={(college) => <CollegeCard college={college} />} />
      </Section>
      <Section title="Upcoming Deadlines" cta="/tracker">
        {upcoming.length ? (
          <div className="grid gap-3">
            {upcoming.map((app) => (
              <DeadlineRow key={app.id} app={app} college={colleges.find((c) => c.id === app.collegeId)} />
            ))}
          </div>
        ) : (
          <Empty icon={CalendarClock} title="No deadlines yet" action="Add a college to the tracker" to="/colleges" />
        )}
      </Section>
    </Page>
  );
}
