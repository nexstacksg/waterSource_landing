"use client";

import { useEffect } from "react";

export default function ClearCartOnPayment() {
  useEffect(() => {
    window.localStorage.removeItem("watersource-shop-cart");
    window.localStorage.removeItem("watersource-pending-payment");
  }, []);

  return null;
}
