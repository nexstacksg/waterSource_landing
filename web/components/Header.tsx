import Link from "next/link";

export default function Header() {
  return (
    <>
      <header>
        <div className="wrap nav">
          <Link className="brand" href="/">
            <img
              alt="WaterSource logo"
              src="https://watersource.com.sg/wp-content/uploads/2022/08/logo.png"
            />
          </Link>
          <nav className="links">
            <Link href="/#who">Who is this for</Link>
            <Link href="/#about">About</Link>
            <Link href="/#founder">Founder</Link>
            <Link href="/#method">Method</Link>
            <Link href="/#bonus">Bonuses</Link>
            <Link href="/shop">Shop</Link>
            <Link href="/#consultation">Consultation</Link>
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
