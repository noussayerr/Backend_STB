import express from "express";
import accountController from "../controllers/account.controller.js";
import adminroutes from "../controllers/admin.controller.js";
import { verifyToken } from "../middleware/verifytoken.js";
const router = express.Router();

// Account Type Routes
router.get("/getaccounttypes", accountController.getAccountTypes);
router.post("/createaccounttype", adminroutes.createAccountType);
router.get("/getaccounttype/:id", accountController.getAccountTypeById);
router.put("/updateaccounttype/:id", adminroutes.updateAccountType);

// Application Routes
router.post('/submitapplication', verifyToken, accountController.submitAccountApplication);
router.get('/myapplications', verifyToken, accountController.getUserApplications);
router.get('/allapplications', accountController.allapplications);
router.put('/applications/:id/status', accountController.updateApplicationStatus);

// Account Routes
router.get('/myaccounts', verifyToken, accountController.getuseraccounts); // New route for user accounts
router.post('/findrib', verifyToken, accountController.findrrib);

export default router;