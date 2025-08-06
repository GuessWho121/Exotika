"use client"

import { useState } from "react"
import { Eye, Package } from 'lucide-react'
import { useAdmin, type Transaction } from "../contexts/AdminContext"

export function AdminTransactions() {
  const { state, dispatch } = useAdmin()
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  const updateStatus = (id: string, status: Transaction["status"]) => {
    dispatch({ type: "UPDATE_TRANSACTION_STATUS", payload: { id, status } })
  }

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#4A3F00]">Orders & Transactions</h2>
        <div className="text-sm text-[#8C7B00]">Total: {state.transactions.length} orders</div>
      </div>

      {state.transactions.length === 0 ? (
        <div className="rounded-lg border border-[#FFF5CC] bg-white p-12 text-center shadow-sm">
          <Package className="mx-auto mb-4 h-12 w-12 text-[#8C7B00]" />
          <h3 className="mb-2 text-lg font-semibold text-[#4A3F00]">No orders yet</h3>
          <p className="text-[#8C7B00]">Orders will appear here once customers make purchases.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {state.transactions.map((transaction) => (
            <div key={transaction.id} className="rounded-lg border border-[#FFF5CC] bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="font-semibold text-[#4A3F00]">Order #{transaction.id}</h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(transaction.status)}`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                  <div className="grid gap-2 text-sm text-[#8C7B00] sm:grid-cols-2">
                    <div>
                      <strong>Customer:</strong> {transaction.customerInfo.name}
                    </div>
                    <div>
                      <strong>Email:</strong> {transaction.customerInfo.email}
                    </div>
                    <div>
                      <strong>Phone:</strong> {transaction.customerInfo.phone}
                    </div>
                    <div>
                      <strong>Date:</strong> {transaction.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="mt-2">
                    <strong className="text-sm text-[#8C7B00]">Items:</strong>
                    <div className="mt-1 space-y-1">
                      {transaction.items.map((item, index) => (
                        <div key={index} className="text-sm text-[#8C7B00]">
                          {item.title} × {item.quantity} - ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="mb-4">
                    <div className="text-lg font-bold text-[#4A3F00]">₹{transaction.total.toFixed(2)}</div>
                    <div className="text-sm text-[#8C7B00]">{transaction.items.length} item(s)</div>
                  </div>
                  <div className="space-y-2">
                    <select
                      value={transaction.status}
                      onChange={(e) => updateStatus(transaction.id, e.target.value as Transaction["status"])}
                      className="block w-full rounded border border-[#FFF5CC] bg-[#FFFBEB] px-2 py-1 text-xs text-[#4A3F00] focus:border-[#FFDE59] focus:outline-none focus:ring-1 focus:ring-[#FFDE59]"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                    <button
                      onClick={() => setSelectedTransaction(transaction)}
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

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setSelectedTransaction(null)} />
            <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-xl font-bold text-[#4A3F00]">
                Order Details - #{selectedTransaction.id}
              </h3>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h4 className="font-semibold text-[#4A3F00]">Customer Information</h4>
                    <div className="mt-2 space-y-1 text-sm text-[#8C7B00]">
                      <div>
                        <strong>Name:</strong> {selectedTransaction.customerInfo.name}
                      </div>
                      <div>
                        <strong>Email:</strong> {selectedTransaction.customerInfo.email}
                      </div>
                      <div>
                        <strong>Phone:</strong> {selectedTransaction.customerInfo.phone}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#4A3F00]">Order Information</h4>
                    <div className="mt-2 space-y-1 text-sm text-[#8C7B00]">
                      <div>
                        <strong>Date:</strong> {selectedTransaction.createdAt.toLocaleDateString()}
                      </div>
                      <div>
                        <strong>Status:</strong>
                        <span
                          className={`ml-2 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(selectedTransaction.status)}`}
                        >
                          {selectedTransaction.status}
                        </span>
                      </div>
                      <div>
                        <strong>Total:</strong> ₹{selectedTransaction.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[#4A3F00]">Shipping Address</h4>
                  <div className="mt-2 text-sm text-[#8C7B00]">{selectedTransaction.customerInfo.address}</div>
                </div>

                <div>
                  <h4 className="font-semibold text-[#4A3F00]">Items Ordered</h4>
                  <div className="mt-2 space-y-2">
                    {selectedTransaction.items.map((item, index) => (
                      <div key={index} className="flex justify-between rounded border border-[#FFF5CC] p-3">
                        <div>
                          <div className="font-medium text-[#4A3F00]">{item.title}</div>
                          <div className="text-sm text-[#8C7B00]">Quantity: {item.quantity}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-[#4A3F00]">₹{(item.price * item.quantity).toFixed(2)}</div>
                          <div className="text-sm text-[#8C7B00]">₹{item.price.toFixed(2)} each</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedTransaction(null)}
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
