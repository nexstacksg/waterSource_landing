"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import type { ProductReview } from "@/lib/product-reviews";

export default function ProductReviewForm({
  productId,
  onCreated,
}: {
  productId: number;
  onCreated?: (review: ProductReview) => void;
}) {
  const [auth, setAuth] = useState<"loading" | "signed-in" | "guest" | "error">(
    "loading",
  );
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/customer-auth/me", { signal: controller.signal })
      .then(async (response) => {
        if (response.status === 401) {
          setAuth("guest");
          return;
        }
        if (!response.ok) throw new Error("Account unavailable");
        const payload = await response.json();
        const customer =
          payload.data?.customer ?? payload.data ?? payload.customer;
        setAuth(customer?.id ? "signed-in" : "guest");
      })
      .catch(() => {
        if (!controller.signal.aborted) setAuth("error");
      });
    return () => controller.abort();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/shop/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, review }),
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error || "Could not submit your review.");
      onCreated?.(payload.data);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not submit your review.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (auth === "loading")
    return <p className="ws-review-message">Checking your account…</p>;
  if (auth === "error")
    return (
      <p className="ws-review-message">
        We couldn’t check your account. Reopen the product to try again.
      </p>
    );
  if (auth === "guest")
    return (
      <p className="ws-review-signin">
        <Link href="/portal/login?next=shop">Sign in</Link> to leave a review.
      </p>
    );
  if (success)
    return (
      <p className="ws-review-success" role="status">
        Thank you! Your review is now published.
      </p>
    );
  return (
    <form className="ws-review-form" onSubmit={submit}>
      <h4>Write a review</h4>
      <fieldset disabled={submitting}>
        <legend>Your rating</legend>
        <div className="ws-rating-options">
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value}>
              <input
                type="radio"
                name="rating"
                value={value}
                checked={rating === value}
                onChange={() => setRating(value)}
                required
              />
              <span>
                {value} <span aria-hidden="true">★</span>
                <span className="sr-only"> out of 5 stars</span>
              </span>
            </label>
          ))}
        </div>
        <label className="ws-review-text">
          Your review
          <textarea
            value={review}
            onChange={(event) => setReview(event.target.value)}
            maxLength={5000}
            required
            rows={4}
            placeholder="Share your experience with this product"
          />
        </label>
        <button
          className="ws-primary-button"
          disabled={!rating || !review.trim()}
          type="submit"
        >
          {submitting ? "Submitting…" : "Submit review"}
        </button>
      </fieldset>
      {error && (
        <p className="ws-form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
