import { z } from "zod"
import dotenv from "dotenv"

dotenv.config()

const envSchema = z.object({
  PORT: z.string().transform((val) => parseInt(val, 10)).default("8080"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(8),
  CORS_ORIGIN: z.string().url().default("http://localhost:5173"),
  S3_ENDPOINT: z.string().url(),
  S3_PUBLIC_URL: z.string().url().optional(),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_S3_BUCKET_NAME: z.string().min(1),
  S3_FORCE_PATH_STYLE: z
    .string()
    .transform((val) => val === "true")
    .default("true"),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  SHIPROCKET_EMAIL: z.string().optional(),
  SHIPROCKET_PASSWORD: z.string().optional(),
  SHIPROCKET_PICKUP_POSTCODE: z.string().optional(),
  SHIPROCKET_PICKUP_LOCATION_NAME: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional()
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format())
  process.exit(1)
}

export const env = parsed.data
export type Env = z.infer<typeof envSchema>
