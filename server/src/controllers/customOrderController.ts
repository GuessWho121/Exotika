import type { Response, NextFunction } from "express"
import { CustomOrderStatus, Role } from "@prisma/client"
import { prisma } from "../config/db.js"
import { AppError } from "../middleware/errorMiddleware.js"
import type { AuthRequest } from "../middleware/authMiddleware.js"
import { uploadFile, deleteFile } from "../services/storageService.js"
import { sendCustomOrderConfirmationEmail } from "../services/emailService.js"
import { scanFileBufferForViruses } from "../services/virusScannerService.js"
import { logger } from "../utils/logger.js"
import { enqueueJob } from "../utils/jobQueue.js"

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
      customerPhone,
      customerState
    } = req.body

    const userId = req.user?.id || null
    const files = req.files as Express.Multer.File[]

    // Helper to validate binary magic headers for JPEG, PNG, and WebP
    const isValidImageSignature = (buffer: Buffer): boolean => {
      if (buffer.length < 12) return false

      // Check PNG: 89 50 4E 47 0D 0A 1A 0A
      if (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a
      ) {
        return true
      }

      // Check JPEG: FF D8 FF
      if (
        buffer[0] === 0xff &&
        buffer[1] === 0xd8 &&
        buffer[2] === 0xff
      ) {
        return true
      }

      // Check WebP: RIFF (52 49 46 46) ... WEBP (57 45 42 50)
      if (
        buffer[0] === 0x52 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46 &&
        buffer[3] === 0x46 &&
        buffer[8] === 0x57 &&
        buffer[9] === 0x45 &&
        buffer[10] === 0x42 &&
        buffer[11] === 0x50
      ) {
        return true
      }

      return false
    }

    // 0. Perform binary magic headers and virus scans on all uploaded reference images in parallel
    if (files && files.length > 0) {
      // Validate magic bytes synchronously first
      for (const file of files) {
        if (!isValidImageSignature(file.buffer)) {
          throw new AppError(`Invalid file signature for ${file.originalname}. Spoofed file extensions are prohibited.`, 400)
        }
      }

      // Run virus scans in parallel
      await Promise.all(
        files.map((file) => scanFileBufferForViruses(file.buffer, file.originalname))
      )
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
        customerState: customerState || "Unknown",
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

    // Enqueue email confirmation dispatch job
    enqueueJob(`Send Custom Order Confirmation Email ${customOrder.id}`, async () => {
      await sendCustomOrderConfirmationEmail(
        customOrder.customerEmail,
        customOrder.customerName,
        customOrder.id,
        customOrder.type,
        Number(customOrder.budget),
        customOrder.description
      )
    })

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

    const { page = "1", limit = "10" } = req.query
    const pageNumber = parseInt(page as string, 10)
    const limitNumber = parseInt(limit as string, 10)
    const skip = (pageNumber - 1) * limitNumber

    const where: any = {}
    if (req.user.role !== Role.ADMIN) {
      where.userId = req.user.id
    }

    const [customOrders, total] = await prisma.$transaction([
      prisma.customOrder.findMany({
        where,
        include: { references: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNumber
      }),
      prisma.customOrder.count({ where })
    ])

    res.status(200).json({
      status: "success",
      results: customOrders.length,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber)
      },
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
