import "server-only";
import { db } from "@/lib/db";

interface AuditLogInput {
  gymId: string;
  actorType: "ADMIN" | "SYSTEM";
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
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
        metadata: input.metadata ?? undefined,
      },
    });
  } catch (error) {
    // Audit logging must never break the user-facing mutation it describes.
    console.error("Failed to write audit log", { input, error });
  }
}
