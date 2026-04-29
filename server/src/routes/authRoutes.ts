import express from "express";
import { register, login } from "../controllers/authController";
import { protect, type AuthRequest } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", protect, (req, res) => {
  const authReq = req as AuthRequest;

  res.json({
    message: "Protected route works.",
    user: authReq.user,
  });
});
export default router;
