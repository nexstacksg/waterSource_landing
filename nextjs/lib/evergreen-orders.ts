import { API_BASE_URL } from "@/lib/shop";

export type EvergreenPaymentMode = "cash" | "card" | "paynow" | "bank_transfer";

type InvoiceRecord = {
  id: number;
  invoiceNumber: string;
  total: string;
  contactId: number | null;
};

type QuotationDetail = {
  quotation: {
    id: number;
    quotationNumber: string;
    total: string;
    status: string;
    contactId: number | null;
    deliveryAddress: string | null;
    convertedInvoiceId: number | null;
  };
  items: Array<{ itemName: string; quantity: number }>;
  convertedInvoice: InvoiceRecord | null;
};

type ContactRecord = {
  id: number;
  firstName: string;
  lastName?: string | null;
  email: string | null;
  phone: string | null;
};

type InvoiceDetail = {
  invoice: InvoiceRecord;
  contact: { id: number; firstName: string; lastName?: string | null } | null;
  payments: Array<{
    id: number;
    amount: string;
    status: string;
    reference?: string | null;
  }>;
};

class EvergreenApiError extends Error {
  constructor(
    readonly status: number,
    readonly responseText: string,
  ) {
    super(`Evergreen API request failed with ${status}.`);
  }
}

async function evergreenRequest<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });
  const responseText = await response.text();
  if (!response.ok) {
    const alreadyConverted =
      response.status === 400 &&
      responseText.toLowerCase().includes("quotation already converted");
    if (!alreadyConverted) {
      console.error(`Evergreen API rejected ${path}`, responseText);
    }
    throw new EvergreenApiError(response.status, responseText);
  }
  return JSON.parse(responseText) as { data: T };
}

export async function getEvergreenQuotation(quotationId: number) {
  return evergreenRequest<QuotationDetail>(`/quotations/${quotationId}/detail`);
}

function normalizedPhone(value: string | null | undefined) {
  return typeof value === "string" ? value.replace(/\D/g, "") : "";
}

function normalizedEmail(value: string | null | undefined) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

async function findOrCreateEvergreenCustomer(input: {
  name: string;
  email: string;
  phone: string;
  quotation: QuotationDetail;
  paidAt: string;
}) {
  const contacts = await evergreenRequest<ContactRecord[]>("/contacts");
  const email = normalizedEmail(input.email);
  const phone = normalizedPhone(input.phone);
  const existing = contacts.data.find(
    (contact) =>
      (email && normalizedEmail(contact.email) === email) ||
      (phone && normalizedPhone(contact.phone) === phone),
  );
  if (existing) return existing;

  const nameParts = input.name.trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts.shift() || "Customer";
  const lastName = nameParts.join(" ") || null;
  const productInterest = input.quotation.items
    .map((item) => `${item.itemName} × ${item.quantity}`)
    .join(", ");

  const created = await evergreenRequest<ContactRecord>("/contacts", {
    method: "POST",
    body: JSON.stringify({
      firstName,
      lastName,
      email: input.email,
      phone: input.phone,
      source: "website-shop-hitpay",
      qualification: "hot",
      interestLevel: "hot",
      productInterest,
      purchaseType: "purchase",
      location: input.quotation.quotation.deliveryAddress,
      budget: input.quotation.quotation.total,
      timeline: "Purchased",
      pipelineStage: "won",
      customerType: "personage",
      purchaseDate: new Date(input.paidAt).toISOString(),
      status: "active",
      notes: `Paid online order ${input.quotation.quotation.quotationNumber}`,
      tags: ["new", "qualified"],
    }),
  });
  return created.data;
}

export async function completeEvergreenPurchase(input: {
  quotationId: number;
  mode: EvergreenPaymentMode;
  reference: string;
  paidAt: string;
  customer: { name: string; email: string; phone: string };
}) {
  const quotationResult = await getEvergreenQuotation(input.quotationId);
  let invoice = quotationResult.data.convertedInvoice;
  const customer = quotationResult.data.quotation.contactId
    ? null
    : await findOrCreateEvergreenCustomer({
        ...input.customer,
        quotation: quotationResult.data,
        paidAt: input.paidAt,
      });

  if (!invoice) {
    if (
      quotationResult.data.quotation.status !== "accepted" ||
      (!quotationResult.data.quotation.contactId && customer)
    ) {
      await evergreenRequest(`/quotations/${input.quotationId}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "accepted",
          acceptedAt: new Date(input.paidAt).toISOString(),
          leadId: null,
          ...(customer ? { contactId: customer.id } : {}),
        }),
      });
    }
    try {
      const conversion = await evergreenRequest<{ invoice: InvoiceRecord }>(
        `/quotations/${input.quotationId}/convert-to-invoice`,
        { method: "POST" },
      );
      invoice = conversion.data.invoice;
    } catch (error) {
      const alreadyConverted =
        error instanceof EvergreenApiError &&
        error.status === 400 &&
        error.responseText
          .toLowerCase()
          .includes("quotation already converted");
      if (!alreadyConverted) throw error;

      const refreshed = await getEvergreenQuotation(input.quotationId);
      invoice = refreshed.data.convertedInvoice;
      if (!invoice) {
        throw new Error("Converted quotation did not return its invoice.");
      }
    }
  }

  let invoiceResult = await evergreenRequest<InvoiceDetail>(
    `/invoices/${invoice.id}/detail`,
  );
  const completedAmount = invoiceResult.data.payments
    .filter((payment) => payment.status === "completed")
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const invoiceTotal = Number(invoice.total);
  const outstandingAmount = Math.max(0, invoiceTotal - completedAmount);

  if (!Number.isFinite(invoiceTotal) || invoiceTotal <= 0) {
    throw new Error("Invoice has an invalid total.");
  }

  if (outstandingAmount >= 0.005) {
    const matchingReference = invoiceResult.data.payments.some(
      (payment) =>
        payment.status === "completed" && payment.reference === input.reference,
    );
    if (matchingReference) {
      throw new Error("Payment reference was already partially applied.");
    }

    await evergreenRequest("/payments", {
      method: "POST",
      body: JSON.stringify({
        invoiceId: invoice.id,
        amount: outstandingAmount.toFixed(2),
        mode: input.mode,
        status: "completed",
        reference: input.reference,
        notes: "Payment confirmed by verified HitPay webhook.",
        paidAt: new Date(input.paidAt).toISOString(),
      }),
    });
    invoiceResult = await evergreenRequest<InvoiceDetail>(
      `/invoices/${invoice.id}/detail`,
    );
  }

  const salesHistory = await evergreenRequest<Array<{ id: number }>>(
    `/sales-history/documents?search=${encodeURIComponent(invoice.invoiceNumber)}`,
  );

  if (salesHistory.data.length === 0) {
    throw new Error("Sales history has not been recorded yet.");
  }

  return {
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    customer: invoiceResult.data.contact ?? customer,
    paymentRecorded: true,
    salesHistoryRecorded: true,
    salesHistoryId: salesHistory.data[0].id,
  };
}
