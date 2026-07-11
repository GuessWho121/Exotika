import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { Role } from "@prisma/client"
import { env } from "../config/env.js"
import { prisma } from "../config/db.js"
import { AppError } from "./errorMiddleware.js"

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: Role
  }
}

interface DecodedToken {
  id: string
  email: string
  role: Role
  iat: number
  exp: number
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = ""

    // 1. Read token from HttpOnly cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token
    } 
    // 2. Fallback: Authorization header (Bearer token)
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1]
    }

    if (!token) {
      throw new AppError("Authentication required. Please login.", 401)
    }

    // 3. Verify JWT token signature
    const decoded = jwt.verify(token, env.JWT_SECRET) as DecodedToken

    // 4. Verify user still exists in the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    })

    if (!user) {
      throw new AppError("User belonging to this token no longer exists.", 401)
    }

    // 5. Attach decoded user payload to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    }

    next()
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return next(new AppError("Invalid session token. Please log in again.", 401))
    }
    if (err instanceof jwt.TokenExpiredError) {
      return next(new AppError("Session expired. Please log in again.", 401))
    }
    next(err)
  }
}

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== Role.ADMIN) {
    return next(new AppError("Forbidden. Access restricted to administrator roles.", 403))
  }
  next()
}

export const optionalAuthenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = ""

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1]
    }

    if (token) {
      const decoded = jwt.verify(token, env.JWT_SECRET) as DecodedToken
      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      })
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role
        }
      }
    }
    next()
  } catch (err) {
    // Fail silently for optional auth
    next()
  }
}
