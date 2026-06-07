import { type ButtonHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes, type SelectHTMLAttributes } from "react";
import { cn } from "../utils/utils";

export function Button({ className, variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "ghost" | "danger" }) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-xs font-sans font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.99]",
        variant === "primary" && "bg-[#4C43CD] hover:bg-[#3930B8] text-white border border-[#4C43CD] dark:bg-[#1F150C] dark:hover:bg-[#2B1E10] dark:text-white dark:border-[#412D15]",
        variant === "outline" && "border border-[rgba(0,0,0,0.08)] bg-[#FBFAF2] text-[#111111] hover:border-[rgba(76,67,205,0.28)] hover:text-[#4C43CD] dark:border-[rgba(225,220,201,0.08)] dark:bg-transparent dark:text-[#E1DCC9] dark:hover:bg-[#1A1A1A] dark:hover:text-white",
        variant === "ghost" && "text-[#5A5A5A] hover:bg-[#F1EEDD] hover:text-[#111111] dark:text-[rgba(225,220,201,0.75)] dark:hover:bg-[#111111] dark:hover:text-white",
        variant === "danger" && "bg-[rgba(201,74,74,0.12)] border border-[rgba(201,74,74,0.2)] text-[#C94A4A] hover:bg-[rgba(201,74,74,0.2)]",
        className,
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        "rounded-xl border border-[rgba(0,0,0,0.08)] bg-[#FBFAF2] text-[#111111] transition-colors duration-200 hover:border-[rgba(76,67,205,0.22)] dark:border-[rgba(225,220,201,0.06)] dark:bg-[#111111] dark:text-[#E1DCC9] dark:hover:bg-[#1A1A1A] dark:hover:border-[rgba(225,220,201,0.15)]", 
        className
      )} 
      {...props} 
    />
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("h-10 w-full rounded-xl border border-[rgba(0,0,0,0.08)] bg-[#FBFAF2] px-3.5 text-sm text-[#111111] outline-none transition-all duration-200 placeholder:text-[#8B8B8B] focus:border-[#4C43CD] focus:ring-4 focus:ring-[#4C43CD]/10 dark:border-[rgba(225,220,201,0.08)] dark:bg-[#111111] dark:text-white dark:placeholder:text-[rgba(225,220,201,0.3)] dark:focus:border-[#412D15] dark:focus:ring-[#412D15]/20", className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("h-10 w-full rounded-xl border border-[rgba(0,0,0,0.08)] bg-[#FBFAF2] px-3.5 text-sm text-[#111111] outline-none transition-all duration-200 focus:border-[#4C43CD] focus:ring-4 focus:ring-[#4C43CD]/10 dark:border-[rgba(225,220,201,0.08)] dark:bg-[#111111] dark:text-white dark:focus:border-[#412D15] dark:focus:ring-[#412D15]/20", className)} {...props} />;
}

export function Badge({ className, tone = "slate", ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: "slate" | "blue" | "emerald" | "amber" | "rose" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-sans font-semibold border transition-colors",
        tone === "slate" && "bg-[#F1EEDD] text-[#5A5A5A] border-[rgba(0,0,0,0.08)] dark:bg-[rgba(225,220,201,0.05)] dark:text-[rgba(225,220,201,0.85)] dark:border-[rgba(225,220,201,0.08)]",
        tone === "blue" && "bg-[rgba(76,67,205,0.10)] text-[#4C43CD] border-[rgba(76,67,205,0.16)] dark:bg-[rgba(108,142,255,0.12)] dark:text-[#6C8EFF] dark:border-[rgba(108,142,255,0.15)]",
        tone === "emerald" && "bg-[rgba(76,175,80,0.12)] text-[#4CAF50] border-[rgba(76,175,80,0.15)]",
        tone === "amber" && "bg-[rgba(212,160,23,0.12)] text-[#D4A017] border-[rgba(212,160,23,0.15)]",
        tone === "rose" && "bg-[rgba(201,74,74,0.12)] text-[#C94A4A] border-[rgba(201,74,74,0.15)]",
        className,
      )}
      {...props}
    />
  );
}

export function Progress({ value }: { value: number }) {
  return (
    <div className="h-2 rounded-full bg-[#E8E4CF] overflow-hidden border border-[rgba(0,0,0,0.05)] dark:bg-[#1A1A1A] dark:border-[rgba(225,220,201,0.04)]">
      <div className="h-2 rounded-full bg-[#4C43CD] transition-all duration-500 ease-out dark:bg-[#E1DCC9]" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function Separator({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-[rgba(0,0,0,0.08)] dark:bg-[rgba(225,220,201,0.08)]", className)} />;
}

export function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <label className="grid gap-1.5 text-xs font-sans font-semibold text-[#5A5A5A] dark:text-[rgba(225,220,201,0.7)]">
      <span>{label}</span>
      {children}
      {error && <span className="text-xs text-[#C94A4A]">{error}</span>}
    </label>
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("w-full rounded-xl border border-[rgba(0,0,0,0.08)] bg-[#FBFAF2] px-3.5 py-2.5 text-sm text-[#111111] outline-none transition-all duration-200 placeholder:text-[#8B8B8B] focus:border-[#4C43CD] focus:ring-4 focus:ring-[#4C43CD]/10 resize-none dark:border-[rgba(225,220,201,0.08)] dark:bg-[#111111] dark:text-white dark:placeholder:text-[rgba(225,220,201,0.3)] dark:focus:border-[#412D15] dark:focus:ring-[#412D15]/20", className)} {...props} />;
}
