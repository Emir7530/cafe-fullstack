import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };
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
        {!isLoggedIn ? (
          <div className="navbar-auth-links">
            <Link to="/login" className="login-btn">Login</Link>
            <Link to="/register" className="register-link">
              Register
            </Link>
          </div>
        ) : (
          <div className="user-menu">
            <button className="user-menu-button">
              {user?.name} <span>⌄</span>
            </button>

            <div className="user-dropdown">
              <Link to="/orders">My Orders</Link>
              <Link to="/profile">Profile</Link>

              {user?.role === "admin" && (
                <Link to="/admin">Admin Dashboard</Link>
              )}

              <button onClick={handleLogout}>Logout</button>
            </div>
          </div>
        )}

        <Link to="/cart" className="cart-link">
          <span className="cart-icon">🛒</span>
          <span className="cart-badge">0</span>
        </Link>
      </div>
    </header>
  );
}

export default Navbar;