import { Router } from "express"
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductSchema,
  updateProductSchema,
  toggleProductFavorite,
  getUserFavorites,
  getProductReviews,
  createProductReview
} from "../controllers/productController.js"
import { authenticate, requireAdmin } from "../middleware/authMiddleware.js"
import { validateRequest } from "../middleware/validateMiddleware.js"

const router = Router()

// Favorites (Must reside before /:id parameter matching)
router.get("/user/favorites", authenticate as any, getUserFavorites as any)

router.get("/", getProducts)
router.get("/:id", getProductById)
router.post("/:id/favorite", authenticate as any, toggleProductFavorite as any)

// Product Reviews
router.get("/:id/reviews", getProductReviews)
router.post("/:id/reviews", authenticate as any, createProductReview as any)

// Protected Admin Routes
router.post(
  "/",
  authenticate as any,
  requireAdmin as any,
  validateRequest(createProductSchema),
  createProduct
)
router.put(
  "/:id",
  authenticate as any,
  requireAdmin as any,
  validateRequest(updateProductSchema),
  updateProduct
)
router.delete(
  "/:id",
  authenticate as any,
  requireAdmin as any,
  deleteProduct
)

export default router
