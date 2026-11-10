import "server-only";
import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { recordAuditLog } from "@/lib/audit";
import { DEFAULT_TIMEZONE } from "@/lib/dates";
import type { UpdateGymInput } from "@/modules/gym/validation";

export async function getGym(gymId: string) {
  return db.gym.findUnique({ where: { id: gymId } });
}

/**
 * The gym's own timezone, which decides what "today" and "this month" mean.
 * Falls back to India if the gym row is missing. One copy: the dashboard,
 * member list and workouts all need it.
 */
export async function getGymTimezone(gymId: string): Promise<string> {
  const gym = await db.gym.findUnique({ where: { id: gymId }, select: { timezone: true } });
  return gym?.timezone ?? DEFAULT_TIMEZONE;
}

/**
 * For the public marketing page, which has no session and therefore no
 * gymId to scope by. Single-gym MVP assumption: exactly one Gym row
 * exists, so grabbing the first one is correct. A true multi-gym
 * deployment would resolve this from the request's subdomain/slug instead
 * - see README's multi-gym section for that future path.
 */
export async function getPublicGym() {
  return db.gym.findFirst({ orderBy: { createdAt: "asc" } });
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

/**
 * For pages that must render even if the database is slow or asleep (the
 * sign-in pages). A cold Neon compute can fail a lookup; the page should
 * still load with the fallback name rather than error before anyone has
 * even typed a password.
 */
export async function getPublicGymName(fallback: string): Promise<string> {
  try {
    return (await getPublicGym())?.name ?? fallback;
  } catch {
    return fallback;
  }
}
