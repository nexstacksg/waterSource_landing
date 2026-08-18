import { NextResponse } from "next/server";
import {
  completeEvergreenPurchase,
  getEvergreenQuotation,
  type EvergreenPaymentMode,
} from "@/lib/evergreen-orders";
import {
  quotationIdFromHitPayReference,
  verifyHitPaySignature,
  type HitPayPaymentRequest,
} from "@/lib/hitpay";

function hitPayMethodToEvergreen(method?: string): EvergreenPaymentMode {
  if (method === "card") return "card";
  if (method?.includes("paynow")) return "paynow";
  if (method?.includes("bank")) return "bank_transfer";
  return "card";
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("hitpay-signature") ?? "";

  if (!process.env.HITPAY_WEBHOOK_SALT?.trim()) {
    console.error("HitPay webhook salt is not configured.");
    return NextResponse.json(
      { error: "Webhook is not configured." },
      { status: 503 },
    );
  }
  if (!verifyHitPaySignature(rawBody, signature)) {
    return NextResponse.json(
      { error: "Invalid HitPay signature." },
      { status: 401 },
    );
  }

  try {
    const eventType = request.headers.get("hitpay-event-type")?.toLowerCase();
    const eventObject = request.headers
      .get("hitpay-event-object")
      ?.toLowerCase();
    const payment = JSON.parse(rawBody) as HitPayPaymentRequest;

    if (
      eventType !== "completed" ||
      eventObject !== "payment_request" ||
      payment.status !== "completed"
    ) {
      return NextResponse.json({ received: true, processed: false });
    }

    const quotationId = quotationIdFromHitPayReference(
      payment.reference_number,
    );
    if (!quotationId) {
      return NextResponse.json(
        { error: "Unknown order reference." },
        { status: 400 },
      );
    }

    const quotation = await getEvergreenQuotation(quotationId);
    const expectedAmount = Number(quotation.data.quotation.total);
    const receivedAmount = Number(payment.amount);
    if (
      payment.currency.toUpperCase() !== "SGD" ||
      !Number.isFinite(receivedAmount) ||
      Math.abs(receivedAmount - expectedAmount) >= 0.005
    ) {
      console.error("HitPay payment does not match quotation", {
        quotationId,
        expectedAmount,
        receivedAmount,
        currency: payment.currency,
      });
      return NextResponse.json(
        { error: "Payment amount mismatch." },
        { status: 400 },
      );
    }

    const succeededPayment = payment.payments?.find(
      (entry) => entry.status === "succeeded",
    );
    const result = await completeEvergreenPurchase({
      quotationId,
      mode: hitPayMethodToEvergreen(succeededPayment?.payment_type),
      reference: succeededPayment?.id ?? payment.id,
      paidAt: succeededPayment?.created_at ?? new Date().toISOString(),
      customer: {
        name: payment.name,
        email: payment.email,
        phone: payment.phone,
      },
    });

    return NextResponse.json({ received: true, processed: true, ...result });
  } catch (error) {
    console.error("HitPay webhook processing failed", error);
    return NextResponse.json(
      { error: "Could not complete the paid order." },
      { status: 502 },
    );
  }
}
