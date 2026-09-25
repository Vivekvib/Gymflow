import { notFound } from "next/navigation";
import { requireAdminSession } from "@/modules/auth/guards";
import { getGym } from "@/modules/gym/service";
import { GymSettingsForm } from "@/components/admin/gym-settings-form";
import { PageHeader } from "@/components/shared/page-header";

export default async function AdminSettingsPage() {
  const session = await requireAdminSession();
  const gym = await getGym(session.gymId);

  // Should be unreachable (the session was issued for this gym), but fail
  // safely rather than crash if the gym row ever went missing.
  if (!gym) notFound();

  return (
    <div>
      <PageHeader title="Settings" description="Gym profile and contact details." />
      <GymSettingsForm
        defaultValues={{
          name: gym.name,
          phone: gym.phone ?? "",
          email: gym.email ?? "",
          address: gym.address ?? "",
          city: gym.city ?? "",
        }}
      />
    </div>
  );
}
