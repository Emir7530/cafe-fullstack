import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <main className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <p className="hero-label">Welcome to Eunoia Cafe</p>

          <h1>
            Fresh coffee, sweet desserts, and cozy moments.
          </h1>

          <p className="hero-description">
            Discover our handcrafted drinks, fresh pastries, and selected cafe
            products made for your daily comfort.
          </p>

          <div className="hero-buttons">
            <Link to="/menu" className="primary-btn">
              View Menu
            </Link>

            <Link to="/shop" className="secondary-btn">
              Shop Products
            </Link>
          </div>
        </div>

        <div className="hero-image-card">
          <div className="coffee-cup">☕</div>
          <h2>Today&apos;s Favorite</h2>
          <p>Caramel Latte & Chocolate Croissant</p>
        </div>
      </section>
    </main>
  );
}

export default Home;