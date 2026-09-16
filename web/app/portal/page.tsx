import Link from "next/link";
import PortalShell from "@/components/portal/PortalShell";
import { requireCustomer } from "@/lib/customer-auth";
import { getCustomerInvoices } from "@/lib/portal-orders";
import InvoiceList from "@/components/portal/InvoiceList";

export default async function PortalPage() {
  const customer = await requireCustomer();
  const name = [customer.firstName, customer.lastName].filter(Boolean).join(" ");
  const invoices = await getCustomerInvoices(customer.contactId);
  const latestAddress = invoices.find((invoice) => invoice.deliveryAddress)?.deliveryAddress;
  return <PortalShell active="overview">
    <div className="portal-heading"><div><p className="eyebrow">Good morning, {customer.firstName}</p><h1>Your WaterSource portal</h1><p>Everything for your water journey, in one calm place.</p></div><Link className="portal-outline-button" href="/portal/address">Manage address</Link></div>
    <section className="portal-welcome-card"><div><span className="portal-card-kicker">Welcome, {name}</span><h2>Your account is ready</h2><p>View your invoices, purchased items, and delivery details in one place.</p></div><Link className="portal-primary-button" href="/shop">Shop WaterSource <span>→</span></Link></section>
    <div className="portal-overview-grid"><section className="portal-panel"><div className="portal-panel-heading"><div><span className="portal-card-kicker">Customer account</span><h2>Order history</h2></div><Link href="/portal/orders">View all</Link></div><InvoiceList invoices={invoices.slice(0, 2)} /></section><section className="portal-panel"><div className="portal-panel-heading"><div><span className="portal-card-kicker">Saved for delivery</span><h2>Your address</h2></div><Link href="/portal/address">Edit</Link></div><address className="portal-address"><b>{name}</b><span>{customer.email}</span><span>{customer.phone || "Add a phone number"}</span><span>{customer.address || latestAddress || "No delivery address saved yet"}</span></address></section></div>
  </PortalShell>;
}
