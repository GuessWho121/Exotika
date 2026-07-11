import type { Request, Response, NextFunction } from "express"
import { ZodError } from "zod"
import { Prisma } from "@prisma/client"
import { logger } from "../utils/logger.js"

export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`${err.name}: ${err.message}`)

  // 1. Zod schema validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: "fail",
      message: "Validation failed",
      errors: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message
      }))
    })
  }

  // 2. Prisma Database unique or validation errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation (P2002)
    if (err.code === "P2002") {
      const targets = (err.meta?.target as string[]) || []
      return res.status(409).json({
        status: "fail",
        message: `Duplicate entry error on fields: ${targets.join(", ")}`
      })
    }

    // Record not found
    if (err.code === "P2025") {
      return res.status(404).json({
        status: "fail",
        message: "Record not found in database"
      })
    }
  }

  // 3. Known Operational App Error
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.statusCode >= 500 ? "error" : "fail",
      message: err.message
    })
  }

  // 4. Default Unknown Internal Server Error
  const isProd = process.env.NODE_ENV === "production"
  return res.status(500).json({
    status: "error",
    message: "Internal server error occurred",
    ...(isProd ? {} : { stack: err.stack })
  })
}
