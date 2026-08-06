"use client"

import { useState } from "react" // Import useEffect
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock, X } from 'lucide-react'
import { useNotifications } from "../contexts/NotificationContext"
import { useAdmin } from "../contexts/AdminContext" // Import useAdmin
import { GoogleLogin } from "@react-oauth/google"
import { Logo } from "../components/Logo"

export function Login() {
const navigate = useNavigate()
const { addNotification } = useNotifications()
const { fetchSession } = useAdmin() // Get admin dispatch & session
const googleClientId = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID || ""
const [showPassword, setShowPassword] = useState(false)
const [isLoading, setIsLoading] = useState(false)
const [formData, setFormData] = useState({
  email: "",
  password: "",
  rememberMe: false,
})
const [fieldErrors, setFieldErrors] = useState<{[key: string]: boolean}>({})


// Do not clear session automatically on mount, let backend checks resolve status

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

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: formData.email, password: formData.password })
    })

    const json = await res.json()

    if (res.ok) {
      addNotification({
        type: "success",
        title: "Login Successful!",
        message: `Welcome back.`,
        duration: 3000,
      })
      await fetchSession()
      navigate("/")
    } else {
      addNotification({
        type: "error",
        title: "Login Failed",
        message: json.message || "Invalid email or password.",
        duration: 5000,
      })
    }
  } catch (err) {
    console.error("Login API request error:", err)
    addNotification({
      type: "error",
      title: "Login Error",
      message: "Failed to connect to the backend server.",
      duration: 5000,
    })
  }

  setIsLoading(false)
}

const handleRealGoogleSignIn = async (credential: string) => {
  setIsLoading(true)
  try {
    const res = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: credential })
    })

    const json = await res.json()

    if (res.ok) {
      addNotification({
        type: "success",
        title: "Google Sign-In Successful!",
        message: `Welcome to Exotika Creation!`,
        duration: 3000,
      })
      await fetchSession()
      navigate("/")
    } else {
      addNotification({
        type: "error",
        title: "Google Sign-In Failed",
        message: json.message || "Failed to authenticate.",
        duration: 5000,
      })
    }
  } catch (err) {
    console.error(err)
    addNotification({
      type: "error",
      title: "Connection Error",
      message: "Failed to connect to authentication server.",
      duration: 5000,
    })
  } finally {
    setIsLoading(false)
  }
}





  return (
    <div className="mx-auto w-full max-w-md py-4 md:h-[calc(100vh-200px)] md:overflow-hidden flex flex-col justify-center space-y-8">
      {/* Header */}
      <div className="text-center">
        <Logo size={64} className="mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-[#4A3F00]">Welcome Back</h2>
        <p className="mt-2 text-[#8C7B00]">Sign in to your account to continue</p>
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

        {/* Actions Row */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 rounded-lg bg-[#FFDE59] px-4 py-3 font-semibold text-[#4A3F00] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
          <Link
            to="/signup"
            className="flex-1 flex items-center justify-center rounded-lg border border-[#E6C747] bg-white px-4 py-3 font-semibold text-[#4A3F00] transition-colors hover:bg-[#FFFBEB] no-underline"
          >
            Sign Up
          </Link>
        </div>

        {/* Google Sign In Button */}
        {googleClientId && (
          <>
            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#FFF5CC]"></div>
              </div>
              <span className="relative bg-[#FFFBEB] px-3 text-xs text-[#8C7B00] uppercase font-semibold">Or</span>
            </div>

            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  if (credentialResponse.credential) {
                    handleRealGoogleSignIn(credentialResponse.credential)
                  }
                }}
                onError={() => {
                  addNotification({
                    type: "error",
                    title: "Google Auth Error",
                    message: "Google Sign-In failed to load or authenticate.",
                    duration: 5000
                  })
                }}
                theme="outline"
                size="large"
                shape="rectangular"
                width="100%"
              />
            </div>
          </>
        )}
      </form>
  </div>
)
}
