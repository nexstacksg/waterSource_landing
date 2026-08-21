import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { POST as handleHitPayWebhook } from "@/app/api/hitpay/webhook/route";
import {
  createHitPayPaymentRequest,
  quotationIdFromHitPayReference,
  verifyHitPaySignature,
} from "@/lib/hitpay";
import { nextQuotationNumber } from "@/lib/quotation-number";
import { resolveCheckoutSiteUrl } from "@/lib/site-url";

test("uses the Evergreen quotation number sequence", () => {
  const date = new Date(2026, 7, 21);

  assert.equal(
    nextQuotationNumber(
      [
        { quotationNumber: "Q-2026-0007" },
        { quotationNumber: "Q-2026-0002" },
        { quotationNumber: "WEB-20260819-49625068" },
        { quotationNumber: "Q-2025-0099" },
        { quotationNumber: null },
      ],
      date,
    ),
    "Q-2026-0008",
  );
  assert.equal(nextQuotationNumber([], date), "Q-2026-0001");
});

test("uses local and deployed HitPay return URLs correctly", () => {
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  process.env.NEXT_PUBLIC_SITE_URL = "https://watersource-website.nexstack.sg/";

  try {
    assert.equal(
      resolveCheckoutSiteUrl(
        new Request("http://localhost:3000/api/shop/checkout"),
        "development",
      ),
      "http://localhost:3000",
    );
    assert.equal(
      resolveCheckoutSiteUrl(
        new Request("http://localhost:3000/api/shop/checkout"),
        "production",
      ),
      "https://watersource-website.nexstack.sg",
    );
    assert.equal(
      resolveCheckoutSiteUrl(
        new Request("https://localhost:3000/api/shop/checkout"),
        "development",
      ),
      "https://watersource-website.nexstack.sg",
    );
    assert.equal(
      resolveCheckoutSiteUrl(
        new Request(
          "https://watersource-website.nexstack.sg/api/shop/checkout",
        ),
        "production",
      ),
      "https://watersource-website.nexstack.sg",
    );
  } finally {
    if (originalSiteUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
    }
  }
});

test("validates HitPay signatures and WaterSource references", () => {
  process.env.HITPAY_WEBHOOK_SALT = "test-salt";
  const payload = JSON.stringify({ id: "payment-request" });
  const signature = createHmac("sha256", "test-salt")
    .update(payload)
    .digest("hex");

  assert.equal(verifyHitPaySignature(payload, signature), true);
  assert.equal(verifyHitPaySignature(`${payload}x`, signature), false);
  assert.equal(quotationIdFromHitPayReference("WSQ-42-WEB-ORDER"), 42);
  assert.equal(quotationIdFromHitPayReference("unrelated"), null);
});

