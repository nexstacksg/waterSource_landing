"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Customer = { firstName?: string; lastName?: string; email?: string };

export default function HeaderAccount({ onOpen }: { onOpen?: () => void }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/customer-auth/me", { headers: { Accept: "application/json" } })
      .then(async (response) => (response.ok ? response.json() : null))
      .then((payload: { data?: Customer; customer?: Customer } | null) =>
        setCustomer(payload?.data ?? payload?.customer ?? null),
      )
      .catch(() => setCustomer(null))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    function closeOnOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node))
        setOpen(false);
    }
    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && open) {
        setOpen(false);
        ref.current?.querySelector("button")?.focus();
      }
    }
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  async function signOut() {
    await fetch("/api/customer-auth/logout", { method: "POST" });
    setCustomer(null);
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  const name = customer
    ? [customer.firstName, customer.lastName].filter(Boolean).join(" ")
    : "My account";
  return (
    <div
      className={`header-account${open ? " is-open" : ""}`}
      ref={ref}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        aria-label="My account"
        aria-expanded={open}
        aria-controls="header-account-links"
        className="header-account-trigger"
        onClick={() => {
          if (!open) onOpen?.();
          setOpen((value) => !value);
        }}
        type="button"
      >
        <span className="header-account-icon" aria-hidden="true">
          <svg viewBox="0 0 32 32">
            <circle cx="16" cy="10" r="5" />
            <path d="M6.5 27c.8-5 4.1-8 9.5-8s8.7 3 9.5 8" />
          </svg>
        </span>
        <span className="header-account-copy">
          <small>
            {loaded && customer ? "Welcome back" : "Welcome to WaterSource"}
          </small>
          <b>{name}</b>
        </span>
        <span className="header-account-chevron">⌄</span>
      </button>
      {open && (
        <div className="header-account-menu" id="header-account-links">
          {customer ? (
            <>
              <div className="header-account-menu-intro">
                <b>{name}</b>
                <span>{customer.email}</span>
              </div>
              <Link href="/portal" onClick={() => setOpen(false)}>
                Account overview
              </Link>
              <Link href="/portal/orders" onClick={() => setOpen(false)}>
                Order history
              </Link>
              <Link href="/portal/address" onClick={() => setOpen(false)}>
                Delivery address
              </Link>
              <button onClick={signOut} type="button">
                Sign out
              </button>
            </>
          ) : (
            <>
              <div className="header-account-menu-intro">
                <b>Manage your WaterSource journey</b>
                <span>Orders, delivery details and account access.</span>
              </div>
              <Link
                className="header-account-menu-primary"
                href="/portal/login"
                onClick={() => setOpen(false)}
              >
                Sign in
              </Link>
              <Link href="/portal/signup" onClick={() => setOpen(false)}>
                Create account
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
