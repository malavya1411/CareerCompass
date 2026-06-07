import { type ButtonHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes, type SelectHTMLAttributes } from "react";
import { cn } from "../utils/utils";

export function Button({ className, variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "ghost" | "danger" }) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-xs font-heading font-extrabold transition-all duration-250 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]",
        variant === "primary" && "bg-[#1F150C] hover:bg-[#2B1E10] text-[#FFFFFF] border border-[#412D15] shadow-sm hover:shadow-md",
        variant === "outline" && "border border-[rgba(225,220,201,0.08)] bg-transparent text-[#E1DCC9] hover:bg-[#1A1A1A] hover:text-[#FFFFFF]",
        variant === "ghost" && "text-[rgba(225,220,201,0.75)] hover:bg-[#111111] hover:text-[#FFFFFF]",
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
        "rounded-2xl border border-[rgba(225,220,201,0.06)] bg-[#111111] text-[#E1DCC9] shadow-[0px_12px_32px_rgba(0,0,0,0.35)] transition-colors duration-200 hover:bg-[#1A1A1A]", 
        className
      )} 
      {...props} 
    />
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("h-10 w-full rounded-xl border border-[rgba(225,220,201,0.08)] bg-[#111111] px-3.5 text-sm outline-none transition-all duration-200 placeholder:[rgba(225,220,201,0.3)] text-[#FFFFFF] focus:border-[#412D15] focus:ring-4 focus:ring-[#412D15]/20", className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("h-10 w-full rounded-xl border border-[rgba(225,220,201,0.08)] bg-[#111111] px-3.5 text-sm outline-none transition-all duration-200 text-[#FFFFFF] focus:border-[#412D15] focus:ring-4 focus:ring-[#412D15]/20", className)} {...props} />;
}

export function Badge({ className, tone = "slate", ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: "slate" | "blue" | "emerald" | "amber" | "rose" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-sans font-bold border transition-colors",
        tone === "slate" && "bg-[rgba(225,220,201,0.05)] text-[rgba(225,220,201,0.85)] border-[rgba(225,220,201,0.08)]",
        tone === "blue" && "bg-[rgba(108,142,255,0.12)] text-[#6C8EFF] border-[rgba(108,142,255,0.15)]",
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
    <div className="h-2 rounded-full bg-[#1A1A1A] overflow-hidden border border-[rgba(225,220,201,0.04)]">
      <div className="h-2 rounded-full bg-[#E1DCC9] transition-all duration-500 ease-out" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function Separator({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-[rgba(225,220,201,0.08)]", className)} />;
}

export function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <label className="grid gap-1.5 text-xs font-sans font-bold text-[rgba(225,220,201,0.7)]">
      <span>{label}</span>
      {children}
      {error && <span className="text-xs text-[#C94A4A]">{error}</span>}
    </label>
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("w-full rounded-xl border border-[rgba(225,220,201,0.08)] bg-[#111111] px-3.5 py-2.5 text-sm outline-none transition-all duration-200 text-[#FFFFFF] placeholder:[rgba(225,220,201,0.3)] focus:border-[#412D15] focus:ring-4 focus:ring-[#412D15]/20 resize-none", className)} {...props} />;
}
