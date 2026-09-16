"use client";

import type { ReactNode } from "react";

export default function PurchaseButton({
  status,
  unavailable,
  onClick,
  className,
  children,
}: {
  status: "loading" | "signed-in" | "guest";
  unavailable?: boolean;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      className={className}
      type="button"
      onClick={onClick}
      disabled={status === "loading" || (status === "signed-in" && unavailable)}
    >
      {status === "loading"
        ? "Checking account…"
        : status === "guest"
          ? "Sign in"
          : children}
    </button>
  );
}
