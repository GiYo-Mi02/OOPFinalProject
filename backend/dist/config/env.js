"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProd = exports.env = void 0;
const dotenv_1 = require("dotenv");
const zod_1 = require("zod");
(0, dotenv_1.config)();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.string().default("development"),
    PORT: zod_1.z.string().default("4000"),
    SUPABASE_URL: zod_1.z.string().url().optional(),
    SUPABASE_ANON_KEY: zod_1.z.string().optional(),
    SUPABASE_SERVICE_ROLE_KEY: zod_1.z.string().optional(),
    REDIS_URL: zod_1.z.string().optional(),
    APP_JWT_SECRET: zod_1.z.string().min(16, "APP_JWT_SECRET must be at least 16 characters"),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
    throw new Error("Unable to start server due to invalid environment variables.");
}
exports.env = parsed.data;
exports.isProd = exports.env.NODE_ENV === "production";
