import { createHmac, timingSafeEqual } from "node:crypto";

const DEFAULT_API_BASE_URL = "https://api.sandbox.hit-pay.com/v1";

export type HitPayPaymentStatus =
  "pending" | "completed" | "failed" | "expired" | "canceled" | "inactive";

export type HitPayPaymentRequest = {
  id: string;
  name: string;
  email: string;
  phone: string;
  amount: string;
  currency: string;
  status: HitPayPaymentStatus;
  reference_number: string;
  url: string;
  payments?: Array<{
    id: string;
    status: string;
    amount: string;
    payment_type: string;
    created_at?: string;
  }>;
};

type CreatePaymentInput = {
  amount: number;
  name: string;
  email: string;
  phone: string;
  purpose: string;
  referenceNumber: string;
  redirectUrl: string;
};

function hitPayConfig() {
  const apiKey = process.env.HITPAY_API_KEY?.trim();
  if (!apiKey) throw new Error("HitPay API key is not configured.");
  return {
    apiKey,
    apiBaseUrl: (
      process.env.HITPAY_API_BASE_URL ?? DEFAULT_API_BASE_URL
    ).replace(/\/$/, ""),
  };
}

async function hitPayRequest<T>(path: string, init?: RequestInit) {
  const { apiKey, apiBaseUrl } = hitPayConfig();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "X-BUSINESS-API-KEY": apiKey,
      "X-Requested-With": "XMLHttpRequest",
      ...init?.headers,
    },
    cache: "no-store",
  });
  const responseText = await response.text();
  if (!response.ok) {
    console.error("HitPay API error", response.status, responseText);
    throw new Error(`HitPay returned ${response.status}.`);
  }
  return JSON.parse(responseText) as T;
}

export function isHitPayConfigured() {
  return Boolean(process.env.HITPAY_API_KEY?.trim());
}

export async function createHitPayPaymentRequest(input: CreatePaymentInput) {
  const body = new URLSearchParams();
  body.set("amount", input.amount.toFixed(2));
  body.set("currency", "SGD");
  body.set("name", input.name);
  body.set("email", input.email);
  body.set("phone", input.phone);
  body.set("purpose", input.purpose.slice(0, 255));
  body.set("reference_number", input.referenceNumber.slice(0, 255));
  body.set("redirect_url", input.redirectUrl);
  body.set("allow_repeated_payments", "false");
  body.set("send_email", "true");

  const paymentMethods = (
    process.env.HITPAY_PAYMENT_METHODS ?? "paynow_online,card"
  )
    .split(",")
    .map((method) => method.trim())
    .filter(Boolean);
  paymentMethods.forEach((method) => body.append("payment_methods[]", method));

  return hitPayRequest<HitPayPaymentRequest>("/payment-requests", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
}

export function getHitPayPaymentRequest(id: string) {
  return hitPayRequest<HitPayPaymentRequest>(
    `/payment-requests/${encodeURIComponent(id)}`,
  );
}

export function verifyHitPaySignature(rawBody: string, signature: string) {
  const salt = process.env.HITPAY_WEBHOOK_SALT?.trim();
  if (!salt || !signature) return false;
  const computed = createHmac("sha256", salt).update(rawBody).digest("hex");
  const computedBuffer = Buffer.from(computed);
  const signatureBuffer = Buffer.from(signature);
  return (
    computedBuffer.length === signatureBuffer.length &&
    timingSafeEqual(computedBuffer, signatureBuffer)
  );
}

export function quotationIdFromHitPayReference(reference: string) {
  const match = /^WSQ-(\d+)-/.exec(reference);
  return match ? Number(match[1]) : null;
}
