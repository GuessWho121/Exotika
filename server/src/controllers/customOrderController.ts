import type { Response, NextFunction } from "express"
import { z } from "zod"
import { CustomOrderStatus, Role } from "@prisma/client"
import { prisma } from "../config/db.js"
import { AppError } from "../middleware/errorMiddleware.js"
import type { AuthRequest } from "../middleware/authMiddleware.js"
import { uploadFile, deleteFile } from "../services/storageService.js"
import { sendCustomOrderConfirmationEmail } from "../services/emailService.js"
import { scanFileBufferForViruses } from "../services/virusScannerService.js"
import { logger } from "../utils/logger.js"

// Validation Schemas
export const createCustomOrderSchema = z.object({
  body: z.object({
    type: z.string().min(2, "Type is required"),
    description: z.string().min(20, "Description must be at least 20 characters").max(1000, "Description cannot exceed 1000 characters"),
    size: z.string().optional(),
    budget: z
      .string()
      .transform((val) => parseFloat(val))
      .refine((val) => val >= 4000, { message: "Budget must be at least ₹4,000 INR" }),
    customerName: z.string().min(2, "Name must be at least 2 characters"),
    customerEmail: z.string().email("Invalid email format"),
    customerPhone: z.string().min(10, "Phone number must be at least 10 digits")
  })
})

export const updateCustomOrderStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(CustomOrderStatus, { errorMap: () => ({ message: "Invalid custom order status" }) })
  })
})

export const createCustomOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      type,
      description,
      size,
      budget,
      customerName,
      customerEmail,
      customerPhone
    } = req.body

    const userId = req.user?.id || null
    const files = req.files as Express.Multer.File[]

    // 0. Perform binary magic headers and virus scans on all uploaded reference images
    if (files && files.length > 0) {
      for (const file of files) {
        await scanFileBufferForViruses(file.buffer, file.originalname)
      }
    }

    // 1. Upload files to MinIO in parallel (up to 3 files)
    const uploadPromises = (files || []).map((file) => uploadFile(file, "custom-orders"))
    const referenceUrls = await Promise.all(uploadPromises)

    // 2. Insert Custom Order and links in database
    const customOrder = await prisma.customOrder.create({
      data: {
        userId,
        type,
        description,
        size,
        budget,
        customerName,
        customerEmail,
        customerPhone,
        status: CustomOrderStatus.PENDING,
        references: {
          create: referenceUrls.map((url) => ({
            referenceUrl: url
          }))
        }
      },
      include: {
        references: true
      }
    })

    sendCustomOrderConfirmationEmail(
      customOrder.customerEmail,
      customOrder.customerName,
      customOrder.id,
      customOrder.type,
      Number(customOrder.budget),
      customOrder.description
    ).catch((err) => logger.error("Custom order email dispatch error:", err))

    res.status(201).json({
      status: "success",
      data: { customOrder }
    })
  } catch (error) {
    next(error)
  }
}

export const getCustomOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError("Not authenticated", 401)
    }

    let customOrders
    // Admin gets all requests; registered user gets only their own
    if (req.user.role === Role.ADMIN) {
      customOrders = await prisma.customOrder.findMany({
        include: { references: true },
        orderBy: { createdAt: "desc" }
      })
    } else {
      customOrders = await prisma.customOrder.findMany({
        where: { userId: req.user.id },
        include: { references: true },
        orderBy: { createdAt: "desc" }
      })
    }

    res.status(200).json({
      status: "success",
      results: customOrders.length,
      data: { customOrders }
    })
  } catch (error) {
    next(error)
  }
}

export const updateCustomOrderStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const customOrder = await prisma.customOrder.findUnique({ where: { id } })
    if (!customOrder) {
      throw new AppError("Custom order request not found", 404)
    }

    const updatedCustomOrder = await prisma.customOrder.update({
      where: { id },
      data: { status },
      include: { references: true }
    })

    // If order is completed or cancelled, delete S3 images to save space and protect privacy
    if (status === CustomOrderStatus.COMPLETED || status === CustomOrderStatus.CANCELLED) {
      if (updatedCustomOrder.references && updatedCustomOrder.references.length > 0) {
        logger.info(`Cleaning up ${updatedCustomOrder.references.length} reference images from object storage for completed/cancelled order #${id}`)
        for (const ref of updatedCustomOrder.references) {
          await deleteFile(ref.referenceUrl)
        }
        // Remove database rows matching these references
        await prisma.customOrderReference.deleteMany({
          where: { customOrderId: id }
        })
        
        // Clear references array on returned object
        updatedCustomOrder.references = []
      }
    }

    res.status(200).json({
      status: "success",
      data: { customOrder: updatedCustomOrder }
    })
  } catch (error) {
    next(error)
  }
}
