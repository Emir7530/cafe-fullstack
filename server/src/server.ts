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

app.use(cors());
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

app.listen(5000, () => {
  console.log("Server running on port 5000");
});