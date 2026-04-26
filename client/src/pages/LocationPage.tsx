import "../styles/LocationPage.css";

function LocationPage() {
  return (
    <main className="location-page">
      <section className="location-hero">
        <p className="location-label">Visit Us</p>

        <h1>Find Eunoia Cafe in Izmir</h1>

        <p>
          Stop by for fresh coffee, a relaxing cafe atmosphere, and your
          favorite drinks. You can also check our menu and shop online before
          visiting.
        </p>
      </section>

      <section className="location-content">
        <div className="location-info-card">
          <p className="location-section-label">Cafe Location</p>

          <h2>Eunoia Cafe</h2>

          <div className="location-info-list">
            <div className="location-info-item">
              <span>Address</span>
              <strong>Buca, Izmir, Turkey</strong>
              <p>Replace this with the real street address later.</p>
            </div>

            <div className="location-info-item">
              <span>Opening Hours</span>
              <strong>Monday - Sunday</strong>
              <p>09:00 - 23:00</p>
            </div>

            <div className="location-info-item">
              <span>Phone</span>
              <strong>+90 555 000 00 00</strong>
            </div>

            <div className="location-info-item">
              <span>Email</span>
              <strong>hello@eunoiacafe.com</strong>
              <p>For questions, orders, and cafe information.</p>
            </div>
          </div>

          <a
            className="directions-button"
            href="https://www.google.com/maps/search/?api=1&query=Buca%20Izmir%20Turkey"
            target="_blank"
            rel="noreferrer"
          >
            Get Directions
          </a>
        </div>

        <div className="location-map-card">
          <iframe
            title="Cabrillo Cafe Location"
            src="https://www.google.com/maps?q=Buca%20Izmir%20Turkey&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      <section className="location-extra-section">
        <div className="location-extra-card">
          <span>01</span>
          <h3>Easy to Visit</h3>
          <p>
            Located in Izmir, our cafe is designed to be a comfortable place for
            coffee, studying, working, and relaxing.
          </p>
        </div>

        <div className="location-extra-card">
          <span>02</span>
          <h3>Order Online</h3>
          <p>
            You can browse the shop page and add coffee products to your cart
            before or after your visit.
          </p>
        </div>

        <div className="location-extra-card">
          <span>03</span>
          <h3>Fresh Menu</h3>
          <p>
            Check our menu page for current drink prices and cafe options before
            coming in.
          </p>
        </div>
      </section>
    </main>
  );
}

export default LocationPage;