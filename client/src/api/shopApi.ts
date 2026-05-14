import { apiRequest } from "./client";

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

export const getShopProducts = async (): Promise<ShopProduct[]> => {
  const result = await apiRequest<{ products: ShopProduct[] }>(
    "/products?section=shop&limit=100"
  );

  return result.products || [];
};

export const getShopCategories = async (): Promise<Category[]> => {
  return apiRequest<Category[]>("/categories?section=shop");
};

export const createShopCategory = async (name: string) => {
  return apiRequest<Category>("/categories", {
    method: "POST",
    auth: true,
    json: {
      name,
      section: "shop",
    },
  });
};

export const createShopProduct = async (data: ProductFormData) => {
  return apiRequest<{ message: string; product: ShopProduct }>("/products", {
    method: "POST",
    auth: true,
    body: buildProductFormData(data),
  });
};

export const updateShopProduct = async (
  productId: number,
  data: ProductFormData
) => {
  return apiRequest<{ message: string; product: ShopProduct }>(
    `/products/${productId}`,
    {
      method: "PUT",
      auth: true,
      body: buildProductFormData(data),
    }
  );
};

export const deleteShopProduct = async (productId: number) => {
  return apiRequest<{ message: string }>(`/products/${productId}`, {
    method: "DELETE",
    auth: true,
  });
};

export const deleteShopCategory = async (categoryId: number) => {
  return apiRequest<{ message: string; category: Category }>(
    `/categories/${categoryId}`,
    {
      method: "DELETE",
      auth: true,
    }
  );
};
