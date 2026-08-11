import type { Response, NextFunction } from "express"
import { OrderStatus, Role } from "@prisma/client"
import { prisma } from "../config/db.js"
import { AppError } from "../middleware/errorMiddleware.js"
import type { AuthRequest } from "../middleware/authMiddleware.js"
import { createRazorpayOrder, verifyRazorpaySignature, verifyRazorpayOrderReceipt } from "../services/paymentService.js"
import { calculateShippingQuote, createShiprocketOrder } from "../services/shippingService.js"
import { sendOrderConfirmationEmail } from "../services/emailService.js"
import { logger } from "../utils/logger.js"
import { enqueueJob } from "../utils/jobQueue.js"
import { clearProductCache } from "./productController.js"

export const createOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingZipCode,
      shippingCountry,
      expectedShippingRate,
      idempotencyKey,
      items
    } = req.body

    const userId = req.user?.id || null

    // 0. Check for existing order with same idempotencyKey to prevent duplicate creation
    if (idempotencyKey) {
      const existingOrder = await prisma.order.findUnique({
        where: { idempotencyKey },
        include: { items: true }
      })

      if (existingOrder) {
        logger.info(`[Idempotency] Duplicate order submission detected for key ${idempotencyKey}. Returning existing order.`)
        const rzpOrder = await createRazorpayOrder(
          existingOrder.id,
          Number(existingOrder.totalAmount)
        )
        return res.status(201).json({
          status: "success",
          data: {
            order: existingOrder,
            razorpayOrder: rzpOrder
          }
        })
      }
    }

    // Determine the items to process based on guest vs authenticated checkout
    let itemsToProcess = items
    if (userId) {
      const dbCartItems = await prisma.cartItem.findMany({
        where: { userId }
      })
      if (dbCartItems.length === 0) {
        throw new AppError("Your cart is empty", 400)
      }
      itemsToProcess = dbCartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    }

    // 1. Fetch Shipping quote dynamically (based on delivery postcode and number of items)
    const shippingInfo = await calculateShippingQuote(
      shippingZipCode,
      itemsToProcess.length * 0.5, // Estimate 0.5kg per artwork item
      false,
      shippingCountry || "India"
    )

    const shippingCost = shippingInfo.rate

    // Validate shipping rate consistency to prevent user charge mismatch
    if (expectedShippingRate !== undefined && Math.abs(shippingCost - expectedShippingRate) > 0.01) {
      logger.warn(
        `[Shipping Mismatch] Expected rate ₹${expectedShippingRate} from client does not match calculated rate ₹${shippingCost}. ` +
        `Postcode: ${shippingZipCode}, Country: ${shippingCountry || "India"}, Weight: ${itemsToProcess.length * 0.5}kg`
      )
      throw new AppError(`Shipping rate has changed. Expected ₹${expectedShippingRate}, but current rate is ₹${shippingCost}. Please reload checkout and review.`, 400)
    }

    // 2. Process total price inside transaction
    const order = await prisma.$transaction(async (tx) => {
      let totalAmount = shippingCost // Start with shipping cost
      const orderItemsToCreate = []

      // Batch query products to avoid N+1 query overhead inside transaction
      const productIds = itemsToProcess.map((i: any) => i.productId)
      const products = await tx.product.findMany({
        where: { id: { in: productIds } }
      })
      const productMap = new Map(products.map(p => [p.id, p]))

      for (const item of itemsToProcess) {
        const product = productMap.get(item.productId)

        if (!product) {
          throw new AppError(`Product with ID ${item.productId} not found`, 404)
        }

        if (!product.inStock) {
          throw new AppError(`Product '${product.title}' is currently out of stock`, 400)
        }

        try {
          await tx.product.update({
            where: {
              id: product.id,
              inStock: true
            },
            data: {
              inStock: false
            }
          })
        } catch (err) {
          throw new AppError(`Product '${product.title}' was just purchased by another customer.`, 400)
        }

        const price = Number(product.price)
        totalAmount += price * item.quantity

        orderItemsToCreate.push({
          productId: product.id,
          title: product.title,
          price: product.price,
          quantity: item.quantity
        })
      }

      // Create Order Header record
      const newOrder = await tx.order.create({
        data: {
          userId,
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress,
          shippingCity,
          shippingState: shippingState || "Unknown",
          shippingZipCode,
          shippingCountry: shippingCountry || "India",
          totalAmount,
          idempotencyKey,
          status: OrderStatus.PENDING,
          items: {
            create: orderItemsToCreate
          }
        },
        include: {
          items: true
        }
      })

      return newOrder
    })

    // 3. Create a live sandbox Razorpay order
    const rzpOrder = await createRazorpayOrder(
      order.id,
      Number(order.totalAmount)
    )

    await clearProductCache()

    res.status(201).json({
      status: "success",
      data: {
        order,
        razorpayOrder: rzpOrder
      }
    })
  } catch (error) {
    next(error)
  }
}

