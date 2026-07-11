"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock, User, Phone, X } from 'lucide-react'
import { useNotifications } from "../contexts/NotificationContext"
import { GoogleLogin } from "@react-oauth/google"
import { Logo } from "../components/Logo"

export function Signup() {
  const navigate = useNavigate()
  const { addNotification } = useNotifications()
  const googleClientId = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID || ""
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
  
  // Google sign in simulation states
  const [showGooglePopup, setShowGooglePopup] = useState(false)
  const [googleEmail, setGoogleEmail] = useState("")
  const [googleName, setGoogleName] = useState("")
  
  // OTP states (removed for signup, done during checkout instead)

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

    // Phone validation (Optional at registration)
    if (formData.phone && !/^\+?[0-9\s\-()]{7,20}$/.test(formData.phone)) {
      errors.phone = true
      addNotification({
        type: "error",
        title: "Invalid Phone Number",
        message: "Please enter a valid phone number (7 to 20 digits, e.g. +1 555 12345).",
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
      // Perform direct registration
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined
        })
      })

      const regJson = await regRes.json()

      if (regRes.ok) {
        addNotification({
          type: "success",
          title: "Account Created!",
          message: "Welcome to Exotika! Please sign in with your credentials.",
          duration: 4000,
        })
        navigate("/login")
      } else {
        addNotification({
          type: "error",
          title: "Signup Failed",
          message: regJson.message || "Failed to create account.",
          duration: 5000,
        })
      }
    } catch (err) {
      console.error(err)
      addNotification({
        type: "error",
        title: "Connection Error",
        message: "Failed to connect to the server.",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
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
        window.location.href = "/"
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
        // Force reload session in the browser to update UI Context
        window.location.href = "/"
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
    <div className="mx-auto w-full max-w-md py-12 space-y-8">
        {/* Header */}
        <div className="text-center">
          <Logo size={64} className="mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-[#4A3F00]">Create Account</h2>
          <p className="mt-2 text-[#8C7B00]">Join our community of art lovers</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
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
              className="w-full flex items-center justify-center gap-3 rounded-lg border border-[#E6C747] bg-white px-4 py-3 font-semibold text-[#4A3F00] transition-colors hover:bg-[#FFFBEB]"
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

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E6C747]"></div>
            </div>
            <span className="relative bg-[#FFFBEB] px-3 text-xs text-[#8C7B00] uppercase font-semibold">Or</span>
          </div>

          <div className="rounded-lg border border-[#E6C747] bg-white p-6 shadow-sm">
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
                    placeholder="Enter phone number"
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
            {isLoading ? "Please wait..." : "Create Account"}
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
                Sign up with Google
              </h3>
              <button onClick={() => setShowGooglePopup(false)} className="text-[#8C7B00] hover:text-[#4A3F00]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-3 text-sm text-[#8C7B00]">
              Simulating Google OAuth account registration. Select a dummy account or type custom Gmail:
            </p>

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
                Register
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP verification has been removed from signup step */}
    </div>
  )
}
