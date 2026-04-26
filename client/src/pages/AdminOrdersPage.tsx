import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getAllOrders,
  updateOrderStatus,
  type Order,
  type OrderStatus,
} from "../api/orderApi";
import "../styles/AdminOrdersPage.css";

const statusOptions: OrderStatus[] = [
  "pending",
  "preparing",
  "completed",
  "cancelled",
];

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  preparing: "Preparing",
  completed: "Completed",
  cancelled: "Cancelled",
};

function AdminOrdersPage() {
  const { user, isLoggedIn } = useAuth();

  const isAdmin = user?.role === "admin";

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllOrders();
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
    if (isLoggedIn && isAdmin) {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, isAdmin]);

  const handleStatusChange = async (orderId: number, status: OrderStatus) => {
    try {
      setUpdatingOrderId(orderId);
      setError("");

      await updateOrderStatus(orderId, status);

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId ? { ...order, status } : order
        )
      );
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update order status.");
      }
    } finally {
      setUpdatingOrderId(null);
    }
  };

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
      <main className="admin-orders-page">
        <section className="admin-orders-message-card">
          <h1>Login required</h1>
          <p>You need to login as admin to view this page.</p>
          <Link to="/login">Go to Login</Link>
        </section>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="admin-orders-page">
        <section className="admin-orders-message-card">
          <h1>Access denied</h1>
          <p>Only admins can view customer orders.</p>
          <Link to="/">Go Home</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-orders-page">
      <section className="admin-orders-hero">
        <p className="admin-orders-label">Admin Orders</p>
        <h1>Manage customer orders</h1>
        <p>View all customer orders and update their current status.</p>
      </section>

      <section className="admin-orders-content">
        {error && <p className="admin-orders-error">{error}</p>}

        {loading ? (
          <p className="admin-orders-loading">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="admin-orders-empty-card">
            <h2>No orders yet</h2>
            <p>Customer orders will appear here after checkout.</p>
          </div>
        ) : (
          <div className="admin-orders-list">
            {orders.map((order) => (
              <article key={order.id} className="admin-order-card">
                <div className="admin-order-header">
                  <div>
                    <h2>Order #{order.id}</h2>
                    <p>{formatDate(order.createdAt)}</p>
                  </div>

                  <div className="admin-order-status-control">
                    <label>Status</label>

                    <select
                      value={order.status}
                      disabled={updatingOrderId === order.id}
                      onChange={(e) =>
                        handleStatusChange(
                          order.id,
                          e.target.value as OrderStatus
                        )
                      }
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {statusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="admin-customer-info">
                  <div>
                    <span>Customer</span>
                    <strong>{order.customerName}</strong>
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>{order.customerEmail}</strong>
                  </div>

                  <div>
                    <span>Phone</span>
                    <strong>{order.phone || "-"}</strong>
                  </div>

                  <div>
                    <span>Address</span>
                    <strong>{order.address || "-"}</strong>
                  </div>
                </div>

                <div className="admin-order-items">
                  {order.items.map((item) => (
                    <div key={item.id} className="admin-order-item-row">
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

                <div className="admin-order-footer">
                  <span className={`admin-order-status ${order.status}`}>
                    {statusLabels[order.status]}
                  </span>

                  <strong>{order.total.toFixed(2)} TL</strong>
                </div>

                {order.note && (
                  <p className="admin-order-note">
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

export default AdminOrdersPage;