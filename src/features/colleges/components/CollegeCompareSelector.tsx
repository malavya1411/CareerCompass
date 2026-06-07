import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useCatalog, Card, Input } from "../../../shared";
import { useCompare } from "../state/CompareContext";

export function CollegeCompareSelector() {
  const { colleges } = useCatalog();
  const { compareIds, toggleCompare } = useCompare();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const available = colleges.filter(
    (c) => !compareIds.includes(c.id) && c.name.toLowerCase().includes(search.toLowerCase())
  );

  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleScroll() {
      setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    if (isOpen) {
      window.addEventListener("scroll", handleScroll, true);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (compareIds.length >= 4) return null;

  return (
    <div className="relative w-full max-w-md z-20" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
        <Input
          className="pl-10 h-10 border-slate-200/80 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
          placeholder="Search and add colleges to compare..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {search && (
          <button
            type="button"
            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            onClick={() => {
              setSearch("");
              setIsOpen(false);
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && (
        <Card className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto p-1.5 shadow-lg border border-slate-100 bg-white">
          {available.length > 0 ? (
            available.map((college) => (
              <button
                key={college.id}
                type="button"
                className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg flex items-center justify-between transition-colors"
                onClick={() => {
                  toggleCompare(college.id);
                  setSearch("");
                  setIsOpen(false);
                }}
              >
                <div>
                  <p className="font-bold">{college.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{college.city}, {college.state}</p>
                </div>
                <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">+ Add</span>
              </button>
            ))
          ) : (
            <div className="px-3 py-3 text-center text-xs text-slate-400 font-medium">
              No matching colleges found
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
