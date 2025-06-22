// routes/reclamation.routes.js
import express from "express";
import reclamationController from "../controllers/reclamation.controller.js";
import { verifyToken } from "../middleware/verifytoken.js";

const router = express.Router();

// User routes
router.post("/", verifyToken, reclamationController.createReclamation);
router.get("/user", verifyToken, reclamationController.getUserReclamations);

// Admin routes
router.get("/", reclamationController.getAllReclamations);
router.get("/:id", reclamationController.getReclamationById);
router.put("/:id/status", reclamationController.updateReclamationStatus);
router.put("/:id/response", reclamationController.addResponse);

export default router;