import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMenuProducts, type MenuProduct } from "../api/menuApi";
import { getImageUrl } from "../api/config";
import "../styles/HomePage.css";

const heroImages = [
  "/images/eunoia-hero-1.png",
  "/images/eunoia-hero-2.png",
  "/images/eunoia-hero-3.png",
];

function Home() {
  const [currentImage, setCurrentImage] = useState(0);

  const [featuredItems, setFeaturedItems] = useState<MenuProduct[]>([]);
  const [currentItem, setCurrentItem] = useState(0);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [itemsError, setItemsError] = useState("");

  useEffect(() => {
    const loadFeaturedItems = async () => {
      try {
        setIsLoadingItems(true);
        setItemsError("");

        const products = await getMenuProducts();

        setFeaturedItems(products.slice(0, 6));
        setCurrentItem(0);
      } catch (error) {
        console.error(error);
        setItemsError("Could not load featured menu items.");
      } finally {
        setIsLoadingItems(false);
      }
    };

    loadFeaturedItems();
  }, []);

  const getImageSrc = (imageUrl?: string | null) => {
    if (!imageUrl) {
      return "/images/product-placeholder.png";
    }

    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }

    return getImageUrl(imageUrl);
  };

  const goToNextImage = () => {
    setCurrentImage((prev) =>
      prev === heroImages.length - 1 ? 0 : prev + 1
    );
  };

  const goToPreviousImage = () => {
    setCurrentImage((prev) =>
      prev === 0 ? heroImages.length - 1 : prev - 1
    );
  };

  const goToNextItem = () => {
    if (featuredItems.length === 0) return;

    setCurrentItem((prev) =>
      prev === featuredItems.length - 1 ? 0 : prev + 1
    );
  };

  const goToPreviousItem = () => {
    if (featuredItems.length === 0) return;

    setCurrentItem((prev) =>
      prev === 0 ? featuredItems.length - 1 : prev - 1
    );
  };

  const selectedItem = featuredItems[currentItem];

  return (
    <main className="home-page">
      <section
        className="hero-slider"
        style={
          {
            "--hero-image": `url(${heroImages[currentImage]})`,
          } as React.CSSProperties
        }
      >
        <div className="hero-blur-bg"></div>

        <img
          src={heroImages[currentImage]}
          alt="Eunoia Cafe"
          className="hero-slider-image"
        />

        <button
          className="slider-btn slider-btn-left"
          onClick={goToPreviousImage}
          type="button"
          aria-label="Previous image"
        >
          <img src="/images/to-left.png" className="to-left-btn" alt="" />
        </button>

        <button
          className="slider-btn slider-btn-right"
          onClick={goToNextImage}
          type="button"
          aria-label="Next image"
        >
          <img src="/images/to-right.png" className="to-right-btn" alt="" />
        </button>

        <div className="slider-dots">
          {heroImages.map((_, index) => (
            <button
              key={index}
              className={`slider-dot ${
                currentImage === index ? "active" : ""
              }`}
              onClick={() => setCurrentImage(index)}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>
      </section>

      <section className="home-intro">
        <p className="section-label">Welcome to Eunoia Cafe</p>

        <h1>Fresh coffee, calm atmosphere, and carefully selected flavors.</h1>

        <p className="home-intro-text">
          Eunoia Cafe is a warm local coffee spot in İzmir, Buca. You can visit
          us for fresh drinks, desserts, and relaxing moments, or shop our
          coffee products online.
        </p>

        <div className="intro-cards">
          <div className="intro-card">
            <h3>Fresh Coffee</h3>
            <p>Daily prepared espresso drinks and carefully selected beans.</p>
          </div>

          <div className="intro-card">
            <h3>Online Shop</h3>
            <p>Order coffee products and blends directly from our shop.</p>
          </div>

          <div className="intro-card">
            <h3>Cozy Place</h3>
            <p>A calm cafe experience for studying, meeting, or relaxing.</p>
          </div>
        </div>
      </section>

      <section className="featured-section">
        <div className="featured-header">
          <div>
            <p className="section-label">Featured Menu</p>
            <h2>Popular picks from our cafe</h2>
          </div>

          <div className="featured-actions">
            <Link to="/menu" className="outline-btn">
              View Menu
            </Link>
            <Link to="/shop" className="dark-btn">
              Shop Coffee
            </Link>
          </div>
        </div>

        {isLoadingItems && (
          <div className="featured-status">
            <p>Loading menu items...</p>
          </div>
        )}

        {!isLoadingItems && itemsError && (
          <div className="featured-status">
            <p>{itemsError}</p>
          </div>
        )}

        {!isLoadingItems && !itemsError && featuredItems.length === 0 && (
          <div className="featured-status">
            <p>No featured menu items found.</p>
          </div>
        )}

        {!isLoadingItems && !itemsError && selectedItem && (
          <>
            <div className="featured-slider">
              <button
                className="featured-arrow"
                onClick={goToPreviousItem}
                type="button"
                aria-label="Previous item"
              >
                ‹
              </button>

              <div className="featured-card">
                <div className="featured-image-wrapper">
                  <img
                    src={getImageSrc(selectedItem.imageUrl)}
                    alt={selectedItem.name}
                    className="featured-image"
                  />
                </div>

                <div className="featured-info">
                  <span>₺{Number(selectedItem.price).toFixed(2)}</span>

                  <h3>{selectedItem.name}</h3>

                  <p>
                    {selectedItem.description ||
                      "A carefully prepared item from our cafe menu."}
                  </p>

                  <div className="featured-card-buttons">
                    <Link to="/menu" className="outline-btn small-btn">
                      View Menu
                    </Link>
                    <Link to="/shop" className="dark-btn small-btn">
                      Shop Coffee
                    </Link>
                  </div>
                </div>
              </div>

              <button
                className="featured-arrow"
                onClick={goToNextItem}
                type="button"
                aria-label="Next item"
              >
                ›
              </button>
            </div>

            <div className="featured-dots">
              {featuredItems.map((_, index) => (
                <button
                  key={index}
                  className={`featured-dot ${
                    currentItem === index ? "active" : ""
                  }`}
                  onClick={() => setCurrentItem(index)}
                  type="button"
                  aria-label={`Go to featured item ${index + 1}`}
                ></button>
              ))}
            </div>
          </>
        )}
      </section>

      <footer className="home-footer">
        <div className="footer-content">
          <div>
            <h2>Eunoia Cafe</h2>
            <p>
              Fresh coffee, online products, and a cozy cafe experience in
              İzmir, Buca.
            </p>
          </div>

          <div className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/menu">Menu</Link>
            <Link to="/shop">Shop</Link>
            <Link to="/about">About</Link>
            <Link to="/location">Locations</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Eunoia Cafe. All rights reserved.</p>
          <p>Made with care for coffee lovers.</p>
        </div>
      </footer>
    </main>
  );
}

export default Home;
