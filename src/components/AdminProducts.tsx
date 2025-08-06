"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Edit, Trash2, Package, Upload } from 'lucide-react'
import { useAdmin, type Product } from "../contexts/AdminContext"
import { useNotifications } from "../contexts/NotificationContext"

export function AdminProducts() {
  const { state, dispatch } = useAdmin()
  const { addNotification } = useNotifications()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: boolean}>({})

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    image: "",
    description: "",
    category: "painting" as "painting" | "craft" | "tote-bag",
    inStock: true,
    height: "",
    width: "",
    medium: "",
  })

  const resetForm = () => {
    setFormData({
      title: "",
      price: "",
      image: "",
      description: "",
      category: "painting",
      inStock: true,
      height: "",
      width: "",
      medium: "",
    })
    setImageFile(null)
    setImagePreview("")
    setShowAddForm(false)
    setEditingProduct(null)
    setFieldErrors({})
  }

  const validateForm = () => {
    const errors: {[key: string]: boolean} = {}
    let isValid = true

    // Title validation
    if (!formData.title.trim()) {
      errors.title = true
      addNotification({
        type: "error",
        title: "Title Required",
        message: "Please enter a product title.",
        duration: 4000,
      })
      isValid = false
    } else if (formData.title.trim().length < 3) {
      errors.title = true
      addNotification({
        type: "error",
        title: "Title Too Short",
        message: "Product title must be at least 3 characters long.",
        duration: 4000,
      })
      isValid = false
    }

    // Price validation
    if (!formData.price) {
      errors.price = true
      addNotification({
        type: "error",
        title: "Price Required",
        message: "Please enter a product price.",
        duration: 4000,
      })
      isValid = false
    } else if (Number.parseFloat(formData.price) <= 0) {
      errors.price = true
      addNotification({
        type: "error",
        title: "Invalid Price",
        message: "Price must be greater than 0.",
        duration: 4000,
      })
      isValid = false
    } else if (Number.parseFloat(formData.price) > 1000000) {
      errors.price = true
      addNotification({
        type: "error",
        title: "Price Too High",
        message: "Price cannot exceed ₹10,00,000.",
        duration: 4000,
      })
      isValid = false
    }

    // Image validation
    if (!formData.image && !imageFile) {
      errors.image = true
      addNotification({
        type: "error",
        title: "Image Required",
        message: "Please upload a product image.",
        duration: 4000,
      })
      isValid = false
    }

    // Description validation (optional but if provided, should be valid)
    if (formData.description && formData.description.trim().length < 10) {
      errors.description = true
      addNotification({
        type: "error",
        title: "Description Too Short",
        message: "Description must be at least 10 characters if provided.",
        duration: 4000,
      })
      isValid = false
    }

    // Painting-specific validations
    if (formData.category === "painting") {
      if (formData.height && !/^\d+(\.\d+)?$/.test(formData.height)) {
        errors.height = true
        addNotification({
          type: "error",
          title: "Invalid Height",
          message: "Height must be a valid number.",
          duration: 4000,
        })
        isValid = false
      }
      if (formData.width && !/^\d+(\.\d+)?$/.test(formData.width)) {
        errors.width = true
        addNotification({
          type: "error",
          title: "Invalid Width",
          message: "Width must be a valid number.",
          duration: 4000,
        })
        isValid = false
      }
    }

    setFieldErrors(errors)
    return isValid
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        addNotification({
          type: "error",
          title: "Invalid File Type",
          message: "Please upload a valid image file.",
          duration: 4000,
        })
        return
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        addNotification({
          type: "error",
          title: "File Too Large",
          message: "Image size must be less than 10MB.",
          duration: 4000,
        })
        return
      }

      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreview(result)
        setFormData({ ...formData, image: result })
        // Clear image error if it exists
        if (fieldErrors.image) {
          setFieldErrors(prev => ({ ...prev, image: false }))
        }
      }
      reader.readAsDataURL(file)

      addNotification({
        type: "success",
        title: "Image Uploaded",
        message: "Product image uploaded successfully.",
        duration: 3000,
      })
    }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const productData = {
      title: formData.title.trim(),
      price: Number.parseFloat(formData.price),
      image: formData.image,
      description: formData.description.trim(),
      category: formData.category,
      inStock: formData.inStock,
      ...(formData.category === "painting" && {
        height: formData.height,
        width: formData.width,
        medium: formData.medium.trim(),
      }),
    }

    if (editingProduct) {
      dispatch({
        type: "UPDATE_PRODUCT",
        payload: {
          ...editingProduct,
          ...productData,
        },
      })
      addNotification({
        type: "success",
        title: "Product Updated!",
        message: `${productData.title} has been updated successfully.`,
        duration: 4000,
      })
    } else {
      dispatch({
        type: "ADD_PRODUCT",
        payload: productData,
      })
      addNotification({
        type: "success",
        title: "Product Added!",
        message: `${productData.title} has been added to your catalog.`,
        duration: 4000,
      })
    }

    resetForm()
  }

  const handleEdit = (product: Product) => {
    setFormData({
      title: product.title,
      price: product.price.toString(),
      image: product.image,
      description: product.description || "",
      category: product.category,
      inStock: product.inStock,
      height: product.height || "",
      width: product.width || "",
      medium: product.medium || "",
    })
    setImagePreview(product.image)
    setEditingProduct(product)
    setShowAddForm(true)
    setFieldErrors({})
  }

  const handleDelete = (product: Product) => {
    if (confirm(`Are you sure you want to delete "${product.title}"?`)) {
      dispatch({ type: "DELETE_PRODUCT", payload: product.id })
      addNotification({
        type: "info",
        title: "Product Deleted",
        message: `${product.title} has been removed from your catalog.`,
        duration: 4000,
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#4A3F00]">Products</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 rounded-lg bg-[#FFDE59] px-4 py-2 font-semibold text-[#4A3F00] transition-opacity hover:opacity-90"
        >
          <Plus className="h-5 w-5" />
          Add Product
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="rounded-lg border border-[#FFF5CC] bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-[#4A3F00]">
            {editingProduct ? "Edit Product" : "Add New Product"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[#4A3F00]">Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-lg border ${fieldErrors.title ? 'border-red-500 bg-red-50' : 'border-[#FFF5CC]'} bg-[#FFFBEB] px-3 py-2 text-[#4A3F00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]`}
                  placeholder="Enter product title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A3F00]">Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  required
                  min="1"
                  max="1000000"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-lg border ${fieldErrors.price ? 'border-red-500 bg-red-50' : 'border-[#FFF5CC]'} bg-[#FFFBEB] px-3 py-2 text-[#4A3F00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]`}
                  placeholder="Enter price"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A3F00]">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border border-[#FFF5CC] bg-[#FFFBEB] px-3 py-2 text-[#4A3F00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]"
                >
                  <option value="painting">Painting</option>
                  <option value="craft">Craft</option>
                  <option value="tote-bag">Tote Bag</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A3F00]">Product Image</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border ${fieldErrors.image ? 'border-red-500 bg-red-50' : 'border-[#FFF5CC]'} bg-[#FFFBEB] px-3 py-2 text-sm text-[#4A3F00] hover:bg-[#FFF5CC]`}
                  >
                    <Upload className="h-4 w-4" />
                    Upload Image
                  </label>
                  {imageFile && <span className="text-sm text-[#8C7B00]">{imageFile.name}</span>}
                </div>
                {imagePreview && (
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="mt-2 h-20 w-20 rounded-lg object-cover"
                  />
                )}
              </div>
            </div>

            {/* Painting-specific fields */}
            {formData.category === "painting" && (
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-[#4A3F00]">Height (inches)</label>
                  <input
                    type="text"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-lg border ${fieldErrors.height ? 'border-red-500 bg-red-50' : 'border-[#FFF5CC]'} bg-[#FFFBEB] px-3 py-2 text-[#4A3F00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]`}
                    placeholder="20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A3F00]">Width (inches)</label>
                  <input
                    type="text"
                    name="width"
                    value={formData.width}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-lg border ${fieldErrors.width ? 'border-red-500 bg-red-50' : 'border-[#FFF5CC]'} bg-[#FFFBEB] px-3 py-2 text-[#4A3F00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]`}
                    placeholder="16"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A3F00]">Medium</label>
                  <input
                    type="text"
                    name="medium"
                    value={formData.medium}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border border-[#FFF5CC] bg-[#FFFBEB] px-3 py-2 text-[#4A3F00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]"
                    placeholder="Acrylic on Canvas"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#4A3F00]">Description</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-lg border ${fieldErrors.description ? 'border-red-500 bg-red-50' : 'border-[#FFF5CC]'} bg-[#FFFBEB] px-3 py-2 text-[#4A3F00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]`}
                placeholder="Enter product description (optional)"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="inStock"
                name="inStock"
                checked={formData.inStock}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-[#FFF5CC] text-[#FFDE59] focus:ring-[#FFDE59]"
              />
              <label htmlFor="inStock" className="ml-2 text-sm text-[#4A3F00]">
                In Stock
              </label>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="rounded-lg bg-[#FFDE59] px-4 py-2 font-semibold text-[#4A3F00] transition-opacity hover:opacity-90"
              >
                {editingProduct ? "Update Product" : "Add Product"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-[#FFF5CC] px-4 py-2 font-semibold text-[#4A3F00] transition-colors hover:bg-[#FFFBEB]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {state.products.map((product) => (
          <div key={product.id} className="rounded-lg border border-[#FFF5CC] bg-white p-4 shadow-sm">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.title}
              className="mb-4 h-48 w-full rounded-lg object-cover"
            />
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-[#4A3F00]">{product.title}</h3>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    product.inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
              <p className="text-sm text-[#8C7B00] capitalize">{product.category}</p>
              <p className="font-semibold text-[#4A3F00]">₹{product.price.toFixed(2)}</p>
              {product.description && <p className="text-sm text-[#8C7B00] line-clamp-2">{product.description}</p>}
              {product.category === "painting" && (product.height || product.width || product.medium) && (
                <div className="text-xs text-[#8C7B00]">
                  {product.height && product.width && <div>Size: {product.width}" × {product.height}"</div>}
                  {product.medium && <div>Medium: {product.medium}</div>}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex items-center gap-1 rounded px-3 py-1 text-sm text-blue-600 hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product)}
                  className="flex items-center gap-1 rounded px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {state.products.length === 0 && (
        <div className="rounded-lg border border-[#FFF5CC] bg-white p-12 text-center shadow-sm">
          <Package className="mx-auto mb-4 h-12 w-12 text-[#8C7B00]" />
          <h3 className="mb-2 text-lg font-semibold text-[#4A3F00]">No products yet</h3>
          <p className="text-[#8C7B00]">Add your first product to get started.</p>
        </div>
      )}
    </div>
  )
}