test("creates a hosted HitPay payment request with server-only credentials", async () => {
  const originalFetch = globalThis.fetch;
  process.env.HITPAY_API_KEY = "sandbox-key";
  process.env.HITPAY_API_BASE_URL = "https://hitpay.test/v1";
  process.env.HITPAY_PAYMENT_METHODS = "paynow_online,card";

  globalThis.fetch = (async (input, init) => {
    assert.equal(String(input), "https://hitpay.test/v1/payment-requests");
    assert.equal(
      new Headers(init?.headers).get("X-BUSINESS-API-KEY"),
      "sandbox-key",
    );
    const body = new URLSearchParams(String(init?.body));
    assert.equal(body.get("amount"), "2888.00");
    assert.deepEqual(body.getAll("payment_methods[]"), [
      "paynow_online",
      "card",
    ]);
    assert.equal(body.has("expires_after"), false);
    assert.equal(body.get("reference_number"), "WSQ-42-WEB-ORDER");
    return Response.json({
      id: "hitpay-request-id",
      name: "Test Customer",
      email: "customer@example.com",
      phone: "+6512345678",
      amount: "2888.00",
      currency: "SGD",
      status: "pending",
      reference_number: "WSQ-42-WEB-ORDER",
      url: "https://securecheckout.sandbox.hit-pay.com/example",
    });
  }) as typeof fetch;

  try {
    const payment = await createHitPayPaymentRequest({
      amount: 2888,
      name: "Test Customer",
      email: "customer@example.com",
      phone: "+6512345678",
      purpose: "WaterSource test order",
      referenceNumber: "WSQ-42-WEB-ORDER",
      redirectUrl: "https://example.com/shop/payment-result",
    });
    assert.equal(payment.id, "hitpay-request-id");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("verified payment creates the Evergreen customer and sales history", async () => {
  const originalFetch = globalThis.fetch;
  process.env.HITPAY_WEBHOOK_SALT = "webhook-test-salt";
  let invoiceReads = 0;
  let quotationReads = 0;
  let paymentBody: Record<string, unknown> = {};

  globalThis.fetch = (async (input, init) => {
    const url = String(input);
    if (url.endsWith("/quotations/42/detail")) {
      quotationReads += 1;
      const convertedInvoice =
        quotationReads >= 3
          ? {
              id: 91,
              invoiceNumber: "INV-2026-0091",
              total: "2888.00",
              contactId: 73,
            }
          : null;
      return Response.json({
        data: {
          quotation: {
            id: 42,
            quotationNumber: "WEB-ORDER",
            total: "2888.00",
            status: "sent",
            contactId: null,
            deliveryAddress: "Singapore 123456",
            convertedInvoiceId: convertedInvoice?.id ?? null,
          },
          items: [{ itemName: "H001 Water Purifier", quantity: 1 }],
          convertedInvoice,
        },
      });
    }
    if (url.endsWith("/contacts") && (!init?.method || init.method === "GET")) {
      return Response.json({
        data: [
          {
            id: 7,
            firstName: "Legacy",
            lastName: null,
            email: null,
            phone: null,
          },
        ],
      });
    }
    if (url.endsWith("/contacts") && init?.method === "POST") {
      const customer = JSON.parse(String(init.body)) as Record<string, unknown>;
      assert.equal(customer.source, "website-shop-hitpay");
      assert.equal(customer.pipelineStage, "won");
      assert.deepEqual(customer.tags, ["new", "qualified"]);
      return Response.json(
        {
          data: {
            id: 73,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone,
          },
        },
        { status: 201 },
      );
    }
    if (url.endsWith("/quotations/42") && init?.method === "PATCH") {
      const update = JSON.parse(String(init.body)) as Record<string, unknown>;
      assert.equal(update.status, "accepted");
      assert.equal(update.contactId, 73);
      assert.equal(update.leadId, null);
      return Response.json({ data: { id: 42, ...update } });
    }
    if (url.endsWith("/quotations/42/convert-to-invoice")) {
      return Response.json(
        { error: "quotation already converted" },
        { status: 400 },
      );
    }
    if (url.endsWith("/invoices/91/detail")) {
      invoiceReads += 1;
      return Response.json({
        data: {
          invoice: {
            id: 91,
            invoiceNumber: "INV-2026-0091",
            total: "2888.00",
            contactId: 73,
          },
          contact: { id: 73, firstName: "Test", lastName: "Customer" },
          payments:
            invoiceReads === 1
              ? []
              : [
                  {
                    id: 81,
                    amount: "2888.00",
                    status: "completed",
                    reference: "hp-payment",
                  },
                ],
        },
      });
    }
    if (url.endsWith("/payments") && init?.method === "POST") {
      paymentBody = JSON.parse(String(init.body)) as Record<string, unknown>;
      return Response.json({ data: { id: 81 } }, { status: 201 });
    }
    if (url.includes("/sales-history/documents?search=")) {
      return Response.json({ data: [{ id: 101 }] });
    }
    throw new Error(`Unexpected mocked request: ${url}`);
  }) as typeof fetch;

  const payload = JSON.stringify({
    id: "hp-request",
    name: "Test Customer",
    email: "customer@example.com",
    phone: "+6512345678",
    amount: "2888.00",
    currency: "SGD",
    status: "completed",
    reference_number: "WSQ-42-WEB-ORDER",
    url: "https://securecheckout.sandbox.hit-pay.com/example",
    payments: [
      {
        id: "hp-payment",
        status: "succeeded",
        amount: "2888.00",
        payment_type: "paynow_online",
        created_at: "2026-08-18T08:00:00.000Z",
      },
    ],
  });
  const signature = createHmac("sha256", "webhook-test-salt")
    .update(payload)
    .digest("hex");

  try {
    const response = await handleHitPayWebhook(
      new Request("https://example.com/api/hitpay/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Hitpay-Signature": signature,
          "Hitpay-Event-Type": "completed",
          "Hitpay-Event-Object": "payment_request",
        },
        body: payload,
      }),
    );
    const result = (await response.json()) as Record<string, unknown>;

    assert.equal(response.status, 200);
    assert.equal(result.processed, true);
    assert.equal(result.salesHistoryRecorded, true);
    assert.equal(result.salesHistoryId, 101);
    assert.deepEqual(result.customer, {
      id: 73,
      firstName: "Test",
      lastName: "Customer",
    });
    assert.equal(paymentBody.mode, "paynow");
    assert.equal(paymentBody.reference, "hp-payment");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
