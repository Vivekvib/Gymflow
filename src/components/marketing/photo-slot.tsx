/**
 * Used wherever a real photo of the gym belongs. There is no stock or
 * generated photography in this app on purpose: until the owner adds real
 * photos (see config/marketing.ts), sections fall back to this dark
 * technical pattern with a faint accent glow, so they look finished rather
 * than broken.
 */
export const DARK_PATTERN =
  "radial-gradient(60% 55% at 88% 8%, rgba(212, 255, 0, 0.10), transparent 70%), repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0px, rgba(255, 255, 255, 0.03) 1px, transparent 1px, transparent 14px)";

/** Darkens a photo so overlaid white text stays readable. Plain black, no hue. */
export const PHOTO_SCRIM =
  "linear-gradient(to top, rgba(12, 12, 12, 0.95) 0%, rgba(12, 12, 12, 0.6) 50%, rgba(12, 12, 12, 0.35) 100%)";

interface PhotoSlotProps {
  src: string;
  alt: string;
  className?: string;
}

export function PhotoSlot({ src, alt, className }: PhotoSlotProps) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={`overflow-hidden rounded-lg bg-[var(--color-surface)] bg-cover bg-center ${className ?? ""}`}
      style={{ backgroundImage: `url(${src})` }}
    />
  );
}
