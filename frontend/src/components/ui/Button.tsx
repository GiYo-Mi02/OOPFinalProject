import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => {
    const baseClasses =
      "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 dark:focus-visible:ring-offset-slate-900";

    const variantClasses = {
      primary:
        "border border-transparent bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30 hover:from-primary-500 hover:to-primary-400 hover:shadow-xl hover:shadow-primary-500/40 dark:from-primary-500 dark:to-primary-600 dark:hover:from-primary-400 dark:hover:to-primary-500",
      secondary:
        "border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:border-slate-600",
      ghost:
        "text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800",
    } as const;

    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2.5 text-sm",
      lg: "px-6 py-3 text-base",
    } as const;

    return (
      <button
        ref={ref}
        type={type}
        className={clsx(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
