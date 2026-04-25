import express from "express";
import {
  getCategories,
  createCategory,
  deleteCategory,
} from "../controllers/categoriesController";
import { protect, adminOnly } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", getCategories);

router.post("/", protect, adminOnly, createCategory);
router.delete("/:id", protect, adminOnly, deleteCategory);

export default router;