export default function Products() {
  return (
    <>
      <section
        className="section products products-match h001-product"
        id="products"
      >
        <div className="wrap center products-head">
          <p className="eyebrow">H001 flagship system</p>
          <h2>
            H001 High-Concentration Hydrogen with Essential Minerals Healthy
            Water Machine
          </h2>
          <p className="lead">
            Designed for those who prioritize true health and quality living.
          </p>
        </div>

        <div className="wrap h001-showcase">
          <div className="h001-media">
            <span className="featured-label">Featured H001</span>
            <img
              alt="H001 High-Concentration Hydrogen with Essential Minerals Healthy Water Machine"
              src="/assets/PHOTO-2026-05-31-09-49-36.jpg"
            />
          </div>

          <div className="h001-copy">
            <p className="h001-kicker">Our unique core benefits</p>
            <h3>
              Fresh hydrogen-rich water, produced on demand for every sip.
            </h3>
            <div className="h001-price" aria-label="Hydrogen price">
              <span>Hydrogen</span>
              <div>
                <del>$3,388.00</del>
                <strong>$2,888.00</strong>
              </div>
            </div>
            <p>
              The only system that selectively neutralizes harmful free
              radicals, converting toxins into water for natural elimination,
              protecting health, maintaining an elegant figure, promoting
              radiant skin, slowing aging, and supporting longevity.
            </p>

            <ul className="h001-benefits">
              <li>Repairing damaged cells</li>
              <li>Reducing cell degeneration</li>
              <li>Boosting cell renewal</li>
              <li>Balancing organ functions</li>
              <li>Activating self-healing abilities</li>
              <li>Easing inflammation and discomfort</li>
            </ul>

            <div className="h001-temperatures">
              <h4>6 temperatures designed for every moment</h4>
              <ul>
                <li>
                  <b>Morning:</b> Warm hydrogen water to start your day
                  energized.
                </li>
                <li>
                  <b>Post-workout:</b> Accelerate recovery with
                  high-concentration hydrogen water.
                </li>
                <li>
                  <b>Afternoon:</b> Ideal temperature for premium tea or
                  barista-grade coffee.
                </li>
                <li>
                  Enhance metabolism to help maintain energy all day long.
                </li>
                <li>
                  Protecting the whole family and ensuring a healthy, happy
                  life.
                </li>
              </ul>
            </div>

            <p className="h001-close">
              Always fresh, always potent: hydrogen produced on demand for
              maximum effectiveness with every sip.
            </p>

            <p className="h001-close">
              <b>Elevate your lifestyle.</b> Choose H001, more than a purified
              water machine, your gateway to better health and a higher quality
              of life. Wellness redefined for the exceptional you.
            </p>

            <a className="btn" href="#consultation">
              Book H001 Consultation
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
