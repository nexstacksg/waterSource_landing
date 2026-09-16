import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/shop";
import { publicProductReviews } from "@/lib/product-reviews";
import { getCustomer } from "@/lib/customer-auth";

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Expected JSON." }, { status: 415 });
  }
  try {
    const customer = await getCustomer();
    if (!customer)
      return NextResponse.json(
        { error: "Please sign in to leave a review." },
        { status: 401 },
      );
    const body = await request.json().catch(() => null);
    if (
      !body ||
      !Number.isInteger(body.productId) ||
      body.productId <= 0 ||
      !Number.isInteger(body.rating) ||
      body.rating < 1 ||
      body.rating > 5 ||
      typeof body.review !== "string" ||
      !body.review.trim() ||
      body.review.trim().length > 5000
    ) {
      return NextResponse.json(
        {
          error:
            "Choose a rating and enter a review of up to 5,000 characters.",
        },
        { status: 400 },
      );
    }
    const product = await fetch(`${API_BASE_URL}/products/${body.productId}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!product.ok)
      return NextResponse.json(
        { error: "This product is unavailable." },
        { status: 400 },
      );
    const payload = await product.json();
    if (!payload.data?.active)
      return NextResponse.json(
        { error: "This product is unavailable." },
        { status: 400 },
      );
    const response = await fetch(`${API_BASE_URL}/product-reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        productId: body.productId,
        customerAccountId: customer.id,
        reviewerName:
          [customer.firstName, customer.lastName].filter(Boolean).join(" ") ||
          "WaterSource customer",
        reviewerEmail: customer.email,
        rating: body.rating,
        review: body.review.trim(),
        approved: true,
      }),
    });
    if (!response.ok) throw new Error("Review submission failed");
    const created = await response.json();
    const [review] = publicProductReviews([created.data]);
    if (!review) throw new Error("Invalid review response");
    return NextResponse.json(
      { message: "Thank you! Your review is now published.", data: review },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "We could not submit your review. Please try again." },
      { status: 502 },
    );
  }
}

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/product-reviews`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Reviews unavailable");
    const payload = await response.json();
    if (!Array.isArray(payload.data)) throw new Error("Invalid reviews");
    return NextResponse.json({ data: publicProductReviews(payload.data) });
  } catch {
    return NextResponse.json(
      { error: "Reviews are temporarily unavailable." },
      { status: 502 },
    );
  }
}
