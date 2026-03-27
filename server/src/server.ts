import express from "express";
import cors from "cors";
import productsRoutes from "./routes/productsRoutes";
import categoriesRoutes from "./routes/categoriesRoutes"


const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Cafe API running...");
});

app.use("/api/products", productsRoutes);

app.use("/api/categories", categoriesRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});