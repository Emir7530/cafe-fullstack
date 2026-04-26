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

export const getMyOrders = async () => {
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