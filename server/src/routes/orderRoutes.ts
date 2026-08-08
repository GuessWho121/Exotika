import { Router } from "express"
import {
  createOrder,
  getOrders,
  updateOrderStatus,
  verifyPayment,
  getShippingQuote
} from "../controllers/orderController.js"
import {
  createOrderSchema,
  updateOrderStatusSchema
} from "../schemas/order.schema.js"
import { authenticate, optionalAuthenticate, requireAdmin } from "../middleware/authMiddleware.js"
import { validateRequest } from "../middleware/validateMiddleware.js"
import { orderLimiter } from "../middleware/securityMiddleware.js"

const router = Router()

// Public checkout endpoints
router.post("/", optionalAuthenticate as any, orderLimiter, validateRequest(createOrderSchema), createOrder as any)
router.post("/verify", optionalAuthenticate as any, orderLimiter, verifyPayment as any)
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
