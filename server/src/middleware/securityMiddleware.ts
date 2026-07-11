import type { Request, Response, NextFunction } from "express"
import rateLimit from "express-rate-limit"

// 1. Recursive XSS and HTML Tag Stripper Sanitizer
export const sanitizeString = (str: string): string => {
  return str
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "") // Remove <script> blocks
    .replace(/on\w+\s*=\s*"[^"]*"/gi, "") // Remove inline event handlers (e.g. onload, onerror)
    .replace(/on\w+\s*=\s*'[^']*'/gi, "")
    .replace(/on\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/javascript:\s*[^"'>\s]+/gi, "") // Remove javascript: URIs
    .replace(/<[^>]*>/g, "") // Strip all other HTML tags
    .trim()
}

export const recursiveSanitize = (obj: any): any => {
  if (typeof obj === "string") {
    return sanitizeString(obj)
  }
  if (Array.isArray(obj)) {
    return obj.map(recursiveSanitize)
  }
  if (obj !== null && typeof obj === "object") {
    const sanitized: any = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = recursiveSanitize(obj[key])
      }
    }
    return sanitized
  }
  return obj
}

export const xssSanitizer = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = recursiveSanitize(req.body)
  }
  next()
}

// 2. Strict Rate Limiter for Login and registration (Auth Brute Force protection)
export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Max 5 request attempts
  message: "Too many login/registration attempts from this IP. Please try again after 5 minutes.",
  standardHeaders: true,
  legacyHeaders: false
})

// 3. Rate Limiter for Custom Order uploads (Denial of Storage protection)
export const customOrderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 custom orders per window
  message: "Too many custom order submissions from this IP. Please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false
})
