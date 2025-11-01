import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomInt } from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { supabase } from "../config/supabaseClient";
import { User } from "../models/User";
import type { UserRole } from "../models/User";
import { RedisCache } from "./RedisCache";
import { EmailService } from "../utils/EmailService";

const OTP_TTL_SECONDS = 5 * 60;
const OTP_NAMESPACE = "otp";
const USERS_TABLE = "users";

export class AuthService {
  private readonly cache = new RedisCache<string>(OTP_NAMESPACE);
  private readonly emailService = new EmailService();

  async requestOtp(email: string) {
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
    } catch (error) {
      console.error("Failed to send OTP:", error);
      throw new Error("Failed to send OTP email. Please try again.");
    }
  }

  async verifyOtp(email: string, otp: string) {
    const cached = await this.cache.get(email);
    if (!cached || cached !== otp) {
      throw new Error("Invalid or expired OTP.");
    }

    await this.cache.delete(email);
    const client = supabase ?? this.bootstrapSupabase();
    const profile = await this.upsertUserProfile(client, email);
    const user = this.toDomainUser(profile);
    const token = this.signToken(user);

    return { token, user };
  }

  private bootstrapSupabase() {
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials are missing.");
    }

    return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
      },
    });
  }

  private static generateOtp() {
    return String(randomInt(100000, 999999));
  }

  private async upsertUserProfile(client: SupabaseClient, email: string) {
    const { data, error } = await client
      .from(USERS_TABLE)
      .select("id, email, institute_id, role, name")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      return data as UserRow;
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

    return inserted as UserRow;
  }

  private toDomainUser(row: UserRow) {
    const role = this.normaliseRole(row.role);
    const name = row.name ?? row.email.split("@")[0];
    return new User(row.id, name, row.email, row.institute_id ?? null, role);
  }

  private normaliseRole(role: string | null): UserRole {
    return role === "admin" ? "admin" : "student";
  }

  private signToken(user: User) {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        instituteId: user.instituteId,
      },
      env.APP_JWT_SECRET,
      {
        expiresIn: "12h",
        issuer: "umak-eballot",
      },
    );
  }
}

interface UserRow {
  id: string;
  email: string;
  institute_id: string | null;
  role: string | null;
  name?: string | null;
}
