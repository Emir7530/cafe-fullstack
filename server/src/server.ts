import "dotenv/config";
import express from "express";
import cors from "cors";
import productsRoutes from "./routes/productsRoutes";
import categoriesRoutes from "./routes/categoriesRoutes"
import { errorHandler } from "./middlewares/errorMiddleware";
import authRoutes from "./routes/authRoutes";


const app = express();
app.use(errorHandler);
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Cafe API running...");
});

app.use("/api/products", productsRoutes);

app.use("/api/categories", categoriesRoutes);
app.use("/api/auth", authRoutes);
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
