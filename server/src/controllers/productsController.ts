import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import {
  deleteUploadedProductImage,
  saveUploadedProductImage,
} from "../middlewares/uploadMiddleware";

const formatProduct = <T extends { price: Prisma.Decimal }>(product: T) => ({
  ...product,
  price: Number(product.price),
});

const readOptionalNumber = (value: unknown, fieldName: string) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    throw new Error(`${fieldName} must be a valid number`);
  }

  return parsedValue;
};

const readImageCropSettings = (body: Request["body"]) => {
  const imageCropX = readOptionalNumber(body.imageCropX, "imageCropX");
  const imageCropY = readOptionalNumber(body.imageCropY, "imageCropY");
  const imageZoom = readOptionalNumber(body.imageZoom, "imageZoom");

  if (imageZoom !== undefined && imageZoom < 1) {
    throw new Error("imageZoom must be greater than or equal to 1");
  }

  return {
    imageCropX,
    imageCropY,
    imageZoom,
  };
};

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
  let imageUrl: string | null = null;

  try {
    const { name, price, description, categoryId } = req.body;
    let cropSettings: ReturnType<typeof readImageCropSettings>;

    try {
      cropSettings = readImageCropSettings(req.body);
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error ? error.message : "Crop settings are invalid",
      });
    }

    const file = req.file;
    const normalizedName = typeof name === "string" ? name.trim() : "";

    if (!normalizedName || price === undefined || categoryId === undefined) {
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

    if (file) {
      try {
        imageUrl = await saveUploadedProductImage(file);
      } catch (error) {
        return res.status(400).json({
          message:
            error instanceof Error ? error.message : "Uploaded image is invalid.",
        });
      }
    }

    const product = await prisma.product.create({
      data: {
        name: normalizedName,
        price: new Prisma.Decimal(String(price)),
        description: description ? String(description).trim() : null,
        imageUrl,
        imageCropX: cropSettings.imageCropX ?? 0,
        imageCropY: cropSettings.imageCropY ?? 0,
        imageZoom: cropSettings.imageZoom ?? 1,
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
    if (imageUrl) {
      await deleteUploadedProductImage(imageUrl);
    }

    console.error("Error creating product:", error);
    res.status(500).json({
      message: "Failed to create product",
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  let newImageUrl: string | undefined;

  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid product id",
      });
    }

    const { name, price, description, categoryId } = req.body;
    let cropSettings: ReturnType<typeof readImageCropSettings>;

    try {
      cropSettings = readImageCropSettings(req.body);
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error ? error.message : "Crop settings are invalid",
      });
    }

    const file = req.file;
    const normalizedName =
      name !== undefined && typeof name === "string" ? name.trim() : undefined;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (name !== undefined && !normalizedName) {
      return res.status(400).json({
        message: "name cannot be empty",
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

    if (file) {
      try {
        newImageUrl = await saveUploadedProductImage(file);
      } catch (error) {
        return res.status(400).json({
          message:
            error instanceof Error ? error.message : "Uploaded image is invalid.",
        });
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(normalizedName !== undefined && { name: normalizedName }),
        ...(price !== undefined && {
          price: new Prisma.Decimal(String(price)),
        }),
        ...(description !== undefined && {
          description: description ? String(description).trim() : null,
        }),
        ...(newImageUrl && {
          imageUrl: newImageUrl,
        }),
        ...(cropSettings.imageCropX !== undefined && {
          imageCropX: cropSettings.imageCropX,
        }),
        ...(cropSettings.imageCropY !== undefined && {
          imageCropY: cropSettings.imageCropY,
        }),
        ...(cropSettings.imageZoom !== undefined && {
          imageZoom: cropSettings.imageZoom,
        }),
        ...(categoryId !== undefined && {
          categoryId: Number(categoryId),
        }),
      },
      include: {
        category: true,
      },
    });

    if (newImageUrl) {
      await deleteUploadedProductImage(existingProduct.imageUrl);
    }

    res.status(200).json({
      message: "Product updated successfully",
      product: formatProduct(updatedProduct),
    });
  } catch (error) {
    if (newImageUrl) {
      await deleteUploadedProductImage(newImageUrl);
    }

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

    try {
      await prisma.product.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2003"
      ) {
        return res.status(409).json({
          message:
            "Cannot delete product because it is used by existing orders. Edit it or keep it for order history.",
        });
      }

      throw error;
    }

    await deleteUploadedProductImage(existingProduct.imageUrl);

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
