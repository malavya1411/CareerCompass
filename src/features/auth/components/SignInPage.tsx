import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass } from "lucide-react";
import { useAuth } from "../state/AuthContext";
import { Button, Card, Field, Input, cn } from "../../../shared";
import { firebaseReady } from "../../../services/firebase";

export function SignInPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, register, authError, startDemo } = useAuth();
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
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
    }
  }

  const handleDemoMode = () => {
    startDemo();
    navigate("/");
  };

  return (
    <div className="min-h-screen mesh-bg flex flex-col font-sans antialiased text-slate-800">
      {/* Navbar */}
      <header className="bg-white/70 backdrop-blur-md border-b border-slate-100/80 px-4 py-3">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-lg font-extrabold text-slate-900 select-none">
            <span className="grid size-9 place-items-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/10">
              <Compass size={18} />
            </span>
            <span>CareerCompass</span>
          </Link>
          <Link 
            to="/" 
            className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main content centered */}
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="glass-card p-6 sm:p-8 shadow-xl border border-white/60 relative overflow-hidden rounded-2xl">
            {/* Decorative gradients */}
            <div className="absolute -right-12 -top-12 size-36 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 size-36 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="text-center mb-6">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {mode === "register" ? "Create your workspace" : "Welcome back"}
              </h2>
              <p className="text-slate-500 font-medium text-xs mt-1">
                {mode === "register" ? "Join CareerCompass for free today." : "Access your colleges and career pathways."}
              </p>
            </div>

            <div className="relative mb-5 flex bg-slate-100 p-1 rounded-xl">
              <button 
                type="button"
                className={cn(
                  "flex-grow rounded-lg py-2 text-xs font-bold transition-all", 
                  mode === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                )} 
                onClick={() => { setMode("login"); setError(""); }}
              >
                Log In
              </button>
              <button 
                type="button"
                className={cn(
                  "flex-grow rounded-lg py-2 text-xs font-bold transition-all", 
                  mode === "register" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                )} 
                onClick={() => { setMode("register"); setError(""); }}
              >
                Register
              </button>
            </div>
            
            <form className="relative grid gap-4" onSubmit={submit}>
              {mode === "register" && (
                <Field label="Full Name">
                  <Input 
                    placeholder="Alex Morgan"
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    className="bg-white/80 border-slate-200/80 focus:bg-white"
                  />
                </Field>
              )}
              <Field label="Email Address">
                <Input 
                  type="email" 
                  placeholder="alex@example.com"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="bg-white/80 border-slate-200/80 focus:bg-white"
                />
              </Field>
              <Field label="Password">
                <Input 
                  type="password" 
                  placeholder="••••••••"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="bg-white/80 border-slate-200/80 focus:bg-white"
                />
              </Field>
              
              {(error || authError) && (
                <p className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-800 font-bold leading-normal">
                  ⚠️ {error || authError}
                </p>
              )}

              {!firebaseReady && (
                <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-3 text-xs text-blue-900 leading-normal space-y-2">
                  <p className="font-extrabold">✨ Sandbox Mode Enabled</p>
                  <p className="text-slate-500 font-medium text-[11px] leading-relaxed">
                    Firebase is currently bypassed. Explore fully featured tracker state saved securely in browser storage.
                  </p>
                  <Button 
                    type="button" 
                    variant="primary" 
                    className="w-full h-8.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm"
                    onClick={handleDemoMode}
                  >
                    Explore Sandbox Demo
                  </Button>
                </div>
              )}
              
              {firebaseReady && (
                <Button type="submit" className="w-full h-10 mt-2 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/10">
                  {mode === "register" ? "Create Account" : "Access Workspace"}
                </Button>
              )}
            </form>

            {firebaseReady && (
              <div className="relative mt-4">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="h-px flex-grow bg-slate-200/60" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Or</span>
                  <div className="h-px flex-grow bg-slate-200/60" />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-9 border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 font-bold rounded-xl text-xs"
                  onClick={handleDemoMode}
                >
                  Continue in Demo Mode
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
