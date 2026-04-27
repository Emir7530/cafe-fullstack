import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getMyOrders, type Order } from "../api/orderApi";
import "../styles/ProfilePage.css";

const statusLabels: Record<string, string> = {
  pending: "Pending",
  preparing: "Preparing",
  completed: "Completed",
  cancelled: "Cancelled",
};

function ProfilePage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const { cartCount, cartTotal } = useCart();

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const loadOrders = async () => {
      if (!isLoggedIn) {
        setOrdersLoading(false);
        return;
      }

      try {
        setOrdersLoading(true);
        setOrdersError("");

        const data = await getMyOrders();
        setOrders(data);
      } catch {
        setOrdersError("Failed to load recent orders.");
      } finally {
        setOrdersLoading(false);
      }
    };

    loadOrders();
  }, [isLoggedIn]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!isLoggedIn || !user) {
    return (
      <main className="profile-page">
        <section className="profile-message-card">
          <h1>Login required</h1>
          <p>You need to login to view your profile.</p>
          <Link to="/login">Go to Login</Link>
        </section>
      </main>
    );
  }

  const recentOrders = orders.slice(0, 3);
  const completedOrders = orders.filter((order) => order.status === "completed");
  const pendingOrders = orders.filter(
    (order) => order.status === "pending" || order.status === "preparing"
  );

  return (
    <main className="profile-page">
      <section className="profile-hero">
        <p className="profile-label">My Profile</p>
        <h1>Welcome, {user.name.split(" ")[0]}</h1>
        <p>Manage your account, view your orders, and continue shopping.</p>
      </section>

      <section className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div className="profile-info">
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <span>{user.role === "admin" ? "Admin" : "Customer"}</span>
          </div>
        </div>

        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <span>Total Orders</span>
            <strong>{orders.length}</strong>
          </div>

          <div className="profile-stat-card">
            <span>Active Orders</span>
            <strong>{pendingOrders.length}</strong>
          </div>

          <div className="profile-stat-card">
            <span>Completed</span>
            <strong>{completedOrders.length}</strong>
          </div>
        </div>

        <div className="profile-details-card">
          <h2>Account Details</h2>

          <div className="profile-detail-row">
            <span>Name</span>
            <strong>{user.name}</strong>
          </div>

          <div className="profile-detail-row">
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>

          <div className="profile-detail-row">
            <span>Role</span>
            <strong>{user.role === "admin" ? "Admin" : "Customer"}</strong>
          </div>

          <div className="profile-detail-row">
            <span>Cart Total</span>
            <strong>{cartTotal.toFixed(2)} TL</strong>
          </div>
        </div>

        <div className="profile-orders-card">
          <div className="profile-section-header">
            <h2>Recent Orders</h2>
            <Link to="/my-orders">View All</Link>
          </div>

          {ordersLoading ? (
            <p className="profile-muted-text">Loading recent orders...</p>
          ) : ordersError ? (
            <p className="profile-error-text">{ordersError}</p>
          ) : recentOrders.length === 0 ? (
            <div className="profile-empty-orders">
              <p>You have not placed any orders yet.</p>
              <Link to="/shop">Start Shopping</Link>
            </div>
          ) : (
            <div className="profile-recent-orders">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to="/my-orders"
                  className="profile-order-preview"
                >
                  <div>
                    <h3>Order #{order.id}</h3>
                    <p>{formatDate(order.createdAt)}</p>
                  </div>

                  <div className="profile-order-preview-right">
                    <span className={`profile-order-status ${order.status}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                    <strong>{order.total.toFixed(2)} TL</strong>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="profile-actions-card">
          <h2>Quick Actions</h2>

          <div className="profile-action-grid">
            <Link to="/my-orders" className="profile-action-link">
              <span>My Orders</span>
              <p>View your order history and current order status.</p>
            </Link>

            <Link to="/cart" className="profile-action-link">
              <span>Cart</span>
              <p>
                {cartCount} item{cartCount !== 1 ? "s" : ""} ·{" "}
                {cartTotal.toFixed(2)} TL
              </p>
            </Link>

            <Link to="/shop" className="profile-action-link">
              <span>Shop</span>
              <p>Browse coffee products and add them to your cart.</p>
            </Link>

            <Link to="/menu" className="profile-action-link">
              <span>Menu</span>
              <p>View cafe menu items and prices.</p>
            </Link>
          </div>

          {user.role === "admin" && (
            <div className="profile-admin-panel">
              <h2>Admin Panel</h2>

              <div className="profile-action-grid admin-grid">
                <Link to="/admin/orders" className="profile-action-link admin">
                  <span>Admin Orders</span>
                  <p>View customer orders and update order status.</p>
                </Link>

                <Link to="/menu" className="profile-action-link admin">
                  <span>Manage Menu</span>
                  <p>Add or edit menu categories and menu items.</p>
                </Link>

                <Link to="/shop" className="profile-action-link admin">
                  <span>Manage Shop</span>
                  <p>Add or edit shop categories and products.</p>
                </Link>
              </div>
            </div>
          )}

          <button className="profile-logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </section>
    </main>
  );
}

export default ProfilePage;