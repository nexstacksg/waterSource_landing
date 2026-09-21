"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import type { Customer } from "@/lib/customer-auth";

type Session = {
  customer: Customer | null;
  status: "loading" | "signed-in" | "guest" | "error";
};
const initial: Session = { customer: null, status: "loading" };
let session = initial;
let generation = 0;
let pending: Promise<Customer | null> | null = null;
const listeners = new Set<() => void>();

function publish(next: Session) {
  session = next;
  listeners.forEach((listener) => listener());
}

export function clearCustomerSession() {
  generation++;
  pending = null;
  publish({ customer: null, status: "guest" });
}

export function refreshCustomerSession(
  force = false,
): Promise<Customer | null> {
  if (pending && !force) return pending;
  const requestGeneration = ++generation;
  pending = (async () => {
    try {
      const response = await fetch("/api/customer-auth/me", {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (response.status === 401) {
        if (requestGeneration === generation)
          publish({ customer: null, status: "guest" });
        return null;
      }
      if (!response.ok) throw new Error("Account unavailable");
      const payload = await response.json();
      const data = payload.data;
      const customer: Customer | null =
        (data && "id" in data ? data : data?.customer) ??
        payload.customer ??
        null;
      if (requestGeneration !== generation) return session.customer;
      publish({ customer, status: customer?.id ? "signed-in" : "guest" });
      return customer;
    } catch {
      if (requestGeneration === generation)
        publish({ customer: null, status: "error" });
      return null;
    } finally {
      if (requestGeneration === generation) pending = null;
    }
  })();
  return pending;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
const snapshot = () => session;
const serverSnapshot = () => initial;

export function useCustomerSession() {
  const state = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const pathname = usePathname();
  useEffect(() => {
    void refreshCustomerSession();
    const refresh = () => {
      void refreshCustomerSession();
    };
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [pathname]);
  return state;
}
