"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Upload, X, ImageIcon, ZoomIn } from 'lucide-react'
import { useNotifications } from "../contexts/NotificationContext"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import Stepper, { Step } from "../components/Stepper"

export function CustomOrder() {
  const { addNotification } = useNotifications()
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(1)

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
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null)


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

  const handleSelectChange = (value: "painting" | "craft") => {
    setFormData({
      ...formData,
      type: value,
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

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
      if (file.size > 10 * 1024 * 1024) {
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

  const isStep1Valid = 
    formData.description.trim().length >= 20 &&
    formData.description.trim().length <= 1000 &&
    formData.budget &&
    Number.parseFloat(formData.budget) >= 4000 &&
    Number.parseFloat(formData.budget) <= 500000;

  const isStep3Valid =
    formData.name.trim().length >= 2 &&
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email) &&
    /^\+?[0-9\s\-()]{7,20}$/.test(formData.phone);

  const getNextButtonProps = () => {
    if (activeStep === 1) {
      return { disabled: !isStep1Valid }
    }
    if (activeStep === 2) {
      return {}
    }
    if (activeStep === 3) {
      return { disabled: !isStep3Valid || isSubmitting }
    }
    return {}
  }

  const triggerFormSubmit = async () => {
    setIsSubmitting(true)

    try {
      const data = new FormData()
      data.append("type", formData.type)
      data.append("description", formData.description)
      data.append("size", formData.size)
      data.append("budget", formData.budget)
      data.append("customerName", formData.name)
      data.append("customerEmail", formData.email)
      data.append("customerPhone", formData.phone)

      referenceImages.forEach((file) => {
        data.append("references", file)
      })

      const res = await fetch("/api/custom-orders", {
        method: "POST",
        body: data
      })

      const json = await res.json()

      if (res.ok) {
        addNotification({
          type: "success",
          title: "Custom Order Submitted!",
          message: "We'll review your request and get back to you within 24 hours.",
          duration: 5000,
        })
        navigate("/custom-order-success")
      } else {
        addNotification({
          type: "error",
          title: "Submission Failed",
          message: json.message || "Failed to submit request.",
          duration: 5000,
        })
      }
    } catch (err) {
      console.error("Custom order submit error:", err)
      addNotification({
        type: "error",
        title: "Submission Error",
        message: "Failed to connect to the backend server.",
        duration: 5000,
      })
    }

    setIsSubmitting(false)
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

      <div className="mt-4">
        <Stepper
          initialStep={1}
          onStepChange={(step) => setActiveStep(step)}
          onFinalStepCompleted={triggerFormSubmit}
          backButtonText="Previous"
          nextButtonText="Continue"
          nextButtonProps={getNextButtonProps()}
        >
          {/* Step 1: Project Details */}
          <Step>
            <Card className="border-none bg-transparent shadow-none">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl font-semibold text-[#4A3F00]">Project Details</CardTitle>
                <CardDescription className="text-[#8C7B00]">Describe the customized craft or painting you wish to request.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-0 pb-0">
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-[#4A3F00]">Type of Work</label>
                  <Select value={formData.type} onValueChange={handleSelectChange}>
                    <SelectTrigger className="w-full border border-[#8B4513]/30 bg-[#FFFBEB] text-[#4A3F00] focus:border-[#8B4513] focus:ring-0">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#FFFBEB]">
                      <SelectItem value="painting" className="text-[#4A3F00] focus:bg-[#FFDE59]">Custom Painting</SelectItem>
                      <SelectItem value="craft" className="text-[#4A3F00] focus:bg-[#FFDE59]">Custom Craft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium text-[#4A3F00]">Description</label>
                  <Textarea
                    name="description"
                    placeholder="Please describe your vision in detail. Include colors, style, subject matter, and any specific requirements..."
                    value={formData.description}
                    onChange={handleInputChange}
                    className={fieldErrors.description ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-[#E6C747] bg-[#FFFBEB] text-[#4A3F00] focus:ring-[#FFDE59] h-32'}
                  />
                  <p className="mt-1 text-xs text-[#8C7B00]">
                    {formData.description.length}/1000 characters (Min: 20)
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-[#4A3F00]">
                      Size {formData.type === "painting" ? "(e.g., 16x20 inches)" : "(e.g., Small, Medium, Large)"}
                    </label>
                    <Input
                      type="text"
                      name="size"
                      placeholder={formData.type === "painting" ? "16x20 inches" : "Medium"}
                      value={formData.size}
                      onChange={handleInputChange}
                      className={fieldErrors.size ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-[#E6C747] bg-[#FFFBEB] text-[#4A3F00] focus:ring-[#FFDE59]'}
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium text-[#4A3F00]">Budget (₹)</label>
                    <Input
                      type="number"
                      name="budget"
                      min="4000"
                      max="500000"
                      placeholder="16000"
                      value={formData.budget}
                      onChange={handleInputChange}
                      className={fieldErrors.budget ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-[#E6C747] bg-[#FFFBEB] text-[#4A3F00] focus:ring-[#FFDE59]'}
                    />
                    <p className="mt-1 text-xs text-[#8C7B00]">
                      Minimum: ₹4,000 | Maximum: ₹5,00,000
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Step>

          {/* Step 2: Reference Images */}
          <Step>
            <Card className="border-none bg-transparent shadow-none">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl font-semibold text-[#4A3F00]">Reference Images (Optional)</CardTitle>
                <CardDescription className="text-[#8C7B00]">
                  Upload any images that can help us understand your vision better (inspiration photos, color schemes, sketches).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-0 pb-0">
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

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 mt-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview || "/placeholder.svg"}
                          alt={`Reference ${index + 1}`}
                          className="h-24 w-full rounded-lg object-cover cursor-pointer transition-transform hover:scale-105"
                          onClick={() => setSelectedPreview(preview)}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none">
                          <ZoomIn className="h-6 w-6 text-white" />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 shadow"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {referenceImages.length === 0 && (
                  <div className="flex items-center justify-center rounded-lg border border-[#E6C747] bg-[#FFFBEB] p-8">
                    <div className="text-center">
                      <ImageIcon className="mx-auto mb-2 h-12 w-12 text-[#8C7B00]" />
                      <p className="text-sm text-[#8C7B00]">No reference images uploaded yet</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </Step>

          {/* Step 3: Contact Info */}
          <Step>
            <Card className="border-none bg-transparent shadow-none">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl font-semibold text-[#4A3F00]">Contact Information</CardTitle>
                <CardDescription className="text-[#8C7B00]">We will use these details to contact you with quotes and designs.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 px-0 pb-0">
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-[#4A3F00]">Full Name</label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={fieldErrors.name ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-[#E6C747] bg-[#FFFBEB] text-[#4A3F00] focus:ring-[#FFDE59]'}
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
                    className={fieldErrors.email ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-[#E6C747] bg-[#FFFBEB] text-[#4A3F00] focus:ring-[#FFDE59]'}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block mb-1.5 text-sm font-medium text-[#4A3F00]">Phone Number</label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={fieldErrors.phone ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-[#E6C747] bg-[#FFFBEB] text-[#4A3F00] focus:ring-[#FFDE59]'}
                    placeholder="Enter phone number (7 to 20 digits)"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Process Information */}
            <div className="rounded-lg border border-[#E6C747] bg-[#FFFBEB] p-6 shadow-inner mt-6">
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
          </Step>
        </Stepper>
      </div>

      {/* Expanded Reference Image Preview Modal */}
      {selectedPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setSelectedPreview(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedPreview}
              alt="Reference View"
              className="max-w-full max-h-[85vh] rounded-lg object-contain shadow-2xl"
            />
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-4 rounded-full bg-white/20 text-white border-white/20 hover:bg-white/40 hover:text-white"
              onClick={() => setSelectedPreview(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
