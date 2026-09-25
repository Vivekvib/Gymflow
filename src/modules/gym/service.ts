import "server-only";
import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { recordAuditLog } from "@/lib/audit";
import type { UpdateGymInput } from "@/modules/gym/validation";

export async function getGym(gymId: string) {
  return db.gym.findUnique({ where: { id: gymId } });
}

export async function updateGym(gymId: string, input: UpdateGymInput, actorAdminId: string) {
  const existing = await db.gym.findUnique({ where: { id: gymId } });
  if (!existing) throw new NotFoundError("Gym");

  const updated = await db.gym.update({
    where: { id: gymId },
    data: {
      name: input.name,
      phone: input.phone || null,
      email: input.email || null,
      address: input.address || null,
      city: input.city || null,
    },
  });

  await recordAuditLog({
    gymId,
    actorType: "ADMIN",
    actorId: actorAdminId,
    action: "GYM_SETTINGS_UPDATED",
    entityType: "Gym",
    entityId: gymId,
  });

  return updated;
}
