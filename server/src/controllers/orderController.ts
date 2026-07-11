import type { Response, NextFunction } from "express"
import { z } from "zod"
import { OrderStatus, Role } from "@prisma/client"
import { prisma } from "../config/db.js"
import { AppError } from "../middleware/errorMiddleware.js"
import type { AuthRequest } from "../middleware/authMiddleware.js"
import { createRazorpayOrder, verifyRazorpaySignature } from "../services/paymentService.js"
import { calculateShippingQuote, createShiprocketOrder } from "../services/shippingService.js"
import { sendOrderConfirmationEmail } from "../services/emailService.js"
import { logger } from "../utils/logger.js"

// Validation Schemas
export const createOrderSchema = z.object({
  body: z.object({
    customerName: z.string().min(2, "Name must be at least 2 characters"),
    customerEmail: z.string().email("Invalid email format"),
    customerPhone: z.string().min(10, "Phone number must be at least 10 digits"),
    shippingAddress: z.string().min(5, "Address must be at least 5 characters"),
    shippingCity: z.string().min(2, "City must be at least 2 characters"),
    shippingZipCode: z.string().min(4, "Zip code must be at least 4 characters"),
    shippingCountry: z.string().optional(),
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
      shippingZipCode,
      shippingCountry,
      items
    } = req.body

    const userId = req.user?.id || null

    // 1. Fetch Shipping quote dynamically (based on delivery postcode and number of items)
    const shippingInfo = await calculateShippingQuote(
      shippingZipCode,
      items.length * 0.5, // Estimate 0.5kg per artwork item
      false,
      shippingCountry || "India"
    )

    const shippingCost = shippingInfo.rate

    // 2. Process total price inside transaction
    const order = await prisma.$transaction(async (tx) => {
      let totalAmount = shippingCost // Start with shipping cost
      const orderItemsToCreate = []

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        })

        if (!product) {
          throw new AppError(`Product with ID ${item.productId} not found`, 404)
        }

        if (!product.inStock) {
          throw new AppError(`Product '${product.title}' is currently out of stock`, 400)
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
          shippingZipCode,
          shippingCountry: shippingCountry || "India",
          totalAmount,
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

    let orders
    // Admin gets all orders; standard customer gets only their own orders
    if (req.user.role === Role.ADMIN) {
      orders = await prisma.order.findMany({
        include: { items: true },
        orderBy: { createdAt: "desc" }
      })
    } else {
      orders = await prisma.order.findMany({
        where: { userId: req.user.id },
        include: { items: true },
        orderBy: { createdAt: "desc" }
      })
    }

    res.status(200).json({
      status: "success",
      results: orders.length,
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

// Simulated local sandbox payment completion form redirect page
export const paySandbox = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.query

    if (!orderId || typeof orderId !== "string") {
      throw new AppError("Order ID query parameter is required", 400)
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      throw new AppError("Order not found", 404)
    }

    if (order.isPaid) {
      return res.status(200).send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding-top: 50px; background: #FFFBEB;">
            <h1 style="color: #10B981;">Order Already Paid!</h1>
            <p>Order ID: ${order.id}</p>
            <p>Total: ₹${order.totalAmount}</p>
          </body>
        </html>
      `)
    }

    // Render simple HTML payment checkout form overlay
    res.status(200).send(`
      <html>
        <head>
          <title>Simulated Payment Sandbox</title>
          <style>
            body { font-family: sans-serif; background: #FFFBEB; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); text-align: center; max-width: 400px; width: 100%; border: 1px solid #F59E0B; }
            h2 { color: #534b07; margin-bottom: 20px; }
            .amount { font-size: 24px; font-weight: bold; color: #10B981; margin: 15px 0; }
            button { background: #534b07; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; width: 100%; margin-top: 15px; }
            button:hover { opacity: 0.9; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Local Payment Sandbox</h2>
            <p>Simulating Checkout for Order:</p>
            <code style="display:block; padding: 8px; background: #f3f4f6; border-radius: 4px;">${order.id}</code>
            <div class="amount">₹${order.totalAmount} INR</div>
            <form action="/api/orders/verify-sandbox" method="POST">
              <input type="hidden" name="orderId" value="${order.id}">
              <input type="hidden" name="paymentId" value="pay_${Math.random().toString(36).substring(2, 10)}">
              <button type="submit">Complete Payment (Simulate Success)</button>
            </form>
          </div>
        </body>
      </html>
    `)
  } catch (error) {
    next(error)
  }
}

// Verification redirect handler for sandbox form response
export const verifySandboxPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId, paymentId } = req.body

    if (!orderId || !paymentId) {
      throw new AppError("Invalid payment verify parameters", 400)
    }

    // Verify and update order is Paid in DB
    const order = await prisma.order.findUnique({ where: { id: orderId } })

    if (!order) {
      throw new AppError("Order not found", 404)
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        paymentId
      }
    })

    // Return HTML success redirect screen
    res.status(200).send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding-top: 50px; background: #FFFBEB;">
          <h1 style="color: #10B981; margin-bottom: 20px;">Payment Successful!</h1>
          <p>Order <strong>${orderId}</strong> is verified as Paid.</p>
          <p>Payment ID: <code>${paymentId}</code></p>
          <p style="margin-top: 30px;"><a href="http://localhost:5173/#/order-success" style="color: #534b07; text-decoration: underline; font-weight: bold;">Return to Exotika Shop</a></p>
        </body>
      </html>
    `)
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

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        paymentId: razorpayPaymentId
      }
    })

    // Clear User Cart items in DB on successful payment
    if (order.userId) {
      await prisma.cartItem.deleteMany({
        where: { userId: order.userId }
      })
    }

    // Book shipment in Shiprocket sandbox asynchronously
    const orderItems = order.items.map(item => ({
      title: item.title,
      price: Number(item.price),
      quantity: item.quantity
    }))

    createShiprocketOrder(
      order.id,
      order.customerName,
      order.customerEmail,
      order.customerPhone,
      order.shippingAddress,
      order.shippingCity,
      order.shippingZipCode,
      order.shippingCountry,
      orderItems,
      Number(order.totalAmount)
    ).catch(err => logger.error("Shiprocket shipment booking error:", err))

    // Send transaction invoice email to customer asynchronously
    const orderSubtotal = order.items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0)
    const orderShippingCost = Number(order.totalAmount) - orderSubtotal

    sendOrderConfirmationEmail(
      order.customerEmail,
      order.customerName,
      order.id,
      orderItems,
      orderShippingCost,
      Number(order.totalAmount)
    ).catch(err => logger.error("Order confirmation email dispatch error:", err))

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