export const getOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError("Not authenticated", 401)
    }

    const { page = "1", limit = "10" } = req.query
    const pageNumber = Math.max(1, parseInt(page as string, 10) || 1)
    const limitNumber = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 10))
    const skip = (pageNumber - 1) * limitNumber

    const where: any = {}
    if (req.user.role !== Role.ADMIN) {
      where.userId = req.user.id
    }

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNumber
      }),
      prisma.order.count({ where })
    ])

    res.status(200).json({
      status: "success",
      results: orders.length,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber)
      },
      data: { orders }
    })
  } catch (error) {
    next(error)
  }
}

export const updateOrderStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) {
      throw new AppError("Order not found", 404)
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true }
    })

    res.status(200).json({
      status: "success",
      data: { order: updatedOrder }
    })
  } catch (error) {
    next(error)
  }
}



// Verification endpoint for Razorpay payment success response
export const verifyPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw new AppError("Missing signature verification parameters", 400)
    }

    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)
    if (!isValid) {
      throw new AppError("Payment verification failed. Invalid signature.", 400)
    }

    // Update order status in DB
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } }
    })

    if (!order) {
      throw new AppError("Order not found", 404)
    }

    // Security: Assert order ownership for authenticated users
    if (req.user) {
      const isOwner =
        order.userId === req.user.id ||
        order.customerEmail.toLowerCase() === req.user.email.toLowerCase()
      if (!isOwner && req.user.role !== Role.ADMIN) {
        throw new AppError("You do not have permission to verify payment for this order.", 403)
      }
    }

    // Security: Verify that the Razorpay order ID matches this DB order ID
    const isReceiptValid = await verifyRazorpayOrderReceipt(razorpayOrderId, orderId)
    if (!isReceiptValid) {
      throw new AppError("Payment verification failed. Razorpay order mismatch.", 400)
    }

    if (order.isPaid) {
      return res.status(200).json({
        status: "success",
        message: "Payment already verified previously",
        data: { order }
      })
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        paymentId: razorpayPaymentId
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    // Clear only the purchased items from the User's Cart in DB on successful payment
    if (order.userId) {
      const productIds = order.items
        .map(item => item.productId)
        .filter((id): id is string => id !== null)
      await prisma.cartItem.deleteMany({
        where: {
          userId: order.userId,
          productId: { in: productIds }
        }
      })
    }

    // Book shipment in Shiprocket sandbox asynchronously with retries
    const orderItems = order.items.map(item => ({
      title: item.title,
      price: Number(item.price),
      quantity: item.quantity
    }))

    enqueueJob(`Book Shiprocket Order ${order.id}`, async () => {
      await createShiprocketOrder(
        order.id,
        order.customerName,
        order.customerEmail,
        order.customerPhone,
        order.shippingAddress,
        order.shippingCity,
        order.shippingState,
        order.shippingZipCode,
        order.shippingCountry,
        orderItems,
        Number(order.totalAmount)
      )
    })

    // Send transaction invoice email to customer asynchronously with retries
    const orderSubtotal = order.items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0)
    const orderShippingCost = Number(order.totalAmount) - orderSubtotal

    enqueueJob(`Send Confirmation Email for Order ${order.id}`, async () => {
      await sendOrderConfirmationEmail(
        order.customerEmail,
        order.customerName,
        order.id,
        orderItems,
        orderShippingCost,
        Number(order.totalAmount)
      )
    })

    res.status(200).json({
      status: "success",
      message: "Payment verified and order finalized successfully",
      data: { order: updatedOrder }
    })
  } catch (error) {
    next(error)
  }
}

// Fetch shipping carrier charges and ETD prior to order creation
export const getShippingQuote = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shippingZipCode, shippingCountry, itemsCount } = req.body

    const quote = await calculateShippingQuote(
      shippingZipCode || "110001",
      (itemsCount || 1) * 0.5,
      false,
      shippingCountry || "India"
    )

    res.status(200).json({
      status: "success",
      data: quote
    })
  } catch (error) {
    next(error)
  }
}
