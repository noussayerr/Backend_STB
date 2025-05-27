import express from "express";
import accountController from "../controllers/account.controller.js";
import adminroutes from "../controllers/admin.controller.js";
import { verifyToken } from "../middleware/verifytoken.js";
const router =express.Router();
router.get("/getaccounttypes", accountController.getAccountTypes);
router.post("/createaccounttype", adminroutes.createAccountType);
router.get("/getaccounttype/:id", accountController.getAccountTypeById);
router.put("/updateaccounttype/:id", adminroutes.updateAccountType);
router.post('/submitapplication', verifyToken, accountController.submitAccountApplication);
router.get('/myapplications', verifyToken, accountController.getUserApplications);
router.get('/allapplications',accountController.allapplications)

router.put('/applications/:id/status', accountController.updateApplicationStatus);

export default router