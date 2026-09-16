"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import HeaderAccount from "@/components/HeaderAccount";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function updateMenuHeight() {
      const header = headerRef.current;
      if (header) {
        header.style.setProperty(
          "--menu-height",
          `${Math.max(0, window.innerHeight - header.getBoundingClientRect().bottom)}px`,
        );
      }
    }
    updateMenuHeight();
    window.addEventListener("scroll", updateMenuHeight, { passive: true });
    window.addEventListener("resize", updateMenuHeight);
    const observer = new ResizeObserver(updateMenuHeight);
    const topbar = document.querySelector(".topbar");
    if (topbar) observer.observe(topbar);
    return () => {
      window.removeEventListener("scroll", updateMenuHeight);
      window.removeEventListener("resize", updateMenuHeight);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    function closeMenuOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && menuOpen) {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    }
    const desktop = window.matchMedia("(width > 768px)");
    function close() {
      setMenuOpen(false);
    }
    function outside(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) close();
    }
    document.addEventListener("keydown", closeMenuOnEscape);
    document.addEventListener("pointerdown", outside);
    desktop.addEventListener("change", close);
    window.addEventListener("hashchange", close);
    return () => {
      document.removeEventListener("keydown", closeMenuOnEscape);
      document.removeEventListener("pointerdown", outside);
      desktop.removeEventListener("change", close);
      window.removeEventListener("hashchange", close);
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <header
        className="site-header"
        ref={headerRef}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) closeMenu();
        }}
      >
        <div className="site-header-inner">
          <Link className="site-brand" href="/" onClick={closeMenu}>
            <img
              alt="WaterSource logo"
              src="https://watersource.com.sg/wp-content/uploads/2022/08/logo.png"
            />
          </Link>
          <button
            ref={toggleRef}
            aria-controls="main-navigation"
            aria-expanded={menuOpen}
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            className="site-menu-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            <span />
            <span />
            <span />
          </button>
          <nav
            aria-label="Main navigation"
            className={`site-navigation${menuOpen ? " is-open" : ""}`}
            id="main-navigation"
          >
            <Link href="/#programs" onClick={closeMenu}>
              Explore
            </Link>
            <Link href="/#proof" onClick={closeMenu}>
              About
            </Link>
            <Link href="/#founder" onClick={closeMenu}>
              Founder
            </Link>
            <Link href="/#method" onClick={closeMenu}>
              Method
            </Link>
            <Link href="/#products" onClick={closeMenu}>
              Our system
            </Link>
            <Link href="/shop" onClick={closeMenu}>
              Shop
            </Link>
            <Link
              className="site-consultation"
              href="/#consultation"
              onClick={closeMenu}
            >
              Speak to a specialist <span aria-hidden="true">↗</span>
            </Link>
          </nav>
          <HeaderAccount onOpen={closeMenu} />
        </div>
      </header>
    </>
  );
}
