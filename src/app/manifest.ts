import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/**
 * Makes the site installable: on a phone, "Add to Home Screen" gives members
 * an icon that opens straight into their dashboard, full-screen like an app,
 * with no app store, no fee and nothing extra to maintain.
 *
 * The name comes from NEXT_PUBLIC_GYM_NAME (set it in Vercel). The icons in
 * public/icons are a plain monogram - swap in the gym's logo at the same
 * file names and sizes (192, 512, and a 512 "maskable" with extra padding).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name.length > 14 ? siteConfig.name.split(/\s+/).slice(0, 2).join(" ") : siteConfig.name,
    description: "Check your membership, follow your workout plan and track your progress.",
    start_url: "/member",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0c0c0c",
    theme_color: "#0c0c0c",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Today's workout", short_name: "Workout", url: "/member/workouts" },
      { name: "My progress", short_name: "Progress", url: "/member/progress" },
    ],
  };
}
