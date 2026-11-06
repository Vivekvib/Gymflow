/**
 * Phone-number helpers, shared by the member forms (what gets stored), the
 * login (how a typed number is matched) and the WhatsApp links.
 *
 * Why this exists: the same mobile number is written many ways ("98105 40347",
 * "+91 98105-40347", "098105 40347"). Members are matched on what is stored, so
 * without one canonical form a member who types their number slightly
 * differently from how the front desk entered it simply cannot sign in.
 *
 * Canonical form: Indian mobile numbers are stored as the plain 10 digits
 * ("9810540347"). Anything else (a foreign number) keeps its leading "+".
 */

/** Removes spaces, dashes, dots and brackets. Keeps digits and one leading "+". */
export function stripPhoneFormatting(input: string): string {
  const trimmed = input.trim();
  const digits = trimmed.replace(/\D/g, "");
  return trimmed.startsWith("+") ? `+${digits}` : digits;
}

export function normalizePhone(input: string): string {
  const cleaned = stripPhoneFormatting(input);
  let digits = cleaned.replace(/\D/g, "");

  // "0091 98105 40347" - international dialling prefix.
  if (digits.startsWith("00")) digits = digits.slice(2);

  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);

  return cleaned;
}

/**
 * Every spelling a stored number might have, for matching a typed number
 * against rows saved before numbers were normalized (e.g. "+919810540347").
 */
export function phoneLookupCandidates(input: string): string[] {
  const raw = input.trim();
  const normalized = normalizePhone(input);
  const candidates = new Set<string>([raw, stripPhoneFormatting(input), normalized]);

  if (/^[0-9]{10}$/.test(normalized)) {
    candidates.add(`+91${normalized}`);
    candidates.add(`91${normalized}`);
    candidates.add(`0${normalized}`);
  }

  return [...candidates].filter((value) => value.length > 0);
}

/** The digits-only number WhatsApp's wa.me links expect (country code included). */
export function toWhatsAppNumber(phone: string): string {
  const normalized = normalizePhone(phone);
  if (/^[0-9]{10}$/.test(normalized)) return `91${normalized}`;
  return normalized.replace(/\D/g, "");
}

/** "9810540347" -> "+91 98105 40347" for display. Other numbers are returned as stored. */
export function formatPhoneDisplay(phone: string): string {
  const normalized = normalizePhone(phone);
  if (/^[0-9]{10}$/.test(normalized)) {
    return `+91 ${normalized.slice(0, 5)} ${normalized.slice(5)}`;
  }
  return phone;
}

/** Value for a tel: link - no spaces. */
export function toTelHref(phone: string): string {
  return `tel:${stripPhoneFormatting(phone)}`;
}

/** A wa.me link that opens WhatsApp with `text` ready to send to `phone`. */
export function toWhatsAppUrl(phone: string, text: string): string {
  return `https://wa.me/${toWhatsAppNumber(phone)}?text=${encodeURIComponent(text)}`;
}
