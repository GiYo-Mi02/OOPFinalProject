"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const crypto_1 = require("crypto");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const supabaseClient_1 = require("../config/supabaseClient");
const User_1 = require("../models/User");
const RedisCache_1 = require("./RedisCache");
const EmailService_1 = require("../utils/EmailService");
const OTP_TTL_SECONDS = 5 * 60;
const OTP_NAMESPACE = "otp";
const USERS_TABLE = "users";
class AuthService {
    constructor() {
        this.cache = new RedisCache_1.RedisCache(OTP_NAMESPACE);
        this.emailService = new EmailService_1.EmailService();
    }
    async requestOtp(email) {
        if (!email.endsWith("@umak.edu.ph")) {
            throw new Error("Only institutional accounts are allowed.");
        }
        const otp = AuthService.generateOtp();
        try {
            // Send OTP via email first
            const emailResult = await this.emailService.sendOTP(email, otp, OTP_TTL_SECONDS);
            if (!emailResult.success) {
                throw new Error("Failed to send OTP email");
            }
            // Only store in Redis after successful email send
            await this.cache.set(email, otp, OTP_TTL_SECONDS);
            return {
                success: true,
                message: "OTP sent to your email address",
                email,
                expiresIn: OTP_TTL_SECONDS
            };
        }
        catch (error) {
            console.error("Failed to send OTP:", error);
            throw new Error("Failed to send OTP email. Please try again.");
        }
    }
    async verifyOtp(email, otp) {
        const cached = await this.cache.get(email);
        if (!cached || cached !== otp) {
            throw new Error("Invalid or expired OTP.");
        }
        await this.cache.delete(email);
        const client = supabaseClient_1.supabase ?? this.bootstrapSupabase();
        const profile = await this.upsertUserProfile(client, email);
        const user = this.toDomainUser(profile);
        const token = this.signToken(user);
        return { token, user };
    }
    bootstrapSupabase() {
        if (!env_1.env.SUPABASE_URL || !env_1.env.SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error("Supabase credentials are missing.");
        }
        return (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_SERVICE_ROLE_KEY, {
            auth: {
                persistSession: false,
            },
        });
    }
    static generateOtp() {
        return String((0, crypto_1.randomInt)(100000, 999999));
    }
    async upsertUserProfile(client, email) {
        const { data, error } = await client
            .from(USERS_TABLE)
            .select("id, email, institute_id, role, name")
            .eq("email", email)
            .maybeSingle();
        if (error) {
            throw error;
        }
        if (data) {
            return data;
        }
        const { data: inserted, error: insertError } = await client
            .from(USERS_TABLE)
            .insert({
            email,
            role: "student",
        })
            .select("id, email, institute_id, role, name")
            .single();
        if (insertError) {
            throw insertError;
        }
        return inserted;
    }
    toDomainUser(row) {
        const role = this.normaliseRole(row.role);
        const name = row.name ?? row.email.split("@")[0];
        return new User_1.User(row.id, name, row.email, row.institute_id ?? null, role);
    }
    normaliseRole(role) {
        return role === "admin" ? "admin" : "student";
    }
    signToken(user) {
        return jsonwebtoken_1.default.sign({
            sub: user.id,
            email: user.email,
            role: user.role,
            instituteId: user.instituteId,
        }, env_1.env.APP_JWT_SECRET, {
            expiresIn: "12h",
            issuer: "umak-eballot",
        });
    }
}
exports.AuthService = AuthService;
