const API_URL = "http://localhost:5000/api";

type CheckoutItem = {
  productId: number;
  quantity: number;
};

export type CreateOrderData = {
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  note: string;
  items: CheckoutItem[];
};

export type OrderStatus = "pending" | "preparing" | "completed" | "cancelled";

export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  createdAt: string;
};

export type Order = {
  id: number;
  userId: number;
  customerName: string;
  customerEmail: string;
  phone?: string | null;
  address?: string | null;
  note?: string | null;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

const getToken = () => localStorage.getItem("token");

const parseResponse = async (response: Response) => {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
};

export const createOrder = async (data: CreateOrderData) => {
  const response = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });

  const result = await parseResponse(response);

  if (!response.ok) {
    throw new Error(result.message || "Failed to create order");
  }

  return result;
};

export const getMyOrders = async (): Promise<Order[]> => {
  const response = await fetch(`${API_URL}/orders/my-orders`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const result = await parseResponse(response);

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch orders");
  }

  return result;
};