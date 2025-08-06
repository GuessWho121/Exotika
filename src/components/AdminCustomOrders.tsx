"use client"

import { useState } from "react"
import { Eye, Palette, ImageIcon } from 'lucide-react'
import { useAdmin, type CustomOrder } from "../contexts/AdminContext"

export function AdminCustomOrders() {
  const { state, dispatch } = useAdmin()
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null)

  const updateStatus = (id: string, status: CustomOrder["status"]) => {
    dispatch({ type: "UPDATE_CUSTOM_ORDER_STATUS", payload: { id, status } })
  }

  const getStatusColor = (status: CustomOrder["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#4A3F00]">Custom Orders</h2>
        <div className="text-sm text-[#8C7B00]">Total: {state.customOrders.length} requests</div>
      </div>

      {state.customOrders.length === 0 ? (
        <div className="rounded-lg border border-[#FFF5CC] bg-white p-12 text-center shadow-sm">
          <Palette className="mx-auto mb-4 h-12 w-12 text-[#8C7B00]" />
          <h3 className="mb-2 text-lg font-semibold text-[#4A3F00]">No custom orders yet</h3>
          <p className="text-[#8C7B00]">Custom order requests will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {state.customOrders.map((order) => (
            <div key={order.id} className="rounded-lg border border-[#FFF5CC] bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="font-semibold text-[#4A3F00]">Custom Order #{order.id}</h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.replace("-", " ")}
                    </span>
                    {order.referenceImages && order.referenceImages.length > 0 && (
                      <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                        <ImageIcon className="h-3 w-3" />
                        {order.referenceImages.length} ref images
                      </span>
                    )}
                  </div>
                  <div className="grid gap-2 text-sm text-[#8C7B00] sm:grid-cols-2">
                    <div>
                      <strong>Customer:</strong> {order.customerInfo.name}
                    </div>
                    <div>
                      <strong>Type:</strong> <span className="capitalize">{order.type}</span>
                    </div>
                    <div>
                      <strong>Budget:</strong> ₹{order.budget.toFixed(2)}
                    </div>
                    <div>
                      <strong>Date:</strong> {order.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                  {order.size && (
                    <div className="mt-2 text-sm text-[#8C7B00]">
                      <strong>Size:</strong> {order.size}
                    </div>
                  )}
                  <div className="mt-2">
                    <strong className="text-sm text-[#8C7B00]">Description:</strong>
                    <p className="mt-1 text-sm text-[#8C7B00] line-clamp-3">{order.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="mb-4">
                    <div className="text-lg font-bold text-[#4A3F00]">₹{order.budget.toFixed(2)}</div>
                    <div className="text-sm text-[#8C7B00] capitalize">{order.type}</div>
                  </div>
                  <div className="space-y-2">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value as CustomOrder["status"])}
                      className="block w-full rounded border border-[#FFF5CC] bg-[#FFFBEB] px-2 py-1 text-xs text-[#4A3F00] focus:border-[#FFDE59] focus:outline-none focus:ring-1 focus:ring-[#FFDE59]"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex w-full items-center justify-center gap-1 rounded bg-[#FFFBEB] px-3 py-1 text-xs text-[#4A3F00] hover:bg-[#FFF5CC]"
                    >
                      <Eye className="h-3 w-3" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setSelectedOrder(null)} />
            <div className="relative w-full max-w-4xl rounded-lg bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-xl font-bold text-[#4A3F00]">Custom Order Details - #{selectedOrder.id}</h3>

              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h4 className="font-semibold text-[#4A3F00]">Customer Information</h4>
                    <div className="mt-2 space-y-1 text-sm text-[#8C7B00]">
                      <div>
                        <strong>Name:</strong> {selectedOrder.customerInfo.name}
                      </div>
                      <div>
                        <strong>Email:</strong> {selectedOrder.customerInfo.email}
                      </div>
                      <div>
                        <strong>Phone:</strong> {selectedOrder.customerInfo.phone}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#4A3F00]">Project Information</h4>
                    <div className="mt-2 space-y-1 text-sm text-[#8C7B00]">
                      <div>
                        <strong>Type:</strong> <span className="capitalize">{selectedOrder.type}</span>
                      </div>
                      <div>
                        <strong>Budget:</strong> ₹{selectedOrder.budget.toFixed(2)}
                      </div>
                      {selectedOrder.size && (
                        <div>
                          <strong>Size:</strong> {selectedOrder.size}
                        </div>
                      )}
                      <div>
                        <strong>Date:</strong> {selectedOrder.createdAt.toLocaleDateString()}
                      </div>
                      <div>
                        <strong>Status:</strong>
                        <span
                          className={`ml-2 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(selectedOrder.status)}`}
                        >
                          {selectedOrder.status.replace("-", " ")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[#4A3F00]">Project Description</h4>
                  <div className="mt-2 rounded border border-[#FFF5CC] bg-[#FFFBEB] p-3 text-sm text-[#8C7B00]">
                    {selectedOrder.description}
                  </div>
                </div>

                {/* Reference Images */}
                {selectedOrder.referenceImages && selectedOrder.referenceImages.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-[#4A3F00]">Reference Images ({selectedOrder.referenceImages.length})</h4>
                    <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                      {selectedOrder.referenceImages.map((image, index) => (
                        <div key={index} className="group relative">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`Reference ${index + 1}`}
                            className="h-24 w-full rounded-lg object-cover cursor-pointer transition-transform hover:scale-105"
                            onClick={() => window.open(image, '_blank')}
                          />
                          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-0 transition-all group-hover:bg-opacity-20">
                            <Eye className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-[#8C7B00]">Click on any image to view full size</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-lg bg-[#FFDE59] px-4 py-2 font-semibold text-[#4A3F00] transition-opacity hover:opacity-90"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
