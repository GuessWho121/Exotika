import type { Response, NextFunction } from "express"
import bcrypt from "bcryptjs"
import { OAuth2Client } from "google-auth-library"
import jwt from "jsonwebtoken"
import { z } from "zod"
import { prisma } from "../config/db.js"
import { env } from "../config/env.js"
import { AppError } from "../middleware/errorMiddleware.js"
import type { AuthRequest } from "../middleware/authMiddleware.js"
import { logger } from "../utils/logger.js"

// Input Validation Schemas
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    zipCode: z.string().optional()
  })
})

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required")
  })
})

export const profileUpdateSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    zipCode: z.string().optional()
  })
})

// Helper: Generate JWT and set HttpOnly Cookie
const sendToken = (
  user: { id: string; email: string; role: string },
  statusCode: number,
  res: Response
) => {
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  )

  const cookieOptions: any = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const
  }

  if (env.NODE_ENV === "production") {
    cookieOptions.domain = ".exotikacreation.com"
  }

  res.cookie("token", token, cookieOptions)

  res.status(statusCode).json({
    status: "success",
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    }
  })
}

export const register = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, name, phone, address, city, zipCode } = req.body

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      throw new AppError("Email is already registered", 400)
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        phone,
        address,
        city,
        zipCode,
        phoneVerified: phone ? true : false
      }
    })

    sendToken(newUser, 201, res)
  } catch (error) {
    next(error)
  }
}

export const login = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      throw new AppError("Invalid email or password", 401)
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401)
    }

    sendToken(user, 200, res)
  } catch (error) {
    next(error)
  }
}

export const logout = (req: AuthRequest, res: Response) => {
  const cookieOptions: any = {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const
  }

  if (env.NODE_ENV === "production") {
    cookieOptions.domain = ".exotikacreation.com"
  }

  res.cookie("token", "loggedout", cookieOptions)
  res.status(200).json({ status: "success", message: "Logged out successfully" })
}

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError("Not authenticated", 401)
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    })

    if (!user) {
      throw new AppError("User not found", 404)
    }

    res.status(200).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          address: user.address,
          city: user.city,
          zipCode: user.zipCode,
          phoneVerified: user.phoneVerified
        }
      }
    })
  } catch (error) {
    next(error)
  }
}

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError("Not authenticated", 401)
    }

    const { name, phone, address, city, zipCode } = req.body

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name,
        phone,
        address,
        city,
        zipCode
      }
    })

    res.status(200).json({
      status: "success",
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          phone: updatedUser.phone,
          address: updatedUser.address,
          city: updatedUser.city,
          zipCode: updatedUser.zipCode,
          phoneVerified: updatedUser.phoneVerified
        }
      }
    })
  } catch (error) {
    next(error)
  }
}

const otpStore = new Map<string, { otp: string; expiresAt: number }>()

export const sendOtpSchema = z.object({
  body: z.object({
    contact: z.string().min(3, "Contact (email or phone) is required")
  })
})

export const verifyOtpSchema = z.object({
  body: z.object({
    contact: z.string().min(3, "Contact (email or phone) is required"),
    otp: z.string().length(6, "OTP must be exactly 6 digits")
  })
})

export const googleLoginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format").optional(),
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    token: z.string().optional()
  })
})

export const sendOtp = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { contact } = req.body
    
    // Generate a 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = Date.now() + 5 * 60 * 1000 // 5 minutes validity

    otpStore.set(contact, { otp, expiresAt })

    logger.info(`[OTP Service] Generated OTP ${otp} for ${contact}`)

    res.status(200).json({
      status: "success",
      message: `OTP sent successfully to ${contact}`,
      data: {
        otp: env.NODE_ENV === "development" ? otp : undefined
      }
    })
  } catch (error) {
    next(error)
  }
}

export const verifyOtp = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { contact, otp } = req.body

    const record = otpStore.get(contact)
    if (!record) {
      throw new AppError("No OTP requested for this contact", 400)
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(contact)
      throw new AppError("OTP has expired", 400)
    }

    if (record.otp !== otp) {
      throw new AppError("Invalid OTP code", 400)
    }

    otpStore.delete(contact) // Single-use OTP

    res.status(200).json({
      status: "success",
      message: "OTP verified successfully"
    })
  } catch (error) {
    next(error)
  }
}

