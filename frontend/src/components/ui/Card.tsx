import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/50 transition-shadow hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/60 dark:shadow-primary-500/5 dark:hover:shadow-primary-500/10",
        className,
      )}
      {...props}
    />
  );
}
