import { Router } from "express"
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  sendOtp,
  verifyOtp,
  googleLogin,
  getAddresses,
  addAddress,
  deleteAddress,
  updateAddress,
  verifyPhone,
  registerSchema,
  loginSchema,
  profileUpdateSchema,
  sendOtpSchema,
  verifyOtpSchema,
  googleLoginSchema,
  createAddressSchema,
  verifyPhoneSchema
} from "../controllers/authController.js"
import { authenticate } from "../middleware/authMiddleware.js"
import { validateRequest } from "../middleware/validateMiddleware.js"
import { authLimiter } from "../middleware/securityMiddleware.js"

const router = Router()

router.post("/register", authLimiter, validateRequest(registerSchema), register)
router.post("/login", authLimiter, validateRequest(loginSchema), login)
router.post("/logout", logout)
router.post("/send-otp", authLimiter, validateRequest(sendOtpSchema), sendOtp as any)
router.post("/verify-otp", authLimiter, validateRequest(verifyOtpSchema), verifyOtp as any)
router.post("/google", authLimiter, validateRequest(googleLoginSchema), googleLogin as any)

// Protected routes
router.get("/me", authenticate as any, getMe as any)
router.put("/profile", authenticate as any, validateRequest(profileUpdateSchema), updateProfile as any)

// Address Book routes
router.get("/addresses", authenticate as any, getAddresses as any)
router.post("/addresses", authenticate as any, validateRequest(createAddressSchema), addAddress as any)
router.put("/addresses/:id", authenticate as any, validateRequest(createAddressSchema), updateAddress as any)
router.delete("/addresses/:id", authenticate as any, deleteAddress as any)

// Phone verification
router.post("/verify-phone", authenticate as any, authLimiter, validateRequest(verifyPhoneSchema), verifyPhone as any)

export default router
