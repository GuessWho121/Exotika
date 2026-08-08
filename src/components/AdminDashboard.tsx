import { useState, useEffect } from "react"
import { Package, ShoppingCart, Palette, DollarSign, TrendingUp } from 'lucide-react'
import { useAdmin } from "../contexts/AdminContext"

interface AdminDashboardProps {
  onTabChange: (tab: "dashboard" | "products" | "orders" | "transactions" | "custom-orders") => void
}

interface DashboardStats {
  totalRevenue: number
  pendingOrders: number
  aov: number
  chartData: Array<{ label: string; amount: number }>
  categoryCounts: { [key: string]: number }
}

export function AdminDashboard({ onTabChange }: AdminDashboardProps) {
  const { state } = useAdmin()
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null)
  
  const [statsData, setStatsData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats")
        if (res.ok) {
          const json = await res.json()
          setStatsData(json.data)
        }
      } catch (err) {
        console.error("Failed to load dashboard stats", err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading || !statsData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FFDE59] border-t-transparent"></div>
        <p className="text-sm text-[#8C7B00] font-medium">Loading analytics dashboard...</p>
      </div>
    )
  }

  const { totalRevenue, pendingOrders, aov, chartData, categoryCounts } = statsData

  const maxAmount = Math.max(...chartData.map(d => d.amount), 1000)

  const totalItemsSold = Object.values(categoryCounts).reduce((a, b) => a + b, 0)
  
  const categoryColors: { [key: string]: string } = {
    painting: "#B39800", // Gold Dark
    craft: "#8B4513",    // Brown
    "tote-bag": "#E6C747", // Gold Light
    apparel: "#4A3F00",    // Darkest Gold
    unknown: "#9CA3AF"     // Gray for unknown/deleted products
  }

  const categoryLabels: { [key: string]: string } = {
    painting: "Paintings",
    craft: "Crafts",
    "tote-bag": "Tote Bags",
    apparel: "Apparel",
    unknown: "Deleted Artworks"
  }

  const categoryData = Object.keys(categoryCounts).map(key => {
    const count = categoryCounts[key]
    const percent = totalItemsSold > 0 ? count / totalItemsSold : 0
    return {
      key,
      label: categoryLabels[key],
      count,
      percent,
      color: categoryColors[key]
    }
  }).filter(c => c.count > 0)

  // Donut chart calculations
  const donutRadius = 40
  const donutCircumference = 2 * Math.PI * donutRadius
  let accumulatedPercent = 0
  const donutSegments = categoryData.map(c => {
    const strokeDasharray = `${c.percent * donutCircumference} ${donutCircumference}`
    const strokeDashoffset = -accumulatedPercent * donutCircumference
    accumulatedPercent += c.percent
    return {
      ...c,
      strokeDasharray,
      strokeDashoffset
    }
  })

  const stats = [
    {
      title: "Total Products",
      value: state.products.length,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Average Order Value (AOV)",
      value: `₹${aov.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Pending Orders",
      value: pendingOrders,
      icon: ShoppingCart,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="rounded-xl border border-[#FFF5CC] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-semibold text-[#8C7B00] uppercase tracking-wider">{stat.title}</p>
                  <p className="text-xl font-bold text-[#4A3F00] mt-1">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Revenue Bar Chart (2 cols) */}
        <div className="lg:col-span-2 rounded-xl border border-[#FFF5CC] bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#4A3F00]">Revenue Trends</h3>
            <p className="text-xs text-[#8C7B00] mt-1">Daily billing summaries for active checkout cycles</p>
          </div>
          
          <div className="mt-8 relative h-64 flex items-end justify-between border-b border-[#FFF5CC] pb-2">
            {chartData.map((d, idx) => {
              const heightPercent = (d.amount / maxAmount) * 100
              return (
                <div 
                  key={idx} 
                  className="flex flex-col items-center flex-1 group cursor-pointer relative"
                  onMouseEnter={() => setHoveredBar(idx)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Tooltip */}
                  {hoveredBar === idx && (
                    <div className="absolute -top-12 z-50 bg-[#4A3F00] text-white text-xs font-bold px-2 py-1 rounded shadow-md pointer-events-none transition-all">
                      ₹{d.amount.toFixed(2)}
                    </div>
                  )}
                  {/* SVG Bar */}
                  <div className="w-8 sm:w-12 bg-[#FFFBEB] border border-[#E6C747]/40 rounded-t-md relative overflow-hidden transition-all duration-300 group-hover:bg-[#FFDE59]/20 group-hover:border-[#FFDE59]" style={{ height: `${Math.max(heightPercent, 3)}%` }}>
                    <div className="absolute bottom-0 w-full bg-[#FFDE59] transition-all rounded-t-md" style={{ height: "100%" }} />
                  </div>
                  <span className="text-[10px] sm:text-xs text-[#8C7B00] mt-2 font-medium">{d.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Category Share Donut Chart (1 col) */}
        <div className="rounded-xl border border-[#FFF5CC] bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#4A3F00]">Category Distribution</h3>
            <p className="text-xs text-[#8C7B00] mt-1">Share of items sold by product categories</p>
          </div>

          {totalItemsSold === 0 ? (
            <div className="py-12 text-center text-sm text-[#8C7B00]">No sales data recorded yet.</div>
          ) : (
            <div className="flex flex-col items-center justify-center mt-6">
              <div className="relative flex items-center justify-center">
                <svg width="150" height="150" viewBox="0 0 100 100" className="transform -rotate-90">
                  <circle cx="50" cy="50" r={donutRadius} fill="transparent" stroke="#FFFBEB" strokeWidth="10" />
                  {donutSegments.map((seg, idx) => (
                    <circle
                      key={idx}
                      cx="50"
                      cy="50"
                      r={donutRadius}
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth={hoveredSegment === idx ? "12" : "9"}
                      strokeDasharray={seg.strokeDasharray}
                      strokeDashoffset={seg.strokeDashoffset}
                      strokeLinecap="round"
                      className="cursor-pointer transition-all duration-200"
                      onMouseEnter={() => setHoveredSegment(idx)}
                      onMouseLeave={() => setHoveredSegment(null)}
                    />
                  ))}
                </svg>
                {/* Center metric */}
                <div className="absolute text-center">
                  <span className="text-2xl font-bold text-[#4A3F00]">{totalItemsSold}</span>
                  <span className="block text-[10px] text-[#8C7B00] font-bold uppercase tracking-wider">Sold</span>
                </div>
              </div>

              {/* Legend Table */}
              <div className="w-full mt-6 grid grid-cols-2 gap-2 text-xs">
                {categoryData.map((c, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-2 p-1.5 rounded transition-colors ${hoveredSegment === idx ? "bg-[#FFFBEB] font-bold" : ""}`}
                    onMouseEnter={() => setHoveredSegment(idx)}
                    onMouseLeave={() => setHoveredSegment(null)}
                  >
                    <span className="h-3.5 w-3.5 rounded-full shrink-0 border border-black/5" style={{ backgroundColor: c.color }} />
                    <span className="text-[#4A3F00] truncate">{c.label} ({Math.round(c.percent * 100)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-[#FFF5CC] bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#4A3F00] mb-4">Quick Operations</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button 
            onClick={() => onTabChange("products")}
            className="rounded-lg border border-[#FFDE59] p-4 text-left transition-all hover:bg-[#FFFBEB] hover:shadow-sm"
          >
            <Package className="mb-2 h-6 w-6 text-[#4A3F00]" />
            <h4 className="font-bold text-[#4A3F00] text-sm">Manage Products</h4>
            <p className="text-xs text-[#8C7B00] mt-1">Upload artwork, update inventory stock, or edit collections</p>
          </button>
          <button 
            onClick={() => onTabChange("orders")}
            className="rounded-lg border border-[#FFDE59] p-4 text-left transition-all hover:bg-[#FFFBEB] hover:shadow-sm"
          >
            <ShoppingCart className="mb-2 h-6 w-6 text-[#4A3F00]" />
            <h4 className="font-bold text-[#4A3F00] text-sm">View Orders</h4>
            <p className="text-xs text-[#8C7B00] mt-1">Update fulfillments, track couriers, and view shipping labels</p>
          </button>
          <button 
            onClick={() => onTabChange("custom-orders")}
            className="rounded-lg border border-[#FFDE59] p-4 text-left transition-all hover:bg-[#FFFBEB] hover:shadow-sm"
          >
            <Palette className="mb-2 h-6 w-6 text-[#4A3F00]" />
            <h4 className="font-bold text-[#4A3F00] text-sm">Custom Orders</h4>
            <p className="text-xs text-[#8C7B00] mt-1">Process customer commissions and reference files</p>
          </button>
        </div>
      </div>
    </div>
  )
}
