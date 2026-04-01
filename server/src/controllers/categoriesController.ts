import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getCategories = async (req: Request, res: Response) => {
  try {
    const { name, section } = req.query;
    const where: {
      name?: { equals: string; mode: "insensitive" };
      section?: "menu" | "shop";
    } = {};

    if (name) {
      where.name = {
        equals: String(name),
        mode: "insensitive",
      };
    }

    if (section) {
      const sectionValue = String(section).toLowerCase();

      if (sectionValue !== "menu" && sectionValue !== "shop") {
        return res.status(400).json({
          message: "Section must be either 'menu' or 'shop'",
        });
      }

      where.section = sectionValue;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: {
        id: "asc",
      },
    });

    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      message: "Failed to fetch categories",
    });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, section } = req.body;

    if (!name || !section) {
      return res.status(400).json({
        message: "name and section are required",
      });
    }

    const sectionValue = String(section).toLowerCase();

    if (sectionValue !== "menu" && sectionValue !== "shop") {
      return res.status(400).json({
        message: "Section must be either 'menu' or 'shop'",
      });
    }

    const category = await prisma.category.create({
      data: {
        name: String(name),
        section: sectionValue,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({
      message: "Failed to create category",
    });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid category id",
      });
    }

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    if (category._count.products > 0) {
      return res.status(400).json({
        message: "Cannot delete category that is used by products.",
      });
    }

    await prisma.category.delete({
      where: { id },
    });

    res.status(200).json({
      message: "Category deleted successfully",
      category: {
        id: category.id,
        name: category.name,
        section: category.section,
      },
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      message: "Failed to delete category",
    });
  }
};
