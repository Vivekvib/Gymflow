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

export interface MemberNavItem extends NavItem {
  /** Short label for the phone's bottom tab bar, where five full labels don't fit. */
  shortLabel: string;
  icon: "home" | "workouts" | "progress" | "bmi" | "profile";
}

export const memberNavItems: MemberNavItem[] = [
  { label: "Dashboard", shortLabel: "Home", href: "/member", icon: "home" },
  { label: "Workouts", shortLabel: "Workouts", href: "/member/workouts", icon: "workouts" },
  { label: "Progress", shortLabel: "Progress", href: "/member/progress", icon: "progress" },
  { label: "BMI Calculator", shortLabel: "BMI", href: "/member/bmi", icon: "bmi" },
  { label: "Profile", shortLabel: "Profile", href: "/member/profile", icon: "profile" },
];
