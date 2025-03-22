import express from "express";
import auth from "../controllers/auth.controller.js"
import { verifyToken } from "../middleware/verifytoken.js";
const router =express.Router();
router.get("/check-auth", verifyToken, auth.checkAuth);
router.post("/signup",auth.signup)
router.post("/verify_email",auth.verifyemail)
router.post("/login",auth.login)
router.post("/logout",auth.logout)
router.post("/forgotpassword",auth.forgotpassword)
router.post("/resetpassword/:token",auth.resetpassword)
export default router