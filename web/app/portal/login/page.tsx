import PortalAuthForm from "@/components/portal/PortalAuthForm";
import { getCustomer } from "@/lib/customer-auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  if (await getCustomer()) redirect("/portal");
  return <PortalAuthForm mode="login" />;
}
