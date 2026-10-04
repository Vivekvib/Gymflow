import { requireAdminSession } from "@/modules/auth/guards";
import { db } from "@/lib/db";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { AdminHeader } from "@/components/admin/admin-header";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // middleware.ts already blocks unauthenticated requests to /admin/* - this
  // is the second, independent layer (see modules/auth/guards.ts).
  const session = await requireAdminSession();
  const [admin, gym] = await Promise.all([
    db.admin.findUnique({ where: { id: session.adminId }, select: { name: true } }),
    db.gym.findUnique({ where: { id: session.gymId }, select: { name: true } }),
  ]);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar gymName={gym?.name ?? "GymFlow"} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader adminName={admin?.name ?? "Admin"} />
        <AdminMobileNav />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
