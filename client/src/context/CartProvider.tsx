import { useCallback, useEffect, useMemo, useState } from "react";
import { CartContext, type CartItem } from "./cartContext";

const readStoredCart = (): CartItem[] => {
  const savedCart = localStorage.getItem("cart");

  if (!savedCart) {
    return [];
  }

  try {
    const parsedCart = JSON.parse(savedCart);

    if (!Array.isArray(parsedCart)) {
      localStorage.removeItem("cart");
      return [];
    }

    return parsedCart.filter((item): item is CartItem => {
      return (
        item &&
        typeof item === "object" &&
        Number.isInteger(item.productId) &&
        typeof item.name === "string" &&
        typeof item.price === "number" &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
      );
    });
  } catch {
    localStorage.removeItem("cart");
    return [];
  }
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    readStoredCart()
  );

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback(
    (item: Omit<CartItem, "quantity">, quantity: number) => {
      if (quantity <= 0) return;

      setCartItems((currentItems) => {
        const existingItem = currentItems.find(
          (cartItem) => cartItem.productId === item.productId
        );

        if (existingItem) {
          return currentItems.map((cartItem) =>
            cartItem.productId === item.productId
              ? {
                  ...cartItem,
                  quantity: cartItem.quantity + quantity,
                }
              : cartItem
          );
        }

        return [
          ...currentItems,
          {
            ...item,
            quantity,
          },
        ];
      });
    },
    []
  );

  const removeFromCart = useCallback((productId: number) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.productId !== productId)
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: number, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }

      setCartItems((currentItems) =>
        currentItems.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity,
              }
            : item
        )
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const value = useMemo(() => {
    const cartCount = cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    );
    const cartTotal = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    return {
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      cartCount,
      cartTotal,
    };
  }, [addToCart, cartItems, clearCart, removeFromCart, updateQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
