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
  return <div className={cn("rounded-xl border border-slate-200/60 dark:border-[#1d283d] bg-white dark:bg-[#0f1524] text-slate-900 dark:text-white shadow-soft backdrop-blur-sm", className)} {...props} />;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("h-10 w-full rounded-lg border border-slate-200 dark:border-[#1d283d] bg-white dark:bg-[#111827] px-3.5 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10", className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("h-10 w-full rounded-lg border border-slate-200 dark:border-[#1d283d] bg-white dark:bg-[#111827] px-3.5 text-sm outline-none transition-all duration-200 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10", className)} {...props} />;
}

export function Badge({ className, tone = "slate", ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: "slate" | "blue" | "emerald" | "amber" | "rose" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border transition-colors",
        tone === "slate" && "bg-slate-50 text-slate-700 border-slate-200/80 dark:bg-slate-900/50 dark:text-slate-350 dark:border-slate-800",
        tone === "blue" && "bg-blue-50 text-blue-750 border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60",
        tone === "emerald" && "bg-emerald-50 text-emerald-750 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60",
        tone === "amber" && "bg-amber-50/70 text-amber-800 border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60",
        tone === "rose" && "bg-rose-50 text-rose-750 border-rose-100 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60",
        className,
      )}
      {...props}
    />
  );
}

export function Progress({ value }: { value: number }) {
  return (
    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-250/30 dark:border-slate-800/30">
      <div className="h-2 rounded-full bg-[#3B5BDB] dark:bg-blue-500 transition-all duration-500 ease-out" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
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
