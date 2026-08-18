export default function Hero() {
  return (
    <>
      <section className="hero">
        <div aria-hidden="true" className="hero-collage">
          <img
            alt=""
            src="https://watersource.com.sg/wp-content/uploads/2022/09/Customers-Gathering-Oct-2014-01.jpg"
          />
          <img
            alt=""
            src="https://watersource.com.sg/wp-content/uploads/2022/09/Enterprise-Award-April-2014-03.jpg"
          />
          <img alt="" src="/assets/hero-water-glasses.jpg" />
          <img
            alt=""
            src="https://watersource.com.sg/wp-content/uploads/2023/02/watersource-1080-template-38-800x800.png"
          />
          <img
            alt=""
            src="https://watersource.com.sg/wp-content/uploads/2021/08/drinks-18.jpg"
          />
          <img
            alt=""
            src="https://sgvisionaries.com/wp-content/uploads/2025/05/img-20250526-wa0013.jpg"
          />
          <img
            alt=""
            src="https://watersource.com.sg/wp-content/uploads/2023/10/GEM-9090NT-Turbo-Alkaline-Hydrogen-Functional-Water-Ionizer-1-430x430.jpg"
          />
          <img
            alt=""
            src="https://watersource.com.sg/wp-content/uploads/2023/10/GEM-9000-Turbo-Under-Sink-9-Plates-1-430x430.jpg"
          />
          <img
            alt=""
            src="https://watersource.com.sg/wp-content/uploads/2022/09/H001-Alkaline-Hydrogen-Rich-Water-Purifier-1.jpg"
          />
          <img
            alt=""
            src="https://watersource.com.sg/wp-content/uploads/2023/01/169-presentation-size-4.jpg"
          />
          <img
            alt=""
            src="https://watersource.com.sg/wp-content/uploads/2022/09/Enterprise-Award-April-2014-01.jpg"
          />
          <img
            alt=""
            src="https://watersource.com.sg/wp-content/uploads/2023/01/169-presentation-size-3.jpg"
          />
        </div>
        <div className="wrap hero-inner">
          <div className="hero-copy">
            <h1>
              Step Into
              <br />
              The Water Your
              <br />
              Body Was
              <br />
              <span>Designed For.</span>
            </h1>
            <p className="lead">
              After decades of searching for better wellness solutions,
              WaterSource was created to help people reconnect with what the
              body naturally needs most — cleaner, functional, hydrogen-rich
              water that supports hydration, balance, and renewed daily energy.
            </p>
            <div className="hero-benefit-panel">
              <div className="benefit-mini">
                <b>Hydrate</b>
                <ul>
                  <li>Delivers deep cellular hydration</li>
                  <li>Provides oxygen and vital nutrients</li>
                  <li>Eliminates metabolic waste and toxins</li>
                </ul>
              </div>
              <div className="benefit-mini">
                <b>Energize</b>
                <ul>
                  <li>Stimulates mitochondria</li>
                  <li>Boosts energy production</li>
                  <li>Peak cell performance</li>
                </ul>
              </div>
              <div className="benefit-mini">
                <b>Renew</b>
                <ul>
                  <li>Repairs damaged cells</li>
                  <li>Supports cellular regeneration</li>
                  <li>Slows aging</li>
                </ul>
              </div>
              <div className="benefit-mini">
                <b>Protect</b>
                <ul>
                  <li>Prevent oxidative damage</li>
                  <li>Slows cellular aging</li>
                  <li>Reduces inflammation</li>
                </ul>
              </div>
            </div>
            <div className="hero-specialist-cta">
              <a className="btn blue" href="#consultation">
                Speak with a WaterSource specialist →
              </a>
            </div>
          </div>
          <div className="showcase visual-board">
            <div className="hero-feature-board">
              <img
                alt="WaterSource hydration lifestyle moment by the water"
                src="/assets/water.png"
              />
              <div className="feature-caption">
                <h3>
                  Better water.
                  <br />
                  Better wellness.
                  <br />
                  <span>Better you.</span>
                </h3>
                <p>
                  Upgrade the water your
                  <br />
                  body truly deserves
                </p>
              </div>
            </div>
            <div className="hero-offer-strip">
              <div>
                <span className="tag">Transformation consultation</span>
                <b>WaterSource Wellness Journey</b>
                <ul className="hero-offer-points">
                  <li>Quality check of your drinking water</li>
                  <li>Comparing different water qualities</li>
                  <li>
                    Revealing health changes in the body before and after
                    drinking water
                  </li>
                </ul>
              </div>
              <div className="hero-offer-price">
                <s>$399</s>
                <strong>$0</strong>
                <span>Intro Session</span>
              </div>
              <div className="hero-offer-action">
                <a className="btn orange" href="#consultation">
                  Reserve Consultation
                </a>
                <p className="hero-offer-note">
                  No obligation · 100% personalised
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
