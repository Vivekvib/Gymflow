/**
 * Implemented by each online payment provider (Razorpay today, Stripe
 * later) so modules/payments/service.ts never imports a provider SDK
 * directly. CASH/UPI/CARD/BANK_TRANSFER payments recorded in person by an
 * admin bypass this entirely - see manual-provider.ts.
 */
export interface PaymentProviderOrder {
  providerOrderId: string;
  amountPaise: number;
  currency: "INR";
}

export interface PaymentProviderAdapter {
  /** Creates a hosted-checkout order and returns the ID to hand to the client SDK. */
  createOrder(amountPaise: number): Promise<PaymentProviderOrder>;

  /** Verifies a webhook's signature before its payload is trusted. */
  verifyWebhookSignature(rawBody: string, signature: string): boolean;
}
