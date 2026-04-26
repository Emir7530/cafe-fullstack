import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";

const formatProduct = <T extends { price: Prisma.Decimal }>(product: T) => ({
  ...product,
  price: Number(product.price),
});

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category, section, search, minPrice, maxPrice, sort, page, limit } =
      req.query;

    const where: Prisma.ProductWhereInput = {};

    if (category || section) {
      where.category = {};

      if (category) {
        where.category.name = {
          equals: String(category),
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

        where.category.section = sectionValue as "menu" | "shop";
      }
    }

    if (search) {
      where.name = {
        contains: String(search),
        mode: "insensitive",
      };
    }

    if (minPrice || maxPrice) {
      where.price = {};

      if (minPrice !== undefined) {
        if (isNaN(Number(minPrice))) {
          return res.status(400).json({
            message: "minPrice must be a valid number",
          });
        }

        where.price.gte = new Prisma.Decimal(String(minPrice));
      }

      if (maxPrice !== undefined) {
        if (isNaN(Number(maxPrice))) {
          return res.status(400).json({
            message: "maxPrice must be a valid number",
          });
        }

        where.price.lte = new Prisma.Decimal(String(maxPrice));
      }
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { id: "asc" };

    if (sort !== undefined) {
      if (sort !== "asc" && sort !== "desc") {
        return res.status(400).json({
          message: "sort must be either 'asc' or 'desc'",
        });
      }

      orderBy = { price: sort };
    }

    const pageNumber = page !== undefined ? Number(page) : 1;
    const limitNumber = limit !== undefined ? Number(limit) : 10;

    if (isNaN(pageNumber) || pageNumber < 1) {
      return res.status(400).json({
        message: "page must be a positive number",
      });
    }

    if (isNaN(limitNumber) || limitNumber < 1) {
      return res.status(400).json({
        message: "limit must be a positive number",
      });
    }

    const skip = (pageNumber - 1) * limitNumber;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        orderBy,
        skip,
        take: limitNumber,
      }),
      prisma.product.count({ where }),
    ]);

    res.status(200).json({
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
      products: products.map(formatProduct),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      message: "Failed to fetch products",
    });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid product id",
      });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json(formatProduct(product));
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      message: "Failed to fetch product",
    });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, price, description, categoryId } = req.body;

    const file = req.file;
    const imageUrl = file ? `/uploads/${file.filename}` : null;

    if (!name || price === undefined || categoryId === undefined) {
      return res.status(400).json({
        message: "name, price, and categoryId are required",
      });
    }

    if (isNaN(Number(price))) {
      return res.status(400).json({
        message: "price must be a valid number",
      });
    }

    if (Number(price) <= 0) {
      return res.status(400).json({
        message: "price must be greater than 0",
      });
    }

    if (isNaN(Number(categoryId))) {
      return res.status(400).json({
        message: "categoryId must be a valid number",
      });
    }

    const category = await prisma.category.findUnique({
      where: { id: Number(categoryId) },
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const product = await prisma.product.create({
      data: {
        name: String(name).trim(),
        price: new Prisma.Decimal(String(price)),
        description: description ? String(description).trim() : null,
        imageUrl,
        categoryId: Number(categoryId),
      },
      include: {
        category: true,
      },
    });

    res.status(201).json({
      message: "Product created successfully",
      product: formatProduct(product),
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      message: "Failed to create product",
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid product id",
      });
    }

    const { name, price, description, categoryId } = req.body;

    const file = req.file;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (price !== undefined && isNaN(Number(price))) {
      return res.status(400).json({
        message: "price must be a valid number",
      });
    }

    if (price !== undefined && Number(price) <= 0) {
      return res.status(400).json({
        message: "price must be greater than 0",
      });
    }

    if (categoryId !== undefined) {
      if (isNaN(Number(categoryId))) {
        return res.status(400).json({
          message: "categoryId must be a valid number",
        });
      }

      const category = await prisma.category.findUnique({
        where: { id: Number(categoryId) },
      });

      if (!category) {
        return res.status(404).json({
          message: "Category not found",
        });
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(price !== undefined && {
          price: new Prisma.Decimal(String(price)),
        }),
        ...(description !== undefined && {
          description: description ? String(description).trim() : null,
        }),
        ...(file && {
          imageUrl: `/uploads/${file.filename}`,
        }),
        ...(categoryId !== undefined && {
          categoryId: Number(categoryId),
        }),
      },
      include: {
        category: true,
      },
    });

    res.status(200).json({
      message: "Product updated successfully",
      product: formatProduct(updatedProduct),
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      message: "Failed to update product",
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid product id",
      });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    await prisma.product.delete({
      where: { id },
    });

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      message: "Failed to delete product",
    });
  }
};