import PortalShell from "@/components/portal/PortalShell";
import AddressForm from "@/components/portal/AddressForm";
import { requireCustomer } from "@/lib/customer-auth";

export default async function AddressPage() { const customer = await requireCustomer(); return <PortalShell active="address"><div className="portal-heading"><div><p className="eyebrow">Delivery details</p><h1>Your address</h1><p>Keep your installation and delivery details up to date.</p></div></div><section className="portal-panel portal-form-panel"><AddressForm customer={customer} /></section></PortalShell>; }
