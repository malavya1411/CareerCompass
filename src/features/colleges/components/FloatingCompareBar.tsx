import { BarChart3 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCatalog, Button, initials } from "../../../shared";
import { useCompare } from "../state/CompareContext";

export function FloatingCompareBar() {
  const { compareIds, clearCompare } = useCompare();
  const { colleges } = useCatalog();
  const navigate = useNavigate();
  const location = useLocation();

  if (compareIds.length === 0 || location.pathname === "/compare") return null;

  const selectedColleges = colleges.filter((c) => compareIds.includes(c.id));

  return (
    <div className="fixed bottom-20 left-1/2 z-40 w-[90%] max-w-xl -translate-x-1/2 rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-xl backdrop-blur-md md:bottom-6 md:w-full transition-all duration-300 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-blue-50 text-blue-600">
            <BarChart3 size={18} />
          </span>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Comparing Colleges</h4>
            <p className="text-[10px] text-slate-500 font-medium">
              {compareIds.length} of 4 selected
            </p>
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            {selectedColleges.map((c) => (
              <span
                key={c.id}
                className="grid size-7 place-items-center rounded bg-slate-100 font-extrabold text-slate-700 text-[9px]"
                title={c.name}
              >
                {initials(c.name)}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="ghost"
            className="text-xs font-bold hover:bg-slate-100 h-8 px-3 text-slate-500"
            onClick={clearCompare}
          >
            Clear
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-8 px-4 rounded-lg shadow-sm"
            onClick={() => navigate("/compare")}
            disabled={compareIds.length < 2}
            title={compareIds.length < 2 ? "Select at least 2 colleges to compare" : "Compare Now"}
          >
            Compare Now
          </Button>
        </div>
      </div>
    </div>
  );
}
