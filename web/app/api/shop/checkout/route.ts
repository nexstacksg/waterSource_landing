import { NextResponse } from "next/server";
import {
  API_BASE_URL,
  formatPrice,
  parsePrice,
  type ShopProduct,
} from "@/lib/shop";
import { createHitPayPaymentRequest, isHitPayConfigured } from "@/lib/hitpay";
import { resolveCheckoutSiteUrl } from "@/lib/site-url";

type ApiRecord = { id: number; [key: string]: unknown };

async function createApiRecord<T extends ApiRecord>(
  path: string,
  payload: Record<string, unknown>,
) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  const responseText = await response.text();
  if (!response.ok) {
    console.error(`Evergreen API rejected ${path}`, responseText);
    throw new Error(`Evergreen API could not create ${path}.`);
  }
  return JSON.parse(responseText) as { data: T };
}

async function deleteApiRecord(path: string) {
  const response = await fetch(`${API_BASE_URL}${path}`, { method: "DELETE" });
  if (!response.ok && response.status !== 404) {
    console.error(
      `Evergreen cleanup failed for ${path}`,
      await response.text(),
    );
  }
}

type CheckoutRequest = {
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    notes?: string;
  };
  items?: Array<{ productId?: number; quantity?: number }>;
};

const MAX_QUANTITY = 10;

export async function POST(request: Request) {
  if (!isHitPayConfigured()) {
    return NextResponse.json(
      { error: "Online payment is not configured yet." },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as CheckoutRequest;
    const name = body.customer?.name?.trim() ?? "";
    const email = body.customer?.email?.trim() ?? "";
    const phone = body.customer?.phone?.trim() ?? "";
    const location = body.customer?.location?.trim() ?? "";
    const customerNotes = body.customer?.notes?.trim() ?? "";
    const items = (body.items ?? []).filter(
      (item) =>
        Number.isInteger(item.productId) &&
        Number.isInteger(item.quantity) &&
        Number(item.quantity) > 0,
    );

    if (!name || !email || !phone || items.length === 0) {
      return NextResponse.json(
        { error: "Name, email, phone, and at least one product are required." },
        { status: 400 },
      );
    }

    const productsResponse = await fetch(`${API_BASE_URL}/products`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!productsResponse.ok) {
      throw new Error(`Product API returned ${productsResponse.status}`);
    }

    const productPayload = (await productsResponse.json()) as {
      data?: ShopProduct[];
    };
    const products = new Map(
      (productPayload.data ?? [])
        .filter((product) => product.active)
        .map((product) => [product.id, product]),
    );

    const verifiedItems = items.map((item) => {
      const product = products.get(Number(item.productId));
      if (!product)
        throw new Error("A selected product is no longer available.");
      const quantity = Math.min(Number(item.quantity), MAX_QUANTITY);
      const unitPrice = parsePrice(product.purchasePrice);
      return { product, quantity, unitPrice, total: unitPrice * quantity };
    });

    const total = verifiedItems.reduce((sum, item) => sum + item.total, 0);
    const itemSummary = verifiedItems
      .map(
        ({ product, quantity, total: lineTotal }) =>
          `${quantity} × ${product.name} (${formatPrice(lineTotal)})`,
      )
      .join("; ");
    const notes = [
      `Online shop purchase request. Cart: ${itemSummary}. Estimated total: ${formatPrice(total)}.`,
      customerNotes ? `Customer note: ${customerNotes}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    const now = new Date();
    const validUntil = new Date(now);
    validUntil.setDate(validUntil.getDate() + 7);
    const quotationNumber = `WEB-${now.toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const quotationPayload = await createApiRecord<ApiRecord>("/quotations", {
      quotationNumber,
      status: "sent",
      issueDate: now.toISOString(),
      validUntil: validUntil.toISOString(),
      subtotal: total.toFixed(2),
      tax: "0.00",
      total: total.toFixed(2),
      notes,
      deliveryAddress: location || null,
      paymentTerms: "Payment required before fulfilment",
      sentAt: now.toISOString(),
      promotionsJson: [],
    });

    await Promise.all(
      verifiedItems.map(({ product, quantity, unitPrice, total: lineTotal }) =>
        createApiRecord<ApiRecord>("/quotation-items", {
          quotationId: quotationPayload.data.id,
          productId: product.id,
          itemName: product.name,
          itemType: "product",
          quantity,
          unitPrice: unitPrice.toFixed(2),
          lineTotal: lineTotal.toFixed(2),
          description: product.shortDescription,
          selectedImageUrlsJson: "[]",
        }),
      ),
    );

    const hitPayReference = `WSQ-${quotationPayload.data.id}-${quotationNumber}`;
    const siteUrl = resolveCheckoutSiteUrl(request);
    let paymentRequest;
    try {
      paymentRequest = await createHitPayPaymentRequest({
        amount: total,
        name,
        email,
        phone,
        purpose: `WaterSource order ${quotationNumber}`,
        referenceNumber: hitPayReference,
        redirectUrl: `${siteUrl}/shop/payment-result`,
      });
    } catch (error) {
      await deleteApiRecord(`/quotations/${quotationPayload.data.id}`);
      throw error;
    }

    return NextResponse.json(
      {
        orderId: quotationNumber,
        quotationId: quotationPayload.data.id,
        total,
        paymentRequestId: paymentRequest.id,
        paymentUrl: paymentRequest.url,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Shop checkout failed", error);
    const message =
      error instanceof Error && error.message.includes("no longer available")
        ? error.message
        : "We could not submit your request. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
