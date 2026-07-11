import { useState } from "react"
import { Search, ShoppingBag, Truck } from 'lucide-react'
import { useAdmin, type Transaction } from "../contexts/AdminContext"

export function AdminOrders() {
  const { state, refreshTransactions } = useAdmin()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "processing" | "shipped" | "delivered">("all")
  
  // Local state to simulate courier tracking detail inputs
  const [trackingInfo, setTrackingInfo] = useState<{ [orderId: string]: { courier: string; trackingId: string; estDate: string } }>({})

  const updateStatus = async (id: string, status: Transaction["status"]) => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: status.toUpperCase() })
      })
      if (res.ok) {
        await refreshTransactions()
      } else {
        alert("Failed to update order status.")
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Handle saving tracking info (mock persistence)
  const saveTrackingInfo = (orderId: string, courier: string, trackingId: string, estDate: string) => {
    setTrackingInfo(prev => ({
      ...prev,
      [orderId]: { courier, trackingId, estDate }
    }))
    alert(`Tracking information updated successfully for Order #${orderId.slice(0, 8)}!`)
  }

  // Filter orders
  const filteredOrders = state.transactions.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = 
      statusFilter === "all" || 
      order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header and Summary stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#4A3F00]">Order Fulfillment</h2>
          <p className="text-xs text-[#8C7B00] mt-1">Track packaging logistics, print shipping details, and dispatch couriers</p>
        </div>
        <div className="text-xs font-semibold text-[#8C7B00] bg-[#FFFBEB] border border-[#FFF5CC] px-3.5 py-1.5 rounded-lg">
          Pending Dispatch: {state.transactions.filter(t => t.status === "pending" || t.status === "processing").length} packages
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 bg-[#FFFBEB] p-4 rounded-xl border border-[#FFF5CC]">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-[#8C7B00]" />
          <input
            type="text"
            placeholder="Search by customer name, email, or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#FFF5CC] rounded-lg text-sm text-[#4A3F00] placeholder-[#8C7B00] focus:border-[#FFDE59] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 border-t border-[#FFF5CC] pt-3">
          {(["all", "pending", "processing", "shipped", "delivered"] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors border ${
                statusFilter === status
                  ? "bg-[#4A3F00] text-white border-[#4A3F00]"
                  : "bg-white text-[#8C7B00] border-[#FFF5CC] hover:bg-[#FFFBEB]"
              }`}
            >
              {status} ({status === "all" ? state.transactions.length : state.transactions.filter(t => t.status === status).length})
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-xl border border-[#FFF5CC] bg-white p-12 text-center shadow-sm">
          <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-[#8C7B00]/40" />
          <h3 className="mb-2 text-lg font-bold text-[#4A3F00]">No matching orders</h3>
          <p className="text-sm text-[#8C7B00]">Try expanding filters or search details.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredOrders.map((order) => {
            const track = trackingInfo[order.id] || { courier: "", trackingId: "", estDate: "" }
            return (
              <div key={order.id} className="rounded-xl border border-[#FFF5CC] bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  {/* Order Status Badge & ID */}
                  <div className="flex items-center justify-between mb-4 border-b border-[#FFF5CC] pb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#4A3F00]">#{order.id.slice(0, 8)}...</span>
                      <span className="block text-[10px] text-[#8C7B00] mt-0.5">
                        {order.createdAt.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        order.isPaid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {order.isPaid ? "Paid" : "Unpaid"}
                      </span>
                    </div>
                  </div>

                  {/* Customer Information Section */}
                  <div className="space-y-2.5 text-sm text-[#8C7B00]">
                    <div>
                      <strong className="text-xs uppercase font-bold text-[#4A3F00] block mb-0.5">Ship To</strong>
                      <div className="font-semibold text-[#4A3F00]">{order.customerInfo.name}</div>
                      <div className="text-xs">{order.customerInfo.email} | {order.customerInfo.phone}</div>
                    </div>
                    
                    <div>
                      <strong className="text-xs uppercase font-bold text-[#4A3F00] block mb-0.5">Delivery Address</strong>
                      <div className="text-xs leading-relaxed bg-[#FFFBEB]/50 p-2 rounded-lg border border-[#FFF5CC]/60 font-medium text-[#4A3F00]">
                        {order.customerInfo.address}
                      </div>
                    </div>

                    {/* Purchased Items List */}
                    <div>
                      <strong className="text-xs uppercase font-bold text-[#4A3F00] block mb-1">Package Items</strong>
                      <div className="text-xs space-y-1 font-medium text-[#4A3F00]">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center bg-[#FFFBEB]/20 p-1.5 rounded">
                            <span>{item.title} <strong className="text-[#8C7B00]">× {item.quantity}</strong></span>
                            <span className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logistics Controls Area */}
                <div className="mt-6 border-t border-[#FFF5CC] pt-4 space-y-4">
                  {/* Status Progression Controls */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-bold text-[#4A3F00] uppercase tracking-wider">Update Status:</span>
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value as any)}
                      className="rounded-lg border border-[#FFF5CC] bg-white px-2 py-1.5 text-xs font-bold text-[#4A3F00] shadow-xs outline-none focus:border-[#FFDE59]"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>

                  {/* Courier Tracking Inputs (Active when processing or shipped) */}
                  {(order.status === "processing" || order.status === "shipped" || order.status === "delivered") && (
                    <div className="bg-[#FFFBEB] p-3 rounded-lg border border-[#FFF5CC] space-y-2">
                      <div className="flex items-center gap-1 text-xs font-bold text-[#4A3F00] border-b border-[#FFF5CC]/60 pb-1">
                        <Truck className="h-3.5 w-3.5" />
                        <span>COURIER & TRACKING LOGISTICS</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-[#8C7B00]">Courier Partner</label>
                          <input 
                            type="text" 
                            placeholder="e.g. BlueDart"
                            defaultValue={track.courier}
                            id={`courier-${order.id}`}
                            className="w-full mt-0.5 p-1 bg-white border border-[#FFF5CC] rounded text-[#4A3F00]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#8C7B00]">Waybill / Tracking ID</label>
                          <input 
                            type="text" 
                            placeholder="e.g. 98124712"
                            defaultValue={track.trackingId}
                            id={`tracking-${order.id}`}
                            className="w-full mt-0.5 p-1 bg-white border border-[#FFF5CC] rounded text-[#4A3F00]"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-[#8C7B00]">Estimated Delivery Date</label>
                          <input 
                            type="date"
                            defaultValue={track.estDate}
                            id={`estdate-${order.id}`}
                            className="w-full mt-0.5 p-1 bg-white border border-[#FFF5CC] rounded text-[#4A3F00]"
                          />
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          const courier = (document.getElementById(`courier-${order.id}`) as HTMLInputElement)?.value || ""
                          const trackingId = (document.getElementById(`tracking-${order.id}`) as HTMLInputElement)?.value || ""
                          const estDate = (document.getElementById(`estdate-${order.id}`) as HTMLInputElement)?.value || ""
                          saveTrackingInfo(order.id, courier, trackingId, estDate)
                        }}
                        className="w-full mt-1.5 bg-[#4A3F00] text-white py-1 rounded text-xs font-bold hover:bg-[#4A3F00]/90 transition-opacity"
                      >
                        Save Dispatch Details
                      </button>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm font-bold text-[#4A3F00]">
                    <span>Total Amount:</span>
                    <span>₹{order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
