"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Upload, X, ImageIcon, ZoomIn } from 'lucide-react'
import { useAdmin } from "../contexts/AdminContext"
import { useNotifications } from "../contexts/NotificationContext"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "../components/ui/dialog"

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
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null)

  const validateForm = () => {
    const errors: {[key: string]: boolean} = {}
    let isValid = true

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
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
        referenceImages: imagePreviews,
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
        <Card className="border-[#FFF5CC]">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#4A3F00]">Project Details</CardTitle>
            <CardDescription className="text-[#8C7B00]">Describe the customized craft or painting you wish to request.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block mb-1.5 text-sm font-medium text-[#4A3F00]">Type of Work</label>
              <Select value={formData.type} onValueChange={handleSelectChange}>
                <SelectTrigger className="border-[#FFF5CC] bg-[#FFFBEB] text-[#4A3F00] focus:ring-[#FFDE59]">
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
                className={fieldErrors.description ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-[#FFF5CC] bg-[#FFFBEB] text-[#4A3F00] focus:ring-[#FFDE59]'}
              />
              <p className="mt-1 text-xs text-[#8C7B00]">
                {formData.description.length}/1000 characters
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
                  className={fieldErrors.size ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-[#FFF5CC] bg-[#FFFBEB] text-[#4A3F00] focus:ring-[#FFDE59]'}
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
                  className={fieldErrors.budget ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-[#FFF5CC] bg-[#FFFBEB] text-[#4A3F00] focus:ring-[#FFDE59]'}
                />
                <p className="mt-1 text-xs text-[#8C7B00]">
                  Minimum: ₹4,000 | Maximum: ₹5,00,000
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reference Images */}
        <Card className="border-[#FFF5CC]">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#4A3F00]">Reference Images</CardTitle>
            <CardDescription className="text-[#8C7B00]">
              Upload any images that can help us understand your vision better (inspiration photos, color schemes, sketches).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <div className="flex items-center justify-center rounded-lg border border-[#FFF5CC] bg-[#FFFBEB] p-8">
                <div className="text-center">
                  <ImageIcon className="mx-auto mb-2 h-12 w-12 text-[#8C7B00]" />
                  <p className="text-sm text-[#8C7B00]">No reference images uploaded yet</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border-[#FFF5CC]">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#4A3F00]">Contact Information</CardTitle>
            <CardDescription className="text-[#8C7B00]">We will use these details to contact you with quotes and designs.</CardDescription>
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
              <label className="block mb-1.5 text-sm font-medium text-[#4A3F00]">Phone Number</label>
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

        {/* Process Information */}
        <div className="rounded-lg border border-[#FFF5CC] bg-[#FFFBEB] p-6 shadow-inner">
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

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 text-md font-semibold"
        >
          {isSubmitting ? "Submitting Request..." : "Submit Custom Order Request"}
        </Button>
      </form>

      {/* Expanded Reference Image Preview Modal */}
      <Dialog open={!!selectedPreview} onOpenChange={(open) => !open && setSelectedPreview(null)}>
        <DialogContent className="max-w-3xl border-none p-0 overflow-hidden bg-transparent shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Reference Image View</DialogTitle>
          </DialogHeader>
          <div className="relative flex items-center justify-center p-4 bg-black/90 rounded-lg">
            <img
              src={selectedPreview || ""}
              alt="Reference View"
              className="max-h-[80vh] max-w-full rounded-md object-contain"
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
        </DialogContent>
      </Dialog>
    </div>
  )
}
