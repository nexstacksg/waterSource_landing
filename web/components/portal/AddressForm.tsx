"use client";

import { useState, type FormEvent } from "react";
import type { Customer } from "@/lib/customer-auth";

export default function AddressForm({ customer }: { customer: Customer }) {
  const [saved, setSaved] = useState(false);
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <form className="portal-address-form" onSubmit={handleSubmit}>
      <div className="portal-form-grid">
        <label>Recipient name<input defaultValue={[customer.firstName, customer.lastName].filter(Boolean).join(" ")} required /></label>
        <label>Phone number<input defaultValue={customer.phone} required /></label>
        <label className="portal-address-full">Delivery address<input defaultValue={customer.address ?? ""} placeholder="Enter your delivery address" required /></label>
      </div>
      <div className="portal-form-actions">
        <button className="portal-primary-button" type="submit">Save address</button>
        {saved && <span className="portal-saved">Address submitted</span>}
      </div>
    </form>
  );
}
