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

export const memberNavItems: NavItem[] = [
  { label: "Dashboard", href: "/member" },
  { label: "Progress", href: "/member/progress" },
  { label: "Workouts", href: "/member/workouts" },
  { label: "BMI Calculator", href: "/member/bmi" },
  { label: "Profile", href: "/member/profile" },
];
