import { z } from "zod"

export const syncCartSchema = z.object({
  body: z.object({
    productId: z.string().uuid("Invalid product ID").optional(),
    quantity: z.number().int().nonnegative().optional(),
    items: z.array(
      z.object({
        productId: z.string().uuid("Invalid product ID"),
        quantity: z.number().int().positive()
      })
    ).optional()
  })
})
