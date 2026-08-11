import type { Request, Response, NextFunction } from "express"
import type { AuthRequest } from "../middleware/authMiddleware.js"
import { Category } from "@prisma/client"
import { prisma } from "../config/db.js"
import { redis } from "../config/redis.js"
import { logger } from "../utils/logger.js"
import { AppError } from "../middleware/errorMiddleware.js"
import { uploadBase64Image } from "../services/storageService.js"

export const clearProductCache = async () => {
  try {
    const keys = await redis.keys("products:*")
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (err) {
    logger.error("Failed to clear product cache from Redis:", err)
  }
}

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category, search, sort, page = "1", limit = "10" } = req.query

    const pageNumber = Math.max(1, parseInt(page as string, 10) || 1)
    let limitNumber = Math.max(1, parseInt(limit as string, 10) || 10)
    
    // Clamp to 1000 for admin user, 100 for regular/guest users
    const maxLimit = (req as any).user?.role === "ADMIN" ? 1000 : 100
    if (limitNumber > maxLimit) {
      limitNumber = maxLimit
    }
    const skip = (pageNumber - 1) * limitNumber

    // Try returning cached products first
    const cacheKey = `products:${category || ""}:${search || ""}:${sort || ""}:${pageNumber}:${limitNumber}`
    try {
      const cachedProductsStr = await redis.get(cacheKey)
      if (cachedProductsStr) {
        return res.status(200).json(JSON.parse(cachedProductsStr))
      }
    } catch (cacheErr) {
      logger.error("Failed to fetch products from Redis cache:", cacheErr)
    }

    // Build Prisma query filters
    const where: any = {}

    if (category) {
      const categories = (category as string)
        .split(",")
        .map((c) => c.trim().toUpperCase() as Category)
      where.category = { in: categories }
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } }
      ]
    }

    // Build sorting logic
    let orderBy: any = { createdAt: "desc" }
    if (sort === "price_asc") {
      orderBy = { price: "asc" }
    } else if (sort === "price_desc") {
      orderBy = { price: "desc" }
    } else if (sort === "date_desc") {
      orderBy = { createdAt: "desc" }
    }

    // Fetch products
    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limitNumber
      }),
      prisma.product.count({ where })
    ])

    const responsePayload = {
      status: "success",
      results: products.length,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
        totalResults: total
      },
      data: { products }
    }

    try {
      await redis.setex(cacheKey, 60, JSON.stringify(responsePayload)) // Cache for 60 seconds
    } catch (cacheErr) {
      logger.error("Failed to write products to Redis cache:", cacheErr)
    }

    res.status(200).json(responsePayload)
  } catch (error) {
    next(error)
  }
}

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params

    const product = await prisma.product.findUnique({
      where: { id }
    })

    if (!product) {
      throw new AppError("Product not found", 404)
    }

    res.status(200).json({
      status: "success",
      data: {
        product
      }
    })
  } catch (error) {
    next(error)
  }
}

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.body.imageUrl && req.body.imageUrl.startsWith("data:image/")) {
      req.body.imageUrl = await uploadBase64Image(req.body.imageUrl, "products")
    }

    const newProduct = await prisma.product.create({
      data: req.body
    })

    await clearProductCache()

    res.status(201).json({
      status: "success",
      data: { product: newProduct }
    })
  } catch (error) {
    next(error)
  }
}

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params

    if (req.body.imageUrl && req.body.imageUrl.startsWith("data:image/")) {
      req.body.imageUrl = await uploadBase64Image(req.body.imageUrl, "products")
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: req.body
    })

    await clearProductCache()

    res.status(200).json({
      status: "success",
      data: { product: updatedProduct }
    })
  } catch (error) {
    next(error)
  }
}

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params

    await prisma.product.delete({
      where: { id }
    })

    await clearProductCache()

    res.status(200).json({
      status: "success",
      message: "Product deleted successfully"
    })
  } catch (error) {
    next(error)
  }
}

export const toggleProductFavorite = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401)
    }
    const { id } = req.params
    const userId = req.user.id

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id }
    })
    if (!product) {
      throw new AppError("Product not found", 404)
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: id
        }
      }
    })

    let favorited = false
    if (existing) {
      // Remove favorite
      await prisma.favorite.delete({
        where: {
          userId_productId: {
            userId,
            productId: id
          }
        }
      })
    } else {
      // Add favorite
      await prisma.favorite.create({
        data: {
          userId,
          productId: id
        }
      })
      favorited = true
    }

    res.status(200).json({
      status: "success",
      data: { favorited }
    })
  } catch (error) {
    next(error)
  }
}

export const getUserFavorites = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401)
    }
    const userId = req.user.id

    // Find all products favorited by the user
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        product: true
      }
    })

    const favoriteProducts = favorites.map(f => f.product)

    res.status(200).json({
      status: "success",
      data: { favorites: favoriteProducts }
    })
  } catch (error) {
    next(error)
  }
}

export const getProductReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params

    const reviews = await prisma.review.findMany({
      where: { productId: id },
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    res.status(200).json({
      status: "success",
      results: reviews.length,
      data: { reviews }
    })
  } catch (error) {
    next(error)
  }
}

export const createProductReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401)
    }
    const { id } = req.params
    const userId = req.user.id
    const { rating, comment } = req.body

    const ratingVal = parseInt(rating as string, 10)
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      throw new AppError("Rating must be an integer between 1 and 5", 400)
    }

    if (!comment || comment.trim().length === 0) {
      throw new AppError("Comment cannot be empty", 400)
    }

    // 0. Verify purchase: user must have a paid order containing this product
    const purchaseCount = await prisma.order.count({
      where: {
        userId,
        isPaid: true,
        items: {
          some: {
            productId: id
          }
        }
      }
    })

    if (purchaseCount === 0) {
      throw new AppError("You can only review products you have purchased.", 400)
    }

    const newReview = await prisma.$transaction(async (tx) => {
      const review = await tx.review.upsert({
        where: {
          productId_userId: {
            productId: id,
            userId
          }
        },
        create: {
          productId: id,
          userId,
          rating: ratingVal,
          comment
        },
        update: {
          rating: ratingVal,
          comment
        },
        include: {
          user: {
            select: {
              name: true
            }
          }
        }
      })

      // Aggregate new average rating and review count database-side
      const stats = await tx.review.aggregate({
        where: { productId: id },
        _avg: { rating: true },
        _count: { rating: true }
      })

      const avgRating = stats._avg.rating !== null && typeof stats._avg.rating === "number" && !isNaN(stats._avg.rating)
        ? stats._avg.rating
        : 5.0

      await tx.product.update({
        where: { id },
        data: {
          averageRating: avgRating,
          reviewCount: stats._count.rating || 0
        }
      })

      return review
    })

    res.status(201).json({
      status: "success",
      data: { review: newReview }
    })
  } catch (error) {
    next(error)
  }
}
