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
        const users = await prisma.user.findMany({ select: { id: true, email: true } })
        for (const user of users) {
          const ordersRes = await prisma.order.updateMany({
            where: {
              customerEmail: { equals: user.email, mode: "insensitive" },
              userId: null
            },
            data: {
              userId: user.id
            }
          })
          if (ordersRes.count > 0) {
            logger.info(`Link ${ordersRes.count} orphaned order(s) to user: ${user.email}`)
          }
          const customOrdersRes = await prisma.customOrder.updateMany({
            where: {
              customerEmail: { equals: user.email, mode: "insensitive" },
              userId: null
            },
            data: {
              userId: user.id
            }
          })
          if (customOrdersRes.count > 0) {
            logger.info(`Link ${customOrdersRes.count} orphaned custom order(s) to user: ${user.email}`)
          }
        }
      } catch (err: any) {
        logger.error(`Error linking orphaned orders: ${err.message}`)
      }
    }
    await linkOrphanedOrders()

    // 3. Check MinIO bucket availability
    await ensureBucketExists()

    // 3. Bind HTTP listener
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running in [${env.NODE_ENV}] mode on port ${env.PORT}`)
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
