import express from "express";
import adminroutes from "../controllers/admin.controller.js";
import creidtcontroller from "../controllers/credit.controller.js";
import { verifyToken } from "../middleware/verifytoken.js";
const router =express.Router();
router.get('/credittypes', creidtcontroller.getCreditTypes);
router.get('/credittypes/:id', creidtcontroller.getCreditType);
router.post('/credittypes', adminroutes.createCreditType);
router.put('/credittypes/:id', adminroutes.updateCreditType);
router.delete('/credittypes/:id', adminroutes.deleteCreditType);
router.post('/submitapplication', verifyToken, creidtcontroller.submitCreditApplication);
router.get('/myapplications', verifyToken, creidtcontroller.getUserCreditApplications);
export default router