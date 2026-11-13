import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to max
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "emerald" | "lime" | "coral" | "tangerine" | "midnight";
  indicatorClassName?: string;
  label?: string;
}

export function Progress({
  value,
  max = 100,
  size = "md",
  variant = "default",
  className,
  indicatorClassName,
  label,
  ...props
}: ProgressProps) {
  const safeMax = max > 0 ? max : 100;
  const safeValue = Math.max(0, isNaN(value) ? 0 : value);
  const percentage = Math.min(100, Math.max(0, (safeValue / safeMax) * 100));

  const sizeStyles = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  const variantStyles = {
    default: "bg-gradient-to-r from-fingrow-emerald to-fingrow-lime",
    emerald: "bg-gradient-to-r from-fingrow-emerald to-fingrow-darkEmerald",
    lime: "bg-fingrow-lime",
    coral: "bg-gradient-to-r from-[#C5301A] to-fingrow-coral",
    tangerine: "bg-gradient-to-r from-[#D96B00] to-fingrow-tangerine",
    midnight: "bg-fingrow-midnight",
  };

  return (
    <div className="w-full space-y-1">
      {label && (
        <div className="flex justify-between items-center text-xs font-semibold text-fingrow-midnight">
          <span>{label}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={safeValue}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuetext={`${Math.round(percentage)}%`}
        aria-label={label || props["aria-label"] || "Progress"}
        className={cn(
          "w-full overflow-hidden rounded-full bg-fingrow-midnight/10 border border-fingrow-midnight/5",
          sizeStyles[size],
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-full motion-reduce:transition-none",
            variantStyles[variant],
            indicatorClassName
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
