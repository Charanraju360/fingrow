import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "emerald"
    | "lime"
    | "accent"
    | "midnight"
    | "coral"
    | "tangerine"
    | "yellow"
    | "outline"
    | "success"
    | "warning"
    | "danger"
    | "info";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
}

export function Badge({
  className,
  variant = "emerald",
  size = "md",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variantStyles: Record<NonNullable<BadgeProps["variant"]>, string> = {
    emerald: "bg-fingrow-emerald/10 text-fingrow-emerald border border-fingrow-emerald/25",
    lime: "bg-fingrow-lime/25 text-[#244f00] border border-fingrow-lime/50 font-bold",
    accent: "bg-fingrow-lime/25 text-[#244f00] border border-fingrow-lime/50 font-bold",
    midnight: "bg-fingrow-midnight text-white border border-fingrow-midnight",
    coral: "bg-fingrow-coral/15 text-[#9E200C] border border-fingrow-coral/30 font-semibold",
    tangerine: "bg-fingrow-tangerine/15 text-[#8A3E00] border border-fingrow-tangerine/30 font-semibold",
    yellow: "bg-fingrow-yellow/25 text-[#704E00] border border-fingrow-yellow/40 font-semibold",
    outline: "bg-transparent text-fingrow-midnight border border-fingrow-midnight/25",
    // Semantic aliases
    success: "bg-fingrow-emerald/10 text-fingrow-emerald border border-fingrow-emerald/25",
    warning: "bg-fingrow-tangerine/15 text-[#8A3E00] border border-fingrow-tangerine/30 font-semibold",
    danger: "bg-fingrow-coral/15 text-[#9E200C] border border-fingrow-coral/30 font-semibold",
    info: "bg-fingrow-midnight/10 text-fingrow-midnight border border-fingrow-midnight/20 font-semibold",
  };

  const sizeStyles = {
    sm: "text-[11px] font-semibold px-2 py-0.5 rounded-full",
    md: "text-xs font-semibold px-2.5 py-1 rounded-full",
    lg: "text-sm font-semibold px-3 py-1.5 rounded-full",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 leading-none font-medium transition-colors select-none",
        variantStyles[variant] || variantStyles.emerald,
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-current shrink-0"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
