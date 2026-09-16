import PortalShell from "@/components/portal/PortalShell";
import { requireCustomer } from "@/lib/customer-auth";
import { getCustomerInvoices } from "@/lib/portal-orders";
import InvoiceList from "@/components/portal/InvoiceList";

export default async function OrdersPage() { const customer = await requireCustomer(); const invoices = await getCustomerInvoices(customer.contactId); return <PortalShell active="orders"><div className="portal-heading"><div><p className="eyebrow">Your purchases</p><h1>Order history</h1><p>See every WaterSource purchase and its current status.</p></div></div><section className="portal-panel portal-form-panel"><InvoiceList invoices={invoices} /></section></PortalShell>; }
