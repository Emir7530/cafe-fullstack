import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "./Navbar.css";

function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const { cartCount } = useCart();

  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="navbar">
      {/* Mobile hamburger button */}
      <button
        className="mobile-menu-button"
        onClick={() => setMobileMenuOpen((prev) => !prev)}
        aria-label="Open mobile menu"
        type="button"
      >
        {mobileMenuOpen ? "✕" : "☰"}
      </button>

      {/* Logo */}
      <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
        <div className="logo-icon">
          <span></span>
        </div>

        <div className="logo-text">
          <span>Eunoia</span>
          <span>Cafe</span>
        </div>
      </Link>

      {/* Desktop links */}
      <nav className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/menu">Menu</Link>
        <Link to="/shop">Shop</Link>
        <Link to="/about" className="nav-about-link">
          About
        </Link>
        <Link to="/location" className="nav-location-link">
          Locations
        </Link>
      </nav>

      {/* Right side */}
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
              {user?.name?.split(" ")[0]} <span>⌄</span>
            </button>

            <div className="user-dropdown">
              {user?.role === "customer" && (
                <Link to="/my-orders">My Orders</Link>
              )}

              {user?.role === "admin" && (
                <Link to="/admin/orders">Admin Orders</Link>
              )}

              <Link to="/profile">Profile</Link>

              {user?.role === "admin" && (
                <Link to="/admin">Admin Dashboard</Link>
              )}

              <button onClick={handleLogout} type="button">
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Mobile profile icon */}
        <Link
          to={isLoggedIn ? "/profile" : "/login"}
          className="mobile-profile-link"
          onClick={closeMobileMenu}
          aria-label="Profile"
        >
          👤
        </Link>

        <Link
          to="/cart"
          className="cart-link"
          onClick={closeMobileMenu}
          aria-label="Cart"
        >
          <span className="cart-icon">🛒</span>
          <span className="cart-badge">{cartCount}</span>
        </Link>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <nav className="mobile-menu">
          <Link to="/" onClick={closeMobileMenu}>
            Home
          </Link>

          <Link to="/menu" onClick={closeMobileMenu}>
            Menu
          </Link>

          <Link to="/shop" onClick={closeMobileMenu}>
            Shop
          </Link>

          <Link to="/about" onClick={closeMobileMenu}>
            About
          </Link>

          <Link to="/location" onClick={closeMobileMenu}>
            Locations
          </Link>

          {isLoggedIn && user?.role === "customer" && (
            <Link to="/my-orders" onClick={closeMobileMenu}>
              My Orders
            </Link>
          )}

          {isLoggedIn && user?.role === "admin" && (
            <>
              <Link to="/admin/orders" onClick={closeMobileMenu}>
                Admin Orders
              </Link>

              <Link to="/admin" onClick={closeMobileMenu}>
                Admin Dashboard
              </Link>
            </>
          )}

          {!isLoggedIn ? (
            <>
              <Link to="/login" onClick={closeMobileMenu}>
                Login
              </Link>

              <Link to="/register" onClick={closeMobileMenu}>
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