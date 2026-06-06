import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { doc, getDoc, setDoc, addDoc, collection, updateDoc, deleteDoc, Timestamp, serverTimestamp } from "firebase/firestore";
import { auth, db, firebaseReady } from "../../../services/firebase";
import type { StudentProfile, Application, AppStatus } from "../../../shared/types/types";

type AuthContextValue = {
  user: User | null;
  profile: StudentProfile | null;
  loading: boolean;
  authError: string;
  isDemo: boolean;
  applications: Application[];
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  saveProfile: (patch: Partial<StudentProfile>) => Promise<void>;
  addApplication: (collegeId: string, status?: AppStatus, deadline?: Date) => Promise<void>;
  updateApplication: (id: string, patch: Partial<Application>) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
  startDemo: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const starterProfile = (user: User, name = ""): StudentProfile => ({
  displayName: name || user.displayName || "",
  email: user.email || "",
  grade: "",
  gpa: 0,
  location: "",
  satAct: "",
  intendedMajor: "",
  interests: [],
  careerInterests: [],
  activities: [],
  savedColleges: [],
});

const demoStarterProfile = (): StudentProfile => ({
  displayName: "Alex Morgan",
  email: "alex.morgan@demo.com",
  grade: "11",
  gpa: 3.92,
  location: "Delhi",
  satAct: "1480",
  intendedMajor: "Computer Science",
  interests: ["Coding", "Robotics", "Design", "Machine Learning"],
  careerInterests: ["STEM", "Arts"],
  activities: ["Robotics Club (VP)", "Varsity Tennis", "Hackathon Organizer"],
  savedColleges: ["iit-delhi", "iit-bombay"],
});

const demoStarterApplications = (): Application[] => {
  const now = new Date();
  const d = (daysOffset: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() + daysOffset);
    return date;
  };
  return [
    {
      id: "demo-app-1",
      userId: "demo-user",
      collegeId: "iit-delhi",
      status: "Researching",
      deadline: d(45),
      notes: "Researching cutoff ranks for Computer Science and Engineering branch.",
      completeness: 20,
      createdAt: new Date(),
    },
    {
      id: "demo-app-2",
      userId: "demo-user",
      collegeId: "bits-pilani",
      status: "Shortlisted",
      deadline: d(30),
      notes: "BITSAT score meets cutoff. Need to finalize campus preference.",
      completeness: 40,
      createdAt: new Date(),
    },
    {
      id: "demo-app-3",
      userId: "demo-user",
      collegeId: "iit-bombay",
      status: "Applying",
      deadline: d(10),
      notes: "JEE Advanced preparation and JoSAA registration details under review.",
      completeness: 65,
      createdAt: new Date(),
    },
    {
      id: "demo-app-4",
      userId: "demo-user",
      collegeId: "iit-madras",
      status: "Submitted",
      deadline: d(60),
      notes: "Application submitted via JoSAA portal. Awaiting seat allotment.",
      completeness: 90,
      createdAt: new Date(),
    },
    {
      id: "demo-app-5",
      userId: "demo-user",
      collegeId: "nit-trichy",
      status: "Decision",
      deadline: d(5),
      notes: "Received offer for CS branch. Need to confirm by deadline.",
      completeness: 100,
      createdAt: new Date(),
    },
  ];
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [isDemo, setIsDemo] = useState<boolean>(() => localStorage.getItem("careercompass_is_demo") === "true");
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    if (isDemo) {
      // Load profile
      const savedProfile = localStorage.getItem("careercompass_demo_profile");
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      } else {
        const defProfile = demoStarterProfile();
        setProfile(defProfile);
        localStorage.setItem("careercompass_demo_profile", JSON.stringify(defProfile));
      }

      // Load applications
      const savedApps = localStorage.getItem("careercompass_demo_applications");
      if (savedApps) {
        setApplications(JSON.parse(savedApps).map((app: any) => ({
          ...app,
          deadline: new Date(app.deadline),
          createdAt: new Date(app.createdAt)
        })));
      } else {
        const defApps = demoStarterApplications();
        setApplications(defApps);
        localStorage.setItem("careercompass_demo_applications", JSON.stringify(defApps));
      }

      setUser({
        uid: "demo-user",
        email: "alex.morgan@demo.com",
        displayName: "Alex Morgan"
      } as User);
      setLoading(false);
      return;
    }

    if (!firebaseReady) {
      setLoading(false);
      return;
    }
    return onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setAuthError("");
      if (!nextUser) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const ref = doc(db, "users", nextUser.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setProfile(snap.data() as StudentProfile);
      } else {
        const created = starterProfile(nextUser);
        await setDoc(ref, created);
        setProfile(created);
      }
      setLoading(false);
    });
  }, [isDemo]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    profile,
    loading,
    authError,
    isDemo,
    applications,
    async login(email, password) {
      if (!firebaseReady) {
        setAuthError("Add your Firebase config in src/lib/firebase.ts or .env before signing in.");
        return;
      }
      await signInWithEmailAndPassword(auth, email, password);
    },
    async register(email, password, name) {
      if (!firebaseReady) {
        setAuthError("Add your Firebase config in src/lib/firebase.ts or .env before registering.");
        return;
      }
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const created = starterProfile(credential.user, name);
      await setDoc(doc(db, "users", credential.user.uid), created);
      setProfile(created);
    },
    async logout() {
      if (isDemo) {
        setIsDemo(false);
        setUser(null);
        setProfile(null);
        setApplications([]);
        localStorage.removeItem("careercompass_is_demo");
      } else {
        await signOut(auth);
      }
    },
    async saveProfile(patch) {
      if (isDemo) {
        const updated = { ...profile, ...patch };
        setProfile(updated as StudentProfile);
        localStorage.setItem("careercompass_demo_profile", JSON.stringify(updated));
        if (patch.displayName && user) {
          setUser({ ...user, displayName: patch.displayName });
        }
        return;
      }
      if (!user) return;
      const updated = { ...starterProfile(user), ...profile, ...patch };
      await setDoc(doc(db, "users", user.uid), updated, { merge: true });
      setProfile(updated);
    },
    async addApplication(collegeId, status?: AppStatus, deadline?: Date) {
      const targetStatus = status || "Researching";
      const targetDeadline = deadline || (() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 3);
        return d;
      })();
      const completeness = targetStatus === "Decision" ? 100 : targetStatus === "Submitted" ? 90 : targetStatus === "Applying" ? 50 : targetStatus === "Shortlisted" ? 30 : 0;

      if (isDemo) {
        const newApp: Application = {
          id: `demo-app-${Date.now()}`,
          userId: "demo-user",
          collegeId,
          status: targetStatus,
          deadline: targetDeadline,
          notes: "",
          completeness,
          createdAt: new Date(),
        };
        const updated = [...applications, newApp];
        setApplications(updated);
        localStorage.setItem("careercompass_demo_applications", JSON.stringify(updated));
      } else {
        if (!user || !firebaseReady) {
          throw new Error("Connect Firebase and sign in to add tracker records.");
        }
        await addDoc(collection(db, "applications"), {
          userId: user.uid,
          collegeId,
          status: targetStatus,
          deadline: Timestamp.fromDate(targetDeadline),
          notes: "",
          completeness,
          createdAt: serverTimestamp(),
        });
      }
    },
    async updateApplication(id, patch) {
      if (isDemo) {
        const updated = applications.map((app) =>
          app.id === id ? { ...app, ...patch } : app
        );
        setApplications(updated);
        localStorage.setItem("careercompass_demo_applications", JSON.stringify(updated));
      } else {
        const dbPatch: any = { ...patch };
        if (patch.deadline) {
          dbPatch.deadline = Timestamp.fromDate(patch.deadline);
        }
        await updateDoc(doc(db, "applications", id), dbPatch);
      }
    },
    async deleteApplication(id) {
      if (isDemo) {
        const updated = applications.filter((app) => app.id !== id);
        setApplications(updated);
        localStorage.setItem("careercompass_demo_applications", JSON.stringify(updated));
      } else {
        await deleteDoc(doc(db, "applications", id));
      }
    },
    startDemo() {
      setIsDemo(true);
      localStorage.setItem("careercompass_is_demo", "true");
    },
  }), [authError, loading, profile, user, isDemo, applications]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
