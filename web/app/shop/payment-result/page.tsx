import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SiteInteractions from "@/components/SiteInteractions";
import Topbar from "@/components/Topbar";
import ClearCartOnPayment from "@/components/shop/ClearCartOnPayment";
import {
  getHitPayPaymentRequest,
  quotationIdFromHitPayReference,
  type HitPayPaymentRequest,
} from "@/lib/hitpay";
import { completeEvergreenPurchase } from "@/lib/evergreen-orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment Status | WaterSource",
  description: "Check the status of your WaterSource payment.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PaymentResultPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const reference = firstValue(query.reference);
  let payment: HitPayPaymentRequest | null = null;
  let loadError = false;
  let orderFinalized = false;

  if (reference && /^[a-zA-Z0-9-]{20,80}$/.test(reference)) {
    try {
      payment = await getHitPayPaymentRequest(reference);
      if (payment.status === "completed") {
        const quotationId = quotationIdFromHitPayReference(
          payment.reference_number,
        );
        const succeededPayment = payment.payments?.find(
          (entry) => entry.status === "succeeded",
        );
        if (!quotationId)
          throw new Error("Unknown WaterSource order reference.");
        await completeEvergreenPurchase({
          quotationId,
          mode: succeededPayment?.payment_type?.includes("paynow")
            ? "paynow"
            : "card",
          reference: succeededPayment?.id ?? payment.id,
          paidAt: succeededPayment?.created_at ?? new Date().toISOString(),
          customer: {
            name: payment.name,
            email: payment.email,
            phone: payment.phone,
          },
        });
        orderFinalized = true;
      }
    } catch (error) {
      console.error("Could not verify HitPay return", error);
      loadError = true;
    }
  }

  const completed = payment?.status === "completed";
  const pending = payment?.status === "pending";

  return (
    <>
      <Topbar />
      <Header />
      <main className="ws-payment-result-page">
        <section className="ws-payment-result-card">
          {completed && payment ? (
            <>
              <ClearCartOnPayment />
              <span className="ws-success-mark">✓</span>
              <p className="eyebrow">Payment confirmed</p>
              <h1>Thank you for your purchase.</h1>
              <p>
                HitPay confirmed your payment of {payment.amount} SGD. Your
                Evergreen customer, invoice, and sales history have been
                {orderFinalized
                  ? " created successfully"
                  : " queued for finalization"}
                .
              </p>
              <b>Reference: {payment.reference_number}</b>
            </>
          ) : pending ? (
            <>
              <span className="ws-payment-pending">•••</span>
              <p className="eyebrow">Payment pending</p>
              <h1>We’re waiting for confirmation.</h1>
              <p>
                HitPay has not confirmed this payment yet. PayNow confirmation
                can take a little longer; you can refresh this page shortly.
              </p>
            </>
          ) : (
            <>
              <span className="ws-payment-failed">!</span>
              <p className="eyebrow">Payment not completed</p>
              <h1>
                {loadError
                  ? "We couldn’t verify this payment."
                  : "Your order is still unpaid."}
              </h1>
              <p>
                No customer sale or sales-history entry has been created. Return
                to the shop to try again, or contact WaterSource if you were
                charged.
              </p>
            </>
          )}
          <div className="ws-payment-actions">
            {pending && reference && (
              <Link
                href={`/shop/payment-result?reference=${encodeURIComponent(reference)}`}
              >
                Refresh status
              </Link>
            )}
            <Link href="/shop">Return to shop</Link>
            <a href="https://wa.me/6588606951" rel="noreferrer" target="_blank">
              Contact WaterSource
            </a>
          </div>
        </section>
      </main>
      <Footer />
      <SiteInteractions />
    </>
  );
}
