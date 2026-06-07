import { type ButtonHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes, type SelectHTMLAttributes } from "react";
import { cn } from "../utils/utils";

export function Button({ className, variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "ghost" | "danger" }) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]",
        variant === "primary" && "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/10 hover:from-blue-700 hover:to-indigo-700 hover:shadow-md hover:shadow-blue-500/20",
        variant === "outline" && "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900",
        variant === "ghost" && "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
        variant === "danger" && "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-sm shadow-rose-500/10 hover:from-rose-600 hover:to-red-700 hover:shadow-md hover:shadow-rose-500/20",
        className,
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border border-slate-200/60 bg-white/95 shadow-soft backdrop-blur-sm", className)} {...props} />;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("h-10 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10", className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("h-10 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10", className)} {...props} />;
}

export function Badge({ className, tone = "slate", ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: "slate" | "blue" | "emerald" | "amber" | "rose" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border",
        tone === "slate" && "bg-slate-50 text-slate-700 border-slate-200/80",
        tone === "blue" && "bg-blue-50 text-blue-700 border-blue-100",
        tone === "emerald" && "bg-emerald-50 text-emerald-700 border-emerald-100",
        tone === "amber" && "bg-amber-50/70 text-amber-800 border-amber-100",
        tone === "rose" && "bg-rose-50 text-rose-700 border-rose-100",
        className,
      )}
      {...props}
    />
  );
}

export function Progress({ value }: { value: number }) {
  return (
    <div className="h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200/30">
      <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function Separator({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-slate-200/70", className)} />;
}

export function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      {children}
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </label>
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none", className)} {...props} />;
}
