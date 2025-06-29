import express from "express";
import auth from "../controllers/auth.controller.js"
import { verifyToken } from "../middleware/verifytoken.js";
import accountcontroller from "../controllers/account.controller.js";
import dashboardController from '../controllers/dashboardController.js';
const router =express.Router();
router.get('/dashboard', dashboardController.getDashboardData);
router.get("/check-auth", verifyToken, auth.checkAuth);
router.post("/ribcheck",accountcontroller.findrrib)
router.post("/signup",auth.signup)
router.post("/verify_email",auth.verifyemail)
router.post("/login",auth.login)
router.post("/logout",auth.logout)
router.post("/forgotpassword",auth.forgotpassword)
router.post("/resetpassword/:token",auth.resetpassword)

router.get("/applications", verifyToken, auth.getUserApplications);
router.get("/applications/:type/:id", verifyToken, auth.getApplicationDetails);
router.put("/profile", verifyToken, auth.updateProfile);


export default router