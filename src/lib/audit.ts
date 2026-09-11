import "server-only";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";

/**
 * A plain, JSON-serializable value. Deliberately not `Record<string, unknown>` -
 * `unknown` permits values (functions, Date objects, etc.) that aren't
 * actually valid JSON, which Prisma's JSON column type correctly rejects at
 * the type level. This is the type-safe shape; the cast below still exists
 * because Prisma declares its own nominal InputJsonValue type rather than
 * accepting any structurally-equivalent type.
 */
type JsonRecord = {
  [key: string]: string | number | boolean | null | JsonRecord | JsonRecord[];
};

interface AuditLogInput {
  gymId: string;
  actorType: "ADMIN" | "SYSTEM";
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: JsonRecord;
}

/**
 * Records an administrative mutation (member created, payment recorded,
 * member deactivated, etc.) for later review. Deliberately fire-and-forget
 * from the caller's perspective at the call site (awaited here, but never
 * allowed to block or fail the mutation it's describing) - see the
 * try/catch below.
 */
export async function recordAuditLog(input: AuditLogInput): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        gymId: input.gymId,
        actorType: input.actorType,
        actorId: input.actorId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (error) {
    // Audit logging must never break the user-facing mutation it describes.
    console.error("Failed to write audit log", { input, error });
  }
}