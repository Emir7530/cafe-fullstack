import { createContext } from "react";

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  imageUrl?: string | null;
  quantity: number;
};

export type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
};

export const CartContext = createContext<CartContextType | undefined>(
  undefined
);
