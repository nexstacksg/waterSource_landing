"use client";

import { useEffect, useState } from "react";
import type { ProductReview } from "@/lib/product-reviews";

export type ReviewsState = {
  status: "loading" | "ready" | "error";
  data: ProductReview[];
};

export function useProductReviews() {
  const [state, setState] = useState<ReviewsState>({
    status: "loading",
    data: [],
  });
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/shop/reviews", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Reviews unavailable");
        const payload = await response.json();
        if (!Array.isArray(payload.data)) throw new Error("Invalid reviews");
        setState({ status: "ready", data: payload.data });
      } catch {
        if (!controller.signal.aborted) setState({ status: "error", data: [] });
      }
    }
    void load();
    return () => controller.abort();
  }, []);
  function addReview(review: ProductReview) {
    setState((current) => ({
      status: "ready",
      data: [review, ...current.data.filter((item) => item.id !== review.id)],
    }));
  }
  return { ...state, addReview };
}
