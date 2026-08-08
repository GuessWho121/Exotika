import { z } from "zod"
import { OrderStatus } from "@prisma/client"
import { normalizePhoneNumber } from "../utils/phone.js"

export const createOrderSchema = z.object({
  body: z.object({
    customerName: z.string().min(2, "Name must be at least 2 characters"),
    customerEmail: z.string().email("Invalid email format"),
    customerPhone: z.string().min(10, "Phone number must be at least 10 digits").transform((val) => normalizePhoneNumber(val)),
    shippingAddress: z.string().min(5, "Address must be at least 5 characters"),
    shippingCity: z.string().min(2, "City must be at least 2 characters"),
    shippingState: z.string().optional(),
    shippingZipCode: z.string().min(4, "Zip code must be at least 4 characters"),
    shippingCountry: z.string().optional(),
    expectedShippingRate: z.number().nonnegative().optional(),
    idempotencyKey: z.string().optional(),
    items: z
      .array(
        z.object({
          productId: z.string().uuid("Invalid product ID format"),
          quantity: z.number().int().positive("Quantity must be at least 1")
        })
      )
      .min(1, "Order must contain at least one item")
  })
})

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(OrderStatus, { errorMap: () => ({ message: "Invalid order status" }) })
  })
})
