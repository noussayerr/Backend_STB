import express from "express";
import cardController from "../controllers/cart.controller.js";
import adminroutes from "../controllers/admin.controller.js";
import { verifyToken } from "../middleware/verifytoken.js";
const router =express.Router();

router.get("/getcardtypes", cardController.getCardTypes);
router.post("/addcardtype", adminroutes.createCardType);
router.get("/onecart/:id", cardController.getCardTypeById);
router.put("/updatecardtype/:id", adminroutes.updateCardType);
router.delete('/cardtypes/:id', adminroutes.deleteCardType);
export default router