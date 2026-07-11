import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import rateLimit from "express-rate-limit"
import { env } from "./config/env.js"
import { errorHandler } from "./middleware/errorMiddleware.js"
import authRoutes from "./routes/authRoutes.js"
import productRoutes from "./routes/productRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import customOrderRoutes from "./routes/customOrderRoutes.js"
import cartRoutes from "./routes/cartRoutes.js"
import { logger } from "./utils/logger.js"
import { xssSanitizer, authLimiter, customOrderLimiter } from "./middleware/securityMiddleware.js"

const app = express()

// Disable server header information leakage
app.disable("x-powered-by")

// 1. Custom cookie parser middleware (zero-dependency)
const cookieParser = (req: any, res: any, next: any) => {
  const cookieHeader = req.headers.cookie
  req.cookies = {}
  if (cookieHeader) {
    cookieHeader.split(";").forEach((cookie: string) => {
      const parts = cookie.split("=")
      const name = parts[0].trim()
      const value = parts.slice(1).join("=").trim()
      req.cookies[name] = decodeURIComponent(value)
    })
  }
  next()
}

// 2. Global security headers and policies (Content Security Policy)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://maps.googleapis.com", "https://checkout.razorpay.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://checkout.razorpay.com"],
        imgSrc: ["'self'", "data:", "https://maps.gstatic.com", "http://localhost:9000", "http://exotika-minio:9000", "https://*.exotikacreation.com", "https://*.razorpay.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'", "https://maps.googleapis.com", "http://localhost:9000", "https://api.razorpay.com"],
        frameSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"]
      }
    }
  })
)

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
  })
)

// 3. Request parsing with strict payload size limits (DoS prevention) & cookie parser
app.use(express.json({ limit: "50kb" }))
app.use(express.urlencoded({ limit: "50kb", extended: true }))
app.use(cookieParser)

// Global input sanitization (Stored XSS prevention)
app.use(xssSanitizer)

// 4. HTTP Logger stream config
const morganStream = {
  write: (message: string) => logger.http(message.trim())
}
app.use(morgan(":method :url :status :res[content-length] - :response-time ms", { stream: morganStream }))

// 5. Rate Limiting protection (General APIs)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  message: "Too many requests from this IP, please try again after 15 minutes."
})
app.use("/api", limiter)

// 6. Routes mount with specific security limits
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/custom-orders", customOrderLimiter, customOrderRoutes)
app.use("/api/cart", cartRoutes)

// 7. Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", time: new Date() })
})

// 8. Global error handling fallback
app.use(errorHandler)

export default app
