import type { Response } from "express";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import type { AuthRequest } from "../middlewares/authMiddleware";

type CheckoutItem = {
    productId: number;
    quantity: number;
};

export const createOrder = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Not authorized." });
        }

        const { customerName, customerEmail, phone, address, note, items } = req.body;

        if (
            !customerName?.trim() ||
            !customerEmail?.trim() ||
            !phone?.trim() ||
            !address?.trim()
        ) {
            return res.status(400).json({
                message: "Customer name, email, phone and address are required.",
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "Order must include at least one item.",
            });
        }

        const normalizedItems: CheckoutItem[] = items.map((item) => ({
            productId: Number(item.productId),
            quantity: Number(item.quantity),
        }));

        const invalidItem = normalizedItems.find(
            (item) =>
                isNaN(item.productId) ||
                isNaN(item.quantity) ||
                item.productId <= 0 ||
                item.quantity <= 0
        );

        if (invalidItem) {
            return res.status(400).json({
                message: "Invalid order item.",
            });
        }

        const productIds = normalizedItems.map((item) => item.productId);

        const products = await prisma.product.findMany({
            where: {
                id: {
                    in: productIds,
                },
                category: {
                    section: "shop",
                },
            },
            include: {
                category: true,
            },
        });

        if (products.length !== productIds.length) {
            return res.status(400).json({
                message: "Some products are invalid or not shop products.",
            });
        }

        let total = new Prisma.Decimal(0);

        const orderItemsData = normalizedItems.map((item) => {
            const product = products.find((p) => p.id === item.productId);

            if (!product) {
                throw new Error("Product not found.");
            }

            const itemTotal = product.price.mul(item.quantity);
            total = total.add(itemTotal);

            return {
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
            };
        });

        const order = await prisma.order.create({
            data: {
                userId: req.user.userId,
                customerName: String(customerName).trim(),
                customerEmail: String(customerEmail).trim().toLowerCase(),
                phone: String(phone).trim(),
                address: String(address).trim(),
                note: note ? String(note).trim() : null,
                total,
                items: {
                    create: orderItemsData,
                },
            },
            include: {
                items: true,
            },
        });

        res.status(201).json({
            message: "Order created successfully.",
            order: {
                ...order,
                total: Number(order.total),
                items: order.items.map((item) => ({
                    ...item,
                    price: Number(item.price),
                })),
            },
        });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({
            message: "Failed to create order.",
        });
    }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Not authorized." });
        }

        const orders = await prisma.order.findMany({
            where: {
                userId: req.user.userId,
            },
            include: {
                items: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.status(200).json(
            orders.map((order) => ({
                ...order,
                total: Number(order.total),
                items: order.items.map((item) => ({
                    ...item,
                    price: Number(item.price),
                })),
            }))
        );
    } catch (error) {
        console.error("Error fetching my orders:", error);
        res.status(500).json({
            message: "Failed to fetch orders.",
        });
    }
};

export const getAllOrders = async (_req: AuthRequest, res: Response) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                items: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.status(200).json(
            orders.map((order) => ({
                ...order,
                total: Number(order.total),
                items: order.items.map((item) => ({
                    ...item,
                    price: Number(item.price),
                })),
            }))
        );
    } catch (error) {
        console.error("Error fetching all orders:", error);
        res.status(500).json({
            message: "Failed to fetch orders.",
        });
    }
};