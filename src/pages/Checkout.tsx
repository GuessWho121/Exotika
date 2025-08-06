"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../contexts/CartContext"
import { useAdmin } from "../contexts/AdminContext"

export function Checkout() {
  const { state, dispatch } = useCart()
  const { dispatch: adminDispatch } = useAdmin()
  const navigate = useNavigate()

  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
  })

  const [isProcessing, setIsProcessing] = useState(false)

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required"
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = "Phone number is required"
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-$$$$]/g, ''))) {
      newErrors.phone = "Please enter a valid phone number"
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = "Address is required"
    }

    // City validation
    if (!formData.city.trim()) {
      newErrors.city = "City is required"
    }

    // ZIP code validation
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "ZIP code is required"
    } else if (!/^\d{5,6}$/.test(formData.zipCode.trim())) {
      newErrors.zipCode = "Please enter a valid ZIP code (5-6 digits)"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Create transaction
    adminDispatch({
      type: "ADD_TRANSACTION",
      payload: {
        items: state.items.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
        })),
        total: state.total,
        customerInfo: {
          name: formData.name,
          email: formData.email,
          address: `${formData.address}, ${formData.city}, ${formData.zipCode}`,
          phone: formData.phone,
        },
        status: "pending",
      },
    })

    // Clear cart
    dispatch({ type: "CLEAR_CART" })

    // Navigate to success page
    navigate("/order-success")
  }

  if (state.items.length === 0) {
    navigate("/cart")
    return null
  }

  return (
    <div className="flex w-full max-w-7xl flex-1 flex-col">
      <h1 className="mb-8 text-3xl font-bold text-[#4A3F00]">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Checkout Form */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <div className="rounded-lg border border-[#FFF5CC] bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-[#4A3F00]">Customer Information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[#4A3F00]">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-lg border ${errors.name ? 'border-red-500' : 'border-[#FFF5CC]'} bg-[#FFFBEB] px-3 py-2 text-[#4A3F00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A3F00]">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-lg border ${errors.email ? 'border-red-500' : 'border-[#FFF5CC]'} bg-[#FFFBEB] px-3 py-2 text-[#4A3F00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-[#4A3F00]">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-lg border ${errors.phone ? 'border-red-500' : 'border-[#FFF5CC]'} bg-[#FFFBEB] px-3 py-2 text-[#4A3F00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]`}
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="rounded-lg border border-[#FFF5CC] bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-[#4A3F00]">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#4A3F00]">Address</label>
                  <textarea
                    name="address"
                    required
                    rows={3}
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-lg border ${errors.address ? 'border-red-500' : 'border-[#FFF5CC]'} bg-[#FFFBEB] px-3 py-2 text-[#4A3F00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]`}
                  />
                  {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-[#4A3F00]">City</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-lg border ${errors.city ? 'border-red-500' : 'border-[#FFF5CC]'} bg-[#FFFBEB] px-3 py-2 text-[#4A3F00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]`}
                    />
                    {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A3F00]">ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      required
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-lg border ${errors.zipCode ? 'border-red-500' : 'border-[#FFF5CC]'} bg-[#FFFBEB] px-3 py-2 text-[#4A3F00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]`}
                    />
                    {errors.zipCode && <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full rounded-lg bg-[#FFDE59] px-4 py-3 font-semibold text-[#4A3F00] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : `Pay ₹${state.total.toFixed(2)}`}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <div className="rounded-lg border border-[#FFF5CC] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-[#4A3F00]">Order Summary</h2>
            <div className="space-y-4">
              {state.items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-[#4A3F00]">{item.title}</h3>
                    <p className="text-sm text-[#8C7B00]">Qty: {item.quantity}</p>
                    <p className="text-sm font-medium text-[#4A3F00]">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-[#FFF5CC] pt-4">
              <div className="flex justify-between text-lg font-semibold text-[#4A3F00]">
                <span>Total</span>
                <span>₹{state.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
