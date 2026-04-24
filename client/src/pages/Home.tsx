import { useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const heroImages = [
  "/images/eunoia-hero-1.png",
  "/images/eunoia-hero-2.png",
  "/images/eunoia-hero-3.png",
];

function Home() {
  const [currentImage, setCurrentImage] = useState(0);

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

  return (
    <main className="home-page">
      <section className="hero-slider">
        <img
          src={heroImages[currentImage]}
          alt="Eunoia Cafe"
          className="hero-slider-image"
        />

       


        <button
          className="slider-btn slider-btn-left"
          onClick={goToPreviousImage}
          type="button"
        >
          ‹
        </button>

        <button
          className="slider-btn slider-btn-right"
          onClick={goToNextImage}
          type="button"
        >
          ›
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
            ></button>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Home;