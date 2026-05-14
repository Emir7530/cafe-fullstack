import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

type JwtPayload = {
  userId: number;
};

export type AuthRequest = Request & {
  user?: JwtPayload & {
    role: "customer" | "admin";
  };
};

const getTokenPayload = (token: string): JwtPayload => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT secret is not configured.");
  }

  const decoded = jwt.verify(token, secret);

  const userId =
    typeof decoded === "object" && decoded !== null && "userId" in decoded
      ? Number(decoded.userId)
      : NaN;

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid token payload.");
  }

  return {
    userId,
  };
};

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token." });
    }

    const token = authHeader.split(" ")[1];

    const decoded = getTokenPayload(token);
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found." });
    }

    req.user = {
      userId: user.id,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof Error && error.message === "JWT secret is not configured.") {
      return res.status(500).json({ message: error.message });
    }

    return res.status(401).json({ message: "Not authorized, invalid token." });
  }
};

export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized." });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }

  next();
};
