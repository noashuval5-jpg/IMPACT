import { randomBytes } from "node:crypto";

/** 32 random bytes → 43-char URL-safe token. Server-side only. */
export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Cheap shape check before hitting the database. */
export function looksLikeToken(value: string): boolean {
  return /^[A-Za-z0-9_-]{32,128}$/.test(value);
}
