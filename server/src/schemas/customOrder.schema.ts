import { z } from "zod"
import { CustomOrderStatus } from "@prisma/client"
import { normalizePhoneNumber } from "../utils/phone.js"

export const createCustomOrderSchema = z.object({
  body: z.object({
    type: z.string().min(2, "Type is required"),
    description: z.string().min(20, "Description must be at least 20 characters").max(1000, "Description cannot exceed 1000 characters"),
    size: z
      .string()
      .max(50, "Size description cannot exceed 50 characters")
      .regex(/^[a-zA-Z0-9\s"'.xX-]*$/, "Size contains invalid characters")
      .optional(),
    budget: z
      .string()
      .transform((val) => parseFloat(val))
      .refine((val) => val >= 4000, { message: "Budget must be at least ₹4,000 INR" }),
    customerName: z.string().min(2, "Name must be at least 2 characters"),
    customerEmail: z.string().email("Invalid email format"),
    customerPhone: z.string().min(10, "Phone number must be at least 10 digits").transform((val) => normalizePhoneNumber(val))
  })
})

export const updateCustomOrderStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(CustomOrderStatus, { errorMap: () => ({ message: "Invalid custom order status" }) })
  })
})
