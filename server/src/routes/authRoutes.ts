import express from "express";
import { register, login } from "../controllers/authController";
import { protect, type AuthRequest } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", protect, (req, res) => {
  res.json({
    message: "Protected route works.",
    user: req.user,
  });
});
export default router;