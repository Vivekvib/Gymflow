import Link from "next/link";
import { requireAdminSession } from "@/modules/auth/guards";
import { listMembersWithPlanStatus } from "@/modules/workouts/service";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table";

export default async function AdminWorkoutsPage() {
  const session = await requireAdminSession();
  const members = await listMembersWithPlanStatus(session.gymId);

  return (
    <div>
      <PageHeader
        title="Workout plans"
        description="Assign and manage member workout plans."
      />

      {members.length === 0 ? (
        <EmptyState
          title="No active members yet"
          description="Add a member first, then assign them a workout plan."
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Member</TableHeaderCell>
              <TableHeaderCell>Plan</TableHeaderCell>
              <TableHeaderCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-xs text-[var(--color-ink-muted)]">{member.memberCode}</p>
                </TableCell>
                <TableCell>
                  {member.planTitle ? (
                    <Badge tone="success">{member.planTitle}</Badge>
                  ) : (
                    <Badge tone="neutral">No plan yet</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/workouts/${member.id}`}
                    className="text-sm font-medium text-[var(--color-accent)] hover:underline"
                  >
                    {member.planTitle ? "Edit plan" : "Create plan"}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
