"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  API_BASE_URL,
  formatPrice,
  getProductImages,
  parsePrice,
  type CartItem,
  type ShopProduct,
} from "@/lib/shop";

type CheckoutResult = {
  orderId: string | null;
  quotationId: number;
  total: number;
  paymentRequestId: string;
  paymentUrl: string;
};

const CART_STORAGE_KEY = "watersource-shop-cart";

export default function ShopClient() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All products");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartReady, setCartReady] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(
    null,
  );
  const [selectedImage, setSelectedImage] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const response = await fetch(`${API_BASE_URL}/products`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        if (!response.ok)
          throw new Error(`Product API returned ${response.status}`);
        const payload = (await response.json()) as { data?: ShopProduct[] };
        setProducts((payload.data ?? []).filter((product) => product.active));
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        console.error(error);
        setLoadError("We could not load the shop right now. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    void loadProducts();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    let savedItems: CartItem[] = [];
    try {
      const savedCart = window.localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) savedItems = JSON.parse(savedCart) as CartItem[];
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    }

    const hydrationTimer = window.setTimeout(() => {
      setCart(savedItems);
      setCartReady(true);
    }, 0);

    return () => window.clearTimeout(hydrationTimer);
  }, []);

  useEffect(() => {
    if (cartReady)
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart, cartReady]);

  useEffect(() => {
    const shouldLock = cartOpen || selectedProduct !== null;
    document.body.style.overflow = shouldLock ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen, selectedProduct]);

  const categories = useMemo(
    () =>
      [
        "All products",
        ...Array.from(
          new Set(products.map((product) => product.category).filter(Boolean)),
        ).sort(),
      ] as string[],
    [products],
  );

  const filteredProducts = useMemo(() => {
    const search = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory =
        category === "All products" || product.category === category;
      const matchesSearch =
        !search ||
        [
          product.name,
          product.category,
          product.shortDescription,
          product.modelNumber,
        ]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(search));
      return matchesCategory && matchesSearch;
    });
  }, [category, products, query]);

  const cartLines = useMemo(
    () =>
      cart
        .map((item) => {
          const product = products.find(
            (candidate) => candidate.id === item.productId,
          );
          return product ? { ...item, product } : null;
        })
        .filter(Boolean) as Array<CartItem & { product: ShopProduct }>,
    [cart, products],
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartLines.reduce(
    (sum, line) => sum + parsePrice(line.product.purchasePrice) * line.quantity,
    0,
  );

  function addToCart(productId: number) {
    setCart((current) => {
      const existing = current.find((item) => item.productId === productId);
      return existing
        ? current.map((item) =>
            item.productId === productId
              ? { ...item, quantity: Math.min(item.quantity + 1, 10) }
              : item,
          )
        : [...current, { productId, quantity: 1 }];
    });
    setCartOpen(true);
    setSelectedProduct(null);
  }

  function updateQuantity(productId: number, quantity: number) {
    setCart((current) =>
      quantity < 1
        ? current.filter((item) => item.productId !== productId)
        : current.map((item) =>
            item.productId === productId
              ? { ...item, quantity: Math.min(quantity, 10) }
              : item,
          ),
    );
  }

  function openProduct(product: ShopProduct) {
    setSelectedImage(0);
    setSelectedProduct(product);
  }

  async function submitCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setCheckoutError("");
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: form.get("name"),
            email: form.get("email"),
            phone: form.get("phone"),
            location: form.get("location"),
            notes: form.get("notes"),
          },
          items: cart,
        }),
      });
      const payload = (await response.json()) as CheckoutResult & {
        error?: string;
      };
      if (!response.ok)
        throw new Error(payload.error || "Could not submit your request.");
      if (!payload.paymentUrl)
        throw new Error("HitPay checkout is unavailable.");
      window.localStorage.setItem(
        "watersource-pending-payment",
        JSON.stringify({
          orderId: payload.orderId,
          quotationId: payload.quotationId,
          paymentRequestId: payload.paymentRequestId,
          total: payload.total,
        }),
      );
      window.location.assign(payload.paymentUrl);
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Could not submit your request.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const detailImages = selectedProduct ? getProductImages(selectedProduct) : [];

  return (
    <>
      <section className="ws-shop-hero">
        <div className="wrap ws-shop-hero-grid">
          <div>
            <span className="ws-shop-kicker">
              Water, designed around your life
            </span>
            <h1>Find your WaterSource.</h1>
            <p>
              Compare our water purifiers and ionizers, then pay securely online
              through HitPay using PayNow or card.
            </p>
          </div>
          <div className="ws-shop-promise">
            <span>01</span>
            <div>
              <b>Choose your system</b>
              <small>Explore benefits, images, and specifications.</small>
            </div>
            <span>02</span>
            <div>
              <b>Pay securely with HitPay</b>
              <small>Choose PayNow or card on HitPay’s hosted checkout.</small>
            </div>
            <span>03</span>
            <div>
              <b>Complete your purchase</b>
              <small>
                Verified payment creates your customer and sale record.
              </small>
            </div>
          </div>
        </div>
      </section>

      <section className="ws-shop-catalog">
        <div className="wrap">
          <div className="ws-shop-toolbar">
            <div>
              <p className="eyebrow">The collection</p>
              <h2>Shop functional water systems</h2>
            </div>
            <button
              className="ws-cart-button"
              onClick={() => setCartOpen(true)}
              type="button"
            >
              <CartIcon /> Cart <span>{cartCount}</span>
            </button>
          </div>

          <div className="ws-shop-filters">
            <label className="ws-shop-search">
              <span className="sr-only">Search products</span>
              <SearchIcon />
              <input
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by product or model"
                type="search"
                value={query}
              />
            </label>
            <div className="ws-shop-categories" aria-label="Product categories">
              {categories.map((item) => (
                <button
                  className={category === item ? "is-active" : ""}
                  key={item}
                  onClick={() => setCategory(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="ws-shop-state">
              <span className="ws-spinner" />
              Loading live products…
            </div>
          ) : loadError ? (
            <div className="ws-shop-state ws-shop-error">
              <b>Something went wrong.</b>
              <p>{loadError}</p>
              <button onClick={() => window.location.reload()} type="button">
                Try again
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="ws-shop-state">
              <b>No products found.</b>
              <p>Try another search or category.</p>
            </div>
          ) : (
            <div className="ws-shop-grid">
              {filteredProducts.map((product) => {
                const image = getProductImages(product)[0];
                return (
                  <article className="ws-product-card" key={product.id}>
                    <button
                      className="ws-product-image"
                      onClick={() => openProduct(product)}
                      type="button"
                    >
                      {image ? (
                        <img alt={product.name} src={image} />
                      ) : (
                        <span>No image available</span>
                      )}
                      <small>View details</small>
                    </button>
                    <div className="ws-product-body">
                      <div className="ws-product-meta">
                        <span>{product.category || "Water system"}</span>
                        {product.modelNumber && (
                          <span>{product.modelNumber}</span>
                        )}
                      </div>
                      <h3>{product.name}</h3>
                      <p>
                        {product.shortDescription ||
                          "Contact us for product details."}
                      </p>
                      <div className="ws-product-buy">
                        <b>{product.purchasePrice || "Enquire for price"}</b>
                        <button
                          disabled={!product.purchasePrice}
                          onClick={() => addToCart(product.id)}
                          type="button"
                        >
                          Add to cart <span>+</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {selectedProduct && (
        <div
          className="ws-modal-backdrop"
          onMouseDown={() => setSelectedProduct(null)}
        >
          <section
            aria-label={`${selectedProduct.name} details`}
            aria-modal="true"
            className="ws-product-modal"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
          >
            <button
              className="ws-close"
              onClick={() => setSelectedProduct(null)}
              type="button"
              aria-label="Close details"
            >
              ×
            </button>
            <div className="ws-product-gallery">
              <div className="ws-gallery-main">
                {detailImages[selectedImage] ? (
                  <img
                    alt={selectedProduct.name}
                    src={detailImages[selectedImage]}
                  />
                ) : (
                  <span>No image available</span>
                )}
              </div>
              {detailImages.length > 1 && (
                <div className="ws-gallery-thumbs">
                  {detailImages.slice(0, 6).map((image, index) => (
                    <button
                      className={selectedImage === index ? "is-active" : ""}
                      key={image}
                      onClick={() => setSelectedImage(index)}
                      type="button"
                    >
                      <img
                        alt={`${selectedProduct.name} view ${index + 1}`}
                        src={image}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="ws-product-detail">
              <p className="eyebrow">
                {selectedProduct.category || "WaterSource"}
              </p>
              <h2>{selectedProduct.name}</h2>
              <b className="ws-detail-price">
                {selectedProduct.purchasePrice || "Enquire for price"}
              </b>
              <p>
                {selectedProduct.fullDescription ||
                  selectedProduct.shortDescription}
              </p>
              {selectedProduct.specsJson?.length > 0 && (
                <dl className="ws-specs">
                  {selectedProduct.specsJson.slice(0, 8).map((spec) => (
                    <div key={`${spec.header}-${spec.body}`}>
                      <dt>{spec.header}</dt>
                      <dd>{spec.body}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {selectedProduct.warrantySummary && (
                <p className="ws-warranty">
                  <b>Warranty</b>
                  {selectedProduct.warrantySummary}
                </p>
              )}
              <button
                className="ws-primary-button"
                disabled={!selectedProduct.purchasePrice}
                onClick={() => addToCart(selectedProduct.id)}
                type="button"
              >
                Add to cart ·{" "}
                {selectedProduct.purchasePrice || "Price unavailable"}
              </button>
            </div>
          </section>
        </div>
      )}

      {cartOpen && (
        <div
          className="ws-drawer-backdrop"
          onMouseDown={() => setCartOpen(false)}
        >
          <aside
            className="ws-cart-drawer"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="ws-cart-head">
              <div>
                <p className="eyebrow">Your selection</p>
                <h2>{checkoutOpen ? "Purchase details" : "Your cart"}</h2>
              </div>
              <button
                className="ws-close"
                onClick={() => setCartOpen(false)}
                type="button"
                aria-label="Close cart"
              >
                ×
              </button>
            </div>

            {checkoutOpen ? (
              <form className="ws-checkout-form" onSubmit={submitCheckout}>
                <button
                  className="ws-back-button"
                  onClick={() => setCheckoutOpen(false)}
                  type="button"
                >
                  ← Back to cart
                </button>
                <p className="ws-checkout-note">
                  You’ll continue to HitPay’s secure checkout to complete
                  payment by PayNow or card.
                </p>
                <label>
                  Full name
                  <input autoComplete="name" name="name" required />
                </label>
                <label>
                  Email
                  <input
                    autoComplete="email"
                    name="email"
                    required
                    type="email"
                  />
                </label>
                <label>
                  Phone
                  <input autoComplete="tel" name="phone" required type="tel" />
                </label>
                <label>
                  Delivery area or postal code
                  <input autoComplete="postal-code" name="location" />
                </label>
                <label>
                  Anything we should know?
                  <textarea name="notes" rows={3} />
                </label>
                {checkoutError && (
                  <p className="ws-form-error" role="alert">
                    {checkoutError}
                  </p>
                )}
                <div className="ws-checkout-total">
                  <span>Estimated total</span>
                  <b>{formatPrice(cartTotal)}</b>
                </div>
                <button
                  className="ws-primary-button"
                  disabled={submitting}
                  type="submit"
                >
                  {submitting ? "Opening HitPay…" : "Pay securely with HitPay"}
                </button>
                <small>
                  Payment is recorded only after HitPay securely confirms it.
                </small>
              </form>
            ) : cartLines.length === 0 ? (
              <div className="ws-empty-cart">
                <CartIcon />
                <h3>Your cart is ready for something good.</h3>
                <p>Add a WaterSource system to begin.</p>
                <button onClick={() => setCartOpen(false)} type="button">
                  Continue shopping
                </button>
              </div>
            ) : (
              <>
                <div className="ws-cart-lines">
                  {cartLines.map(({ product, quantity }) => (
                    <article className="ws-cart-line" key={product.id}>
                      <div className="ws-cart-image">
                        {getProductImages(product)[0] && (
                          <img alt="" src={getProductImages(product)[0]} />
                        )}
                      </div>
                      <div>
                        <b>{product.name}</b>
                        <small>{product.purchasePrice}</small>
                        <div className="ws-quantity">
                          <button
                            onClick={() =>
                              updateQuantity(product.id, quantity - 1)
                            }
                            type="button"
                          >
                            −
                          </button>
                          <span>{quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(product.id, quantity + 1)
                            }
                            type="button"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        className="ws-remove"
                        onClick={() => updateQuantity(product.id, 0)}
                        type="button"
                        aria-label={`Remove ${product.name}`}
                      >
                        Remove
                      </button>
                    </article>
                  ))}
                </div>
                <div className="ws-cart-summary">
                  <div>
                    <span>Estimated total</span>
                    <b>{formatPrice(cartTotal)}</b>
                  </div>
                  <p>Secure payment by PayNow or card is handled by HitPay.</p>
                  <button
                    className="ws-primary-button"
                    onClick={() => setCheckoutOpen(true)}
                    type="button"
                  >
                    Continue to purchase
                  </button>
                  <button
                    className="ws-text-button"
                    onClick={() => setCartOpen(false)}
                    type="button"
                  >
                    Continue shopping
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </>
  );
}

function CartIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20 8H6.1M10 20a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm8 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m16 16 4 4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
