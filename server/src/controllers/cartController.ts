import type { Response, NextFunction } from "express"
import { z } from "zod"
import { prisma } from "../config/db.js"
import { AppError } from "../middleware/errorMiddleware.js"
import type { AuthRequest } from "../middleware/authMiddleware.js"

export const getCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError("Not authenticated", 401)
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: true
      }
    })

    res.status(200).json({
      status: "success",
      data: {
        items: cartItems.map(item => ({
          id: item.product.id,
          title: item.product.title,
          price: Number(item.product.price),
          image: item.product.imageUrl,
          quantity: item.quantity,
          category: item.product.category.toLowerCase()
        }))
      }
    })
  } catch (error) {
    next(error)
  }
}

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

export const updateCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError("Not authenticated", 401)
    }

    const userId = req.user.id
    const { productId, quantity, items } = req.body

    // Handle batch sync (array of items)
    if (items && Array.isArray(items)) {
      await prisma.$transaction([
        prisma.cartItem.deleteMany({
          where: { userId }
        }),
        prisma.cartItem.createMany({
          data: items.map(item => ({
            userId,
            productId: item.productId,
            quantity: item.quantity
          }))
        })
      ])
    } 
    // Handle single item update
    else if (productId && typeof quantity === 'number') {
      if (quantity === 0) {
        await prisma.cartItem.deleteMany({
          where: {
            userId,
            productId
          }
        })
      } else {
        await prisma.cartItem.upsert({
          where: {
            userId_productId: {
              userId,
              productId
            }
          },
          update: {
            quantity
          },
          create: {
            userId,
            productId,
            quantity
          }
        })
      }
    } else {
      throw new AppError("Invalid payload. Provide either 'items' or 'productId' + 'quantity'.", 400)
    }

    // Return the updated cart
    const updatedCartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: true
      }
    })

    res.status(200).json({
      status: "success",
      data: {
        items: updatedCartItems.map(item => ({
          id: item.product.id,
          title: item.product.title,
          price: Number(item.product.price),
          image: item.product.imageUrl,
          quantity: item.quantity,
          category: item.product.category.toLowerCase()
        }))
      }
    })
  } catch (error) {
    next(error)
  }
}

export const deleteCartItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError("Not authenticated", 401)
    }

    const { productId } = req.params

    await prisma.cartItem.deleteMany({
      where: {
        userId: req.user.id,
        productId
      }
    })

    res.status(200).json({
      status: "success",
      message: "Item removed from cart"
    })
  } catch (error) {
    next(error)
  }
}

export const clearCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError("Not authenticated", 401)
    }

    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id }
    })

    res.status(200).json({
      status: "success",
      message: "Cart cleared"
    })
  } catch (error) {
    next(error)
  }
}
