import "server-only";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  MEMBER_COOKIE,
  sessionCookieOptions,
  signSessionToken,
  verifySessionToken,
} from "@/modules/auth/jwt";
import type { AdminSessionPayload, MemberSessionPayload } from "@/modules/auth/types";

/**
 * Node-runtime session helpers for Server Components, Server Actions, and
 * Route Handlers - the only places `next/headers`' `cookies()` is valid.
 * middleware.ts cannot use this file (see modules/auth/jwt.ts instead).
 */

// --- Admin ---------------------------------------------------------------

export async function createAdminSession(payload: AdminSessionPayload): Promise<void> {
  const token = await signSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, sessionCookieOptions());
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  return verifySessionToken<AdminSessionPayload>(cookieStore.get(ADMIN_COOKIE)?.value);
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

// --- Member ----------------------------------------------------------------

export async function createMemberSession(payload: MemberSessionPayload): Promise<void> {
  const token = await signSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(MEMBER_COOKIE, token, sessionCookieOptions());
}

export async function getMemberSession(): Promise<MemberSessionPayload | null> {
  const cookieStore = await cookies();
  return verifySessionToken<MemberSessionPayload>(cookieStore.get(MEMBER_COOKIE)?.value);
}

export async function clearMemberSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(MEMBER_COOKIE);
}
