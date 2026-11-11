import { NextResponse, type NextRequest } from "next/server";
import { MEMBER_COOKIE } from "@/modules/auth/jwt";

/**
 * Where a member lands when their session can no longer be used (the account
 * was switched off or removed). Server Components cannot delete cookies, so
 * the sign-out has to happen here, in a Route Handler, before the redirect to
 * the login page. See requireMemberSession in modules/auth/guards.ts.
 *
 * Only `suspended` is distinguished from everything else, and the destination
 * is fixed, so this cannot be used as an open redirect.
 */
export function GET(request: NextRequest) {
  const reason = request.nextUrl.searchParams.get("reason") === "suspended" ? "suspended" : "ended";
  const response = NextResponse.redirect(new URL(`/member/login?notice=${reason}`, request.url));
  response.cookies.delete(MEMBER_COOKIE);
  return response;
}
