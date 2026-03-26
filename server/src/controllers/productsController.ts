import type { Request, Response } from "express";
import type { Product } from "../models/product";

let products: Product[] = [
    { id: 1, name: "Latte", price: 190, category: "Hot Drinks", description: "Hot latte with milk and coffee", imageUrl: "", section: "menu" },
    { id: 2, name: "Hibiscus", price: 220, category: "Refresh Drinks", description: "Berry hibiscus", imageUrl: "", section: "menu" },
    { id: 3, name: "Croissants", price: 250, category: "Desserts", description: "A dessert with chocolate", imageUrl: "", section: "menu" }
];

export const getProducts = (req: Request, res: Response) => {
    const { section, category, search, minPrice, maxPrice, sort, page, limit } = req.query;
    let result = [...products];
    // Section Filter
    if (section) {
        result = result.filter((product) =>
            product.section.toLowerCase() === String(section).toLowerCase()
        );
    }
    // Category Filter
    if (category) {
        result = result.filter((product) =>
            product.category.toLowerCase() === String(category).toLowerCase()
        );
    }
    // Search Filter
    if (search) {
        const searchText = String(search).toLowerCase();

        result = result.filter((product) =>
            product.name.toLowerCase().includes(searchText) ||
            product.description.toLowerCase().includes(searchText) ||
            product.category.toLowerCase().includes(searchText)
        );
    }
    // Price Filter
    if (minPrice) {
        result = result.filter((product) =>
            product.price >= Number(minPrice)
        );
    }

    if (maxPrice) {
        result = result.filter((product) =>
            product.price <= Number(maxPrice)
        );
    }
    // Sorting
    if (sort === "asc") {
        result.sort((a, b) => a.price - b.price);
    }

    if (sort === "desc") {
        result.sort((a, b) => b.price - a.price);
    }
    // Pagination
    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.max(1, Number(limit) || result.length);

    const startIndex = (pageNumber - 1) * limitNumber;
    const endIndex = startIndex + limitNumber;

    const paginatedProducts = result.slice(startIndex, endIndex);

    res.json({
        total: result.length,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(result.length / limitNumber),
        data: paginatedProducts,
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

    res.json(product);
};

export const updateProduct = (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product id." });
    }

    const { name, price, section, category, description, imageUrl } = req.body;

    const product = products.find((product) => product.id === id);

    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    if (price !== undefined && (typeof price !== "number" || price <= 0)) {
        return res.status(400).json({ message: "Price must be a positive number." });
    }

    if (section !== undefined && section !== "menu" && section !== "shop") {
        return res.status(400).json({ message: "Section must be either 'menu' or 'shop'." });
    }

    if (name !== undefined && (typeof name !== "string" || !name.trim())) {
        return res.status(400).json({ message: "Name must be a non-empty string." });
    }

    if (category !== undefined && (typeof category !== "string" || !category.trim())) {
        return res.status(400).json({ message: "Category must be a non-empty string." });
    }

    if (description !== undefined && (typeof description !== "string" || !description.trim())) {
        return res.status(400).json({ message: "Description must be a non-empty string." });
    }
    if (imageUrl !== undefined && typeof imageUrl !== "string") {
        return res.status(400).json({ message: "Image URL must be a string." });
    }

    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;
    if (section !== undefined) product.section = section;
    if (category !== undefined) product.category = category;
    if (description !== undefined) product.description = description;
    if (imageUrl !== undefined) product.imageUrl = imageUrl;

    res.json(product);
};

export const createProduct = (req: Request, res: Response) => {
    const { name, price, section, category, description, imageUrl } = req.body;

    if (!name || price === undefined || !section || !category || !description) {
        return res.status(400).json({ message: "Missing Fields." });
    }

    if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ message: "Name is required." });
    }

    if (typeof category !== "string" || !category.trim()) {
        return res.status(400).json({ message: "Category is required." });
    }

    if (typeof description !== "string" || !description.trim()) {
        return res.status(400).json({ message: "Description is required." });
    }

    if (typeof price !== "number" || price <= 0) {
        return res.status(400).json({ message: "Price must be a positive number." });
    }

    if (imageUrl !== undefined && typeof imageUrl !== "string") {
        return res.status(400).json({ message: "Image URL must be a string." });
    }


    if (section !== "menu" && section !== "shop") {
        return res.status(400).json({ message: "Section must be either 'menu' or 'shop'." });
    }

    const newProduct: Product = {
        id: products.length ? Math.max(...products.map((product) => product.id)) + 1 : 1,
        name,
        price,
        section,
        category,
        description,
        imageUrl: imageUrl || "",
    };

    products.push(newProduct);

    res.status(201).json(newProduct);
};

export const deleteProduct = (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product id." });
    }
    const productIndex = products.findIndex((product) => product.id === id);

    if (productIndex === -1) {
        return res.status(404).json({ message: "Product not found" });
    }

    const deletedProduct = products.splice(productIndex, 1);

    res.json({
        message: "Product deleted successfully",
        product: deletedProduct[0],
    });
};