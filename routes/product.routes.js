import express from "express";
import product from "../controllers/product.controller.js"
import { verifyToken } from "../middleware/verifytoken.js";
const router =express.Router();
router.get("/", product.getAllProducts);
router.get("/featured", product.getFeaturedProducts );
router.post("/", verifyToken,product.createProduct);
router.patch("/:id", verifyToken, product.toggleFeaturedProduct);
router.delete("/:id", verifyToken, product.deleteProduct);
router.get("/:id", product.getProductById);
export default router