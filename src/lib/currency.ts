/**
 * Money is stored in the database as integer paise (Payment.amountPaise) to
 * avoid floating-point rounding errors. These helpers are the only place
 * that should convert between paise and the rupee amounts a human types
 * into a form or reads on screen.
 */

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function paiseToRupees(paise: number): number {
  return paise / 100;
}

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** e.g. 900000 -> "₹9,000" */
export function formatPaise(paise: number): string {
  return inrFormatter.format(paiseToRupees(paise));
}
