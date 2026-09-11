import { requireAdminSession } from "@/modules/auth/guards";
import { db } from "@/lib/db";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // middleware.ts already blocks unauthenticated requests to /admin/* - this
  // is the second, independent layer (see modules/auth/guards.ts).
  const session = await requireAdminSession();
  const admin = await db.admin.findUnique({
    where: { id: session.adminId },
    select: { name: true },
  });

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <AdminHeader adminName={admin?.name ?? "Admin"} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
