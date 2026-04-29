import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";

import productsRoutes from "./routes/productsRoutes";
import categoriesRoutes from "./routes/categoriesRoutes";
import authRoutes from "./routes/authRoutes";
import { errorHandler } from "./middlewares/errorMiddleware";
import ordersRoutes from "./routes/ordersRoutes";

const app = express();

const configuredOrigins = (process.env.CLIENT_ORIGIN || process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://192.168.1.35:5173",
  "http://192.168.1.102:5173",
  ...configuredOrigins,
]);

const isLanDevOrigin = (origin: string) => {
  try {
    const url = new URL(origin);

    if (url.protocol !== "http:") {
      return false;
    }

    const { hostname } = url;

    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
    );
  } catch {
    return false;
  }
};

app.use(
  cors({
    origin(
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) {
      if (!origin || allowedOrigins.has(origin) || isLanDevOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS.`));
    },
    credentials: true,
  })
);
app.use(express.json());

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (req, res) => {
  res.send("Cafe API running...");
});

app.use("/api/products", productsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", ordersRoutes);

app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
