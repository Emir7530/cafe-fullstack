import { Link } from "react-router-dom";
import { getImageUrl } from "../api/config";
import { useCart } from "../context/CartContext";
import "../styles/CartPage.css";

function CartPage() {
    const {
        cartItems,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
    } = useCart();

    const getFullImageUrl = (imageUrl?: string | null) => {
        if (!imageUrl) return "";
        if (imageUrl.startsWith("http")) return imageUrl;
        return getImageUrl(imageUrl);
    };

    return (
        <main className="cart-page">
            <section className="cart-hero">
                <p className="cart-label">Your Cart</p>
                <h1>Review your order</h1>
                <p>
                    Check your selected coffee products, update quantities, and review the
                    total before checkout.
                </p>
            </section>

            <section className="cart-content">
                {cartItems.length === 0 ? (
                    <div className="empty-cart-card">
                        <h2>Your cart is empty</h2>
                        <p>Go to the shop and add your favorite coffee products.</p>

                        <Link to="/shop" className="continue-shopping-button">
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="cart-layout">
                        <div className="cart-items-list">
                            {cartItems.map((item) => (
                                <article key={item.productId} className="cart-item-card">
                                    <div className="cart-item-image">
                                        {item.imageUrl ? (
                                            <img src={getFullImageUrl(item.imageUrl)} alt={item.name} />
                                        ) : (
                                            <div className="cart-image-placeholder">No Image</div>
                                        )}
                                    </div>

                                    <div className="cart-item-info">
                                        <h3>{item.name}</h3>
                                        <p>{item.price.toFixed(2)} TL each</p>

                                        <div className="cart-item-actions">
                                            <div className="cart-quantity-control">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQuantity(item.productId, item.quantity - 1)
                                                    }
                                                >
                                                    -
                                                </button>

                                                <span>{item.quantity}</span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQuantity(item.productId, item.quantity + 1)
                                                    }
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                className="remove-cart-button"
                                                onClick={() => removeFromCart(item.productId)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>

                                    <div className="cart-item-total">
                                        {(item.price * item.quantity).toFixed(2)} TL
                                    </div>
                                </article>
                            ))}
                        </div>

                        <aside className="cart-summary-card">
                            <h2>Order Summary</h2>

                            <div className="summary-row">
                                <span>Items</span>
                                <strong>{cartCount}</strong>
                            </div>

                            <div className="summary-row">
                                <span>Subtotal</span>
                                <strong>{cartTotal.toFixed(2)} TL</strong>
                            </div>

                            <div className="summary-row">
                                <span>Delivery</span>
                                <strong>Not selected</strong>
                            </div>

                            <div className="summary-total">
                                <span>Total</span>
                                <strong>{cartTotal.toFixed(2)} TL</strong>
                            </div>

                            <Link to="/checkout" className="checkout-button">
                                Proceed to Checkout
                            </Link> 

                            <button className="clear-cart-button" onClick={clearCart}>
                                Clear Cart
                            </button>

                            <Link to="/shop" className="cart-continue-link">
                                Continue Shopping
                            </Link>
                        </aside>
                    </div>
                )}
            </section>
        </main>
    );
}

export default CartPage;
