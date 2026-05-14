import { apiRequest } from "./client";

export type Category = {
  id: number;
  name: string;
  section: "menu" | "shop";
};

export type MenuProduct = {
  id: number;
  name: string;
  price: string | number;
  description?: string | null;
  imageUrl?: string | null;
  imageCropX?: number | null;
  imageCropY?: number | null;
  imageZoom?: number | null;
  categoryId: number;
  category: Category;
};

export type ProductFormData = {
  name: string;
  price: number;
  description: string;
  categoryId: number;
  image?: File | null;
  imageCropX?: number;
  imageCropY?: number;
  imageZoom?: number;
};

const buildProductFormData = (data: ProductFormData) => {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("price", String(data.price));
  formData.append("description", data.description);
  formData.append("categoryId", String(data.categoryId));
  formData.append("imageCropX", String(data.imageCropX ?? 0));
  formData.append("imageCropY", String(data.imageCropY ?? 0));
  formData.append("imageZoom", String(data.imageZoom ?? 1));

  if (data.image) {
    formData.append("image", data.image);
  }

  return formData;
};

export const getMenuProducts = async (): Promise<MenuProduct[]> => {
  const result = await apiRequest<{ products: MenuProduct[] }>(
    "/products?section=menu&limit=100"
  );

  return result.products || [];
};

export const getMenuCategories = async (): Promise<Category[]> => {
  return apiRequest<Category[]>("/categories?section=menu");
};

export const createMenuCategory = async (name: string) => {
  return apiRequest<Category>("/categories", {
    method: "POST",
    auth: true,
    json: {
      name,
      section: "menu",
    },
  });
};

export const createMenuProduct = async (data: ProductFormData) => {
  return apiRequest<{ message: string; product: MenuProduct }>("/products", {
    method: "POST",
    auth: true,
    body: buildProductFormData(data),
  });
};

export const updateMenuProduct = async (
  productId: number,
  data: ProductFormData
) => {
  return apiRequest<{ message: string; product: MenuProduct }>(
    `/products/${productId}`,
    {
      method: "PUT",
      auth: true,
      body: buildProductFormData(data),
    }
  );
};

export const deleteMenuProduct = async (productId: number) => {
  return apiRequest<{ message: string }>(`/products/${productId}`, {
    method: "DELETE",
    auth: true,
  });
};

export const deleteMenuCategory = async (categoryId: number) => {
  return apiRequest<{ message: string; category: Category }>(
    `/categories/${categoryId}`,
    {
      method: "DELETE",
      auth: true,
    }
  );
};
