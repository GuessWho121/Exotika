"use client"

import { useState, useEffect } from "react" // Import useEffect
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useNotifications } from "../contexts/NotificationContext"
import { useAdmin } from "../contexts/AdminContext" // Import useAdmin

export function Login() {
const navigate = useNavigate()
const { addNotification } = useNotifications()
const { dispatch: adminDispatch } = useAdmin() // Get admin dispatch
const [showPassword, setShowPassword] = useState(false)
const [isLoading, setIsLoading] = useState(false)
const [formData, setFormData] = useState({
  email: "",
  password: "",
  rememberMe: false,
})
const [fieldErrors, setFieldErrors] = useState<{[key: string]: boolean}>({})

// Reset admin status on component mount
useEffect(() => {
  adminDispatch({ type: "SET_ADMIN_STATUS", payload: false })
}, [adminDispatch])

const validateForm = () => {
  const errors: {[key: string]: boolean} = {}
  let isValid = true

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

  // Password validation
  if (!formData.password) {
    errors.password = true
    addNotification({
      type: "error",
      title: "Password Required",
      message: "Please enter your password.",
      duration: 4000,
    })
    isValid = false
  } else if (formData.password.length < 6) {
    errors.password = true
    addNotification({
      type: "error",
      title: "Password Too Short",
      message: "Password must be at least 6 characters long.",
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

  // Simulate login process
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Demo login credentials
  const validCredentials = [
    { email: "demo@exotika.com", password: "demo123", role: "customer" },
    { email: "admin@exotika.com", password: "admin123", role: "admin" },
    { email: "sarah@exotika.com", password: "artist123", role: "artist" }
  ]

  const matchedUser = validCredentials.find(
    cred => cred.email === formData.email && cred.password === formData.password
  )

  if (matchedUser) {
    addNotification({
      type: "success",
      title: "Login Successful!",
      message: `Welcome back, ${matchedUser.email.split('@')[0]}.`,
      duration: 3000,
    })
    // Set admin status based on login
    adminDispatch({ type: "SET_ADMIN_STATUS", payload: matchedUser.role === "admin" })
    navigate("/")
  } else {
    addNotification({
      type: "error",
      title: "Login Failed",
      message: "Invalid credentials. Try demo@exotika.com / demo123",
      duration: 5000,
    })
    adminDispatch({ type: "SET_ADMIN_STATUS", payload: false }) // Ensure admin status is false on failed login
  }

  setIsLoading(false)
}

const fillDemoCredentials = () => {
  setFormData({
    ...formData,
    email: "demo@exotika.com",
    password: "demo123"
  })
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
        <h2 className="text-3xl font-bold text-[#4A3F00]">Welcome Back</h2>
        <p className="mt-2 text-[#8C7B00]">Sign in to your account to continue</p>
      </div>

      {/* Demo Notice */}
      <div className="rounded-lg border border-[#FFDE59] bg-[#FFFBEB] p-4">
        <h3 className="text-sm font-semibold text-[#4A3F00] mb-2">Demo Login Credentials:</h3>
        <div className="space-y-1 text-sm text-[#8C7B00]">
          <div><strong>Email:</strong> demo@exotika.com</div>
          <div><strong>Password:</strong> demo123</div>
        </div>
        <button
          type="button"
          onClick={fillDemoCredentials}
          className="mt-3 w-full rounded-md bg-[#FFDE59] px-3 py-2 text-sm font-medium text-[#4A3F00] transition-opacity hover:opacity-90"
        >
          Use Demo Credentials
        </button>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="rounded-lg border border-[#FFF5CC] bg-white p-6 shadow-sm">
          <div className="space-y-4">
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

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-[#4A3F00]">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8C7B00]" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`block w-full rounded-lg border ${fieldErrors.password ? 'border-red-500 bg-red-50' : 'border-[#FFF5CC]'} bg-[#FFFBEB] pl-10 pr-10 py-2 text-[#4A3F00] placeholder-[#8C7B00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]`}
                  placeholder="Enter your password"
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-[#FFF5CC] text-[#FFDE59] focus:ring-[#FFDE59]"
                />
                <label className="ml-2 text-sm text-[#8C7B00]">Remember me</label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-[#4A3F00] hover:text-[#FFDE59] no-underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-[#FFDE59] px-4 py-3 font-semibold text-[#4A3F00] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-sm text-[#8C7B00]">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-[#4A3F00] hover:text-[#FFDE59] no-underline"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </form>

      {/* Additional Demo Info */}
      <div className="rounded-lg border border-[#FFF5CC] bg-[#FFFBEB] p-4 text-center">
        <p className="text-sm text-[#8C7B00]">
          <strong>Other Demo Accounts:</strong><br />
          admin@exotika.com / admin123<br />
          sarah@exotika.com / artist123
        </p>
      </div>
    </div>
  </div>
)
}
