import { API_BASE_URL } from "@/lib/shop";

export type CustomerInvoice = {
  id: number;
  contactId: number | null;
  invoiceNumber: string;
  status: string;
  issueDate: string;
  total: string;
  deliveryAddress: string | null;
  items: Array<{ itemName: string; quantity: number; lineTotal?: string; unitPrice?: string }>;
  payments: Array<{ amount: string; status: string; reference?: string | null }>;
};

type InvoiceSummary = Omit<CustomerInvoice, "items" | "payments">;

async function evergreenGet<T>(path: string) {
  const response = await fetch(`${API_BASE_URL}${path}`, { headers: { Accept: "application/json" }, cache: "no-store" });
  if (!response.ok) throw new Error(`Evergreen request failed: ${response.status}`);
  return (await response.json()) as { data: T };
}

export async function getCustomerInvoices(contactId: number) {
  const response = await evergreenGet<InvoiceSummary[]>("/invoices");
  const summaries = response.data.filter((invoice) => invoice.contactId === contactId);
  return Promise.all(summaries.map(async (invoice) => {
    const detail = await evergreenGet<{ invoice: InvoiceSummary; items?: CustomerInvoice["items"]; payments?: CustomerInvoice["payments"] }>(`/invoices/${invoice.id}/detail`);
    return { ...invoice, items: detail.data.items ?? [], payments: detail.data.payments ?? [] };
  }));
}

export function invoiceProgress(status: string) {
  const value = status.toLowerCase();
  if (value === "paid" || value === "completed") return 2;
  if (value === "sent" || value === "accepted") return 1;
  return 0;
}
