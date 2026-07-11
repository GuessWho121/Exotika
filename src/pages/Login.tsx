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
const [showGooglePopup, setShowGooglePopup] = useState(false)
const [googleEmail, setGoogleEmail] = useState("")
const [googleName, setGoogleName] = useState("")

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

const handleGoogleSignIn = async (email: string, name: string) => {
  setIsLoading(true)
  try {
    const res = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name })
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
      setShowGooglePopup(false)
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

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#FFF5CC]"></div>
          </div>
          <span className="relative bg-[#FFFBEB] px-3 text-xs text-[#8C7B00] uppercase font-semibold">Or</span>
        </div>

        {/* Google Sign In Button */}
        {googleClientId ? (
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
        ) : (
          <button
            type="button"
            onClick={() => {
              setGoogleEmail("")
              setGoogleName("")
              setShowGooglePopup(true)
            }}
            className="w-full flex items-center justify-center gap-3 rounded-lg border border-[#FFF5CC] bg-white px-4 py-3 font-semibold text-[#4A3F00] transition-colors hover:bg-[#FFFBEB]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>
        )}
      </form>

    {/* Mock Google Login Popup Modal */}
    {showGooglePopup && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowGooglePopup(false)}>
        <div className="w-full max-w-md rounded-lg border border-[#FFF5CC] bg-white p-6 shadow-2xl animate-in slide-in-from-right duration-200" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between border-b border-[#FFF5CC] pb-3">
            <h3 className="text-lg font-bold text-[#4A3F00] flex items-center gap-2">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              Sign in with Google
            </h3>
            <button onClick={() => setShowGooglePopup(false)} className="text-[#8C7B00] hover:text-[#4A3F00]">
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-3 text-sm text-[#8C7B00]">
            Simulating standard Google OAuth authorization. Select a dummy account or sign in with custom Gmail:
          </p>

          {/* Quick Selectors */}
          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={() => handleGoogleSignIn("john.doe@gmail.com", "John Doe")}
              className="w-full flex items-center justify-between rounded-lg border border-[#FFF5CC] bg-[#FFFBEB] px-3 py-2 text-sm font-medium text-[#4A3F00] hover:bg-[#FFF5CC] transition-colors"
            >
              <span>John Doe</span>
              <span className="text-xs text-[#8C7B00]">john.doe@gmail.com</span>
            </button>
            <button
              type="button"
              onClick={() => handleGoogleSignIn("sarah.art@gmail.com", "Sarah Art")}
              className="w-full flex items-center justify-between rounded-lg border border-[#FFF5CC] bg-[#FFFBEB] px-3 py-2 text-sm font-medium text-[#4A3F00] hover:bg-[#FFF5CC] transition-colors"
            >
              <span>Sarah Art</span>
              <span className="text-xs text-[#8C7B00]">sarah.art@gmail.com</span>
            </button>
          </div>

          <div className="relative my-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#FFF5CC]"></div>
            </div>
            <span className="relative bg-white px-2 text-xs text-[#8C7B00] uppercase font-semibold">Or enter custom</span>
          </div>

          {/* Custom Input */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-[#4A3F00]">Email Address</label>
              <input
                type="email"
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                placeholder="username@gmail.com"
                className="mt-1 block w-full rounded-lg border border-[#FFF5CC] bg-[#FFFBEB] px-3 py-2 text-[#4A3F00] placeholder-[#8C7B00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A3F00]">Full Name</label>
              <input
                type="text"
                value={googleName}
                onChange={(e) => setGoogleName(e.target.value)}
                placeholder="Your Name"
                className="mt-1 block w-full rounded-lg border border-[#FFF5CC] bg-[#FFFBEB] px-3 py-2 text-[#4A3F00] placeholder-[#8C7B00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-[#FFF5CC] pt-3">
            <button
              type="button"
              onClick={() => setShowGooglePopup(false)}
              className="rounded-lg border border-[#FFF5CC] px-4 py-2 text-sm font-medium text-[#4A3F00] hover:bg-[#FFFBEB] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isLoading || (!googleEmail.endsWith("@gmail.com") && !googleEmail.endsWith("@googlemail.com"))}
              onClick={() => handleGoogleSignIn(googleEmail.trim(), googleName.trim() || "Google User")}
              className="rounded-lg bg-[#FFDE59] px-4 py-2 text-sm font-medium text-[#4A3F00] hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
)
}
