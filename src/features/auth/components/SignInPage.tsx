import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Compass, ArrowLeft, Sparkles, LogIn, UserPlus, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../state/AuthContext";
import { cn } from "../../../shared";
import { firebaseReady } from "../../../services/firebase";

export function SignInPage() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">(
    searchParams.get("mode") === "register" ? "register" : "login"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register, authError, startDemo } = useAuth();
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (mode === "register") {
        await register(email, password, name);
        navigate("/profile");
      } else {
        await login(email, password);
        navigate("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDemoMode = () => {
    startDemo();
    navigate("/");
  };

  const inputClass =
    "h-10 w-full rounded-xl border border-slate-200/80 bg-slate-50/40 pl-10 pr-4 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:border-blue-400 focus:ring-[3px] focus:ring-blue-500/10";

  return (
    <div className="h-screen flex flex-col font-sans antialiased text-slate-800 overflow-hidden relative">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/60" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-400/[0.06] rounded-full blur-3xl animate-float-1" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-400/[0.07] rounded-full blur-3xl animate-float-2" />
      </div>

      {/* Navbar */}
      <header className="bg-white/60 backdrop-blur-xl border-b border-slate-200/50 px-5 py-3 shrink-0">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-base font-extrabold text-slate-900 select-none group">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/15 group-hover:shadow-blue-500/25 transition-shadow">
              <Compass size={16} />
            </span>
            <span className="tracking-tight">CareerCompass</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Centered card */}
      <div className="flex-1 flex items-center justify-center px-4 min-h-0">
        <div className="w-full max-w-[420px] animate-fade-in">
          <div className="relative bg-white/80 backdrop-blur-2xl rounded-2xl shadow-xl shadow-slate-900/[0.04] border border-white/70 overflow-hidden">
            {/* Top accent */}
            <div className="h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

            {/* Decorative blurs */}
            <div className="absolute -right-14 -top-14 size-40 bg-blue-400/[0.05] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-14 -bottom-14 size-40 bg-indigo-400/[0.05] rounded-full blur-3xl pointer-events-none" />

            <div className="relative px-7 pt-6 pb-6 sm:px-8">
              {/* Header */}
              <div className="text-center mb-5">
                <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-50 border border-blue-100/50 mb-3">
                  {mode === "register" ? <UserPlus size={20} className="text-blue-600" /> : <LogIn size={20} className="text-blue-600" />}
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {mode === "register" ? "Create your account" : "Welcome back"}
                </h2>
                <p className="text-slate-500 font-medium text-sm mt-1">
                  {mode === "register" ? "Join CareerCompass and start your journey." : "Sign in to access your colleges & pathways."}
                </p>
              </div>

              {/* Tab switcher */}
              <div className="relative mb-5 flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
                <div
                  className={cn(
                    "absolute top-1 bottom-1 rounded-lg bg-white shadow-sm transition-all duration-300 ease-out",
                    mode === "login" ? "left-1 right-[50%]" : "left-[50%] right-1"
                  )}
                />
                <button
                  type="button"
                  className={cn(
                    "relative z-10 flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-bold transition-colors",
                    mode === "login" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                  )}
                  onClick={() => { setMode("login"); setError(""); }}
                >
                  <LogIn size={14} />
                  Log In
                </button>
                <button
                  type="button"
                  className={cn(
                    "relative z-10 flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-bold transition-colors",
                    mode === "register" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                  )}
                  onClick={() => { setMode("register"); setError(""); }}
                >
                  <UserPlus size={14} />
                  Register
                </button>
              </div>

              {/* Form */}
              <form className="relative grid gap-4" onSubmit={submit}>
                {mode === "register" && (
                  <div className="grid gap-1.5 animate-fade-in">
                    <label className="text-sm font-semibold text-slate-700">Full Name</label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" placeholder="Alex Morgan" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
                    </div>
                  </div>
                )}

                <div className="grid gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="email" placeholder="alex@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className={cn(inputClass, "pr-10")}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" tabIndex={-1}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {(error || authError) && (
                  <div className="flex items-start gap-2.5 rounded-xl bg-rose-50/80 border border-rose-100 p-3 animate-fade-in">
                    <span className="text-rose-500 text-sm shrink-0">⚠️</span>
                    <p className="text-sm text-rose-700 font-medium leading-relaxed">{error || authError}</p>
                  </div>
                )}

                {!firebaseReady && (
                  <div className="rounded-xl bg-gradient-to-br from-blue-50/80 to-indigo-50/60 border border-blue-100/60 p-3.5 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-blue-600" />
                      <p className="text-sm font-bold text-blue-900">Sandbox Mode</p>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      Firebase is bypassed. Explore the full experience with browser storage.
                    </p>
                    <button
                      type="button"
                      onClick={handleDemoMode}
                      className="w-full h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-md shadow-blue-500/15 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles size={14} />
                      Explore Sandbox Demo
                    </button>
                  </div>
                )}

                {firebaseReady && (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 mt-0.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-blue-500/15 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="size-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {mode === "register" ? <UserPlus size={15} /> : <LogIn size={15} />}
                        {mode === "register" ? "Create Account" : "Sign In"}
                      </>
                    )}
                  </button>
                )}
              </form>

              {firebaseReady && (
                <div className="relative mt-5">
                  <div className="flex items-center gap-3 mb-3.5">
                    <div className="h-px flex-grow bg-gradient-to-r from-transparent to-slate-200/70" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Or</span>
                    <div className="h-px flex-grow bg-gradient-to-l from-transparent to-slate-200/70" />
                  </div>
                  <button
                    type="button"
                    onClick={handleDemoMode}
                    className="w-full h-10 rounded-xl border border-slate-200/80 bg-white/80 hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-sm font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Sparkles size={13} className="text-indigo-500" />
                    Continue in Demo Mode
                  </button>
                </div>
              )}

              {/* Footer inside card */}
              <p className="text-center text-xs text-slate-400 font-medium mt-5 pt-4 border-t border-slate-100/80">
                {mode === "register" ? (
                  <>Already have an account?{" "}<button type="button" onClick={() => { setMode("login"); setError(""); }} className="text-blue-600 hover:text-blue-700 font-bold transition-colors">Sign in</button></>
                ) : (
                  <>Don't have an account?{" "}<button type="button" onClick={() => { setMode("register"); setError(""); }} className="text-blue-600 hover:text-blue-700 font-bold transition-colors">Create one</button></>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
