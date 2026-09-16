import assert from "node:assert/strict";
import test from "node:test";
import { publicProductReviews } from "../lib/product-reviews";

test("only approved, valid reviews are public and private fields are removed", () => {
  const review = {
    id: 1,
    productId: 87,
    reviewerName: "Customer",
    rating: 4,
    review: "Good product",
    approved: true,
    reviewerEmail: "private@example.com",
    customerAccountId: 15,
  };
  assert.deepEqual(
    publicProductReviews([
      review,
      { ...review, id: 2, approved: false },
      { ...review, id: 3, rating: 6 },
      { ...review, id: 4, rating: 0 },
      null,
    ]),
    [
      {
        id: 1,
        productId: 87,
        reviewerName: "Customer",
        rating: 4,
        review: "Good product",
      },
    ],
  );
});
