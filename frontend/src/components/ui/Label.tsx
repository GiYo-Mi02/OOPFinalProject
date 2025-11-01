import type { LabelHTMLAttributes } from "react";
import { clsx } from "clsx";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: LabelProps) {
  return <label className={clsx("text-sm font-medium text-gray-900 dark:text-slate-200", className)} {...props} />;
}
