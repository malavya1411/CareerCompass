import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth, SignInPage, LandingPage } from "../features/auth";
import { Dashboard } from "../features/dashboard";
import { CareerExplorer, CareerDetails } from "../features/careers";
import { CollegeExplorer, CollegeDetails, Comparison } from "../features/colleges";
import { Tracker } from "../features/tracker";
import { Profile } from "../features/profile";
import { LoadingScreen, Shell } from "../shared";

export default function App() {
  const auth = useAuth();
  
  if (auth.loading) {
    return <LoadingScreen />;
  }
  
  if (!auth.user) {
    return (
      <Routes>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    );
  }

  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/careers" element={<CareerExplorer />} />
        <Route path="/careers/:id" element={<CareerDetails />} />
        <Route path="/colleges" element={<CollegeExplorer />} />
        <Route path="/colleges/:id" element={<CollegeDetails />} />
        <Route path="/compare" element={<Comparison />} />
        <Route path="/tracker" element={<Tracker />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/signin" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}
