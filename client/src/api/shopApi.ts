import { API_URL } from "./config";

export type Category = {
  id: number;
  name: string;
  section: "menu" | "shop";
};

export type ShopProduct = {
  id: number;
  name: string;
  price: string | number;
  description?: string | null;
  imageUrl?: string | null;
  categoryId: number;
  category: Category;
};

export type ProductFormData = {
  name: string;
  price: number;
  description: string;
  categoryId: number;
  image?: File | null;
};

const getToken = () => localStorage.getItem("token");

const buildProductFormData = (data: ProductFormData) => {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("price", String(data.price));
  formData.append("description", data.description);
  formData.append("categoryId", String(data.categoryId));

  if (data.image) {
    formData.append("image", data.image);
  }

  return formData;
};

const parseResponse = async (response: Response) => {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
};

export const getShopProducts = async (): Promise<ShopProduct[]> => {
  const response = await fetch(`${API_URL}/products?section=shop&limit=100`);

  const result = await parseResponse(response);

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch shop products");
  }

  return result.products || [];
};

export const getShopCategories = async (): Promise<Category[]> => {
  const response = await fetch(`${API_URL}/categories?section=shop`);

  const result = await parseResponse(response);

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch shop categories");
  }

  return result;
};

export const createShopCategory = async (name: string) => {
  const response = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({
      name,
      section: "shop",
    }),
  });

  const result = await parseResponse(response);

  if (!response.ok) {
    throw new Error(result.message || "Failed to create category");
  }

  return result;
};

export const createShopProduct = async (data: ProductFormData) => {
  const response = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: buildProductFormData(data),
  });

  const result = await parseResponse(response);

  if (!response.ok) {
    throw new Error(result.message || "Failed to create product");
  }

  return result;
};

export const updateShopProduct = async (
  productId: number,
  data: ProductFormData
) => {
  const response = await fetch(`${API_URL}/products/${productId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: buildProductFormData(data),
  });

  const result = await parseResponse(response);

  if (!response.ok) {
    throw new Error(result.message || "Failed to update product");
  }

  return result;
};
