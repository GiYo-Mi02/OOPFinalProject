import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";
import type { UserRole } from "../models/User";

export interface AuthClaims {
  sub: string;
  email: string;
  role: UserRole;
  instituteId?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthClaims;
      user?: { id: string; email: string; role: UserRole; instituteId?: string | null };
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization");

  if (!header || typeof header !== "string" || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token missing" });
  }

  const token = header.slice("Bearer ".length).trim();

  try {
  const decoded = jwt.verify(token, env.APP_JWT_SECRET) as JwtPayload & AuthClaims;
    const claims: AuthClaims = {
      sub: String(decoded.sub ?? decoded.id ?? ""),
      email: String(decoded.email ?? ""),
      role: (decoded.role as UserRole) ?? "student",
      instituteId: (decoded.instituteId as string | null | undefined) ?? null,
    };

    if (!claims.sub || !claims.email) {
      return res.status(401).json({ message: "Invalid authorization token" });
    }

    (req as Request & { auth?: AuthClaims }).auth = claims;
    req.user = {
      id: claims.sub,
      email: claims.email,
      role: claims.role,
      instituteId: claims.instituteId,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
