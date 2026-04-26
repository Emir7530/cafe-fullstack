import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyOrders, type Order } from "../api/orderApi";
import "../styles/MyOrdersPage.css";

const statusLabels: Record<string, string> = {
  pending: "Pending",
  preparing: "Preparing",
  completed: "Completed",
  cancelled: "Cancelled",
};

function MyOrdersPage() {
  const { isLoggedIn } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyOrders();
      setOrders(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load orders.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isLoggedIn) {
    return (
      <main className="orders-page">
        <section className="orders-message-card">
          <h1>Login required</h1>
          <p>You need to login to view your orders.</p>
          <Link to="/login">Go to Login</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="orders-page">
      <section className="orders-hero">
        <p className="orders-label">My Orders</p>
        <h1>Your order history</h1>
        <p>Track your current order status and review your previous orders.</p>
      </section>

      <section className="orders-content">
        {error && <p className="orders-error">{error}</p>}

        {loading ? (
          <p className="orders-loading">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="orders-empty-card">
            <h2>No orders yet</h2>
            <p>You have not placed any orders yet.</p>
            <Link to="/shop">Go to Shop</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <article key={order.id} className="order-card">
                <div className="order-card-header">
                  <div>
                    <h2>Order #{order.id}</h2>
                    <p>{formatDate(order.createdAt)}</p>
                  </div>

                  <span className={`order-status ${order.status}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>

                <div className="order-items">
                  {order.items.map((item) => (
                    <div key={item.id} className="order-item-row">
                      <div>
                        <h3>{item.name}</h3>
                        <p>
                          {item.quantity} x {item.price.toFixed(2)} TL
                        </p>
                      </div>

                      <strong>
                        {(item.quantity * item.price).toFixed(2)} TL
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="order-card-footer">
                  <div>
                    <span>Total</span>
                    <strong>{order.total.toFixed(2)} TL</strong>
                  </div>

                  {order.address && (
                    <div>
                      <span>Address</span>
                      <strong>{order.address}</strong>
                    </div>
                  )}
                </div>

                {order.note && (
                  <p className="order-note">
                    <strong>Note:</strong> {order.note}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default MyOrdersPage;