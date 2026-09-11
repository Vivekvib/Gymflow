import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_COOKIE,
  MEMBER_COOKIE,
  verifySessionToken,
} from "@/modules/auth/jwt";
import type { AdminSessionPayload, MemberSessionPayload } from "@/modules/auth/types";

/**
 * First line of defense for /admin/* and /member/* - runs before any page
 * or layout renders, so an unauthenticated request never even reaches a
 * Server Component that queries the database. Page-level guards in
 * modules/auth/guards.ts are a second, independent layer (see the comment
 * there for why both exist).
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLoginPage = pathname === "/admin/login";
  const isMemberRoute = pathname.startsWith("/member");
  const isMemberLoginPage = pathname === "/member/login";

  if (isAdminRoute) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    const session = await verifySessionToken<AdminSessionPayload>(token);

    if (isAdminLoginPage) {
      // Already logged in - skip the login form.
      if (session) return NextResponse.redirect(new URL("/admin", request.url));
      return NextResponse.next();
    }

    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  if (isMemberRoute) {
    const token = request.cookies.get(MEMBER_COOKIE)?.value;
    const session = await verifySessionToken<MemberSessionPayload>(token);

    if (isMemberLoginPage) {
      if (session) return NextResponse.redirect(new URL("/member", request.url));
      return NextResponse.next();
    }

    if (!session) {
      return NextResponse.redirect(new URL("/member/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/member/:path*"],
};
