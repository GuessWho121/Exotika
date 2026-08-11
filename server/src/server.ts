import app from "./app.js"
import { env } from "./config/env.js"
import { prisma } from "./config/db.js"
import { ensureBucketExists } from "./services/storageService.js"
import { logger } from "./utils/logger.js"

const startServer = async () => {
  try {
    // 1. Check database connection pool
    await prisma.$connect()
    logger.info("🔌 Connected to the PostgreSQL database successfully.")

    // 2. Link orphaned guest orders to registered users if email matches
    const linkOrphanedOrders = async () => {
      try {
        const ordersLinked = await prisma.$executeRawUnsafe(`
          UPDATE orders
          SET user_id = u.id
          FROM users u
          WHERE orders.user_id IS NULL
            AND LOWER(orders.customer_email) = LOWER(u.email)
        `)
        if (ordersLinked > 0) {
          logger.info(`Linked ${ordersLinked} orphaned orders to users via SQL`)
        }

        const customOrdersLinked = await prisma.$executeRawUnsafe(`
          UPDATE custom_orders
          SET user_id = u.id
          FROM users u
          WHERE custom_orders.user_id IS NULL
            AND LOWER(custom_orders.customer_email) = LOWER(u.email)
        `)
        if (customOrdersLinked > 0) {
          logger.info(`Linked ${customOrdersLinked} orphaned custom orders to users via SQL`)
        }
      } catch (err: any) {
        logger.error(`Error linking orphaned orders: ${err.message}`)
      }
    }

    // 3. Check MinIO bucket availability
    await ensureBucketExists()

    // 3. Bind HTTP listener
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running in [${env.NODE_ENV}] mode on port ${env.PORT}`)
      // Run orphaned order linking in the background after startup completes
      linkOrphanedOrders().catch((err) => {
        logger.error(`Unhandled error during background orphaned orders linking: ${err?.message || err}`)
      })
    })

    // 4. Graceful shutdown handler
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`)
      
      server.close(async () => {
        logger.info("HTTP server closed.")
        await prisma.$disconnect()
        logger.info("Database connection disconnected.")
        process.exit(0)
      })

      // Force shutdown if taking too long
      setTimeout(() => {
        logger.warn("Forcing immediate shutdown due to timeout...")
        process.exit(1)
      }, 10000)
    }

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
    process.on("SIGINT", () => gracefulShutdown("SIGINT"))

  } catch (error: any) {
    logger.error(`❌ Failed to start server: ${error.message}`)
    process.exit(1)
  }
}

startServer()
