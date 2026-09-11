export interface NavItem {
  label: string;
  href: string;
}

export const adminNavItems: NavItem[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Members", href: "/admin/members" },
  { label: "Workouts", href: "/admin/workouts" },
  { label: "Settings", href: "/admin/settings" },
];

// Workouts and Profile aren't built yet (see README's "What's next") -
// left out of the nav rather than linking somewhere that 404s.
export const memberNavItems: NavItem[] = [
  { label: "Dashboard", href: "/member" },
  { label: "Progress", href: "/member/progress" },
  { label: "BMI Calculator", href: "/member/bmi" },
];
