"use client"

import { useState } from "react"
import { Eye, Palette, ImageIcon, Download, X, Mail, Phone, MessageCircle } from 'lucide-react'
import { useAdmin, type CustomOrder } from "../contexts/AdminContext"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

export function AdminCustomOrders() {
  const { state, refreshCustomOrders } = useAdmin()
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null)
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)
  const [isZipping, setIsZipping] = useState(false)

  const loadJSZip = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).JSZip) {
        resolve((window as any).JSZip)
        return
      }
      const script = document.createElement("script")
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"
      script.async = true
      script.onload = () => resolve((window as any).JSZip)
      script.onerror = (err) => reject(err)
      document.body.appendChild(script)
    })
  }

  const downloadZip = async (order: CustomOrder) => {
    if (!order.referenceImages || order.referenceImages.length === 0) return
    setIsZipping(true)
    try {
      const JSZip = await loadJSZip()
      const zip = new JSZip()

      const promises = order.referenceImages.map(async (url, idx) => {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`Failed to fetch image ${url}`)
        const blob = await res.blob()
        const ext = url.split(".").pop()?.split("?")[0] || "jpg"
        zip.file(`reference-${idx + 1}.${ext}`, blob)
      })

      await Promise.all(promises)
      const content = await zip.generateAsync({ type: "blob" })
      
      const link = document.createElement("a")
      link.href = URL.createObjectURL(content)
      link.download = `custom-order-${order.id}-references.zip`
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (err) {
      console.error("ZIP Generation failed:", err)
      alert("Failed to download ZIP file. Please try again.")
    } finally {
      setIsZipping(false)
    }
  }

  const updateStatus = async (id: string, status: CustomOrder["status"]) => {
    // Format status for prisma enum compatibility ("in-progress" -> "IN_PROGRESS")
    const formattedStatus = status.toUpperCase().replace("-", "_")
    try {
      const res = await fetch(`/api/custom-orders/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: formattedStatus })
      })
      if (res.ok) {
        await refreshCustomOrders()
      } else {
        alert("Failed to update custom order status.")
      }
    } catch (err) {
      console.error(err)
    }
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
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <strong>Customer:</strong> <span>{order.customerInfo.name}</span>
                      <span className="flex items-center gap-1.5 ml-1">
                        <a 
                          href={`mailto:${order.customerInfo.email}?subject=Regarding your Exotika Creation Custom Order`}
                          className="text-[#8C7B00] hover:text-[#4A3F00] transition-colors"
                          title={`Email ${order.customerInfo.name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Mail className="h-4 w-4" />
                        </a>
                        <a 
                          href={`tel:${order.customerInfo.phone}`}
                          className="text-[#8C7B00] hover:text-[#4A3F00] transition-colors"
                          title={`Call ${order.customerInfo.name}`}
                        >
                          <Phone className="h-4 w-4" />
                        </a>
                        <a 
                          href={`https://wa.me/${order.customerInfo.phone.replace(/\D/g, "").length === 10 ? "91" : ""}${order.customerInfo.phone.replace(/\D/g, "")}`}
                          className="text-green-600 hover:text-green-700 transition-colors"
                          title={`WhatsApp ${order.customerInfo.name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="h-4 w-4 fill-green-600/10" />
                        </a>
                      </span>
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
                    <Select
                      value={order.status}
                      onValueChange={(val) => updateStatus(order.id, val as any)}
                    >
                      <SelectTrigger className="w-full h-8 border border-[#8B4513]/30 bg-[#FFFBEB] text-[#4A3F00] text-xs focus:border-[#8B4513] focus:ring-0">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#FFFBEB]">
                        <SelectItem value="pending" className="text-[#4A3F00] focus:bg-[#FFDE59] text-xs">Pending</SelectItem>
                        <SelectItem value="in-progress" className="text-[#4A3F00] focus:bg-[#FFDE59] text-xs">In Progress</SelectItem>
                        <SelectItem value="completed" className="text-[#4A3F00] focus:bg-[#FFDE59] text-xs">Completed</SelectItem>
                        <SelectItem value="cancelled" className="text-[#4A3F00] focus:bg-[#FFDE59] text-xs">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
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
                       <div className="flex items-center justify-between py-1 border-b border-gray-100">
                        <div>
                          <strong>Name:</strong> {selectedOrder.customerInfo.name}
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-gray-100">
                        <div>
                          <strong>Email:</strong> {selectedOrder.customerInfo.email}
                        </div>
                        <a 
                          href={`mailto:${selectedOrder.customerInfo.email}?subject=Regarding your Exotika Creation Custom Order`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#8C7B00] hover:text-[#4A3F00] transition-colors bg-[#FFFBEB] px-2 py-1 rounded border border-[#E6C747]/30 shadow-xs"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Mail className="h-3.5 w-3.5" /> Email
                        </a>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <div>
                          <strong>Phone:</strong> {selectedOrder.customerInfo.phone}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <a 
                            href={`tel:${selectedOrder.customerInfo.phone}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#8C7B00] hover:text-[#4A3F00] transition-colors bg-[#FFFBEB] px-2 py-1 rounded border border-[#E6C747]/30 shadow-xs"
                          >
                            <Phone className="h-3.5 w-3.5" /> Call
                          </a>
                          <a 
                            href={`https://wa.me/${selectedOrder.customerInfo.phone.replace(/\D/g, "").length === 10 ? "91" : ""}${selectedOrder.customerInfo.phone.replace(/\D/g, "")}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-800 transition-colors bg-green-50 px-2 py-1 rounded border border-green-200 shadow-xs"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MessageCircle className="h-3.5 w-3.5 fill-green-600/10" /> WhatsApp
                          </a>
                        </div>
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
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-[#4A3F00]">Reference Images ({selectedOrder.referenceImages.length})</h4>
                      <button
                        type="button"
                        onClick={() => downloadZip(selectedOrder)}
                        disabled={isZipping}
                        className="flex items-center gap-1 rounded bg-[#FFDE59] px-3 py-1.5 text-xs font-semibold text-[#4A3F00] hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
                      >
                        <Download className="h-3.5 w-3.5" />
                        {isZipping ? "Creating ZIP..." : "Download ZIP"}
                      </button>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                      {selectedOrder.referenceImages.map((image, index) => (
                        <div key={index} className="group relative cursor-pointer" onClick={() => setZoomedImage(image)}>
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`Reference ${index + 1}`}
                            className="h-24 w-full rounded-lg object-cover transition-transform hover:scale-105"
                          />
                          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-0 transition-all group-hover:bg-opacity-20">
                            <Eye className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-[#8C7B00]">Click on any image to zoom in</p>
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
      {/* Reference Image Zoom Overlay Modal */}
      {zoomedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={() => setZoomedImage(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <img
              src={zoomedImage}
              alt="Zoomed Reference"
              className="max-w-full max-h-[85vh] rounded-lg object-contain shadow-2xl"
            />
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white border-white/20 hover:bg-white/40 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
