/**
 * PayOS payment-gateway integration.
 *
 * Reads credentials from env vars:
 *   PAYOS_CLIENT_ID
 *   PAYOS_API_KEY
 *   PAYOS_CHECKSUM_KEY
 *
 * Throws a friendly 503 error if any are missing so the rest of the app keeps
 * working when PayOS is not configured.
 */
import { PayOS } from '@payos/node';
import { ApiError } from '../utils/errorHandler';

let client: PayOS | null = null;

function getClient(): PayOS {
  const { PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY } = process.env;
  if (!PAYOS_CLIENT_ID || !PAYOS_API_KEY || !PAYOS_CHECKSUM_KEY) {
    throw new ApiError(
      503,
      'Cổng thanh toán PayOS chưa được cấu hình. Liên hệ quản trị viên.',
    );
  }
  if (!client) {
    client = new PayOS({
      clientId: PAYOS_CLIENT_ID,
      apiKey: PAYOS_API_KEY,
      checksumKey: PAYOS_CHECKSUM_KEY,
    });
  }
  return client;
}

export class PayOSService {
  isConfigured(): boolean {
    return Boolean(
      process.env.PAYOS_CLIENT_ID &&
        process.env.PAYOS_API_KEY &&
        process.env.PAYOS_CHECKSUM_KEY,
    );
  }

  /**
   * Generate a unique numeric order code. PayOS requires a positive integer
   * (≤ Number.MAX_SAFE_INTEGER). Combining a truncated timestamp with a
   * random suffix gives plenty of headroom while staying readable.
   */
  generateOrderCode(): number {
    const t = Date.now() % 1_000_000_000;       // last 9 digits of ms timestamp
    const r = Math.floor(Math.random() * 1000); // 0..999
    return Number(`${t}${r.toString().padStart(3, '0')}`);
  }

  async createPaymentLink(input: {
    amount: number;
    description: string;
    returnUrl: string;
    cancelUrl: string;
    items?: Array<{ name: string; quantity: number; price: number }>;
    buyerName?: string;
    buyerEmail?: string;
    buyerPhone?: string;
  }) {
    const payos = getClient();
    const orderCode = this.generateOrderCode();
    // PayOS description max 25 chars
    const desc = input.description.slice(0, 25);

    const link = await payos.paymentRequests.create({
      orderCode,
      amount: Math.round(input.amount),
      description: desc,
      returnUrl: input.returnUrl,
      cancelUrl: input.cancelUrl,
      items: input.items,
      buyerName: input.buyerName,
      buyerEmail: input.buyerEmail,
      buyerPhone: input.buyerPhone,
    });

    return {
      orderCode: link.orderCode,
      paymentLinkId: link.paymentLinkId,
      checkoutUrl: link.checkoutUrl,
      qrCode: link.qrCode,
      amount: link.amount,
      status: link.status,
      bin: link.bin,
      accountNumber: link.accountNumber,
      accountName: link.accountName,
    };
  }

  async getPaymentLink(orderCode: number) {
    const payos = getClient();
    return payos.paymentRequests.get(orderCode);
  }

  async cancelPaymentLink(orderCode: number, reason?: string) {
    const payos = getClient();
    return payos.paymentRequests.cancel(orderCode, reason);
  }

  /**
   * Verify a webhook payload using the checksum key. Throws if the signature
   * is invalid. Returns the parsed webhook data on success.
   */
  async verifyWebhook(webhookBody: any) {
    const payos = getClient();
    return payos.webhooks.verify(webhookBody);
  }
}

export const payosService = new PayOSService();
