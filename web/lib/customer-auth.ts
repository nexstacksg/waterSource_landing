import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_BASE_URL } from "@/lib/shop";

export { API_BASE_URL } from "@/lib/shop";

export const CUSTOMER_SESSION_COOKIE = "watersource_customer_session";

export type Customer = {
  id: number;
  contactId: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address?: string | null;
};

export async function getCustomer() {
  const token = (await cookies()).get(CUSTOMER_SESSION_COOKIE)?.value;
  if (!token) return null;
  const response = await fetch(`${API_BASE_URL}/customer-auth/me`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as { data?: Customer | { customer?: Customer }; customer?: Customer };
  const data = payload.data;
  return (data && "id" in data ? data : data?.customer) ?? payload.customer ?? null;
}

export async function requireCustomer() {
  const customer = await getCustomer();
  if (!customer) redirect("/portal/login");
  return customer;
}
