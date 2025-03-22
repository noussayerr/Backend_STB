import express from "express";
import order from "../controllers/order.controller.js";
import { verifyToken,adminRoute } from "../middleware/verifytoken.js";
const router =express.Router();

router.post("/",verifyToken, order.checkoutSuccess);
router.get('/user-orders',verifyToken,order.getUserOrders)
router.delete('/:orderId',verifyToken,order.deleteOrder)
router.get('/',verifyToken,adminRoute,order.getallorders)
router.put('/:orderId/status',verifyToken,adminRoute,order.updateOrderStatus)
export default router