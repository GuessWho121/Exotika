"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../contexts/CartContext"
import { useAdmin } from "../contexts/AdminContext"
import { useNotifications } from "../contexts/NotificationContext"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../components/ui/card"

export function Checkout() {
  const { state, dispatch } = useCart()
  const { dispatch: adminDispatch } = useAdmin()
  const { addNotification } = useNotifications()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
  })

  const [fieldErrors, setFieldErrors] = useState<{[key: string]: boolean}>({})
  const [isProcessing, setIsProcessing] = useState(false)

  const validateForm = () => {
    const errors: {[key: string]: boolean} = {}
    let isValid = true

    if (!formData.name.trim()) {
      errors.name = true
      addNotification({
        type: "error",
        title: "Name Required",
        message: "Please enter your full name.",
        duration: 4000,
      })
      isValid = false
    } else if (formData.name.trim().length < 2) {
      errors.name = true
      addNotification({
        type: "error",
        title: "Invalid Name",
        message: "Name must be at least 2 characters long.",
        duration: 4000,
      })
      isValid = false
    }

    if (!formData.email) {
      errors.email = true
      addNotification({
        type: "error",
        title: "Email Required",
        message: "Please enter your email address.",
        duration: 4000,
      })
      isValid = false
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      errors.email = true
      addNotification({
        type: "error",
        title: "Invalid Email",
        message: "Please enter a valid email address.",
        duration: 4000,
      })
      isValid = false
    }

    if (!formData.phone) {
      errors.phone = true
      addNotification({
        type: "error",
        title: "Phone Required",
        message: "Please enter your phone number.",
        duration: 4000,
      })
      isValid = false
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/[\s\-()]/g, ''))) {
      errors.phone = true
      addNotification({
        type: "error",
        title: "Invalid Phone Number",
        message: "Please enter a valid 10-digit Indian mobile number.",
        duration: 4000,
      })
      isValid = false
    }

    if (!formData.address.trim()) {
      errors.address = true
      addNotification({
        type: "error",
        title: "Address Required",
        message: "Please enter your delivery address.",
        duration: 4000,
      })
      isValid = false
    } else if (formData.address.trim().length < 10) {
      errors.address = true
      addNotification({
        type: "error",
        title: "Address Too Short",
        message: "Please enter a complete address.",
        duration: 4000,
      })
      isValid = false
    }

    if (!formData.city.trim()) {
      errors.city = true
      addNotification({
        type: "error",
        title: "City Required",
        message: "Please enter your city.",
        duration: 4000,
      })
      isValid = false
    } else if (!/^[a-zA-Z\s]+$/.test(formData.city.trim())) {
      errors.city = true
      addNotification({
        type: "error",
        title: "Invalid City",
        message: "City name can only contain letters and spaces.",
        duration: 4000,
      })
      isValid = false
    }

    if (!formData.zipCode.trim()) {
      errors.zipCode = true
      addNotification({
        type: "error",
        title: "ZIP Code Required",
        message: "Please enter your ZIP code.",
        duration: 4000,
      })
      isValid = false
    } else if (!/^\d{6}$/.test(formData.zipCode.trim())) {
      errors.zipCode = true
      addNotification({
        type: "error",
        title: "Invalid ZIP Code",
        message: "Please enter a valid 6-digit Indian PIN code.",
        duration: 4000,
      })
      isValid = false
    }

    setFieldErrors(errors)
    return isValid
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: false }))
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

    dispatch({ type: "CLEAR_CART" })

    addNotification({
      type: "success",
      title: "Order Placed Successfully!",
      message: "Thank you for your purchase. You'll receive a confirmation email shortly.",
      duration: 5000,
    })

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
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Customer Information */}
            <Card className="border-[#FFF5CC]">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-[#4A3F00]">Customer Information</CardTitle>
                <CardDescription className="text-[#8C7B00]">Provide your basic identity and contact details.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-[#4A3F00]">Full Name</label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={fieldErrors.name ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-[#FFF5CC] bg-[#FFFBEB] text-[#4A3F00] focus:ring-[#FFDE59]'}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-[#4A3F00]">Email</label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={fieldErrors.email ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-[#FFF5CC] bg-[#FFFBEB] text-[#4A3F00] focus:ring-[#FFDE59]'}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block mb-1.5 text-sm font-medium text-[#4A3F00]">Phone</label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={fieldErrors.phone ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-[#FFF5CC] bg-[#FFFBEB] text-[#4A3F00] focus:ring-[#FFDE59]'}
                    placeholder="Enter your 10-digit mobile number"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="border-[#FFF5CC]">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-[#4A3F00]">Shipping Address</CardTitle>
                <CardDescription className="text-[#8C7B00]">Where would you like us to deliver your order?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-[#4A3F00]">Address</label>
                  <Textarea
                    name="address"
                    rows={3}
                    value={formData.address}
                    onChange={handleInputChange}
                    className={fieldErrors.address ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-[#FFF5CC] bg-[#FFFBEB] text-[#4A3F00] focus:ring-[#FFDE59]'}
                    placeholder="Enter your complete address"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-[#4A3F00]">City</label>
                    <Input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={fieldErrors.city ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-[#FFF5CC] bg-[#FFFBEB] text-[#4A3F00] focus:ring-[#FFDE59]'}
                      placeholder="Enter your city"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-[#4A3F00]">ZIP Code</label>
                    <Input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className={fieldErrors.zipCode ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-[#FFF5CC] bg-[#FFFBEB] text-[#4A3F00] focus:ring-[#FFDE59]'}
                      placeholder="Enter ZIP code"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              disabled={isProcessing}
              className="w-full h-12 text-md font-semibold"
            >
              {isProcessing ? "Processing..." : `Pay ₹${state.total.toFixed(2)}`}
            </Button>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="border-[#FFF5CC]">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-[#4A3F00]">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
