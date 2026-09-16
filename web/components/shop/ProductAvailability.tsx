import type { ShopProduct } from "@/lib/shop";

const labels = {
  in_stock: "In stock",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
  on_request: "Availability on request",
};

export default function ProductAvailability({
  product,
}: {
  product: ShopProduct;
}) {
  const count = product.stockCount;
  const hasCount =
    typeof count === "number" && Number.isFinite(count) && count >= 0;
  return (
    <div className="ws-product-availability">
      <span
        className={`ws-stock-status ws-stock-${product.stockStatus ?? "unknown"}`}
      >
        {product.stockStatus
          ? (labels[product.stockStatus] ?? "Availability unavailable")
          : "Availability unavailable"}
      </span>
      <span className="ws-stock-count">
        {hasCount ? `Stock count: ${count}` : "Stock count unavailable"}
      </span>
    </div>
  );
}
