import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.string().default("4000"),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  REDIS_URL: z.string().optional(),
  APP_JWT_SECRET: z.string().min(16, "APP_JWT_SECRET must be at least 16 characters"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
  throw new Error("Unable to start server due to invalid environment variables.");
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
