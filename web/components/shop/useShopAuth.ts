"use client";

import { useRouter } from "next/navigation";
import {
  refreshCustomerSession,
  useCustomerSession,
} from "@/components/CustomerSession";

export function useShopAuth() {
  const router = useRouter();
  const session = useCustomerSession();
  const status = session.status === "error" ? "guest" : session.status;
  async function requireSignIn() {
    if (await refreshCustomerSession()) return true;
    router.push("/portal/login?next=shop");
    return false;
  }
  return { status, requireSignIn };
}
