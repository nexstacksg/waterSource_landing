export type ProductReview = {
  id: number;
  productId: number;
  reviewerName: string;
  rating: number;
  review: string;
};

export function publicProductReviews(rows: unknown[]): ProductReview[] {
  return rows.flatMap((value) => {
    if (!value || typeof value !== "object") return [];
    const row = value as Record<string, unknown>;
    if (
      row.approved !== true ||
      !Number.isInteger(row.id) ||
      !Number.isInteger(row.productId) ||
      typeof row.rating !== "number" ||
      !Number.isInteger(row.rating) ||
      row.rating < 1 ||
      row.rating > 5 ||
      typeof row.reviewerName !== "string" ||
      typeof row.review !== "string"
    )
      return [];
    return [
      {
        id: row.id as number,
        productId: row.productId as number,
        reviewerName: row.reviewerName,
        rating: row.rating,
        review: row.review,
      },
    ];
  });
}
