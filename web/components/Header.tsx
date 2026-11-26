import Link from "next/link";
import SectionLink from "./SectionLink";

export default function Header() {
  return (
    <>
      <header>
        <div className="wrap nav">
          <Link className="brand" href="/">
            <img
              alt="WaterSource logo"
              src="https://wp.watersource.com.sg/wp-content/uploads/2022/08/logo.png"
            />
          </Link>
          <nav className="links">
            <SectionLink href="/#programs">Who is this for</SectionLink>
            <SectionLink href="/#hidden-problem">About</SectionLink>
            <SectionLink href="/#founder">Founder</SectionLink>
            <SectionLink href="/#method">Method</SectionLink>
            <SectionLink href="/#bonus">Bonuses</SectionLink>
            <Link href="/shop">Shop</Link>
            <SectionLink href="/#consultation">Consultation</SectionLink>
          </nav>
          <div className="nav-cta">
            <SectionLink className="btn dark" href="/#consultation">
              Speak to a WaterSource specialist
            </SectionLink>
          </div>
        </div>
      </header>
    </>
  );
}
