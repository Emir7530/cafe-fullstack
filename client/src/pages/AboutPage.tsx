import { Link } from "react-router-dom";
import "../styles/AboutPage.css";

function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="about-hero-content">
          <p className="about-label">About Us</p>

          <h1>Coffee made with care in Izmir</h1>

          <p>
            Eunoia Cafe is built around fresh coffee, simple flavors, and a
            warm neighborhood feeling. Whether you visit for a quick espresso,
            a slow breakfast, or a bag of coffee beans for home, our goal is to
            make every cup feel special.
          </p>

          <div className="about-hero-actions">
            <Link to="/menu" className="about-primary-button">
              View Menu
            </Link>

            <Link to="/shop" className="about-secondary-button">
              Shop Coffee
            </Link>
          </div>
        </div>

        <div className="about-hero-image">
          <img
            src="/images/about-cafe.jpg"
            alt="Cozy cafe interior with coffee"
          />
        </div>
      </section>

      <section className="about-story-section">
        <div className="about-story-card">
          <p className="about-section-label">Our Story</p>

          <h2>Built for coffee lovers</h2>

          <p>
            We believe a cafe should be more than a place to buy coffee. It
            should be a comfortable space where people can meet, study, work,
            relax, and enjoy quality drinks without feeling rushed.
          </p>

          <p>
            Our menu focuses on classic coffee drinks, fresh ingredients, and
            clear prices. Our shop section lets customers order packaged coffee
            products and enjoy the same cafe quality at home.
          </p>
        </div>
      </section>

      <section className="about-values-section">
        <div className="about-value-card">
          <span>01</span>
          <h3>Fresh Coffee</h3>
          <p>
            We care about freshness, aroma, and balance in every drink and
            coffee product.
          </p>
        </div>

        <div className="about-value-card">
          <span>02</span>
          <h3>Simple Menu</h3>
          <p>
            Easy-to-understand drinks, clear prices, and a smooth ordering
            experience.
          </p>
        </div>

        <div className="about-value-card">
          <span>03</span>
          <h3>Local Feeling</h3>
          <p>
            A warm cafe experience inspired by neighborhood culture and daily
            coffee habits.
          </p>
        </div>
      </section>

      <section className="about-visit-section">
        <div>
          <p className="about-section-label">Visit Us</p>
          <h2>Come by for your next coffee</h2>
          <p>
            Stop by for a fresh cup, check our menu online, or order coffee
            products from our shop page.
          </p>
        </div>

        <Link to="/shop" className="about-primary-button">
          Start Shopping
        </Link>
      </section>
    </main>
  );
}

export default AboutPage;