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
