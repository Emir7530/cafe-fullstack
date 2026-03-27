import type { Request, Response } from "express";
import type { Product } from "../models/product";
import type { Category } from "../models/category"
import { products, categories } from "../data/data";

export const getCategories = (req: Request, res: Response) => {
  const { name, section } = req.query;
  let result = [...categories];

  if (name) {
    result = result.filter((category) =>
      category.name.toLowerCase() === String(name).toLowerCase()
    );
  }

  if (section) {
    result = result.filter((category) =>
      category.section.toLowerCase() === String(section).toLowerCase()
    );
  }

  res.json(result);
};  

export const createCategory = (req: Request, res: Response) => {
  const { name, section } = req.body;

  if (!name || !section) {
    return res.status(400).json({ message: "Missing fields." });
  }

  if (section !== "menu" && section !== "shop") {
    return res.status(400).json({ message: "Invalid section." });
  }

  const newCategory: Category = {
    id: categories.length
      ? Math.max(...categories.map((c) => c.id)) + 1
      : 1,
    name,
    section,
  };

  categories.push(newCategory);

  res.status(201).json(newCategory);
};

export const deleteCategory = (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid category id." });
  }

  const index = categories.findIndex((c) => c.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Category not found." });
  }

  // 🔥 IMPORTANT: prevent deleting category used by products
  const isUsed = products.some((p) => p.categoryId === id);

  if (isUsed) {
    return res.status(400).json({
      message: "Cannot delete category that is used by products.",
    });
  }

  const deletedCategory = categories.splice(index, 1);

  res.json({
    message: "Category deleted successfully",
    category: deletedCategory[0],
  });
};