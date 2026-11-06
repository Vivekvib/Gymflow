export type MemberStatus = "ACTIVE" | "EXPIRING" | "EXPIRED" | "INACTIVE";

export interface MemberListItem {
  id: string;
  memberCode: string;
  name: string;
  phone: string;
  joinDate: Date;
  membershipEnd: Date | null;
  active: boolean;
  status: MemberStatus;
}

export interface MemberListResult {
  members: MemberListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export type MemberStatusFilter = "ALL" | MemberStatus;

export const MEMBER_STATUS_LABEL: Record<MemberStatus, string> = {
  ACTIVE: "Active",
  EXPIRING: "Expiring soon",
  EXPIRED: "Expired",
  INACTIVE: "Inactive",
};

export const MEMBER_STATUS_TONE: Record<MemberStatus, "success" | "warning" | "danger" | "neutral"> = {
  ACTIVE: "success",
  EXPIRING: "warning",
  EXPIRED: "danger",
  INACTIVE: "neutral",
};

/**
 * How a status should read on screen. A member who has joined but never paid
 * has no membership to be "expired" from, so they get their own label instead
 * of a red "Expired" - the underlying status (and the status filters) are unchanged.
 */
export function getMemberStatusDisplay(status: MemberStatus, membershipEnd: Date | null) {
  if (status === "EXPIRED" && membershipEnd === null) {
    return { label: "No plan yet", tone: "neutral" as const };
  }
  return { label: MEMBER_STATUS_LABEL[status], tone: MEMBER_STATUS_TONE[status] };
}
