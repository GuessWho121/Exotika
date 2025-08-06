"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react'
import { useNotifications } from "../contexts/NotificationContext"

export function Signup() {
  const navigate = useNavigate()
  const { addNotification } = useNotifications()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    subscribeNewsletter: true,
  })
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: boolean}>({})


  const validateForm = () => {
    const errors: {[key: string]: boolean} = {}
    let isValid = true

    // Name validation
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
        title: "Name Too Short",
        message: "Name must be at least 2 characters long.",
        duration: 4000,
      })
      isValid = false
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      errors.name = true
      addNotification({
        type: "error",
        title: "Invalid Name",
        message: "Name can only contain letters and spaces.",
        duration: 4000,
      })
      isValid = false
    }

    // Email validation
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

    // Phone validation (exactly 10 digits)
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

    // Password validation
    if (!formData.password) {
      errors.password = true
      addNotification({
        type: "error",
        title: "Password Required",
        message: "Please create a password.",
        duration: 4000,
      })
      isValid = false
    } else if (formData.password.length < 8) {
      errors.password = true
      addNotification({
        type: "error",
        title: "Password Too Short",
        message: "Password must be at least 8 characters long.",
        duration: 4000,
      })
      isValid = false
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = true
      addNotification({
        type: "error",
        title: "Weak Password",
        message: "Password must contain uppercase, lowercase, and number.",
        duration: 5000,
      })
      isValid = false
    } else if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(formData.password)) {
      addNotification({
        type: "warning",
        title: "Password Recommendation",
        message: "Consider adding special characters for stronger security.",
        duration: 4000,
      })
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = true
      addNotification({
        type: "error",
        title: "Confirm Password",
        message: "Please confirm your password.",
        duration: 4000,
      })
      isValid = false
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = true
      addNotification({
        type: "error",
        title: "Passwords Don't Match",
        message: "Password and confirmation must match.",
        duration: 4000,
      })
      isValid = false
    }

    // Terms validation
    if (!formData.agreeToTerms) {
      errors.agreeToTerms = true
      addNotification({
        type: "error",
        title: "Terms Required",
        message: "You must agree to the terms and conditions.",
        duration: 4000,
      })
      isValid = false
    }

    setFieldErrors(errors)
    return isValid
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: false }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    // Simulate signup process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    addNotification({
      type: "success",
      title: "Account Created!",
      message: "Welcome to Exotika Creation! Please sign in.",
      duration: 4000,
    })

    navigate("/login")
    setIsLoading(false)
  }

  return (
    <div className="flex w-full max-w-7xl flex-1 items-center justify-center py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFDE59]">
            <svg className="h-10 w-10" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="95" fill="#F4D03F" stroke="#8B4513" strokeWidth="3"/>
              <circle cx="100" cy="100" r="85" fill="none" stroke="#8B4513" strokeWidth="2"/>
              <text x="100" y="90" fontSize="18" fontWeight="bold" fill="#8B4513" textAnchor="middle" fontFamily="serif">
                EXOTIKA
              </text>
              <text x="100" y="110" fontSize="18" fontWeight="bold" fill="#8B4513" textAnchor="middle" fontFamily="serif">
                CREATION
              </text>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-[#4A3F00]">Create Account</h2>
          <p className="mt-2 text-[#8C7B00]">Join our community of art lovers</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="rounded-lg border border-[#FFF5CC] bg-white p-6 shadow-sm">
            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-[#4A3F00]">Full Name</label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8C7B00]" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`block w-full rounded-lg border ${fieldErrors.name ? 'border-red-500 bg-red-50' : 'border-[#FFF5CC]'} bg-[#FFFBEB] pl-10 pr-3 py-2 text-[#4A3F00] placeholder-[#8C7B00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]`}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-[#4A3F00]">Email Address</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8C7B00]" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`block w-full rounded-lg border ${fieldErrors.email ? 'border-red-500 bg-red-50' : 'border-[#FFF5CC]'} bg-[#FFFBEB] pl-10 pr-3 py-2 text-[#4A3F00] placeholder-[#8C7B00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]`}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-medium text-[#4A3F00]">Phone Number</label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8C7B00]" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`block w-full rounded-lg border ${fieldErrors.phone ? 'border-red-500 bg-red-50' : 'border-[#FFF5CC]'} bg-[#FFFBEB] pl-10 pr-3 py-2 text-[#4A3F00] placeholder-[#8C7B00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]`}
                    placeholder="Enter your 10-digit mobile number"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-[#4A3F00]">Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8C7B00]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    minLength={8}
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`block w-full rounded-lg border ${fieldErrors.password ? 'border-red-500 bg-red-50' : 'border-[#FFF5CC]'} bg-[#FFFBEB] pl-10 pr-10 py-2 text-[#4A3F00] placeholder-[#8C7B00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]`}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7B00] hover:text-[#4A3F00]"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-[#4A3F00]">Confirm Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8C7B00]" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`block w-full rounded-lg border ${fieldErrors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-[#FFF5CC]'} bg-[#FFFBEB] pl-10 pr-10 py-2 text-[#4A3F00] placeholder-[#8C7B00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7B00] hover:text-[#4A3F00]"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Terms and Newsletter */}
              <div className="space-y-3">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className={`mt-1 h-4 w-4 rounded border ${fieldErrors.agreeToTerms ? 'border-red-500' : 'border-[#FFF5CC]'} text-[#FFDE59] focus:ring-[#FFDE59]`}
                  />
                  <label className="ml-2 text-sm text-[#8C7B00]">
                    I agree to the{" "}
                    <Link to="/terms" className="font-medium text-[#4A3F00] hover:text-[#FFDE59] no-underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="font-medium text-[#4A3F00] hover:text-[#FFDE59] no-underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="subscribeNewsletter"
                    checked={formData.subscribeNewsletter}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-[#FFF5CC] text-[#FFDE59] focus:ring-[#FFDE59]"
                  />
                  <label className="ml-2 text-sm text-[#8C7B00]">
                    Subscribe to our newsletter for updates and special offers
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-[#FFDE59] px-4 py-3 font-semibold text-[#4A3F00] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-[#8C7B00]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-[#4A3F00] hover:text-[#FFDE59] no-underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
