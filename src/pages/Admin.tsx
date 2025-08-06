"use client"

import { useState } from "react"
import { Package, ShoppingCart, Palette, BarChart3, Eye } from 'lucide-react'
import { useAdmin } from "../contexts/AdminContext"
import { AdminProducts } from "../components/AdminProducts"
import { AdminTransactions } from "../components/AdminTransactions"
import { AdminCustomOrders } from "../components/AdminCustomOrders"
import { AdminDashboard } from "../components/AdminDashboard"

export function Admin() {
  const { state } = useAdmin()
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders" | "transactions" | "custom-orders">("dashboard")

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "View Orders", icon: Eye },
    { id: "transactions", label: "Transactions", icon: ShoppingCart },
    { id: "custom-orders", label: "Custom Orders", icon: Palette },
  ] as const

  return (
    <div className="flex w-full max-w-7xl flex-1 flex-col">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold text-[#4A3F00]">Admin Panel</h1>
        <p className="text-[#8C7B00]">Manage your products, orders, and business data.</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8 border-b border-[#FFF5CC]">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-[#FFDE59] text-[#4A3F00]"
                    : "border-transparent text-[#8C7B00] hover:border-[#FFF5CC] hover:text-[#4A3F00]"
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
                {(tab.id === "transactions" || tab.id === "orders") && state.transactions.length > 0 && (
                  <span className="rounded-full bg-[#FFDE59] px-2 py-1 text-xs font-bold text-[#4A3F00]">
                    {state.transactions.length}
                  </span>
                )}
                {tab.id === "custom-orders" && state.customOrders.length > 0 && (
                  <span className="rounded-full bg-[#FFDE59] px-2 py-1 text-xs font-bold text-[#4A3F00]">
                    {state.customOrders.length}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === "dashboard" && <AdminDashboard onTabChange={setActiveTab} />}
        {activeTab === "products" && <AdminProducts />}
        {(activeTab === "orders" || activeTab === "transactions") && <AdminTransactions />}
        {activeTab === "custom-orders" && <AdminCustomOrders />}
      </div>
    </div>
  )
}
