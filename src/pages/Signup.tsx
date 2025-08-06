"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react'

export function Signup() {
  const navigate = useNavigate()
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!")
      setIsLoading(false)
      return
    }

    if (!formData.agreeToTerms) {
      alert("Please agree to the terms and conditions")
      setIsLoading(false)
      return
    }

    // Simulate signup process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // For demo purposes, any valid form submission works
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
        <form onSubmit={handleSubmit} className="space-y-6">
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
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-[#FFF5CC] bg-[#FFFBEB] pl-10 pr-3 py-2 text-[#4A3F00] placeholder-[#8C7B00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]"
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
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-[#FFF5CC] bg-[#FFFBEB] pl-10 pr-3 py-2 text-[#4A3F00] placeholder-[#8C7B00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]"
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
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-[#FFF5CC] bg-[#FFFBEB] pl-10 pr-3 py-2 text-[#4A3F00] placeholder-[#8C7B00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]"
                    placeholder="Enter your phone number"
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
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-[#FFF5CC] bg-[#FFFBEB] pl-10 pr-10 py-2 text-[#4A3F00] placeholder-[#8C7B00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]"
                    placeholder="Create a password"
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
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-[#FFF5CC] bg-[#FFFBEB] pl-10 pr-10 py-2 text-[#4A3F00] placeholder-[#8C7B00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]"
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
                    required
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 rounded border-[#FFF5CC] text-[#FFDE59] focus:ring-[#FFDE59]"
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
