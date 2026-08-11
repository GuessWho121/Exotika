import { Router } from "express"
import { getFileStream } from "../services/storageService.js"
import { AppError } from "../middleware/errorMiddleware.js"
import { logger } from "../utils/logger.js"
import type { Readable } from "stream"
import { optionalAuthenticate } from "../middleware/authMiddleware.js"
import { prisma } from "../config/db.js"

const router = Router()

router.get("/*", optionalAuthenticate as any, async (req: any, res, next) => {
  try {
    let key = req.path.substring(1) // Remove the leading '/'
    try {
      key = decodeURIComponent(key)
    } catch (err) {
      throw new AppError("Malformed URL key parameter", 400)
    }

    if (!key) {
      throw new AppError("File key is required", 400)
    }

    // Path traversal protection
    if (key.includes("..") || key.includes("\\")) {
      throw new AppError("Invalid file key", 400)
    }

    // Authorization check for private custom-orders reference images
    if (key.startsWith("custom-orders/")) {
      if (!req.user) {
        throw new AppError("Authentication required. Please login.", 401)
      }

      const reference = await prisma.customOrderReference.findFirst({
        where: {
          referenceUrl: `/api/storage/${key}`
        },
        include: {
          customOrder: true
        }
      })

      if (!reference) {
        throw new AppError("File not found", 404)
      }

      const isAuthorized =
        req.user.role === "ADMIN" ||
        req.user.id === reference.customOrder.userId ||
        req.user.email.toLowerCase() === reference.customOrder.customerEmail.toLowerCase()

      if (!isAuthorized) {
        throw new AppError("You are not authorized to view this reference image.", 403)
      }
    }

    logger.info(`Streaming S3 file for key: ${key}`)
    const { stream, contentType } = await getFileStream(key)

    if (contentType) {
      res.setHeader("Content-Type", contentType)
    }
    
    // Allow caching for public images (1 day)
    res.setHeader("Cache-Control", "public, max-age=86400")

    const readableStream = stream as Readable
    readableStream.on("error", (err) => {
      logger.error(`Error streaming key ${key} from S3:`, err)
      if (!res.headersSent) {
        next(new AppError("Failed to stream file", 500))
      }
    })

    readableStream.pipe(res)
  } catch (error: any) {
    if (error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
      next(new AppError("File not found", 404))
    } else {
      next(error)
    }
  }
})

export default router
