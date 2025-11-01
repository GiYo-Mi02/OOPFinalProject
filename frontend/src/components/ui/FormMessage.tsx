import type { HTMLAttributes } from "react";
import { clsx } from "clsx";

interface FormMessageProps extends HTMLAttributes<HTMLParagraphElement> {
  intent?: "error" | "success" | "muted";
}

export function FormMessage({ className, intent = "muted", ...props }: FormMessageProps) {
  const intentClass = {
    error: "text-rose-600 dark:text-rose-400",
    success: "text-emerald-600 dark:text-emerald-400",
    muted: "text-gray-600 dark:text-slate-400",
  }[intent];

  return <p className={clsx("text-sm", intentClass, className)} {...props} />;
}
