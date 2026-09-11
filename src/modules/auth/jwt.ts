import { SignJWT, jwtVerify } from "jose";
import { env } from "@/lib/env";
import type { AdminSessionPayload, MemberSessionPayload } from "@/modules/auth/types";

/**
 * Deliberately has no dependency on `next/headers` (Node-only, request-scoped)
 * so that middleware.ts - which runs in the Edge runtime and only has
 * NextRequest's plain `.cookies` map - can verify a session token the exact
 * same way session.ts does for Server Components/Actions. One
 * implementation of "is this token valid", used from both places.
 */

export const ADMIN_COOKIE = "gymflow_admin_session";
export const MEMBER_COOKIE = "gymflow_member_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

const secretKey = new TextEncoder().encode(env.SESSION_SECRET);

export async function signSessionToken(
  payload: AdminSessionPayload | MemberSessionPayload,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secretKey);
}

export async function verifySessionToken<T>(
  token: string | undefined | null,
): Promise<T | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as T;
  } catch {
    // Expired, tampered, or signed with a rotated secret - treat as logged out.
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  };
}
