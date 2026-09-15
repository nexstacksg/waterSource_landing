"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function closeMenuOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("keydown", closeMenuOnEscape);
    return () => document.removeEventListener("keydown", closeMenuOnEscape);
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <header>
        <div className="wrap nav">
          <Link className="brand" href="/" onClick={closeMenu}>
            <img
              alt="WaterSource logo"
              src="https://watersource.com.sg/wp-content/uploads/2022/08/logo.png"
            />
          </Link>
          <button
            aria-controls="main-navigation"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            className={`mobile-menu-toggle${menuOpen ? " is-open" : ""}`}
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            <span />
            <span />
            <span />
          </button>
          <nav
            aria-label="Main navigation"
            className={`links${menuOpen ? " is-open" : ""}`}
            id="main-navigation"
          >
            <Link href="/#who" onClick={closeMenu}>Who is this for</Link>
            <Link href="/#about" onClick={closeMenu}>About</Link>
            <Link href="/#founder" onClick={closeMenu}>Founder</Link>
            <Link href="/#method" onClick={closeMenu}>Method</Link>
            <Link href="/#bonus" onClick={closeMenu}>Bonuses</Link>
            <Link href="/shop" onClick={closeMenu}>Shop</Link>
            <Link href="/#consultation" onClick={closeMenu}>Consultation</Link>
          </nav>
          <div className="nav-cta">
            <Link className="btn dark" href="/#consultation">
              Speak to a WaterSource specialist
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
