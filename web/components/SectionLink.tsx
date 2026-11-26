"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type SectionLinkProps = {
  href: `#${string}` | `/#${string}`;
  className?: string;
  children: ReactNode;
};

export default function SectionLink({
  href,
  className,
  children,
}: SectionLinkProps) {
  return (
    <Link
      className={className}
      href={href}
      onNavigate={(event) => {
        if (window.location.pathname !== "/") return;

        const hash = href.startsWith("/") ? href.slice(1) : href;
        const section = document.getElementById(hash.slice(1));
        if (!section) return;

        event.preventDefault();
        if (window.location.hash !== hash) {
          window.history.pushState(null, "", hash);
        }

        if (!section.hasAttribute("tabindex")) section.tabIndex = -1;
        section.focus({ preventScroll: true });
        section.scrollIntoView({ block: "start" });
      }}
    >
      {children}
    </Link>
  );
}
