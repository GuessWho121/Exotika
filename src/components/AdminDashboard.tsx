import { Package, ShoppingCart, Palette, DollarSign } from 'lucide-react'
import { useAdmin } from "../contexts/AdminContext"

interface AdminDashboardProps {
  onTabChange: (tab: "dashboard" | "products" | "orders" | "transactions" | "custom-orders") => void
}

export function AdminDashboard({ onTabChange }: AdminDashboardProps) {
  const { state } = useAdmin()

  const totalRevenue = state.transactions.reduce((sum, transaction) => sum + transaction.total, 0)
  const pendingOrders = state.transactions.filter((t) => t.status === "pending").length
  const customOrdersCount = state.customOrders.length

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
      title: "Pending Orders",
      value: pendingOrders,
      icon: ShoppingCart,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Custom Orders",
      value: customOrdersCount,
      icon: Palette,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="rounded-lg border border-[#FFF5CC] bg-white p-6 shadow-sm">
              <div className="flex items-center">
                <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-[#8C7B00]">{stat.title}</p>
                  <p className="text-2xl font-bold text-[#4A3F00]">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-[#FFF5CC] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[#4A3F00]">Quick Actions</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button 
            onClick={() => onTabChange("products")}
            className="rounded-lg border border-[#FFDE59] p-4 text-left transition-colors hover:bg-[#FFFBEB]"
          >
            <Package className="mb-2 h-6 w-6 text-[#4A3F00]" />
            <h4 className="font-medium text-[#4A3F00]">Manage Products</h4>
            <p className="text-sm text-[#8C7B00]">Add, edit, or remove products</p>
          </button>
          <button 
            onClick={() => onTabChange("orders")}
            className="rounded-lg border border-[#FFDE59] p-4 text-left transition-colors hover:bg-[#FFFBEB]"
          >
            <ShoppingCart className="mb-2 h-6 w-6 text-[#4A3F00]" />
            <h4 className="font-medium text-[#4A3F00]">View Orders</h4>
            <p className="text-sm text-[#8C7B00]">Manage customer orders</p>
          </button>
          <button 
            onClick={() => onTabChange("custom-orders")}
            className="rounded-lg border border-[#FFDE59] p-4 text-left transition-colors hover:bg-[#FFFBEB]"
          >
            <Palette className="mb-2 h-6 w-6 text-[#4A3F00]" />
            <h4 className="font-medium text-[#4A3F00]">Custom Orders</h4>
            <p className="text-sm text-[#8C7B00]">Review custom requests</p>
          </button>
        </div>
      </div>
    </div>
  )
}
