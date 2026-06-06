import { createContext, useContext, useEffect, useMemo, useState } from "react";

type CompareContextValue = {
  compareIds: string[];
  toggleCompare: (collegeId: string) => void;
  clearCompare: () => void;
};

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareIds, setCompareIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("careercompass_compare") || "[]") as string[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("careercompass_compare", JSON.stringify(compareIds));
  }, [compareIds]);

  const value = useMemo(() => ({
    compareIds,
    toggleCompare(collegeId: string) {
      setCompareIds((ids) => ids.includes(collegeId) ? ids.filter((id) => id !== collegeId) : ids.length >= 4 ? [...ids.slice(1), collegeId] : [...ids, collegeId]);
    },
    clearCompare() {
      setCompareIds([]);
    },
  }), [compareIds]);

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used inside CompareProvider");
  return ctx;
}
