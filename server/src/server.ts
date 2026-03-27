import express from "express";
import cors from "cors";
import productsRoutes from "./routes/productsRoutes";


const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Cafe API running...");
});

app.use("/api/products", productsRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});