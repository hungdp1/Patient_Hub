import { Request, Response } from 'express';
import { PaymentStatus, PaymentMethod } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, ApiError } from '../utils/errorHandler';
import { payosService } from '../services/PayOSService';
import prisma from '../lib/prismaClient';

/**
 * GET /api/payos/config
 * Returns whether PayOS is configured (used by the frontend to show/hide
 * the PayOS option without exposing the keys).
 */
export const payosConfig = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ enabled: payosService.isConfigured() });
});

/**
 * POST /api/payos/payments/:paymentId/link
 * Creates a PayOS payment link for an existing PENDING Payment owned by the
 * authenticated user. Stores the PayOS orderCode in `transactionId` so the
 * webhook can find the right record later.
 */
export const createPayOSLink = asyncHandler(async (req: AuthRequest, res: Response) => {
  const paymentId = req.params.paymentId;

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new ApiError(404, 'Không tìm thấy hóa đơn');
  if (payment.userId !== req.userId) throw new ApiError(403, 'Bạn không có quyền với hóa đơn này');
  if (payment.status === PaymentStatus.COMPLETED) {
    throw new ApiError(400, 'Hóa đơn này đã được thanh toán');
  }

  // Where PayOS should redirect the user after success / cancel.
  // Prefer the request origin (whatever URL the user is on) so it works for
  // both localhost and the public Cloudflare-tunnel URL automatically.
  const origin =
    (req.headers.origin as string | undefined) ||
    process.env.FRONTEND_URL ||
    'http://localhost:3000';

  const link = await payosService.createPaymentLink({
    amount: payment.amount,
    description: `Mediflow-${paymentId.slice(-6).toUpperCase()}`,
    returnUrl: `${origin}/payment?status=success&pid=${paymentId}`,
    cancelUrl: `${origin}/payment?status=cancel&pid=${paymentId}`,
    items: [
      {
        name: payment.description?.slice(0, 80) || 'Dịch vụ y tế Mediflow',
        quantity: 1,
        price: Math.round(payment.amount),
      },
    ],
  });

  // Persist the orderCode so the webhook can match this Payment later.
  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      transactionId: String(link.orderCode),
      method: PaymentMethod.E_WALLET,
      status: PaymentStatus.PROCESSING,
    },
  });

  res.json({
    checkoutUrl: link.checkoutUrl,
    qrCode: link.qrCode,
    orderCode: link.orderCode,
    paymentLinkId: link.paymentLinkId,
    amount: link.amount,
  });
});

/**
 * POST /api/payos/webhook
 * PayOS calls this URL when the payment status changes. NO auth middleware
 * is used here — instead we verify the request via the PayOS checksum-key
 * signature inside `payosService.verifyWebhook`.
 */
export const payosWebhook = asyncHandler(async (req: Request, res: Response) => {
  // Best-effort signature verify. Throws -> respond 401 without touching DB.
  let data;
  try {
    data = await payosService.verifyWebhook(req.body);
  } catch (err) {
    console.warn('[payos] Webhook signature invalid:', (err as Error).message);
    res.status(401).json({ received: false, error: 'invalid signature' });
    return;
  }

  // PayOS sends a "test" ping with orderCode=123 when registering the URL.
  // Accept it gracefully so the dashboard validation passes.
  if (!data || !data.orderCode) {
    res.json({ received: true });
    return;
  }

  const payment = await prisma.payment.findFirst({
    where: { transactionId: String(data.orderCode) },
  });

  if (!payment) {
    console.warn('[payos] Webhook for unknown orderCode:', data.orderCode);
    res.json({ received: true });
    return;
  }

  const success = data.code === '00';
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: success ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
      paymentDate: success
        ? new Date(data.transactionDateTime || Date.now())
        : payment.paymentDate,
    },
  });

  console.log(
    `[payos] Payment ${success ? 'COMPLETED' : 'FAILED'}: id=${payment.id} orderCode=${data.orderCode}`,
  );
  res.json({ received: true });
});

/**
 * GET /api/payos/payments/:paymentId/status
 * Polling fallback when the webhook hasn't arrived yet (e.g. user returned
 * to the success URL faster than PayOS could call us). Updates the local
 * Payment if PayOS reports it as paid.
 */
export const checkPayOSStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const payment = await prisma.payment.findUnique({ where: { id: req.params.paymentId } });
  if (!payment) throw new ApiError(404, 'Không tìm thấy hóa đơn');
  if (payment.userId !== req.userId) throw new ApiError(403, 'Bạn không có quyền');
  if (!payment.transactionId) {
    res.json({ localStatus: payment.status });
    return;
  }

  try {
    const link = await payosService.getPaymentLink(Number(payment.transactionId));
    // If PayOS says PAID but our DB lags, update locally.
    if (link.status === 'PAID' && payment.status !== PaymentStatus.COMPLETED) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.COMPLETED, paymentDate: new Date() },
      });
    }
    res.json({
      payosStatus: link.status,
      localStatus:
        link.status === 'PAID' ? PaymentStatus.COMPLETED : payment.status,
      paid: link.amountPaid,
      remaining: link.amountRemaining,
    });
  } catch (err) {
    console.warn('[payos] status lookup failed:', (err as Error).message);
    res.json({ localStatus: payment.status });
  }
});
