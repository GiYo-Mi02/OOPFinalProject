import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import { requestOtp as requestOtpApi, verifyOtp as verifyOtpApi } from "../api/auth";
import type { AuthUser } from "../types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  pendingEmail: string | null;
  requestOtp: (email: string) => Promise<{ email: string; expiresIn: number; otp?: string }>;
  verifyOtp: (otp: string) => Promise<AuthUser>;
  logout: () => void;
  clearPending: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USER_STORAGE_KEY = "umak-eballot:user";
const TOKEN_STORAGE_KEY = "umak-eballot:token";
const PENDING_EMAIL_KEY = "umak-eballot:pending-email";

function safeParseUser(serialized: string | null): AuthUser | null {
  if (!serialized) return null;
  try {
    return JSON.parse(serialized) as AuthUser;
  } catch (error) {
    console.warn("Failed to parse stored auth user", error);
    return null;
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(() => safeParseUser(localStorage.getItem(USER_STORAGE_KEY)));
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [pendingEmail, setPendingEmail] = useState<string | null>(() => localStorage.getItem(PENDING_EMAIL_KEY));

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (pendingEmail) {
      localStorage.setItem(PENDING_EMAIL_KEY, pendingEmail);
    } else {
      localStorage.removeItem(PENDING_EMAIL_KEY);
    }
  }, [pendingEmail]);

  const requestOtp = useCallback(async (email: string) => {
    const response = await requestOtpApi(email);
    setPendingEmail(response.meta.email);
    return response.meta;
  }, []);

  const verifyOtp = useCallback(
    async (otp: string) => {
      if (!pendingEmail) {
        throw new Error("No pending OTP request. Please request a new code.");
      }

      const response = await verifyOtpApi(pendingEmail, otp);
      setUser(response.user);
      setToken(response.token);
      setPendingEmail(null);
      return response.user;
    },
    [pendingEmail],
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setPendingEmail(null);
  }, []);

  const clearPending = useCallback(() => setPendingEmail(null), []);

  const refreshUser = useCallback(async () => {
    // Refresh user data from stored user (will be updated after API call)
    const storedUser = safeParseUser(localStorage.getItem(USER_STORAGE_KEY));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, pendingEmail, requestOtp, verifyOtp, logout, clearPending, refreshUser }),
    [user, token, pendingEmail, requestOtp, verifyOtp, logout, clearPending, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
