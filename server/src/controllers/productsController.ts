import type { Request, Response } from "express";
import type { Product } from "../models/product";
import type { Category } from "../models/category";
import { products, categories } from "../data/data";


export const getProducts = (req: Request, res: Response) => {
  const { section, category, search, minPrice, maxPrice, sort, page, limit } = req.query;
  let result = [...products];

  const categoryMap = new Map(categories.map((category) => [category.id, category]));

  if (section) {
    result = result.filter((product) => {
      const foundCategory = categoryMap.get(product.categoryId);
      return foundCategory?.section.toLowerCase() === String(section).toLowerCase();
    });
  }

  if (category) {
    result = result.filter((product) => {
      const foundCategory = categoryMap.get(product.categoryId);
      return foundCategory?.name.toLowerCase() === String(category).toLowerCase();
    });
  }

  if (search) {
    const searchText = String(search).toLowerCase();

    result = result.filter((product) => {
      const foundCategory = categoryMap.get(product.categoryId);

      return (
        product.name.toLowerCase().includes(searchText) ||
        product.description.toLowerCase().includes(searchText) ||
        foundCategory?.name.toLowerCase().includes(searchText) ||
        foundCategory?.section.toLowerCase().includes(searchText)
      );
    });
  }

  if (minPrice) {
    result = result.filter((product) => product.price >= Number(minPrice));
  }

  if (maxPrice) {
    result = result.filter((product) => product.price <= Number(maxPrice));
  }

  if (sort === "asc") {
    result.sort((a, b) => a.price - b.price);
  }

  if (sort === "desc") {
    result.sort((a, b) => b.price - a.price);
  }

  const pageNumber = Math.max(1, Number(page) || 1);
  const limitNumber = Math.max(1, Number(limit) || result.length || 1);

  const startIndex = (pageNumber - 1) * limitNumber;
  const endIndex = startIndex + limitNumber;

  const paginatedProducts = result.slice(startIndex, endIndex);

  const data = paginatedProducts.map((product) => ({
    ...product,
    category: categoryMap.get(product.categoryId) || null,
  }));

  res.json({
    total: result.length,
    page: pageNumber,
    limit: limitNumber,
    totalPages: Math.ceil(result.length / limitNumber),
    data,
  });
};

export const getProductById = (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid product id." });
  }

  const product = products.find((product) => product.id === id);

  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }

  const category = categories.find((category) => category.id === product.categoryId) || null;

  res.json({
    ...product,
    category,
  });
};

export const createProduct = (req: Request, res: Response) => {
  const { name, price, categoryId, description, imageUrl } = req.body;

  if (!name || price === undefined || categoryId === undefined || !description) {
    return res.status(400).json({ message: "Missing fields." });
  }

  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ message: "Name is required." });
  }

  if (typeof price !== "number" || price <= 0) {
    return res.status(400).json({ message: "Price must be a positive number." });
  }

  if (typeof categoryId !== "number" || categoryId <= 0) {
    return res.status(400).json({ message: "Category ID must be a positive number." });
  }

  if (typeof description !== "string" || !description.trim()) {
    return res.status(400).json({ message: "Description is required." });
  }

  if (imageUrl !== undefined && typeof imageUrl !== "string") {
    return res.status(400).json({ message: "Image URL must be a string." });
  }

  const categoryExists = categories.some((category) => category.id === categoryId);

  if (!categoryExists) {
    return res.status(400).json({ message: "Invalid categoryId." });
  }

  const newProduct: Product = {
    id: products.length ? Math.max(...products.map((product) => product.id)) + 1 : 1,
    name,
    price,
    categoryId,
    description,
    imageUrl: imageUrl || "",
  };

  products.push(newProduct);

  const category = categories.find((category) => category.id === newProduct.categoryId) || null;

  res.status(201).json({
    ...newProduct,
    category,
  });
};

export const updateProduct = (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid product id." });
  }

  const { name, price, categoryId, description, imageUrl } = req.body;

  const product = products.find((product) => product.id === id);

  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }

  if (name !== undefined && (typeof name !== "string" || !name.trim())) {
    return res.status(400).json({ message: "Name must be a non-empty string." });
  }

  if (price !== undefined && (typeof price !== "number" || price <= 0)) {
    return res.status(400).json({ message: "Price must be a positive number." });
  }

  if (
    categoryId !== undefined &&
    (typeof categoryId !== "number" || categoryId <= 0)
  ) {
    return res.status(400).json({ message: "Category ID must be a positive number." });
  }

  if (description !== undefined && (typeof description !== "string" || !description.trim())) {
    return res.status(400).json({ message: "Description must be a non-empty string." });
  }

  if (imageUrl !== undefined && typeof imageUrl !== "string") {
    return res.status(400).json({ message: "Image URL must be a string." });
  }

  if (categoryId !== undefined) {
    const categoryExists = categories.some((category) => category.id === categoryId);

    if (!categoryExists) {
      return res.status(400).json({ message: "Invalid categoryId." });
    }
  }

  if (name !== undefined) product.name = name;
  if (price !== undefined) product.price = price;
  if (categoryId !== undefined) product.categoryId = categoryId;
  if (description !== undefined) product.description = description;
  if (imageUrl !== undefined) product.imageUrl = imageUrl;

  const category = categories.find((category) => category.id === product.categoryId) || null;

  res.json({
    ...product,
    category,
  });
};

export const deleteProduct = (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid product id." });
  }

  const productIndex = products.findIndex((product) => product.id === id);

  if (productIndex === -1) {
    return res.status(404).json({ message: "Product not found." });
  }

  const deletedProduct = products.splice(productIndex, 1);

  res.json({
    message: "Product deleted successfully",
    product: deletedProduct[0],
  });
};