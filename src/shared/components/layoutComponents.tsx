import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, MapPin, Building2 } from "lucide-react";
import { Button, Card, Badge } from "../ui";
import { cn, daysUntil, initials } from "../utils/utils";
import type { Career, College, Application } from "../types/types";

export function Page({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="space-y-2 border-b border-[rgba(0,0,0,0.08)] pb-6 dark:border-[rgba(225,220,201,0.08)]">
        <h1 className="text-5xl md:text-6xl font-heading font-extrabold tracking-normal text-primary leading-[0.95]">{title}</h1>
        {subtitle && <p className="text-base text-secondary font-medium leading-relaxed max-w-3xl">{subtitle}</p>}
      </div>
      <div className="space-y-7">{children}</div>
    </div>
  );
}

export function Section({ title, cta, children }: { title: string; cta?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-primary tracking-tight">{title}</h2>
        {cta && (
          <Link to={cta} className="text-xs font-semibold text-[#4C43CD] hover:text-[#3930B8] flex items-center gap-0.5 dark:text-[#E1DCC9] dark:hover:text-white">
            View all <ChevronRight size={13} />
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

export function CardGrid<T>({ items, render }: { items: T[]; render: (item: T) => React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map(render)}</div>;
}

export function Toolbar({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">{children}</div>;
}

export function Stat({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <span className="grid size-11 place-items-center rounded-xl bg-[rgba(76,67,205,0.08)] text-[#4C43CD] border border-[rgba(76,67,205,0.15)] dark:bg-[rgba(108,142,255,0.08)] dark:text-[#6C8EFF] dark:border-[rgba(108,142,255,0.15)]">
        <Icon size={20} />
      </span>
      <div>
        <p className="text-[10px] font-semibold text-muted uppercase tracking-wider">{label}</p>
        <p className="mt-0.5 text-2xl font-extrabold text-primary leading-tight">{value}</p>
      </div>
    </Card>
  );
}

export function GrowthBadge({ value }: { value: Career["growthOutlook"] }) {
  return (
    <Badge tone={value === "High" ? "emerald" : value === "Medium" ? "amber" : "slate"} className="font-extrabold text-[9px] uppercase tracking-wider">
      {value} Growth
    </Badge>
  );
}

export function BadgeList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-muted uppercase tracking-wider">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => <Badge key={item}>{item}</Badge>)}
      </div>
    </div>
  );
}

export function CollegeMark({ college }: { college: College }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-12 place-items-center rounded-xl bg-[#4C43CD] font-extrabold text-white text-base dark:bg-gradient-to-br dark:from-blue-700 dark:to-indigo-600">
        {initials(college.name)}
      </span>
      <div>
        <h2 className="text-xl font-extrabold text-primary leading-tight">{college.name}</h2>
        <p className="text-xs text-muted font-bold flex items-center gap-1 mt-0.5">
          <MapPin size={12} /> {college.city}, {college.state}
        </p>
      </div>
    </div>
  );
}

export function DeadlineRow({ app, college }: { app: Application; college?: College }) {
  const daysLeft = daysUntil(app.deadline);
  return (
    <Link to="/tracker">
      <Card className="flex items-center justify-between p-4 transition-all duration-200">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-[#F1EEDD] border border-[rgba(0,0,0,0.08)] text-secondary font-extrabold text-xs dark:bg-[#1F150C] dark:border-[rgba(225,220,201,0.08)]">
            {initials(college?.name || app.collegeId)}
          </span>
          <div>
            <h4 className="font-extrabold text-primary text-sm leading-tight">
              {college?.name || app.collegeId}
            </h4>
            <p className="text-xs text-muted font-semibold mt-0.5">{app.status}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-secondary">
            {app.deadline.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </p>
          <p className={cn("text-[10px] font-bold mt-0.5", daysLeft <= 7 ? "text-rose-500" : "text-muted")}>
            {daysLeft < 0 ? "Overdue" : `${daysLeft} days left`}
          </p>
        </div>
      </Card>
    </Link>
  );
}

export function Empty({ icon: Icon, title, action, to }: { icon: React.ElementType; title: string; action: string; to: string }) {
  return (
    <Card className="grid place-items-center gap-4 p-12 text-center border-dashed border-2 bg-[#FBFAF2]/70 dark:bg-[#111111]/40">
      <span className="grid size-14 place-items-center rounded-xl bg-[#F1EEDD] text-muted dark:bg-[#1F150C]">
        <Icon size={24} />
      </span>
      <div>
        <h3 className="text-lg font-bold text-primary">{title}</h3>
      </div>
      <Link to={to}>
        <Button>{action}</Button>
      </Link>
    </Card>
  );
}

export function Banner({ text, to }: { text: string; to?: string }) {
  const inner = (
    <div className="mb-4 rounded-xl border border-[rgba(201,74,74,0.15)] bg-[rgba(201,74,74,0.08)] p-4 text-xs font-semibold text-[#C94A4A] hover:bg-[rgba(201,74,74,0.12)] hover:border-[rgba(201,74,74,0.25)] transition-all duration-200 flex items-center gap-2">
      {text}
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

export function Missing({ label }: { label: string }) {
  return (
    <Page title="Not Found">
      <Empty icon={Building2} title={`We couldn't find that ${label}`} action="Go back home" to="/" />
    </Page>
  );
}
