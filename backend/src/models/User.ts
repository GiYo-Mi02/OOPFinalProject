export type UserRole = "student" | "admin";

export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly instituteId: string | null,
    public readonly role: UserRole,
  ) {}
}
