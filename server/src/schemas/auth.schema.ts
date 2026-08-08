import { z } from "zod"
import { normalizePhoneNumber } from "../utils/phone.js"

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().optional().transform((val) => val ? normalizePhoneNumber(val) : val),
    address: z.string().optional(),
    city: z.string().optional(),
    zipCode: z.string().optional()
  })
})

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required")
  })
})

export const profileUpdateSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().optional().transform((val) => val ? normalizePhoneNumber(val) : val),
    address: z.string().optional(),
    city: z.string().optional(),
    zipCode: z.string().optional()
  })
})

export const sendOtpSchema = z.object({
  body: z.object({
    contact: z.string().min(3, "Contact (email or phone) is required").transform((val) => val.includes("@") ? val : normalizePhoneNumber(val))
  })
})

export const verifyOtpSchema = z.object({
  body: z.object({
    contact: z.string().min(3, "Contact (email or phone) is required").transform((val) => val.includes("@") ? val : normalizePhoneNumber(val)),
    otp: z.string().length(6, "OTP must be exactly 6 digits")
  })
})

export const googleLoginSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Google token is required")
  })
})

export const createAddressSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z
      .string()
      .refine((val) => val.replace(/\D/g, "").length >= 10, { message: "Phone number must be at least 10 digits" })
      .transform((val) => normalizePhoneNumber(val)),
    address: z.string().min(5, "Address must be at least 5 characters"),
    city: z.string().min(2, "City must be at least 2 characters"),
    zipCode: z
      .string()
      .min(3, "ZIP Code must be at least 3 characters")
      .max(10, "ZIP Code cannot exceed 10 characters")
      .regex(/^[a-zA-Z0-9\s-]*$/, "ZIP Code contains invalid characters"),
    country: z.string().optional()
  })
})

export const verifyPhoneSchema = z.object({
  body: z.object({
    phone: z.string().min(10, "Phone number must be at least 10 digits").transform((val) => normalizePhoneNumber(val)),
    otp: z.string().length(6, "OTP must be exactly 6 digits")
  })
})
