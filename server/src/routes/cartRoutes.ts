import { Router } from "express"
import { getCart, updateCart, deleteCartItem, clearCart, syncCartSchema } from "../controllers/cartController.js"
import { authenticate } from "../middleware/authMiddleware.js"
import { validateRequest } from "../middleware/validateMiddleware.js"

const router = Router()

// All cart routes require authentication
router.use(authenticate as any)

router.get("/", getCart as any)
router.post("/", validateRequest(syncCartSchema), updateCart as any)
router.delete("/:productId", deleteCartItem as any)
router.delete("/", clearCart as any)

export default router
