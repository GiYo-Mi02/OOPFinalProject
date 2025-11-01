import { HttpError } from "../lib/http";

export function getErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (!error) return fallback;
  if (error instanceof HttpError) return error.message;
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return fallback;
}
