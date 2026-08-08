import { Request, Response, NextFunction } from "express"
import { prisma } from "../config/db.js"
import { OrderStatus } from "@prisma/client"
import { AppError } from "../middleware/errorMiddleware.js"

export const getAdminStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Total revenue & count & pending count
    const aggregations = await prisma.order.aggregate({
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      }
    })

    const totalRevenue = Number(aggregations._sum.totalAmount || 0)
    const totalOrders = aggregations._count.id
    const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0

    const pendingOrders = await prisma.order.count({
      where: {
        status: OrderStatus.PENDING
      }
    })

    // 2. Revenue Trend (Daily rollup for last 7 calendar days)
    // We fetch daily sums. Using queryRaw for date_trunc is highly performant.
    interface DailyTrendRaw {
      day: Date
      amount: number
    }
    const dailyTrendsRaw: DailyTrendRaw[] = await prisma.$queryRaw`
      SELECT date_trunc('day', created_at) AS "day", SUM(total_amount) AS "amount"
      FROM orders
      GROUP BY "day"
      ORDER BY "day" ASC
    `
    // Map to formatted objects
    const revenueMap: { [key: string]: number } = {}
    dailyTrendsRaw.forEach(item => {
      const dateStr = new Date(item.day).toISOString().split("T")[0]
      revenueMap[dateStr] = Number(item.amount)
    })

    // Fill last 7 calendar days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - i)
      return d.toISOString().split("T")[0]
    }).reverse()

    const chartData = last7Days.map(dateStr => ({
      label: new Date(dateStr).toLocaleDateString(undefined, { weekday: "short", day: "numeric" }),
      amount: revenueMap[dateStr] || 0
    }))

    // 3. Category distribution (joining order_items and products)
    interface CategoryCountRaw {
      category: string | null
      count: number | null
    }
    const categoryCountsRaw: CategoryCountRaw[] = await prisma.$queryRaw`
      SELECT p.category, SUM(oi.quantity)::integer AS "count"
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      GROUP BY p.category
    `

    const categoryCounts: { [key: string]: number } = {
      painting: 0,
      craft: 0,
      "tote-bag": 0,
      apparel: 0,
      unknown: 0
    }

    categoryCountsRaw.forEach(item => {
      const cat = item.category ? item.category.toLowerCase() : "unknown"
      const normalizedCat = cat === "tote_bag" ? "tote-bag" : cat
      categoryCounts[normalizedCat] = Number(item.count || 0)
    })

    res.status(200).json({
      status: "success",
      data: {
        totalRevenue,
        pendingOrders,
        aov,
        chartData,
        categoryCounts
      }
    })
  } catch (error) {
    next(error)
  }
}
