import Link from "next/link";
import type { ReactNode } from "react";

export default function PortalShell({
  active,
  children,
}: {
  active: "overview" | "orders" | "address";
  children: ReactNode;
}) {
  return (
    <main className="portal-page">
      <div className="portal-shell">
        <aside className="portal-sidebar">
          <Link className="portal-mark" href="/portal">
            <span>W</span>
            <b>WaterSource</b>
          </Link>
          <p className="portal-sidebar-label">Your account</p>
          <nav aria-label="Portal navigation" className="portal-nav">
            <Link className={active === "overview" ? "is-active" : ""} href="/portal">Overview</Link>
            <Link className={active === "orders" ? "is-active" : ""} href="/portal/orders">Order history</Link>
            <Link className={active === "address" ? "is-active" : ""} href="/portal/address">Delivery address</Link>
          </nav>
          <Link className="portal-sidebar-shop" href="/shop">Continue shopping <span>↗</span></Link>
        </aside>
        <section className="portal-content">{children}</section>
      </div>
    </main>
  );
}
