import { Router } from "express"
import { getFileStream } from "../services/storageService.js"
import { AppError } from "../middleware/errorMiddleware.js"
import { logger } from "../utils/logger.js"
import type { Readable } from "stream"

const router = Router()

router.get("/*", async (req, res, next) => {
  try {
    const key = decodeURIComponent(req.path.substring(1)) // Remove the leading '/'
    if (!key) {
      throw new AppError("File key is required", 400)
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
