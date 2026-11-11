import type {
  MemberStatusFilter,
  MembershipAction,
  MembershipState,
} from "@/modules/membership/state";

/**
 * Where a member stands. Defined, derived and worded in
 * modules/membership/state.ts - this alias is only kept so list code can say
 * "status".
 */
export type MemberStatus = MembershipState;
export type { MemberStatusFilter };

export interface MemberListItem {
  id: string;
  memberCode: string;
  name: string;
  phone: string;
  joinDate: Date;
  membershipEnd: Date | null;
  active: boolean;
  status: MemberStatus;
  /** Gym calendar days to the last paid day; negative once passed, null if never paid. */
  daysLeft: number | null;
  nextAction: MembershipAction;
}

export interface MemberListResult {
  members: MemberListItem[];
  total: number;
  page: number;
  pageSize: number;
}
