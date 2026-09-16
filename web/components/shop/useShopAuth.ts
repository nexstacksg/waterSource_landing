"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useShopAuth() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "signed-in" | "guest">(
    "loading",
  );
  const check = useCallback(async () => {
    try {
      const response = await fetch("/api/customer-auth/me", {
        cache: "no-store",
      });
      if (!response.ok) {
        setStatus("guest");
        return false;
      }
      const payload = await response.json();
      const customer =
        payload.data?.customer ?? payload.data ?? payload.customer;
      const signedIn = Boolean(customer?.id);
      setStatus(signedIn ? "signed-in" : "guest");
      return signedIn;
    } catch {
      setStatus("guest");
      return false;
    }
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void check();
    }, 0);
    const refresh = () => {
      void check();
    };
    window.addEventListener("focus", refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [check]);
  async function requireSignIn() {
    if (await check()) return true;
    router.push("/portal/login?next=shop");
    return false;
  }
  return { status, requireSignIn };
}
