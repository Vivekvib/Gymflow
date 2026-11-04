import { formatPaise, rupeesToPaise } from "@/lib/currency";

/**
 * "₹1,500" for a plan that has a configured price, or null when it doesn't
 * (the page then shows "Ask at the front desk" instead of inventing a
 * number). Anything that isn't a positive finite amount counts as "no price"
 * so a typo in config can never render as "₹0" or "₹NaN".
 */
export function getPlanPriceLabel(
  days: number,
  prices: Partial<Record<number, number>>,
): string | null {
  const rupees = prices[days];
  if (rupees === undefined || !Number.isFinite(rupees) || rupees <= 0) return null;
  return formatPaise(rupeesToPaise(rupees));
}
