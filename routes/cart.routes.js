import express from "express";
import cart from "../controllers/cart.controller.js";
import { verifyToken } from "../middleware/verifytoken.js";
const router = express.Router();

router.get("/", verifyToken,cart.getCartProducts);
router.post("/", verifyToken,cart.addToCart);
router.delete("/", verifyToken,cart.removeAllFromCart);
router.put("/:id", verifyToken,cart.updateQuantity);

export default router;