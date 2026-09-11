import "server-only";
import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { recordAuditLog } from "@/lib/audit";
import { isPast, isWithinNextDays } from "@/lib/dates";
import { hashPassword } from "@/modules/auth/password";
import { generateMemberCode } from "@/modules/members/member-id";
import { EXPIRING_SOON_DAYS, DEFAULT_PAGE_SIZE, DB_TRANSACTION_OPTIONS } from "@/config/constants";
import { Prisma } from "@/generated/prisma/client";
import type {
  CreateMemberInput,
  MemberListQuery,
  UpdateMemberInput,
} from "@/modules/members/validation";
import type { MemberListItem, MemberListResult, MemberStatus } from "@/modules/members/types";

const MAX_MEMBER_CODE_RETRIES = 3;

/**
 * Derives display status from stored fields rather than storing status
 * directly, so the definition of "expiring soon" can change (see
 * config/constants.ts) without a backfill migration.
 *
 * A member with no membershipEnd yet (created but never paid) is bucketed
 * as EXPIRED rather than a separate status - from the dashboard's
 * perspective, "needs a payment recorded" and "membership lapsed" are the
 * same action item.
 */
export function getMemberStatus(member: {
  active: boolean;
  membershipEnd: Date | null;
}): MemberStatus {
  if (!member.active) return "INACTIVE";
  if (!member.membershipEnd) return "EXPIRED";
  if (isPast(member.membershipEnd)) return "EXPIRED";
  if (isWithinNextDays(member.membershipEnd, EXPIRING_SOON_DAYS)) return "EXPIRING";
  return "ACTIVE";
}

function buildStatusFilter(
  status: MemberListQuery["status"],
  now: Date,
  expiringThreshold: Date,
): Prisma.MemberWhereInput | null {
  switch (status) {
    case "INACTIVE":
      return { active: false };
    case "EXPIRED":
      return { active: true, OR: [{ membershipEnd: null }, { membershipEnd: { lt: now } }] };
    case "EXPIRING":
      return { active: true, membershipEnd: { gte: now, lte: expiringThreshold } };
    case "ACTIVE":
      return { active: true, membershipEnd: { gt: expiringThreshold } };
    case "ALL":
    default:
      return null;
  }
}

/**
 * Paginated, searchable, tenant-scoped member list. Uses a `select`
 * projection (never the full row) because the member list is the one page
 * most likely to be rendered with hundreds of rows - see README's
 * performance section.
 */
export async function listMembers(
  gymId: string,
  query: MemberListQuery,
): Promise<MemberListResult> {
  const now = new Date();
  const expiringThreshold = new Date(now);
  expiringThreshold.setDate(expiringThreshold.getDate() + EXPIRING_SOON_DAYS);

  const filters: Prisma.MemberWhereInput[] = [{ gymId }];

  if (query.query) {
    filters.push({
      OR: [
        { name: { contains: query.query, mode: "insensitive" } },
        { phone: { contains: query.query } },
        { memberCode: { contains: query.query, mode: "insensitive" } },
      ],
    });
  }

  const statusFilter = buildStatusFilter(query.status, now, expiringThreshold);
  if (statusFilter) filters.push(statusFilter);

  const where: Prisma.MemberWhereInput = { AND: filters };
  const pageSize = DEFAULT_PAGE_SIZE;

  const [rows, total] = await Promise.all([
    db.member.findMany({
      where,
      select: {
        id: true,
        memberCode: true,
        name: true,
        phone: true,
        joinDate: true,
        membershipEnd: true,
        active: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * pageSize,
      take: pageSize,
    }),
    db.member.count({ where }),
  ]);

  const members: MemberListItem[] = rows.map((row) => ({
    ...row,
    status: getMemberStatus(row),
  }));

  return { members, total, page: query.page, pageSize };
}

/**
 * Fetches a single member scoped to gymId, with enough related data to
 * populate the admin member-detail page. Returns null - never throws -
 * when the member doesn't exist *or* belongs to another gym, so a caller
 * always renders the same 404 either way (see lib/errors.ts).
 */
export async function getMemberDetail(gymId: string, memberId: string) {
  return db.member.findFirst({
    where: { id: memberId, gymId },
    include: {
      payments: { orderBy: { paymentDate: "desc" }, take: 10 },
      weightLogs: { orderBy: { date: "desc" }, take: 10 },
      goal: true,
      workoutPlans: {
        where: { active: true },
        include: { days: { include: { exercises: true }, orderBy: { order: "asc" } } },
        take: 1,
      },
    },
  });
}

async function getOwnedMemberOrThrow(gymId: string, memberId: string) {
  const member = await db.member.findFirst({ where: { id: memberId, gymId } });
  if (!member) throw new NotFoundError("Member");
  return member;
}

export async function createMember(
  gymId: string,
  input: CreateMemberInput,
  actorAdminId: string,
) {
  const passwordHash = await hashPassword(input.password);
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_MEMBER_CODE_RETRIES; attempt += 1) {
    try {
      const member = await db.$transaction(async (tx) => {
        const memberCode = await generateMemberCode(tx, gymId);
        return tx.member.create({
          data: {
            gymId,
            memberCode,
            name: input.name,
            phone: input.phone,
            email: input.email,
            passwordHash,
            gender: input.gender,
            dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
            heightCm: input.heightCm,
            emergencyContactName: input.emergencyContactName,
            emergencyContactPhone: input.emergencyContactPhone,
          },
        });
      }, DB_TRANSACTION_OPTIONS);

      await recordAuditLog({
        gymId,
        actorType: "ADMIN",
        actorId: actorAdminId,
        action: "MEMBER_CREATED",
        entityType: "Member",
        entityId: member.id,
      });

      return member;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const target = Array.isArray(error.meta?.target) ? (error.meta.target as string[]) : [];
        if (target.includes("memberCode")) {
          // Two concurrent creates raced for the same next number - retry
          // with a freshly recomputed one.
          lastError = error;
          continue;
        }
        if (target.includes("phone")) {
          throw new Error("A member with this phone number already exists.");
        }
      }
      throw error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Failed to create member");
}

export async function updateMember(
  gymId: string,
  memberId: string,
  input: UpdateMemberInput,
  actorAdminId: string,
) {
  await getOwnedMemberOrThrow(gymId, memberId);

  const updated = await db.member.update({
    where: { id: memberId },
    data: {
      name: input.name,
      phone: input.phone,
      email: input.email,
      gender: input.gender,
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
      heightCm: input.heightCm,
      emergencyContactName: input.emergencyContactName,
      emergencyContactPhone: input.emergencyContactPhone,
    },
  });

  await recordAuditLog({
    gymId,
    actorType: "ADMIN",
    actorId: actorAdminId,
    action: "MEMBER_UPDATED",
    entityType: "Member",
    entityId: memberId,
  });

  return updated;
}

export async function setMemberActive(
  gymId: string,
  memberId: string,
  active: boolean,
  actorAdminId: string,
) {
  await getOwnedMemberOrThrow(gymId, memberId);

  const updated = await db.member.update({ where: { id: memberId }, data: { active } });

  await recordAuditLog({
    gymId,
    actorType: "ADMIN",
    actorId: actorAdminId,
    action: active ? "MEMBER_REACTIVATED" : "MEMBER_DEACTIVATED",
    entityType: "Member",
    entityId: memberId,
  });

  return updated;
}
