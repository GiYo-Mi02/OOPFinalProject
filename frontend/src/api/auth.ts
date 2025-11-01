import { http } from "../lib/http";
import type { AuthUser } from "../types/auth";

interface RequestOtpResponse {
  message: string;
  meta: {
    success: boolean;
    message: string;
    email: string;
    expiresIn: number;
    otp?: string;
  };
}

export async function requestOtp(email: string) {
  return http<RequestOtpResponse>("/auth/otp", {
    method: "POST",
    body: JSON.stringify({ email }),
    includeAuth: false,
  });
}

interface VerifyOtpResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export async function verifyOtp(email: string, otp: string) {
  return http<VerifyOtpResponse>("/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
    includeAuth: false,
  });
}
