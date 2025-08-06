"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Upload, X, ImageIcon } from 'lucide-react'
import { useAdmin } from "../contexts/AdminContext"

export function CustomOrder() {
  const { dispatch } = useAdmin()
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Limit to 5 images total
    const remainingSlots = 5 - referenceImages.length
    const filesToAdd = files.slice(0, remainingSlots)

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
  }

  const removeImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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

      <form onSubmit={handleSubmit} className="space-y-6">
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
                required
                rows={4}
                placeholder="Please describe your vision in detail. Include colors, style, subject matter, and any specific requirements..."
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-lg border border-[#FFF5CC] bg-[#FFFBEB] px-3 py-2 text-[#4A3F00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]"
              />
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
                  className="mt-1 block w-full rounded-lg border border-[#FFF5CC] bg-[#FFFBEB] px-3 py-2 text-[#4A3F00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A3F00]">Budget (₹)</label>
                <input
                  type="number"
                  name="budget"
                  required
                  min="4000"
                  placeholder="16000"
                  value={formData.budget}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border border-[#FFF5CC] bg-[#FFFBEB] px-3 py-2 text-[#4A3F00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Reference Images */}
        <div className="rounded-lg border border-[#FFF5CC] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-[#4A3F00]">Reference Images</h2>
          <p className="mb-4 text-sm text-[#8C7B00]">
            Upload any images that can help us understand your vision better. This could include inspiration photos, 
            color palettes, existing artworks, or sketches. (Maximum 5 images)
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
                      className="h-24 w-full rounded-lg object-cover"
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
                required
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-lg border border-[#FFF5CC] bg-[#FFFBEB] px-3 py-2 text-[#4A3F00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A3F00]">Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-lg border border-[#FFF5CC] bg-[#FFFBEB] px-3 py-2 text-[#4A3F00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[#4A3F00]">Phone Number</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-lg border border-[#FFF5CC] bg-[#FFFBEB] px-3 py-2 text-[#4A3F00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]"
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
