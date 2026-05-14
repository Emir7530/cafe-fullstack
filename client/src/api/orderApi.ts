import { apiRequest } from "./client";

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
  userId: number | null;
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

export const createOrder = async (data: CreateOrderData) => {
  return apiRequest<{ message: string; order: Order }>("/orders", {
    method: "POST",
    auth: true,
    json: data,
  });
};

export const getMyOrders = async (): Promise<Order[]> => {
  return apiRequest<Order[]>("/orders/my-orders", {
    auth: true,
  });
};

export const getAllOrders = async (): Promise<Order[]> => {
  return apiRequest<Order[]>("/orders", {
    auth: true,
  });
};

export const updateOrderStatus = async (
  orderId: number,
  status: OrderStatus
) => {
  return apiRequest<{ message: string; order: Order }>(`/orders/${orderId}/status`, {
    method: "PUT",
    auth: true,
    json: { status },
  });
};