export const googleLogin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email: bodyEmail, name: bodyName, token } = req.body
    let email = bodyEmail
    let name = bodyName

    if (token) {
      const clientId = process.env.GOOGLE_CLIENT_ID
      if (!clientId) {
        throw new AppError("GOOGLE_CLIENT_ID environment variable is missing on the server", 500)
      }
      const client = new OAuth2Client(clientId)
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: clientId
      })
      const payload = ticket.getPayload()
      if (!payload || !payload.email) {
        throw new AppError("Invalid Google token payload", 400)
      }
      email = payload.email
      name = payload.name || "Google User"
    }

    if (!email) {
      throw new AppError("Email is required for Google authentication", 400)
    }

    let user = await prisma.user.findUnique({ where: { email } })
    
    if (!user) {
      // Create user if they don't exist
      const salt = await bcrypt.genSalt(10)
      const randomPassword = Math.random().toString(36).substring(2, 12)
      const passwordHash = await bcrypt.hash(randomPassword, salt)
      
      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name: name || "Google User",
          role: "CUSTOMER"
        }
      })
      logger.info(`[Google Auth] Created new customer account for ${email}`)
    } else {
      logger.info(`[Google Auth] Logged in existing user ${email}`)
    }

    sendToken(user, 200, res)
  } catch (error) {
    next(error)
  }
}

// Address validation schema
export const createAddressSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().min(7, "Phone number is invalid"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    city: z.string().min(2, "City must be at least 2 characters"),
    zipCode: z.string().min(3, "ZIP Code is invalid"),
    country: z.string().optional()
  })
})

export const getAddresses = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError("Not authenticated", 401)
    }

    const addresses = await prisma.userAddress.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" }
    })

    res.status(200).json({
      status: "success",
      data: { addresses }
    })
  } catch (error) {
    next(error)
  }
}

export const addAddress = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError("Not authenticated", 401)
    }

    const { title, name, phone, address, city, zipCode, country } = req.body

    const newAddress = await prisma.userAddress.create({
      data: {
        userId: req.user.id,
        title: title || "Home",
        name,
        phone,
        address,
        city,
        zipCode,
        country: country || "India"
      }
    })

    res.status(201).json({
      status: "success",
      data: { address: newAddress }
    })
  } catch (error) {
    next(error)
  }
}

export const deleteAddress = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError("Not authenticated", 401)
    }

    const { id } = req.params

    const address = await prisma.userAddress.findFirst({
      where: { id, userId: req.user.id }
    })

    if (!address) {
      throw new AppError("Address not found", 404)
    }

    await prisma.userAddress.delete({
      where: { id }
    })

    res.status(200).json({
      status: "success",
      message: "Address deleted successfully"
    })
  } catch (error) {
    next(error)
  }
}

export const updateAddress = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError("Not authenticated", 401)
    }

    const { id } = req.params
    const { title, name, phone, address, city, zipCode, country } = req.body

    const existingAddress = await prisma.userAddress.findFirst({
      where: { id, userId: req.user.id }
    })

    if (!existingAddress) {
      throw new AppError("Address not found", 404)
    }

    const updatedAddress = await prisma.userAddress.update({
      where: { id },
      data: {
        title,
        name,
        phone,
        address,
        city,
        zipCode,
        country: country || "India"
      }
    })

    res.status(200).json({
      status: "success",
      data: { address: updatedAddress }
    })
  } catch (error) {
    next(error)
  }
}

export const verifyPhoneSchema = z.object({
  body: z.object({
    phone: z.string().optional()
  })
})

export const verifyPhone = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError("Not authenticated", 401)
    }
    const { phone } = req.body

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        phoneVerified: true,
        ...(phone ? { phone } : {})
      }
    })

    res.status(200).json({
      status: "success",
      message: "Phone number verified successfully",
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          phone: updatedUser.phone,
          phoneVerified: updatedUser.phoneVerified
        }
      }
    })
  } catch (error) {
    next(error)
  }
}
