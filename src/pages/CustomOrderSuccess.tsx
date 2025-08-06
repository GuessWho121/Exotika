"use client"

import { useNavigate } from "react-router-dom"
import { CheckCircle } from "lucide-react"

export function CustomOrderSuccess() {
  const navigate = useNavigate()

  return (
    <div className="flex w-full max-w-7xl flex-1 flex-col items-center justify-center py-12">
      <div className="text-center">
        <CheckCircle className="mx-auto mb-6 h-16 w-16 text-green-600" />
        <h1 className="mb-4 text-3xl font-bold text-[#4A3F00]">Custom Order Submitted!</h1>
        <p className="mb-8 text-[#8C7B00]">
          Thank you for your custom order request. We'll review your requirements and get back to you within 24 hours
          with a detailed quote and timeline.
        </p>
        <div className="space-x-4">
          <button
            onClick={() => navigate("/")}
            className="rounded-lg bg-[#FFDE59] px-6 py-3 font-semibold text-[#4A3F00] transition-opacity hover:opacity-90"
          >
            Back to Home
          </button>
          <button
            onClick={() => navigate("/custom-order")}
            className="rounded-lg border border-[#FFDE59] px-6 py-3 font-semibold text-[#4A3F00] transition-colors hover:bg-[#FFFBEB]"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    </div>
  )
}
