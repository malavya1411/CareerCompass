import { Link } from "react-router-dom";
import { ArrowRight, X, BarChart3, Trash2 } from "lucide-react";
import { useCatalog, Page, Card, Button, formatMoney, initials } from "../../../shared";
import { useCompare } from "../state/CompareContext";
import { CollegeCompareSelector } from "./CollegeCompareSelector";
import type { College } from "../../../shared";

export function Comparison() {
  const { colleges } = useCatalog();
  const { compareIds, clearCompare, toggleCompare } = useCompare();
  const selected = colleges.filter((college) => compareIds.includes(college.id));

  if (selected.length < 2) {
    return (
      <Page title="College Comparison" subtitle="Compare up to four saved schools side-by-side.">
        <div className="mx-auto max-w-2xl space-y-6 py-6">
          <Card className="p-6 text-center border-dashed border-2 border-slate-200 bg-slate-50/20 flex flex-col items-center gap-4 relative z-10">
            <span className="grid size-14 place-items-center rounded-lg bg-blue-50 text-blue-600">
              <BarChart3 size={28} />
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Select colleges to compare</h3>
              <p className="text-sm text-slate-500 mt-1">
                Select 2 or more colleges to see a detailed side-by-side comparison.
              </p>
            </div>

            <CollegeCompareSelector />

            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-slate-400 font-semibold">Or</span>
              <Link to="/colleges" className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1">
                Browse all colleges in explorer <ArrowRight size={14} />
              </Link>
            </div>
          </Card>

          {selected.length === 1 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Currently Selected</h4>
              <Card className="p-3 flex items-center justify-between border border-slate-200/60 bg-white">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-blue-700 to-indigo-600 font-extrabold text-white text-xs">
                    {initials(selected[0].name)}
                  </span>
                  <div>
                    <h5 className="font-extrabold text-slate-800 text-sm">{selected[0].name}</h5>
                    <p className="text-xs text-slate-400 font-semibold">{selected[0].city}, {selected[0].state}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="size-8 p-0 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-500"
                  onClick={() => toggleCompare(selected[0].id)}
                >
                  <Trash2 size={16} />
                </Button>
              </Card>
            </div>
          )}
        </div>
      </Page>
    );
  }

  const rows: [string, (c: College) => string][] = [
    ["Tuition", (c: College) => formatMoney(c.tuition)],
    ["Acceptance Rate", (c: College) => `${c.acceptanceRate}%`],
    ["Enrollment", (c: College) => c.enrollment.toLocaleString()],
    ["Type", (c: College) => c.type],
    ["Majors", (c: College) => c.majors.join(", ")],
  ];

  return (
    <Page title="College Comparison" subtitle={`${selected.length} of 4 colleges selected.`}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm mb-4 relative z-20">
        <Button variant="outline" className="w-fit border-slate-200 hover:bg-slate-50 text-slate-700" onClick={clearCompare}>
          <X size={17} />Clear comparison
        </Button>
        <CollegeCompareSelector />
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="p-4 w-40">Metric</th>
              {selected.map((c) => (
                <th className="p-4 relative group" key={c.id}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate max-w-[180px]" title={c.name}>{c.name}</span>
                    <button
                      type="button"
                      className="size-5 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-colors animate-fade-in"
                      onClick={() => toggleCompare(c.id)}
                      title="Remove from comparison"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, get]) => (
              <tr className="border-b last:border-0" key={label}>
                <td className="p-4 font-semibold">{label}</td>
                {selected.map((college) => (
                  <td className="max-w-72 p-4 align-top text-slate-600" key={college.id}>
                    {get(college)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </Page>
  );
}
