import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useCart } from "../context/useCart";
import "./Navbar.css";

function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const { cartCount } = useCart();

  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleNavClick = () => {
    closeMobileMenu();
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="navbar">
      <button
        className="mobile-menu-button"
        onClick={() => setMobileMenuOpen((prev) => !prev)}
        aria-label={mobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
        type="button"
      >
        <span
          className={`mobile-menu-icon ${mobileMenuOpen ? "open" : ""}`}
          aria-hidden="true"
        ></span>
      </button>

      <Link to="/" className="navbar-logo" onClick={handleNavClick}>
        <div className="logo-icon">
          <span></span>
        </div>

        <div className="logo-text">
          <span>Eunoia</span>
          <span>Cafe</span>
        </div>
      </Link>

      <nav className="navbar-links">
        <Link to="/" onClick={handleNavClick}>
          Home
        </Link>
        <Link to="/menu" onClick={handleNavClick}>
          Menu
        </Link>
        <Link to="/shop" onClick={handleNavClick}>
          Shop
        </Link>
        <Link to="/about" className="nav-about-link" onClick={handleNavClick}>
          About
        </Link>
        <Link
          to="/location"
          className="nav-location-link"
          onClick={handleNavClick}
        >
          Locations
        </Link>
      </nav>

      <div className="navbar-actions">
        {!isLoggedIn ? (
          <div className="navbar-auth-links">
            <Link to="/login" className="login-btn">
              Login
            </Link>

            <Link to="/register" className="register-link">
              Register
            </Link>
          </div>
        ) : (
          <div className="user-menu">
            <button className="user-menu-button" type="button">
              {user?.name?.split(" ")[0]} <span></span>
            </button>

            <div className="user-dropdown">
              {user?.role === "customer" && (
                <Link to="/my-orders">My Orders</Link>
              )}

              {user?.role === "admin" && (
                <Link to="/admin/orders">Admin Orders</Link>
              )}

              <Link to="/profile">Profile</Link>

              <button onClick={handleLogout} type="button">
                Logout
              </button>
            </div>
          </div>
        )}

        <Link
          to={isLoggedIn ? "/profile" : "/login"}
          className="mobile-profile-link"
          onClick={handleNavClick}
          aria-label="Profile"
        >
          <img src="/images/user.png" className="mobile-profile-img" alt="" />
        </Link>

        <Link
          to="/cart"
          className="cart-link"
          onClick={handleNavClick}
          aria-label="Cart"
        >
          <img
            src="/images/shopping-cart.png"
            className="cart-icon"
            alt=""
            aria-hidden="true"
          />
          <span className="cart-badge">{cartCount}</span>
        </Link>
      </div>

      {mobileMenuOpen && (
        <nav className="mobile-menu">
          <Link to="/" onClick={handleNavClick}>
            Home
          </Link>

          <Link to="/menu" onClick={handleNavClick}>
            Menu
          </Link>

          <Link to="/shop" onClick={handleNavClick}>
            Shop
          </Link>

          <Link to="/about" onClick={handleNavClick}>
            About
          </Link>

          <Link to="/location" onClick={handleNavClick}>
            Locations
          </Link>

          {isLoggedIn && user?.role === "customer" && (
            <Link to="/my-orders" onClick={handleNavClick}>
              My Orders
            </Link>
          )}

          {isLoggedIn && user?.role === "admin" && (
            <Link to="/admin/orders" onClick={handleNavClick}>
              Admin Orders
            </Link>
          )}

          {!isLoggedIn ? (
            <>
              <Link to="/login" onClick={handleNavClick}>
                Login
              </Link>

              <Link to="/register" onClick={handleNavClick}>
                Register
              </Link>
            </>
          ) : (
            <button onClick={handleLogout} type="button">
              Logout
            </button>
          )}
        </nav>
      )}
    </header>
  );
}

export default Navbar;
