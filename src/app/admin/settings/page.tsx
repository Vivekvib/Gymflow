import { requireAdminSession } from "@/modules/auth/guards";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default async function AdminSettingsPage() {
  await requireAdminSession();

  return (
    <div>
      <PageHeader title="Settings" description="Gym profile and configuration." />
      <EmptyState
        title="Settings management is next"
        description="Gym name, contact details, and operating hours currently come from environment variables (NEXT_PUBLIC_GYM_*) - moving them to an editable admin settings page is scoped for the next implementation pass."
      />
    </div>
  );
}
