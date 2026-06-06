import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db, firebaseReady } from "../../../services/firebase";
import { useAuth } from "../../auth";
import type { Application } from "../../../shared";

export function useApplications(userId?: string) {
  const { isDemo, applications: demoApplications } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isDemo) {
      setApplications(demoApplications);
      return;
    }
    if (!firebaseReady || !userId) return;
    setLoading(true);
    return onSnapshot(query(collection(db, "applications"), where("userId", "==", userId)), (snap) => {
      setApplications(snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          userId: data.userId,
          collegeId: data.collegeId,
          status: data.status,
          deadline: data.deadline?.toDate ? data.deadline.toDate() : new Date(data.deadline),
          notes: data.notes || "",
          completeness: data.completeness || 0,
          decisionOutcome: data.decisionOutcome || undefined,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        } as Application;
      }));
      setLoading(false);
    });
  }, [userId, isDemo, demoApplications]);

  return { applications, loading };
}
