import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productsController";
import { protect, adminOnly } from "../middlewares/authMiddleware";
import { uploadProductImage } from "../middlewares/uploadMiddleware";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post(
  "/",
  protect,
  adminOnly,
  uploadProductImage.single("image"),
  createProduct
);

router.put(
  "/:id",
  protect,
  adminOnly,
  uploadProductImage.single("image"),
  updateProduct
);
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;