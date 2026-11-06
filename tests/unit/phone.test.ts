import { describe, expect, it } from "vitest";
import {
  formatPhoneDisplay,
  normalizePhone,
  phoneLookupCandidates,
  stripPhoneFormatting,
  toTelHref,
  toWhatsAppNumber,
} from "@/lib/phone";

describe("normalizePhone", () => {
  it.each([
    ["9810740347", "9810740347"],
    ["98107 40347", "9810740347"],
    ["98107-40347", "9810740347"],
    ["+91 98107 40347", "9810740347"],
    ["+919810740347", "9810740347"],
    ["919810740347", "9810740347"],
    ["09810740347", "9810740347"],
    ["0091 98107 40347", "9810740347"],
    ["(+91) 98107.40347", "9810740347"],
  ])("normalizes %s to %s", (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });

  it("keeps a foreign number in international form", () => {
    expect(normalizePhone("+1 415 555 2671")).toBe("+14155552671");
  });

  it("is idempotent", () => {
    const once = normalizePhone("+91 98107 40347");
    expect(normalizePhone(once)).toBe(once);
  });
});

describe("stripPhoneFormatting", () => {
  it("keeps only digits and a leading plus", () => {
    expect(stripPhoneFormatting(" +91 (981) 07-40347 ")).toBe("+919810740347");
    expect(stripPhoneFormatting("98107 40347")).toBe("9810740347");
  });
});

describe("phoneLookupCandidates", () => {
  it("covers every spelling a stored Indian number might have", () => {
    const candidates = phoneLookupCandidates("98107 40347");
    expect(candidates).toEqual(
      expect.arrayContaining(["9810740347", "+919810740347", "919810740347", "09810740347"]),
    );
  });

  it("finds the same set whichever way the number is typed", () => {
    const a = new Set(phoneLookupCandidates("9810740347"));
    const b = new Set(phoneLookupCandidates("+91 98107 40347"));
    for (const value of ["9810740347", "+919810740347", "919810740347", "09810740347"]) {
      expect(a.has(value)).toBe(true);
      expect(b.has(value)).toBe(true);
    }
  });

  it("never returns an empty string", () => {
    expect(phoneLookupCandidates("   ")).toEqual([]);
  });
});

describe("display helpers", () => {
  it("builds a WhatsApp number with the country code", () => {
    expect(toWhatsAppNumber("9810740347")).toBe("919810740347");
    expect(toWhatsAppNumber("+91 98107 40347")).toBe("919810740347");
    expect(toWhatsAppNumber("+14155552671")).toBe("14155552671");
  });

  it("formats a number for display", () => {
    expect(formatPhoneDisplay("9810740347")).toBe("+91 98107 40347");
    expect(formatPhoneDisplay("+14155552671")).toBe("+14155552671");
  });

  it("builds a tel: link without spaces", () => {
    expect(toTelHref("+91 98107 40347")).toBe("tel:+919810740347");
  });
});

describe("toWhatsAppUrl", () => {
  it("opens a chat with the message pre-filled and encoded", async () => {
    const { toWhatsAppUrl } = await import("@/lib/phone");
    expect(toWhatsAppUrl("98107 40347", "Hi Asha, renew soon & stay strong")).toBe(
      "https://wa.me/919810740347?text=Hi%20Asha%2C%20renew%20soon%20%26%20stay%20strong",
    );
  });
});
