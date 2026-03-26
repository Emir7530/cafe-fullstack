import express from "express";
import cors from "cors";
import productsRoutes from "./routes/productsRoutes";


const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/products", productsRoutes);

app.get("/", (req, res) => {
  res.send("Cafe API running...");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});