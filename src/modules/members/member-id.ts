import type { Prisma } from "@/generated/prisma/client";

/**
 * Generates the next member-facing ID for a gym, e.g. "GYM-0007". Takes a
 * transaction client so the count-and-create in
 * modules/members/service.ts#createMember happens atomically; the caller
 * still retries on a unique-constraint violation (P2002) to cover the rare
 * case of two signups racing for the same number.
 */
export async function generateMemberCode(
  tx: Prisma.TransactionClient,
  gymId: string,
  prefix = "GYM",
): Promise<string> {
  const memberCount = await tx.member.count({ where: { gymId } });
  const nextNumber = memberCount + 1;
  return `${prefix}-${String(nextNumber).padStart(4, "0")}`;
}
