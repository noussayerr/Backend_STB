import express from "express";
import adminroutes from "../controllers/admin.controller.js";
import adminController from "../controllers/credit.controller.js";
import { verifyToken } from "../middleware/verifytoken.js";
const router =express.Router();
router.get('/credittypes', adminController.getCreditTypes);
router.get('/credittypes/:id', adminController.getCreditType);
router.post('/credittypes', adminroutes.createCreditType);
router.put('/credittypes/:id', adminroutes.updateCreditType);
router.delete('/credittypes/:id', adminroutes.deleteCreditType);
export default router