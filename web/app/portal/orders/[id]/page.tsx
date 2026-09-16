import Link from "next/link";
import { notFound } from "next/navigation";
import PortalShell from "@/components/portal/PortalShell";
import { requireCustomer } from "@/lib/customer-auth";
import { getCustomerInvoices, invoiceProgress } from "@/lib/portal-orders";

export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await requireCustomer();
  const invoice = (await getCustomerInvoices(customer.contactId)).find((item) => item.id === Number(id));
  if (!invoice) notFound();
  const progress = invoiceProgress(invoice.status);
  const steps = ["Invoice created", "Payment confirmed", "Fulfilment & delivery"];
  return <PortalShell active="orders"><Link className="portal-back-link" href="/portal/orders">← Back to order history</Link><div className="portal-heading portal-tracking-heading"><div><p className="eyebrow">Invoice {invoice.invoiceNumber}</p><h1>Your order</h1><p>Review your purchased items and current fulfilment status.</p></div><span className={`portal-status status-${invoice.status.toLowerCase()}`}>{invoice.status}</span></div><section className="portal-panel portal-tracking-panel"><div className="portal-tracking-summary"><div><span className="portal-card-kicker">Delivering to</span><b>{invoice.deliveryAddress || "No delivery address recorded"}</b></div><div><span className="portal-card-kicker">Invoice total</span><b>S${Number(invoice.total).toLocaleString("en-SG", { maximumFractionDigits: 0 })}</b></div></div><div className="portal-invoice-items"><span className="portal-card-kicker">Purchased items</span>{invoice.items.map((item) => <div key={`${item.itemName}-${item.quantity}`}><b>{item.itemName}</b><span>{item.quantity} × {item.unitPrice ? `S$${Number(item.unitPrice).toLocaleString("en-SG", { maximumFractionDigits: 0 })}` : "Item"}</span><strong>{item.lineTotal ? `S$${Number(item.lineTotal).toLocaleString("en-SG", { maximumFractionDigits: 0 })}` : "—"}</strong></div>)}</div><ol className="portal-timeline">{steps.map((step, index) => <li className={index <= progress ? "is-complete" : ""} key={step}><span className="portal-timeline-dot">{index < progress ? "✓" : index + 1}</span><div><b>{step}</b><small>{index <= progress ? index === progress ? "Current status" : "Completed" : "Upcoming"}</small></div></li>)}</ol></section></PortalShell>;
}
