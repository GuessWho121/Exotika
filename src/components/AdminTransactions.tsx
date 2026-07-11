import { useState } from "react"
import { Search, Eye, X } from 'lucide-react'
import { useAdmin, type Transaction } from "../contexts/AdminContext"

export function AdminTransactions() {
  const { state } = useAdmin()
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "unpaid">("all")
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)

  // 1. Filter Transactions
  const filteredTransactions = state.transactions.filter(tx => {
    const matchesSearch = 
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.paymentId && tx.paymentId.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesPayment = 
      paymentFilter === "all" ||
      (paymentFilter === "paid" && tx.isPaid) ||
      (paymentFilter === "unpaid" && !tx.isPaid)

    return matchesSearch && matchesPayment
  })

  // 2. Export Transactions to CSV for Bookkeeping
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return

    const headers = [
      "Order ID", 
      "Date", 
      "Customer Name", 
      "Customer Email", 
      "Customer Phone", 
      "Billing Address", 
      "Payment Status", 
      "Payment ID", 
      "Grand Total (INR)"
    ]

    const csvRows = [headers.join(",")]

    filteredTransactions.forEach(tx => {
      const row = [
        tx.id,
        tx.createdAt.toLocaleDateString(),
        `"${tx.customerInfo.name.replace(/"/g, '""')}"`,
        tx.customerInfo.email,
        tx.customerInfo.phone,
        `"${tx.customerInfo.address.replace(/"/g, '""')}"`,
        tx.isPaid ? "Paid" : "Unpaid",
        tx.paymentId || "N/A",
        tx.total.toFixed(2)
      ]
      csvRows.push(row.join(","))
    })

    const csvString = csvRows.join("\n")
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    const dateStr = new Date().toISOString().slice(0, 10)
    link.setAttribute("download", `exotika_ledger_${dateStr}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Header and Summary stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#4A3F00]">Transactions Ledger</h2>
          <p className="text-xs text-[#8C7B00] mt-1">Financial log of checkout invoicing and receipts</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={filteredTransactions.length === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#4A3F00] text-white text-xs font-bold uppercase tracking-wider transition-all hover:bg-[#6b5a00] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm border-none outline-none"
            title="Download records in CSV format"
          >
            Export to CSV
          </button>
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-2 text-right">
            <span className="block text-[10px] uppercase font-bold text-green-700">Total Bookings</span>
            <span className="text-lg font-extrabold text-green-800">
              ₹{state.transactions.reduce((sum, t) => sum + (t.isPaid ? t.total : 0), 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#FFFBEB] p-4 rounded-xl border border-[#FFF5CC]">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-[#8C7B00]" />
          <input
            type="text"
            placeholder="Search by Order ID, Name, or Payment ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#FFF5CC] rounded-lg text-sm text-[#4A3F00] placeholder-[#8C7B00] focus:border-[#FFDE59] focus:outline-none"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto justify-end">
          {(["all", "paid", "unpaid"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setPaymentFilter(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors border ${
                paymentFilter === tab
                  ? "bg-[#4A3F00] text-white border-[#4A3F00]"
                  : "bg-white text-[#8C7B00] border-[#FFF5CC] hover:bg-[#FFFBEB]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-hidden rounded-xl border border-[#FFF5CC] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-[#8C7B00]">
            <thead className="bg-[#FFFBEB] border-b border-[#FFF5CC] text-xs font-bold uppercase text-[#4A3F00] tracking-wider">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Payment Status</th>
                <th className="px-6 py-4">Payment ID</th>
                <th className="px-6 py-4 text-right">Grand Total</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FFF5CC]">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm font-medium text-[#8C7B00]">
                    No matching transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#FFFBEB]/40 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-[#4A3F00] truncate max-w-[120px]">
                      #{tx.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      {tx.createdAt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#4A3F00]">{tx.customerInfo.name}</div>
                      <div className="text-[10px] text-[#8C7B00]">{tx.customerInfo.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        tx.isPaid 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${tx.isPaid ? "bg-green-600" : "bg-red-600"}`} />
                        {tx.isPaid ? "Paid" : "Unpaid"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-[#4A3F00] whitespace-nowrap">
                      {tx.paymentId || <span className="text-gray-400 italic">N/A</span>}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-[#4A3F00] whitespace-nowrap">
                      ₹{tx.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => setSelectedTx(tx)}
                        className="rounded p-1 text-[#8C7B00] hover:bg-[#FFFBEB] hover:text-[#4A3F00] transition-colors"
                        title="View details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl border border-[#FFF5CC] bg-white p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setSelectedTx(null)}
              className="absolute right-4 top-4 rounded p-1 text-[#8C7B00] hover:bg-[#FFFBEB] hover:text-[#4A3F00]"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h3 className="text-lg font-bold text-[#4A3F00] mb-2 border-b border-[#FFF5CC] pb-2">
              Invoice #{selectedTx.id}
            </h3>
            
            <div className="space-y-4 mt-4 text-sm text-[#8C7B00]">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <strong>Customer:</strong> {selectedTx.customerInfo.name}
                </div>
                <div>
                  <strong>Date:</strong> {selectedTx.createdAt.toLocaleString()}
                </div>
                <div>
                  <strong>Email:</strong> {selectedTx.customerInfo.email}
                </div>
                <div>
                  <strong>Phone:</strong> {selectedTx.customerInfo.phone}
                </div>
                <div className="col-span-2">
                  <strong>Billing Address:</strong> {selectedTx.customerInfo.address}
                </div>
              </div>

              <div>
                <strong className="block text-xs uppercase tracking-wider text-[#4A3F00] mb-2">Purchased Items</strong>
                <div className="divide-y divide-[#FFF5CC] border border-[#FFF5CC] rounded-lg overflow-hidden">
                  {selectedTx.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center px-3 py-2.5 bg-[#FFFBEB]/30 hover:bg-[#FFFBEB]/60 transition-colors">
                      <div>
                        <div className="font-semibold text-[#4A3F00]">{item.title}</div>
                        <div className="text-xs text-[#8C7B00]">₹{item.price.toFixed(2)} × {item.quantity}</div>
                      </div>
                      <div className="font-bold text-[#4A3F00]">₹{(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-[#FFF5CC] pt-4 font-bold text-lg text-[#4A3F00]">
                <span>Total Amount:</span>
                <span>₹{selectedTx.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
