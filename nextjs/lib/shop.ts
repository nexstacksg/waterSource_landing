export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://evergreen-api.nexstack.sg";

export type ProductSpec = {
  header: string;
  body: string;
};

export type ShopProduct = {
  id: number;
  name: string;
  category: string | null;
  shortDescription: string | null;
  fullDescription: string | null;
  modelNumber: string | null;
  purchasePrice: string | null;
  imageUrl: string | null;
  imageUrlsJson: string[];
  specsJson: ProductSpec[];
  warrantySummary: string | null;
  active: boolean;
};

export type CartItem = {
  productId: number;
  quantity: number;
};

export function parsePrice(price: string | null) {
  if (!price) return 0;
  const parsed = Number(price.replace(/[^0-9.-]+/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getProductImages(product: ShopProduct) {
  return Array.from(
    new Set(
      [product.imageUrl, ...(product.imageUrlsJson ?? [])].filter(Boolean),
    ),
  ) as string[];
}
