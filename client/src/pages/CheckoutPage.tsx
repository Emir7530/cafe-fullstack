import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../api/orderApi";
import "./CheckoutPage.css";

const API_BASE_URL = "http://localhost:5000";

function CheckoutPage() {
    const navigate = useNavigate();
    const { user, isLoggedIn } = useAuth();
    const { cartItems, cartTotal, cartCount, clearCart } = useCart();

    const [customerName, setCustomerName] = useState(user?.name || "");
    const [customerEmail, setCustomerEmail] = useState(user?.email || "");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [note, setNote] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const getFullImageUrl = (imageUrl?: string | null) => {
        if (!imageUrl) return "";
        if (imageUrl.startsWith("http")) return imageUrl;
        return `${API_BASE_URL}${imageUrl}`;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isLoggedIn) {
            setError("You must login before checkout.");
            return;
        }

        if (cartItems.length === 0) {
            setError("Your cart is empty.");
            return;
        }

        if (
            !customerName.trim() ||
            !customerEmail.trim() ||
            !phone.trim() ||
            !address.trim()
        ) {
            setError("Name, email, phone and address are required.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const result = await createOrder({
                customerName,
                customerEmail,
                phone,
                address,
                note,
                items: cartItems.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                })),
            });

            clearCart();

            navigate(`/order-success/${result.order.id}`);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Something went wrong.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <main className="checkout-page">
                <section className="checkout-message-card">
                    <h1>Login required</h1>
                    <p>You need to login before placing an order.</p>
                    <Link to="/login">Go to Login</Link>
                </section>
            </main>
        );
    }

    if (cartItems.length === 0) {
        return (
            <main className="checkout-page">
                <section className="checkout-message-card">
                    <h1>Your cart is empty</h1>
                    <p>Add products to your cart before checkout.</p>
                    <Link to="/shop">Go to Shop</Link>
                </section>
            </main>
        );
    }

    return (
        <main className="checkout-page">
            <section className="checkout-hero">
                <p className="checkout-label">Checkout</p>
                <h1>Complete your order</h1>
                <p>Enter your contact details and confirm your coffee order.</p>
            </section>

            <section className="checkout-content">
                <form onSubmit={handleSubmit} className="checkout-form-card">
                    <h2>Customer Information</h2>

                    {error && <p className="checkout-error">{error}</p>}

                    <div className="checkout-form-grid">
                        <div className="checkout-field">
                            <label>Name</label>
                            <input
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Your name"
                                required
                            />
                        </div>

                        <div className="checkout-field">
                            <label>Email</label>
                            <input
                                type="email"
                                value={customerEmail}
                                onChange={(e) => setCustomerEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div className="checkout-field">
                            <label>Phone</label>
                            <input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+90..."
                                required
                            />
                        </div>

                        <div className="checkout-field">
                            <label>Address</label>
                            <input
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Delivery address"
                                required
                            />
                        </div>

                        <div className="checkout-field full">
                            <label>Order Note</label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Any extra notes..."
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? "Placing Order..." : "Place Order"}
                    </button>
                </form>

                <aside className="checkout-summary-card">
                    <h2>Order Summary</h2>

                    <div className="checkout-items">
                        {cartItems.map((item) => (
                            <div key={item.productId} className="checkout-item">
                                <div className="checkout-item-image">
                                    {item.imageUrl ? (
                                        <img src={getFullImageUrl(item.imageUrl)} alt={item.name} />
                                    ) : (
                                        <span>No Image</span>
                                    )}
                                </div>

                                <div>
                                    <h3>{item.name}</h3>
                                    <p>
                                        {item.quantity} x {item.price.toFixed(2)} TL
                                    </p>
                                </div>

                                <strong>{(item.quantity * item.price).toFixed(2)} TL</strong>
                            </div>
                        ))}
                    </div>

                    <div className="checkout-row">
                        <span>Items</span>
                        <strong>{cartCount}</strong>
                    </div>

                    <div className="checkout-row">
                        <span>Subtotal</span>
                        <strong>{cartTotal.toFixed(2)} TL</strong>
                    </div>

                    <div className="checkout-total">
                        <span>Total</span>
                        <strong>{cartTotal.toFixed(2)} TL</strong>
                    </div>
                </aside>
            </section>
        </main>
    );
}

export default CheckoutPage;