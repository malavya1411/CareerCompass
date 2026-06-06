import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { doc, getDoc, setDoc, addDoc, collection, updateDoc, deleteDoc, Timestamp, serverTimestamp } from "firebase/firestore";
import { auth, db, firebaseReady } from "../lib/firebase";
import type { StudentProfile, Application } from "../lib/types";

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
  addApplication: (collegeId: string) => Promise<void>;
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
  location: "CA",
  satAct: "1480",
  intendedMajor: "Computer Science",
  interests: ["Coding", "Robotics", "Design", "Machine Learning"],
  careerInterests: ["STEM", "Arts"],
  activities: ["Robotics Club (VP)", "Varsity Tennis", "Hackathon Organizer"],
  savedColleges: ["stanford", "uc-berkeley"],
});

const demoStarterApplications = (): Application[] => {
  const d1 = new Date();
  d1.setMonth(d1.getMonth() + 2);
  const d2 = new Date();
  d2.setMonth(d2.getMonth() + 3);
  return [
    {
      id: "demo-app-1",
      userId: "demo-user",
      collegeId: "uc-berkeley",
      status: "Applying",
      deadline: d1,
      notes: "UC Application draft in progress. Working on personal insight questions.",
      createdAt: new Date(),
    },
    {
      id: "demo-app-2",
      userId: "demo-user",
      collegeId: "stanford",
      status: "Researching",
      deadline: d2,
      notes: "Attending virtual info session next week. Need to contact counselor.",
      createdAt: new Date(),
    }
  ];
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [isDemo, setIsDemo] = useState<boolean>(!firebaseReady);
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
    async addApplication(collegeId) {
      if (isDemo) {
        const deadline = new Date();
        deadline.setMonth(deadline.getMonth() + 3);
        const newApp: Application = {
          id: `demo-app-${Date.now()}`,
          userId: "demo-user",
          collegeId,
          status: "Researching",
          deadline,
          notes: "",
          createdAt: new Date(),
        };
        const updated = [...applications, newApp];
        setApplications(updated);
        localStorage.setItem("careercompass_demo_applications", JSON.stringify(updated));
      } else {
        if (!user || !firebaseReady) {
          throw new Error("Connect Firebase and sign in to add tracker records.");
        }
        const deadline = new Date();
        deadline.setMonth(deadline.getMonth() + 3);
        await addDoc(collection(db, "applications"), {
          userId: user.uid,
          collegeId,
          status: "Researching",
          deadline: Timestamp.fromDate(deadline),
          notes: "",
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
    },
  }), [authError, loading, profile, user, isDemo, applications]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
