import express from 'express';
import notificationController from '../controllers/notificationController.js';
import { verifyToken } from "../middleware/verifytoken.js";

const router = express.Router();

// Route to register a push token for a user
router.post('/register-token', verifyToken, notificationController.registerPushToken);

export default router;