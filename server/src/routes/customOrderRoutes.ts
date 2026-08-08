import { Router } from "express"
import {
  createCustomOrder,
  getCustomOrders,
  updateCustomOrderStatus
} from "../controllers/customOrderController.js"
import {
  createCustomOrderSchema,
  updateCustomOrderStatusSchema
} from "../schemas/customOrder.schema.js"
import { authenticate, requireAdmin } from "../middleware/authMiddleware.js"
import { upload } from "../middleware/uploadMiddleware.js"
import { validateRequest } from "../middleware/validateMiddleware.js"
import { xssSanitizer } from "../middleware/securityMiddleware.js"

const router = Router()

// Custom order creation: optional auth, parsed by multer first, then validated by Zod
router.post(
  "/",
  upload.array("references", 3), // Handle file stream
  xssSanitizer,
  (req, res, next) => {
    // Parse form-data before validating with Zod
    next()
  },
  validateRequest(createCustomOrderSchema),
  createCustomOrder as any
)

// Protected endpoints
router.get("/", authenticate as any, getCustomOrders as any)
router.put(
  "/:id/status",
  authenticate as any,
  requireAdmin as any,
  validateRequest(updateCustomOrderStatusSchema),
  updateCustomOrderStatus as any
)

export default router
