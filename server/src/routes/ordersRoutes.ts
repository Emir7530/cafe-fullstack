import express from "express";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
} from "../controllers/ordersController";
import { protect, adminOnly } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/", protect, adminOnly, getAllOrders);

export default router;