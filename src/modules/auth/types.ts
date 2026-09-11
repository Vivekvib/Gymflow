/**
 * Shape of the JWT payload stored in the admin session cookie. Kept
 * intentionally small - anything else needed (e.g. name) is fetched fresh
 * from the database, so a stale claim can never grant stale access.
 */
export interface AdminSessionPayload {
  role: "ADMIN";
  adminId: string;
  gymId: string;
}

export interface MemberSessionPayload {
  role: "MEMBER";
  memberId: string;
  gymId: string;
}

export type SessionPayload = AdminSessionPayload | MemberSessionPayload;
