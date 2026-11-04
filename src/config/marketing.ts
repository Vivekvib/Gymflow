/**
 * Everything on the public landing page that the gym owner is likely to want
 * to change without touching a component: photos, wording, and prices.
 *
 * Wording here only claims things the system really does (workout plans
 * built by trainers, online progress tracking, checking expiry and payments).
 * The two facility lines marked ASSUMPTION below are generic gym wording -
 * edit them to match what the gym actually has.
 */

export type ImagePath = string | null;

export type ServiceKey = "plans" | "strength" | "cardio" | "progress";

interface MarketingImages {
  hero: ImagePath;
  /** The two About photos are shown together or not at all - set both. */
  aboutLeft: ImagePath;
  aboutRight: ImagePath;
  cta: ImagePath;
  services: Record<ServiceKey, ImagePath>;
}

/**
 * Photos. `null` means "no photo yet", and the section falls back to a
 * designed dark background. To use a real photo of the gym: put the file in
 * `public/images/` and set its path here, e.g. "/images/hero.jpg". See
 * public/images/README.md for recommended sizes.
 */
export const marketingImages: MarketingImages = {
  hero: null,
  aboutLeft: null,
  aboutRight: null,
  cta: null,
  services: {
    plans: null,
    strength: null,
    cardio: null,
    progress: null,
  },
};

export const heroCopy = {
  headlineLines: ["Train with", "a plan."],
  intro:
    "Strength and cardio training with trainers who build your workout plan. Join at the front desk, then follow your workouts, weight, and membership online.",
} as const;

export const aboutCopy = {
  eyebrow: "About us",
  headlineStrong: "Train with a plan, ",
  headlineMuted: "track your progress, and stay consistent.",
  points: [
    {
      title: "A plan built for you",
      description: "Trainers set up your workout split and adjust it as you get stronger.",
    },
    {
      title: "See your own progress",
      description: "Log your weight and check your BMI trend any time from your phone.",
    },
    {
      title: "Membership you can check yourself",
      description: "Log in any time to see your exact expiry date and full payment history.",
    },
  ],
} as const;

export const servicesCopy = {
  eyebrow: "Training",
  title: "What you get",
  intro: "Everything below is part of your membership. Ask at the front desk if you want details.",
  items: [
    {
      key: "plans",
      icon: "clipboard-list",
      title: "Workout plans",
      description:
        "A day-by-day plan from your trainer, with a demo video for each exercise you can open on your phone.",
    },
    {
      // ASSUMPTION: generic gym wording, edit to match the real equipment.
      key: "strength",
      icon: "dumbbell",
      title: "Strength training",
      description: "Free weights and machines for every level, from first week to experienced.",
    },
    {
      // ASSUMPTION: generic gym wording, edit to match the real equipment.
      key: "cardio",
      icon: "heart-pulse",
      title: "Cardio training",
      description: "Treadmills, bikes, and rowers, with enough space to actually move.",
    },
    {
      key: "progress",
      icon: "trending-up",
      title: "Progress tracking",
      description: "Log your weight, watch your BMI trend, and set a goal with a target date.",
    },
  ],
} as const;

export const joinCopy = {
  eyebrow: "Joining",
  title: "How joining works",
  steps: [
    {
      title: "Visit the front desk",
      description: "Sign up in person and pay by cash, UPI, card, or bank transfer.",
    },
    {
      title: "Get your login",
      description: "You receive a member ID and a password to sign in online.",
    },
    {
      title: "Train and track",
      description: "Follow your workout plan, log your weight, and check your expiry date.",
    },
  ],
} as const;

export const plansCopy = {
  eyebrow: "Membership",
  title: "Pick a plan that fits",
  intro: "Choose how long you want to commit. Every plan includes the same things.",
  features: [
    "Full gym access",
    "Workout plan from a trainer",
    "Online progress tracking",
    "Expiry and payments visible online",
  ],
} as const;

/**
 * Price in rupees, keyed by plan length in days (30, 90, 180, 365 - the same
 * lengths the admin payment form offers). Left empty on purpose: nothing in
 * the system stores official prices (an admin types the amount per payment),
 * so any number shown here would be a guess. Fill in only what is true, e.g.
 *   { 30: 1500, 90: 4000 }
 * Plans without a price show "Ask at the front desk".
 */
export const MEMBERSHIP_PRICES_INR: Partial<Record<number, number>> = {};

export const ctaCopy = {
  headline: "Start training today",
  body: "Visit the front desk to join, then sign in to follow your plan.",
} as const;

export const footerBlurb = "Strength and cardio training with a workout plan built for you.";
