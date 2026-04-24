import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="navbar-logo">
        <div className="logo-icon">
          <span></span>
        </div>

        <div className="logo-text">
          <span>Eunoia</span>
          <span>Cafe</span>
        </div>
      </Link>

      <nav className="navbar-center">
        <Link to="/">Home</Link>
        <Link to="/menu">Menu</Link>
        <Link to="/shop">Shop</Link>
        <Link to="/about">About</Link>
        <Link to="/locations">Locations</Link>
        <Link to="/contact">Contact</Link>
      </nav>

      <div className="navbar-actions">
        <Link to="/login" className="login-btn">
          Log In
        </Link>

        <Link to="/register" className="register-btn">
          Register
        </Link>

        <Link to="/cart" className="cart-link">
          <span className="cart-icon">🛒</span>
          <span className="cart-badge">0</span>
        </Link>
      </div>
    </header>
  );
}

export default Navbar;