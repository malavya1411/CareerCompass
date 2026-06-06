import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db, firebaseReady } from "../../services/firebase";
import { seedDataIfNeeded, careerSeeds, collegeSeeds } from "../../services/seedData";
import type { Career, College } from "../types/types";

export function useCatalog() {
  const [careers, setCareers] = useState<Career[]>(careerSeeds);
  const [colleges, setColleges] = useState<College[]>(collegeSeeds);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!firebaseReady) return;
    setLoading(true);
    seedDataIfNeeded().finally(() => setLoading(false));
    const offCareers = onSnapshot(collection(db, "careers"), (snap) => {
      if (!snap.empty) setCareers(snap.docs.map((d) => d.data() as Career));
    });
    const offColleges = onSnapshot(collection(db, "colleges"), (snap) => {
      if (!snap.empty) setColleges(snap.docs.map((d) => d.data() as College));
    });
    return () => {
      offCareers();
      offColleges();
    };
  }, []);

  return { careers, colleges, loading };
}
