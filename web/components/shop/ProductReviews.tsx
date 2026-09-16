import type { ReviewsState } from "./useProductReviews";
import ProductReviewForm from "./ProductReviewForm";
import type { ProductReview } from "@/lib/product-reviews";

export default function ProductReviews({
  productId,
  state,
  detailed = false,
  onCreated,
}: {
  productId: number;
  state: ReviewsState;
  detailed?: boolean;
  onCreated?: (review: ProductReview) => void;
}) {
  const reviews = state.data.filter((review) => review.productId === productId);
  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;
  const message =
    state.status === "loading"
      ? "Loading reviews…"
      : state.status === "error"
        ? "Reviews temporarily unavailable."
        : "No customer reviews yet.";
  return (
    <div className={detailed ? "ws-product-reviews" : "ws-rating-summary"}>
      {detailed && <h3>Customer reviews &amp; ratings</h3>}
      {state.status !== "ready" || !reviews.length ? (
        <p className="ws-review-message" role="status">
          {message}
        </p>
      ) : (
        <>
          <div className="ws-rating-line">
            <span className="ws-review-stars" aria-hidden="true">
              ★
            </span>
            <b>{average.toFixed(1)} / 5</b>
            <span>
              ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
            </span>
          </div>
          {detailed && (
            <div className="ws-review-list">
              {reviews.map((review) => (
                <article className="ws-customer-review" key={review.id}>
                  <div>
                    <b>{review.reviewerName}</b>
                    <span
                      aria-label={`${review.rating} out of 5 stars`}
                      className="ws-review-stars"
                    >
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </span>
                  </div>
                  <p>{review.review}</p>
                </article>
              ))}
            </div>
          )}
        </>
      )}
      {detailed && (
        <ProductReviewForm
          key={productId}
          productId={productId}
          onCreated={onCreated}
        />
      )}
    </div>
  );
}
