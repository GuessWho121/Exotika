import { z } from "zod"
import { Category } from "@prisma/client"

export const createProductSchema = z.object({
  body: z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    price: z.number().positive("Price must be greater than 0"),
    imageUrl: z.string().refine((val) => val.startsWith("http://") || val.startsWith("https://") || val.startsWith("data:image/"), {
      message: "Invalid image URL or base64 format"
    }),
    description: z.string().optional(),
    category: z.nativeEnum(Category, { errorMap: () => ({ message: "Invalid category type" }) }),
    inStock: z.boolean().default(true),
    height: z.string().optional(),
    width: z.string().optional(),
    medium: z.string().optional()
  })
})

export const updateProductSchema = z.object({
  body: createProductSchema.shape.body.partial()
})
