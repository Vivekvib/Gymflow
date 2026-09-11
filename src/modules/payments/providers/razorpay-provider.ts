import { createHmac, timingSafeEqual } from "node:crypto";
import type { PaymentProviderAdapter, PaymentProviderOrder } from "@/modules/payments/providers/provider.interface";

/**
 * Not yet called from anywhere - modules/payments/actions.ts only records
 * manual payments today. This exists so that turning on online payments
 * (README's "Recommended Future Improvements" #1) is "implement the two
 * methods below for real" rather than a payments-domain redesign.
 *
 * Wiring this up for real needs:
 *   RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
 * (see .env.example) and the `razorpay` npm package for createOrder.
 */
export class RazorpayProvider implements PaymentProviderAdapter {
  constructor(
    private readonly keyId: string | undefined = process.env.RAZORPAY_KEY_ID,
    private readonly keySecret: string | undefined = process.env.RAZORPAY_KEY_SECRET,
    private readonly webhookSecret: string | undefined = process.env.RAZORPAY_WEBHOOK_SECRET,
  ) {}

  async createOrder(amountPaise: number): Promise<PaymentProviderOrder> {
    if (!this.keyId || !this.keySecret) {
      throw new Error(
        "Razorpay is not configured - set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to enable online payments.",
      );
    }

    // Placeholder: call Razorpay's Orders API here with the `razorpay` SDK
    // once online payments are prioritized. Left unimplemented deliberately
    // rather than as a silent stub that looks functional.
    throw new Error(`RazorpayProvider.createOrder is not implemented yet (amountPaise=${amountPaise}).`);
  }

  /**
   * Real signature verification logic, ready to use once webhooks are
   * enabled - Razorpay signs webhook payloads with HMAC-SHA256 over the
   * raw request body using the webhook secret.
   */
  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!this.webhookSecret) return false;

    const expected = createHmac("sha256", this.webhookSecret).update(rawBody).digest("hex");
    const expectedBuffer = Buffer.from(expected, "utf8");
    const signatureBuffer = Buffer.from(signature, "utf8");

    if (expectedBuffer.length !== signatureBuffer.length) return false;
    return timingSafeEqual(expectedBuffer, signatureBuffer);
  }
}
