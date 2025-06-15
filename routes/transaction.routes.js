import express from "express";
import { transferFunds, getTransactionHistory } from "../controllers/transaction.controller.js";
import { verifyToken } from "../middleware/verifytoken.js";

const router = express.Router();

// Protected routes
router.post("/transfer", verifyToken, transferFunds);
router.get("/history", verifyToken, getTransactionHistory);

export default router;