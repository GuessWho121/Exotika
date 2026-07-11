import { Router } from "express"
import {
  createOrder,
  getOrders,
  updateOrderStatus,
  verifyPayment,
  getShippingQuote,
  createOrderSchema,
  updateOrderStatusSchema
} from "../controllers/orderController.js"
import { authenticate, optionalAuthenticate, requireAdmin } from "../middleware/authMiddleware.js"
import { validateRequest } from "../middleware/validateMiddleware.js"

const router = Router()

// Public checkout endpoints
router.post("/", optionalAuthenticate as any, validateRequest(createOrderSchema), createOrder as any)
router.post("/verify", optionalAuthenticate as any, verifyPayment as any)
router.post("/shipping-quote", optionalAuthenticate as any, getShippingQuote as any)

// Protected endpoints
router.get("/", authenticate as any, getOrders as any)
router.put(
  "/:id/status",
  authenticate as any,
  requireAdmin as any,
  validateRequest(updateOrderStatusSchema),
  updateOrderStatus as any
)

export default router
