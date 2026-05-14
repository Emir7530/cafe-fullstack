import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { Prisma } from "../generated/prisma/client";
import app from "../app";
import { prisma } from "../lib/prisma";

vi.mock("../lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    order: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

type PrismaMock = {
  user: {
    findUnique: Mock;
  };
  product: {
    findMany: Mock;
    findUnique: Mock;
    delete: Mock;
  };
  order: {
    create: Mock;
  };
};

const prismaMock = prisma as unknown as PrismaMock;
const JWT_SECRET = "test-secret";

const authHeader = (userId = 1) =>
  `Bearer ${jwt.sign({ userId }, JWT_SECRET)}`;

describe("Cafe API", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = JWT_SECRET;
    vi.clearAllMocks();
  });

  it("returns the current database user from /auth/me", async () => {
    const createdAt = new Date("2026-01-01T10:00:00.000Z");

    prismaMock.user.findUnique
      .mockResolvedValueOnce({ id: 1, role: "admin" })
      .mockResolvedValueOnce({
        id: 1,
        name: "Admin User",
        email: "admin@example.com",
        role: "admin",
        createdAt,
      });

    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", authHeader());

    expect(response.status).toBe(200);
    expect(response.body.user).toMatchObject({
      id: 1,
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
    });
  });

  it("aggregates duplicate checkout items and calculates totals server-side", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 1, role: "customer" });
    prismaMock.product.findMany.mockResolvedValue([
      {
        id: 10,
        name: "House Beans",
        price: new Prisma.Decimal("100.00"),
      },
      {
        id: 20,
        name: "Cold Brew Bottle",
        price: new Prisma.Decimal("75.50"),
      },
    ]);

    prismaMock.order.create.mockImplementation(async (args) => {
      expect(args.data.items.create).toEqual([
        {
          productId: 10,
          name: "House Beans",
          price: new Prisma.Decimal("100.00"),
          quantity: 3,
        },
        {
          productId: 20,
          name: "Cold Brew Bottle",
          price: new Prisma.Decimal("75.50"),
          quantity: 1,
        },
      ]);
      expect(Number(args.data.total)).toBe(375.5);

      return {
        id: 1,
        userId: 1,
        customerName: "Emir",
        customerEmail: "emir@example.com",
        phone: "5551234567",
        address: "Istanbul",
        note: null,
        total: args.data.total,
        status: "pending",
        items: args.data.items.create.map(
          (
            item: {
              productId: number;
              name: string;
              price: Prisma.Decimal;
              quantity: number;
            },
            index: number
          ) => ({
            id: index + 1,
            orderId: 1,
            createdAt: new Date(),
            ...item,
          })
        ),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    const response = await request(app)
      .post("/api/orders")
      .set("Authorization", authHeader())
      .send({
        customerName: " Emir ",
        customerEmail: " Emir@Example.com ",
        phone: "5551234567",
        address: "Istanbul",
        items: [
          { productId: 10, quantity: 1 },
          { productId: 10, quantity: 2 },
          { productId: 20, quantity: 1 },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body.order.total).toBe(375.5);
    expect(response.body.order.items[0].quantity).toBe(3);
    expect(response.body.order.customerEmail).toBe("emir@example.com");
  });

  it("returns 409 when deleting a product used by an order", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 1, role: "admin" });
    prismaMock.product.findUnique.mockResolvedValue({
      id: 10,
      imageUrl: null,
    });
    prismaMock.product.delete.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Foreign key constraint", {
        code: "P2003",
        clientVersion: "test",
      })
    );

    const response = await request(app)
      .delete("/api/products/10")
      .set("Authorization", authHeader());

    expect(response.status).toBe(409);
    expect(response.body.message).toContain("existing orders");
  });
});
