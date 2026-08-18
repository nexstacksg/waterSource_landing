export default function Programs() {
  return (
    <>
      <section className="section programs" id="programs">
        <div className="wrap center program-carousel-head">
          <p className="eyebrow">Discover the WaterSource experience</p>
          <h2>Functional water journeys for every lifestyle</h2>
          <p
            className="lead"
            style={{ maxWidth: "760px", margin: "18px auto 0" }}
          >
            Explore the key experiences behind WaterSource — from hydrogen-rich
            daily drinking and founder-led education to live demonstrations, AI
            wellness checks, home systems and real customer stories.
          </p>
          <div className="program-nav" aria-label="Program carousel controls">
            <button aria-label="Previous WaterSource experience">‹</button>
            <button aria-label="Next WaterSource experience">›</button>
          </div>
        </div>
        <div className="marquee-wrap">
          <div className="marquee-track">
            <div className="program-tile">
              <img
                alt="Mrs Wee founder portrait"
                src="https://watersource.com.sg/wp-content/uploads/2023/02/watersource-1080-template-38-800x800.png"
              />
              <b>Meet Mrs Wee's Water Mission</b>
              <span>Founder Journey</span>
            </div>
            <div className="program-tile">
              <img
                alt="GEM 9000"
                src="https://watersource.com.sg/wp-content/uploads/2023/10/GEM-9000-Turbo-Under-Sink-9-Plates-1-430x430.jpg"
              />
              <b>Upgrade Your Home Water</b>
              <span>Home Wellness</span>
            </div>
            <div className="program-tile">
              <img
                alt="Awards"
                src="https://watersource.com.sg/wp-content/uploads/2022/09/Enterprise-Award-April-2014-03.jpg"
              />
              <b>Trusted Singapore Wellness</b>
              <span>Proof &amp; Recognition</span>
            </div>
            <div className="program-tile">
              <img
                alt="H001"
                src="https://watersource.com.sg/wp-content/uploads/2022/09/H001-Alkaline-Hydrogen-Rich-Water-Purifier-1-1-430x430.jpg"
              />
              <b>Experience Hydrogen-Rich Water</b>
              <span>Daily Drinking</span>
            </div>
            <div className="program-tile">
              <img
                alt="Customer gathering"
                src="https://watersource.com.sg/wp-content/uploads/2022/09/Customers-Gathering-Oct-2014-01.jpg"
              />
              <b>Free Live Water Demo</b>
              <span>Showroom Experience</span>
            </div>
            <div className="program-tile">
              <img
                alt="WaterSource consultation"
                src="https://sgvisionaries.com/wp-content/uploads/2025/05/img-20250526-wa0017.jpg"
              />
              <b>Try The AI Wellness Check</b>
              <span>Guided Assessment</span>
            </div>
            <div className="program-tile">
              <img
                alt="Customer wellness story"
                src="https://watersource.com.sg/wp-content/uploads/2023/01/169-presentation-size-4.jpg"
              />
              <b>Customer Wellness Stories</b>
              <span>Real Experiences</span>
            </div>
          </div>
        </div>
        <div className="program-dots" aria-label="Program carousel position">
          <span></span>
          <span></span>
          <span></span>
          <span className="active"></span>
          <span></span>
          <span></span>
        </div>
      </section>
    </>
  );
}
