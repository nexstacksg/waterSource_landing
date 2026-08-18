import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ShopClient from "@/components/shop/ShopClient";
import SiteInteractions from "@/components/SiteInteractions";
import Topbar from "@/components/Topbar";

export const metadata: Metadata = {
  title: "Shop WaterSource | Water Purifiers & Ionizers",
  description:
    "Browse WaterSource water purifiers and ionizers, compare product details, and submit a purchase request online.",
};

export default function ShopPage() {
  return (
    <>
      <Topbar />
      <Header />
      <main className="ws-shop-page" id="top">
        <ShopClient />
      </main>
      <Footer />
      <SiteInteractions />
    </>
  );
}
