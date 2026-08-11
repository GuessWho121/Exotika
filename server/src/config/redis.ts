import { Redis } from "ioredis"
import { env } from "./env.js"
import { logger } from "../utils/logger.js"

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null
})

redis.on("connect", () => {
  logger.info("🔌 Connected to Redis cache service successfully.")
})

redis.on("error", (err) => {
  logger.error("❌ Redis cache service error:", err)
})
