import { createContext, useContext, useEffect, useState } from "react";

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  imageUrl?: string | null;
  quantity: number;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");

    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch {
        localStorage.removeItem("cart");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: Omit<CartItem, "quantity">, quantity: number) => {
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
  };

  const removeFromCart = (productId: number) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.productId !== productId)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}