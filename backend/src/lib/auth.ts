import { randomBytes, createHash } from "node:crypto";
import bcrypt from "bcryptjs";

const BCRYPT_COST = 12;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export const SESSION_COOKIE_NAME = "session_token";

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

export function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function sessionExpiryDate(): Date {
  return new Date(Date.now() + SESSION_TTL_MS);
}

const isProduction = process.env.NODE_ENV === "production";

export const sessionCookieOptions = {
  httpOnly: true,
  // Frontend and backend are served from the same Vercel project/origin, so
  // the session cookie is same-site in every environment.
  sameSite: "lax" as const,
  secure: isProduction,
  path: "/",
  maxAge: SESSION_TTL_MS,
};
