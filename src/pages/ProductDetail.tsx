"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Heart, ShoppingCart, Star, Truck, Shield, RotateCcw, Share2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useCart } from "../contexts/CartContext"
import { useAdmin } from "../contexts/AdminContext"
import { useFavorites } from "../contexts/FavoritesContext"
import { useNotifications } from "../contexts/NotificationContext"
import { ProductCard } from "../components/ProductCard"
import { Breadcrumbs } from "../components/Breadcrumbs"
import { Button } from "../components/ui/button"
import { Skeleton } from "../components/ui/skeleton"

export function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const { dispatch } = useCart()
  const { state: adminState } = useAdmin()
  const { state: favoritesState, dispatch: favoritesDispatch } = useFavorites()
  const { addNotification } = useNotifications()
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  // Reviews and ratings states
  const [productData, setProductData] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  // Find original product by ID for details template
  const product = adminState.products.find(p => p.id === id)
  const isFavorite = product ? favoritesState.favoriteIds.includes(product.id) : false

  // Load product dynamic data and reviews on mount / route change
  useEffect(() => {
    if (id) {
      setIsLoading(true)
      Promise.all([
        fetch(`/api/products/${id}`).then((res) => (res.ok ? res.json() : null)),
        fetch(`/api/products/${id}/reviews`).then((res) => (res.ok ? res.json() : null))
      ])
        .then(([prodJson, revJson]) => {
          if (prodJson) setProductData(prodJson.data.product)
          if (revJson) setReviews(revJson.data.reviews || [])
        })
        .catch((err) => console.error("Error loading product details:", err))
        .finally(() => setIsLoading(false))
    }
  }, [id])

  // Mock additional product images for gallery
  const productImages = product ? [
    product.image,
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBLqK2L0sOwCFonNwSFRJixWsjcS-J2Fyekt3H7AMpCs-EBwZb7Jm3fSY3ewOCDrgQ1qJptgbWNF9KRquNRIa-ZwC66G38JAr2WKk6FHWLE7Co3V0EyGM_fsjB9Y9-W_LSGUk96NI5zLAg-y2sB9ZmP5vWnYPAGHEZVGYQk_uhuHEeyF4F-kwaUp6FgGtPIYxuClcTMPxpfmwjWUt5mBNtCOFDCulF1PVKUOC6iF-aEbDd3ZP1EWiBOIfNaw8Ydqsgx7yGPzvMzio3",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC0WbOv40Tsw9I8GP1PdFTTU1B5OPgRZ_fRwypUANTUfJYdh6qAR-zuddooaZdFdYwk4YaN1OWKcOVWlxH8z049aV-mszTeQyJC_yVD1IolgT02ukEuZImZuf1BHHumQalZfRDg18ZY_NaaCN2T-USD5fwZix-0zfbo0vg45Fh9l0aTAl5CtV__usw2s8ohDKY7AGArBpGGPh8oc_cnrZwPyHLO_R5BSkHuaWZlOru5iAwMcOeDzhSb_Ah64w6w3TT7XMmJk76h6ZtT"
  ] : []

  // Mock related products
  const relatedProducts = adminState.products
    .filter(p => p.id !== id && p.category === product?.category)
    .slice(0, 4)

  const handleAddToCart = () => {
    if (product) {
      dispatch({
        type: "ADD_ITEM",
        payload: {
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.image,
          category: product.category as any,
        },
      })
      if (quantity > 1) {
        dispatch({
          type: "UPDATE_QUANTITY",
          payload: { id: product.id, quantity },
        })
      }
      addNotification({
        type: "success",
        title: "Added to Cart!",
        message: `${product.title} has been added to your cart.`,
        duration: 3000,
      })
    }
  }

  const toggleFavorite = () => {
    if (product) {
      favoritesDispatch({
        type: "TOGGLE_FAVORITE",
        payload: product.id,
      })
      const isCurrentlyFavorite = favoritesState.favoriteIds.includes(product.id)
      addNotification({
        type: "info",
        title: isCurrentlyFavorite ? "Removed from Favorites" : "Added to Favorites",
        message: `${product.title} has been ${isCurrentlyFavorite ? "removed from" : "added to"} your favorites.`,
        duration: 2000,
      })
    }
  }

  const handleShare = async () => {
    if (!product) return

    const shareData = {
      title: product.title,
      text: product.description || `Check out ${product.title} on Exotika Creation!`,
      url: window.location.href,
    }

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        addNotification({
          type: "success",
          title: "Link Copied!",
          message: "Product page link copied to your clipboard.",
          duration: 3000,
        })
      }
    } catch (err) {
      try {
        await navigator.clipboard.writeText(window.location.href)
        addNotification({
          type: "success",
          title: "Link Copied!",
          message: "Product page link copied to your clipboard.",
          duration: 3000,
        })
      } catch (clipErr) {
        console.error("Failed to copy link:", clipErr)
      }
    }
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmittingReview(true)
    try {
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          rating: newRating,
          comment: newComment
        })
      })

      if (res.ok) {
        addNotification({
          type: "success",
          title: "Review Submitted!",
          message: "Thank you for your feedback!",
          duration: 3000
        })
        setNewComment("")
        setNewRating(5)

        // Refresh reviews list
        const revRes = await fetch(`/api/products/${id}/reviews`)
        if (revRes.ok) {
          const revJson = await revRes.json()
          setReviews(revJson.data.reviews || [])
        }

        // Refresh product metrics (ratings/counts)
        const prodRes = await fetch(`/api/products/${id}`)
        if (prodRes.ok) {
          const prodJson = await prodRes.json()
          setProductData(prodJson.data.product)
        }
      } else {
        const json = await res.json()
        addNotification({
          type: "error",
          title: "Submission Failed",
          message: json.message || "Failed to post review.",
          duration: 3000
        })
      }
    } catch (err) {
      console.error("Error submitting review:", err)
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const handlePreviousImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1))
  }

  if (isLoading || !product) {
    return (
      <div className="flex w-full max-w-7xl flex-1 flex-col px-4 md:px-0">
        <div className="mb-6 flex gap-2">
          <Skeleton className="h-4 w-12" />
          <span className="text-gray-300">/</span>
          <Skeleton className="h-4 w-20" />
          <span className="text-gray-300">/</span>
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="h-20 w-20 rounded-lg" />
              <Skeleton className="h-20 w-20 rounded-lg" />
              <Skeleton className="h-20 w-20 rounded-lg" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
            </div>
            <Skeleton className="h-12 w-28" />
            <Skeleton className="h-24 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-12 flex-1 rounded-lg" />
              <Skeleton className="h-12 w-12 rounded-lg" />
              <Skeleton className="h-12 w-12 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-7xl flex-1 flex-col px-4 md:px-0">
      <Breadcrumbs
        items={[
          { label: "Shop", href: "/" },
          { label: product.category, href: `/${product.category}s` },
          { label: product.title },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery Column */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-xl border border-[#E6C747] bg-white">
            <img
              src={productImages[selectedImageIndex] || "/placeholder.svg"}
              alt={product.title}
              className="h-full w-full object-cover"
            />
            {productImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePreviousImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-[#4A3F00] transition-all hover:bg-white hover:shadow-md"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-[#4A3F00] transition-all hover:bg-white hover:shadow-md"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {productImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {productImages.map((image, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    selectedImageIndex === index
                      ? "border-[#E6C747] scale-[1.02]"
                      : "border-transparent hover:border-[#FFF5CC]"
                  }`}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${product.title} ${index + 1}`}
                    className="h-20 w-20 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Details Column */}
        <div className="flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-[#FFF5CC] px-3 py-1 text-sm font-medium text-[#4A3F00] capitalize">
                  {product.category.replace("-", " ")}
                </span>
                {product.inStock ? (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                    In Stock
                  </span>
                ) : (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                    Out of Stock
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-[#4A3F00] mb-2">{product.title}</h1>
              
              {/* Dynamic Rating Header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => {
                    const val = i + 1
                    const isFilled = val <= Math.round(productData?.averageRating || 5)
                    return (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          isFilled ? "fill-[#FFDE59] text-[#FFDE59]" : "text-gray-300"
                        }`}
                      />
                    )
                  })}
                </div>
                <span className="text-sm font-semibold text-[#8C7B00]">
                  {productData?.averageRating ? Number(productData.averageRating).toFixed(1) : "5.0"} ({productData?.reviewCount || 0} reviews)
                </span>
              </div>

              <div className="text-3xl font-bold text-[#4A3F00] mb-4">
                ₹{Number(product.price).toFixed(2)}
              </div>
            </div>

            {product.description && (
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-[#4A3F00]">Description</h2>
                <p className="text-[#8C7B00] leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#4A3F00] mb-2">Quantity</label>
                <div className="flex items-center rounded-lg border border-[#E6C747] bg-white w-32 justify-between p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-8 w-8 flex items-center justify-center rounded-md text-[#4A3F00] hover:bg-[#FFFBEB] font-bold text-lg transition-colors"
                  >
                    -
                  </button>
                  <span className="text-[#4A3F00] font-bold text-md select-none">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-8 w-8 flex items-center justify-center rounded-md text-[#4A3F00] hover:bg-[#FFFBEB] font-bold text-lg transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1 h-12 gap-2 text-md font-semibold"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </Button>
                <button
                  type="button"
                  onClick={toggleFavorite}
                  className={`rounded-lg border border-[#E6C747] p-3 transition-colors hover:bg-[#FFFBEB] ${
                    isFavorite ? 'text-red-500 border-red-200 bg-red-50' : 'text-[#8C7B00]'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="rounded-lg border border-[#E6C747] p-3 text-[#8C7B00] transition-colors hover:bg-[#FFFBEB]"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="space-y-3 border-t border-[#E6C747] pt-6 mt-6">
            <div className="flex items-center gap-3 text-sm text-[#8C7B00]">
              <Truck className="h-5 w-5 text-[#E6C747]" />
              <span>Free delivery across India</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#8C7B00]">
              <Shield className="h-5 w-5 text-[#E6C747]" />
              <span>100% authentic handmade artwork</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#8C7B00]">
              <RotateCcw className="h-5 w-5 text-[#E6C747]" />
              <span>Easy 7-day return policy</span>
            </div>

            {/* Spec Card Details */}
            <div className="mt-4 rounded-xl border border-[#E6C747] bg-[#FFFBEB]/50 p-4 text-sm space-y-2">
              {product.category === "painting" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-[#8C7B00]">Medium:</span>
                    <span className="font-medium text-[#4A3F00]">{product.medium || "Acrylic"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C7B00]">Dimensions:</span>
                    <span className="font-medium text-[#4A3F00]">{product.height}" × {product.width}"</span>
                  </div>
                </>
              )}
              {product.category === "craft" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-[#8C7B00]">Craft Type:</span>
                    <span className="font-medium text-[#4A3F00]">Artisanal Clay/Ceramics</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C7B00]">Finish:</span>
                    <span className="font-medium text-[#4A3F00]">Glazed Finish</span>
                  </div>
                </>
              )}
              {product.category === "tote-bag" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-[#8C7B00]">Material:</span>
                    <span className="font-medium text-[#4A3F00]">100% Cotton Canvas</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C7B00]">Dimensions:</span>
                    <span className="font-medium text-[#4A3F00]">15" × 16" × 6"</span>
                  </div>
                </>
              )}
              {product.category === "apparel" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-[#8C7B00]">Material:</span>
                    <span className="font-medium text-[#4A3F00]">Premium Silk / Cotton</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C7B00]">Care:</span>
                    <span className="font-medium text-[#4A3F00]">Dry Clean Only</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews and Comments Section */}
      <div className="mt-16 border-t border-[#E6C747] pt-12">
        <h2 className="text-2xl font-bold text-[#4A3F00] mb-8">Customer Reviews</h2>
        
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Rating Summary Left Panel */}
          <div className="rounded-xl border border-[#E6C747] bg-white p-6 shadow-sm h-fit">
            <h3 className="text-lg font-bold text-[#4A3F00] mb-4">Rating Summary</h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-black text-[#4A3F00]">
                {productData?.averageRating ? Number(productData.averageRating).toFixed(1) : "5.0"}
              </span>
              <span className="text-sm font-semibold text-[#8C7B00]">out of 5</span>
            </div>
            <div className="flex items-center mb-6">
              {[...Array(5)].map((_, i) => {
                const val = i + 1
                const isFilled = val <= Math.round(productData?.averageRating || 5)
                return (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      isFilled ? "fill-[#FFDE59] text-[#FFDE59]" : "text-gray-300"
                    }`}
                  />
                )
              })}
            </div>
            <div className="text-sm text-[#8C7B00] font-medium">
              Based on {reviews.length} customer feedback comment(s).
            </div>
          </div>

          {/* Reviews List & Write Review Panel */}
          <div className="lg:col-span-2 space-y-8">
            {/* Write a Review Card */}
            <div className="rounded-xl border border-[#E6C747] bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#4A3F00] mb-4">Share Your Feedback</h3>
              
              {adminState.user ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {/* Interactive Star Selection */}
                  <div>
                    <label className="block text-sm font-bold text-[#4A3F00] mb-2">Your Rating</label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="text-gray-300 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`h-7 w-7 ${
                              star <= newRating ? "fill-[#FFDE59] text-[#FFDE59]" : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment Input */}
                  <div>
                    <label className="block text-sm font-bold text-[#4A3F00] mb-2">Review Comment</label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={4}
                      required
                      placeholder="Write your review here..."
                      className="w-full rounded-lg border border-[#E6C747] bg-[#FFFBEB] p-3 text-sm text-[#4A3F00] placeholder-[#8C7B00] outline-none focus:ring-2 focus:ring-[#FFDE59]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[#FFDE59] px-6 py-2.5 font-bold text-[#4A3F00] transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {isSubmittingReview ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      "Submit Review"
                    )}
                  </button>
                </form>
              ) : (
                <div className="rounded-lg border border-dashed border-[#E6C747] bg-[#FFFBEB]/50 p-6 text-center">
                  <p className="text-sm font-medium text-[#8C7B00] mb-3">
                    You must be logged in to write a review.
                  </p>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center rounded-lg bg-[#FFDE59] px-6 py-2 font-bold text-[#4A3F00] no-underline transition-all hover:bg-[#e6c747]"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>

            {/* List of Reviews */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#4A3F00]">Recent Feedback</h3>
              
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-[#8C7B00] bg-white rounded-xl border border-[#E6C747]/40">
                  No reviews yet. Be the first to review this product!
                </div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="rounded-xl border border-[#E6C747]/50 bg-white p-6 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-[#4A3F00]">{rev.user?.name || "Verified Customer"}</span>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < rev.rating ? "fill-[#FFDE59] text-[#FFDE59]" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-[#8C7B00]">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-[#8C7B00] leading-relaxed whitespace-pre-line">
                      {rev.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-8 text-2xl font-bold text-[#4A3F00]">Related Products</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                id={relatedProduct.id}
                title={relatedProduct.title}
                price={`₹${relatedProduct.price.toFixed(2)}`}
                image={relatedProduct.image}
                description={relatedProduct.description}
                aspectRatio="square"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
