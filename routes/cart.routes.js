// routes/cart.routes.js
import express from "express";
import cardController from "../controllers/cart.controller.js";
import adminroutes from "../controllers/admin.controller.js";
import { verifyToken } from "../middleware/verifytoken.js";
const router = express.Router();

// cart type
router.get("/getcardtypes", cardController.getCardTypes);
router.get("/onecart/:id", cardController.getCardTypeById);
router.post("/addcardtype", adminroutes.createCardType);
router.put("/updatecardtype/:id", adminroutes.updateCardType);
router.delete('/cardtypes/:id', adminroutes.deleteCardType);

// applications
router.post("/submitapplication", verifyToken, cardController.submitApplication);
router.get("/allapplications", cardController.allapplication);
router.put("/processapplication/:applicationId", cardController.processApplication);

export default router;