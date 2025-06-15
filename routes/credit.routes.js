import express from "express";
import creditController from "../controllers/credit.controller.js";
import adminroutes from "../controllers/admin.controller.js";
import { verifyToken } from "../middleware/verifytoken.js";

const router = express.Router();

// Credit Type Routes
router.get("/credittypes", creditController.getCreditTypes);
router.get("/credittypes/:id", creditController.getCreditType);
router.post("/credittypes", adminroutes.createCreditType);
router.put("/credittypes/:id", adminroutes.updateCreditType);
router.delete("/credittypes/:id", adminroutes.deleteCreditType);

// Application Routes
router.post("/submitapplication", verifyToken, creditController.submitCreditApplication);
router.get("/myapplications", verifyToken, creditController.getUserCreditApplications);
router.get("/allapplications", creditController.getAllApplications);
router.get("/applications/:id", creditController.getApplicationById);
router.put("/applications/:id/status", creditController.updateApplicationStatus);

// Credit Accounts
router.get("/mycredits", verifyToken, creditController.getUserCredits);

export default router;