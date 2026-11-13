import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost" | "danger" | "tangerine";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      children,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-fingrow-ivory disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none";

    const variantStyles = {
      primary:
        "bg-fingrow-emerald hover:bg-fingrow-darkEmerald text-white shadow-sm focus-visible:ring-fingrow-emerald",
      secondary:
        "bg-fingrow-midnight hover:bg-black text-white shadow-sm focus-visible:ring-fingrow-midnight",
      accent:
        "bg-fingrow-lime hover:bg-[#6ec900] text-fingrow-midnight font-bold shadow-sm focus-visible:ring-fingrow-darkEmerald",
      outline:
        "border-2 border-fingrow-emerald text-fingrow-emerald hover:bg-fingrow-emerald/10 hover:text-fingrow-darkEmerald focus-visible:ring-fingrow-emerald",
      ghost:
        "text-fingrow-midnight hover:bg-fingrow-midnight/10 focus-visible:ring-fingrow-emerald",
      danger:
        "bg-[#C5301A] hover:bg-[#A82410] text-white shadow-sm focus-visible:ring-[#C5301A]",
      tangerine:
        "bg-fingrow-tangerine hover:bg-[#E68A00] text-fingrow-midnight font-bold shadow-sm focus-visible:ring-fingrow-midnight",
    };

    const sizeStyles = {
      sm: "min-h-[36px] text-xs px-3.5 py-1.5 gap-1.5",
      md: "min-h-[44px] text-sm px-4 py-2.5 gap-2",
      lg: "min-h-[48px] text-base px-6 py-3.5 gap-2.5",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading ? true : undefined}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            <span>Loading...</span>
            <span className="sr-only">Processing request</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
