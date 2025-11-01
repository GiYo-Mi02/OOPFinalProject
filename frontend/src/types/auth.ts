export type UserRole = "student" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  instituteId?: string | null;
}
