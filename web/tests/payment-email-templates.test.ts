import assert from "node:assert/strict";
import test from "node:test";
import {
  buildPaymentEmail,
  type PaymentEmailInput,
} from "../lib/payment-email-templates";

const input: PaymentEmailInput = {
  invoiceNumber: "INV-DEMO-001",
  paidAt: "2026-09-28T07:24:25Z",
  total: 2888,
  customer: {
    name: "Sample Customer",
    email: "customer@example.com",
    phone: "+65 8000 0000",
  },
  items: [{ name: "H001 water purifier", quantity: 1, lineTotal: 2888 }],
  customerOrderUrl: "https://example.com/portal/orders/1",
  adminInvoiceUrl: "https://admin.example.com/finance/invoices/1",
};

test("customer and admin emails have real line breaks and separate destinations", () => {
  const customer = buildPaymentEmail(input, "customer");
  const admin = buildPaymentEmail(input, "admin");
  assert.ok(customer.text.includes("\nOrder summary\n"));
  assert.ok(!customer.text.includes("\\n"));
  assert.match(customer.html, /Payment confirmed/i);
  assert.ok(customer.html.includes(input.customerOrderUrl!));
  assert.ok(!customer.html.includes(input.adminInvoiceUrl!));
  assert.ok(admin.html.includes(input.adminInvoiceUrl!));
  assert.match(admin.text, /Singapore time/);
});

test("escapes customer content and omits unsafe action URLs", () => {
  const output = buildPaymentEmail(
    {
      ...input,
      customer: { name: "<script>bad</script>", email: "x@example.com" },
      customerOrderUrl: "javascript:alert(1)",
    },
    "customer",
  );
  assert.ok(!output.html.includes("<script>"));
  assert.ok(output.html.includes("&lt;script&gt;"));
  assert.ok(!output.html.includes("javascript:"));
});
