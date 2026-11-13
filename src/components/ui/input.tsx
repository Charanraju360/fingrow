import React, { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, type = "text", required, disabled, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    const describedBy = error ? errorId : hint ? hintId : undefined;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-fingrow-midnight select-none"
          >
            {label}
            {required && <span className="ml-1 text-[#C5301A]" aria-hidden="true">*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          type={type}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "w-full min-h-[44px] h-11 px-4 py-2.5 rounded-xl border border-fingrow-midnight/20 bg-white text-fingrow-midnight text-base sm:text-sm placeholder:text-fingrow-midnight/40 transition-colors focus:outline-none focus:ring-2 focus:ring-fingrow-emerald focus:ring-offset-2 focus:ring-offset-fingrow-ivory focus:border-transparent disabled:opacity-50 disabled:bg-fingrow-midnight/5 disabled:cursor-not-allowed",
            error && "border-[#C5301A] text-fingrow-midnight focus:ring-[#C5301A]",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p id={hintId} className="text-xs text-fingrow-midnight/70">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" aria-live="polite" className="text-xs font-semibold text-[#9E200C]">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
