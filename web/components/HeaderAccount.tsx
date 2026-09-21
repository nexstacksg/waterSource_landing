"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { clearCustomerSession, useCustomerSession } from "./CustomerSession";

export default function HeaderAccount({ onOpen }: { onOpen?: () => void }) {
  const { customer, status } = useCustomerSession();
  const loaded = status !== "loading";
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
    if (signingOut) return;
    setSigningOut(true);
    setSignOutError("");
    try {
      const response = await fetch("/api/customer-auth/logout", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Sign out failed");
      clearCustomerSession();
      setOpen(false);
      router.push("/");
      router.refresh();
    } catch {
      setSignOutError("Could not sign out. Please try again.");
    } finally {
      setSigningOut(false);
    }
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
              <button onClick={signOut} disabled={signingOut} type="button">
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
              {signOutError && <p role="alert">{signOutError}</p>}
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
