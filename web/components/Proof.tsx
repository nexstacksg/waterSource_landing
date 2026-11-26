const supportingPhotos = [
  {
    src: "https://wp.watersource.com.sg/wp-content/uploads/2022/09/Enterprise-Award-April-2014-03.jpg",
    alt: "WaterSource enterprise award",
    width: 1200,
    height: 900,
    title: "Enterprise and award moments",
    caption: "Recognition built on trust and impact.",
  },
  {
    src: "https://wp.watersource.com.sg/wp-content/uploads/2023/02/watersource-1080-template-38-800x800.png",
    alt: "Mrs Wee discussion",
    width: 800,
    height: 800,
    title: "Founder conversations and wellness education",
    caption: "Sharing knowledge. Inspiring change.",
  },
  {
    src: "https://wp.watersource.com.sg/wp-content/uploads/2022/09/Customers-Gathering-Oct-2014-01.jpg",
    alt: "WaterSource customer gathering",
    width: 1046,
    height: 1200,
    title: "Customer gatherings and community trust",
    caption: "Real connections. Stronger communities.",
  },
  {
    src: "https://sgvisionaries.com/wp-content/uploads/2025/05/img-20250526-wa0017.jpg",
    alt: "WaterSource article supporting image",
    width: 1024,
    height: 836,
    title: "Healthy aging mission, led by Mrs Wee",
    caption: "Empowering lives every single day.",
  },
];

export default function Proof() {
  return (
    <section className="section authority" id="proof">
      <div className="wrap center">
        <p className="eyebrow">Founder authority &amp; visual proof</p>
        <h2>A Singapore water wellness movement, not just a machine.</h2>
        <p
          className="lead"
          style={{ maxWidth: "980px", margin: "22px auto 0" }}
        >
          Built around Mrs Wee’s founder-led mission, WaterSource brings
          together wellness education, live demonstrations, customer gatherings
          and public recognition — helping families see daily water as the
          foundation of healthier living.
        </p>
      </div>
      <div className="wrap authority-grid">
        <figure className="authority-feature">
          <img
            className="authority-photo"
            alt="Mrs Wee founder portrait"
            src="https://sgvisionaries.com/wp-content/uploads/2025/05/img-20250526-wa0011.jpg?w=1024"
            width={1024}
            height={768}
          />
          <figcaption className="authority-feature-copy">
            <p className="authority-brand">WATERSOURCE</p>
            <h3>Founder. Wellness. Purpose.</h3>
            <p>
              Leading the way in healthy aging and water wellness education.
            </p>
            <p className="authority-role">
              Founder • Wellness Technology • Healthy Aging
            </p>
          </figcaption>
        </figure>
        <div className="authority-stack">
          {supportingPhotos.map(
            ({ src, alt, width, height, title, caption }) => (
              <figure className="authority-card" key={src}>
                <img
                  alt={alt}
                  className="authority-photo"
                  src={src}
                  width={width}
                  height={height}
                />
                <figcaption className="authority-card-copy">
                  <h3>{title}</h3>
                  <p>{caption}</p>
                </figcaption>
              </figure>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
