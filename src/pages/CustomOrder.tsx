"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Upload, X, ImageIcon } from 'lucide-react'
import { useAdmin } from "../contexts/AdminContext"
import { useNotifications } from "../contexts/NotificationContext"

export function CustomOrder() {
  const { dispatch } = useAdmin()
  const { addNotification } = useNotifications()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    type: "painting" as "painting" | "craft",
    description: "",
    size: "",
    budget: "",
    name: "",
    email: "",
    phone: "",
  })

  const [referenceImages, setReferenceImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: boolean}>({})


  const validateForm = () => {
    const errors: {[key: string]: boolean} = {}
    let isValid = true

    // Description validation
    if (!formData.description.trim()) {
      errors.description = true
      addNotification({
        type: "error",
        title: "Description Required",
        message: "Please describe your custom order requirements.",
        duration: 4000,
      })
      isValid = false
    } else if (formData.description.trim().length < 20) {
      errors.description = true
      addNotification({
        type: "error",
        title: "Description Too Short",
        message: "Please provide at least 20 characters describing your vision.",
        duration: 4000,
      })
      isValid = false
    } else if (formData.description.trim().length > 1000) {
      errors.description = true
      addNotification({
        type: "error",
        title: "Description Too Long",
        message: "Please keep description under 1000 characters.",
        duration: 4000,
      })
      isValid = false
    }

    // Budget validation
    if (!formData.budget) {
      errors.budget = true
      addNotification({
        type: "error",
        title: "Budget Required",
        message: "Please specify your budget for this project.",
        duration: 4000,
      })
      isValid = false
    } else if (Number.parseFloat(formData.budget) < 4000) {
      errors.budget = true
      addNotification({
        type: "error",
        title: "Budget Too Low",
        message: "Minimum budget for custom orders is ₹4,000.",
        duration: 4000,
      })
      isValid = false
    } else if (Number.parseFloat(formData.budget) > 500000) {
      errors.budget = true
      addNotification({
        type: "error",
        title: "Budget Too High",
        message: "Please contact us directly for projects over ₹5,00,000.",
        duration: 4000,
      })
      isValid = false
    }

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
        title: "Invalid Name",
        message: "Name must be at least 2 characters long.",
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

    // Size validation (optional but if provided, should be valid)
    if (formData.size && formData.size.trim().length < 3) {
      errors.size = true
      addNotification({
        type: "error",
        title: "Invalid Size",
        message: "Please provide a more detailed size specification.",
        duration: 4000,
      })
      isValid = false
    }

    setFieldErrors(errors)
    return isValid
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: false }))
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        addNotification({
          type: "error",
          title: "Invalid File Type",
          message: `${file.name} is not a valid image file.`,
          duration: 4000,
        })
        return false
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        addNotification({
          type: "error",
          title: "File Too Large",
          message: `${file.name} is too large. Maximum size is 10MB.`,
          duration: 4000,
        })
        return false
      }
      return true
    })

    // Limit to 5 images total
    const remainingSlots = 5 - referenceImages.length
    if (validFiles.length > remainingSlots) {
      addNotification({
        type: "warning",
        title: "Too Many Images",
        message: `You can only upload ${remainingSlots} more image(s). Maximum is 5 total.`,
        duration: 4000,
      })
    }

    const filesToAdd = validFiles.slice(0, remainingSlots)
    setReferenceImages(prev => [...prev, ...filesToAdd])

    // Create previews
    filesToAdd.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreviews(prev => [...prev, result])
      }
      reader.readAsDataURL(file)
    })

    if (filesToAdd.length > 0) {
      addNotification({
        type: "success",
        title: "Images Uploaded",
        message: `${filesToAdd.length} reference image(s) added successfully.`,
        duration: 3000,
      })
    }
  }

  const removeImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
    
    addNotification({
      type: "info",
      title: "Image Removed",
      message: "Reference image has been removed.",
      duration: 2000,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))

    dispatch({
      type: "ADD_CUSTOM_ORDER",
      payload: {
        type: formData.type,
        description: formData.description,
        size: formData.size,
        budget: Number.parseFloat(formData.budget),
        customerInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        },
        status: "pending",
        referenceImages: imagePreviews, // Store the base64 images
      },
    })

    addNotification({
      type: "success",
      title: "Custom Order Submitted!",
      message: "We'll review your request and get back to you within 24 hours.",
      duration: 5000,
    })

    navigate("/custom-order-success")
  }

  return (
    <div className="flex w-full max-w-4xl flex-1 flex-col">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold text-[#4A3F00]">Custom Order Request</h1>
        <p className="text-[#8C7B00]">
          Have something specific in mind? Let us create a custom piece just for you. Fill out the form below and we'll
          get back to you within 24 hours.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Project Details */}
        <div className="rounded-lg border border-[#FFF5CC] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-[#4A3F00]">Project Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#4A3F00]">Type of Work</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-lg border border-[#FFF5CC] bg-[#FFFBEB] px-3 py-2 text-[#4A3F00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]"
              >
                <option value="painting">Custom Painting</option>
                <option value="craft">Custom Craft</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4A3F00]">Description</label>
              <textarea
                name="description"
                rows={4}
                placeholder="Please describe your vision in detail. Include colors, style, subject matter, and any specific requirements..."
                value={formData.description}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-lg border ${fieldErrors.description ? 'border-red-500 bg-red-50' : 'border-[#FFF5CC]'} bg-[#FFFBEB] px-3 py-2 text-[#4A3F00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]`}
              />
              <p className="mt-1 text-xs text-[#8C7B00]">
                {formData.description.length}/1000 characters
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[#4A3F00]">
                  Size {formData.type === "painting" ? "(e.g., 16x20 inches)" : "(e.g., Small, Medium, Large)"}
                </label>
                <input
                  type="text"
                  name="size"
                  placeholder={formData.type === "painting" ? "16x20 inches" : "Medium"}
                  value={formData.size}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-lg border ${fieldErrors.size ? 'border-red-500 bg-red-50' : 'border-[#FFF5CC]'} bg-[#FFFBEB] px-3 py-2 text-[#4A3F00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A3F00]">Budget (₹)</label>
                <input
                  type="number"
                  name="budget"
                  min="4000"
                  max="500000"
                  placeholder="16000"
                  value={formData.budget}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-lg border ${fieldErrors.budget ? 'border-red-500 bg-red-50' : 'border-[#FFF5CC]'} bg-[#FFFBEB] px-3 py-2 text-[#4A3F00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]`}
                />
                <p className="mt-1 text-xs text-[#8C7B00]">
                  Minimum: ₹4,000 | Maximum: ₹5,00,000
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reference Images */}
        <div className="rounded-lg border border-[#FFF5CC] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-[#4A3F00]">Reference Images</h2>
          <p className="mb-4 text-sm text-[#8C7B00]">
            Upload any images that can help us understand your vision better. This could include inspiration photos, 
            color palettes, existing artworks, or sketches. (Maximum 5 images, 10MB each)
          </p>
          
          <div className="space-y-4">
            {/* Upload Area */}
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="reference-images"
                disabled={referenceImages.length >= 5}
              />
              <label
                htmlFor="reference-images"
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                  referenceImages.length >= 5
                    ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                    : "border-[#FFDE59] bg-[#FFFBEB] hover:bg-[#FFF5CC]"
                }`}
              >
                <Upload className="mb-2 h-8 w-8 text-[#8C7B00]" />
                <span className="text-sm font-medium text-[#4A3F00]">
                  {referenceImages.length >= 5 ? "Maximum images reached" : "Click to upload reference images"}
                </span>
                <span className="text-xs text-[#8C7B00]">
                  PNG, JPG, GIF up to 10MB each ({referenceImages.length}/5)
                </span>
              </label>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview || "/placeholder.svg"}
                      alt={`Reference ${index + 1}`}
                      className="h-24 w-full rounded-lg object-cover cursor-pointer transition-transform hover:scale-105"
                      onClick={() => window.open(preview, '_blank')}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {referenceImages.length === 0 && (
              <div className="flex items-center justify-center rounded-lg border border-[#FFF5CC] bg-[#FFFBEB] p-8">
                <div className="text-center">
                  <ImageIcon className="mx-auto mb-2 h-12 w-12 text-[#8C7B00]" />
                  <p className="text-sm text-[#8C7B00]">No reference images uploaded yet</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="rounded-lg border border-[#FFF5CC] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-[#4A3F00]">Contact Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[#4A3F00]">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-lg border ${fieldErrors.name ? 'border-red-500 bg-red-50' : 'border-[#FFF5CC]'} bg-[#FFFBEB] px-3 py-2 text-[#4A3F00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]`}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A3F00]">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-lg border ${fieldErrors.email ? 'border-red-500 bg-red-50' : 'border-[#FFF5CC]'} bg-[#FFFBEB] px-3 py-2 text-[#4A3F00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]`}
                placeholder="Enter your email"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[#4A3F00]">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-lg border ${fieldErrors.phone ? 'border-red-500 bg-red-50' : 'border-[#FFF5CC]'} bg-[#FFFBEB] px-3 py-2 text-[#4A3F00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]`}
                placeholder="Enter your 10-digit mobile number"
              />
            </div>
          </div>
        </div>

        {/* Process Information */}
        <div className="rounded-lg border border-[#FFF5CC] bg-[#FFFBEB] p-6">
          <h3 className="mb-2 font-semibold text-[#4A3F00]">How it works:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-[#8C7B00]">
            <li>Submit your custom order request with reference images</li>
            <li>We'll review your requirements and get back to you within 24 hours</li>
            <li>Once approved, we'll send you a detailed quote and timeline</li>
            <li>After payment confirmation, we'll begin creating your custom piece</li>
            <li>We'll keep you updated throughout the creation process</li>
            <li>Your finished piece will be carefully packaged and shipped to you</li>
          </ol>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-[#FFDE59] px-4 py-3 font-semibold text-[#4A3F00] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Custom Order Request"}
        </button>
      </form>
    </div>
  )
}
