"use client"

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Heart, ShoppingCart, Star, Truck, Shield, RotateCcw, Share2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCart } from "../contexts/CartContext"
import { useAdmin } from "../contexts/AdminContext"
import { useFavorites } from "../contexts/FavoritesContext"
import { ProductCard } from "../components/ProductCard"
import { Breadcrumbs } from "../components/Breadcrumbs"

export function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { dispatch } = useCart()
  const { state } = useAdmin()
  const { state: favoritesState, dispatch: favoritesDispatch } = useFavorites()
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)

  // Find the product by ID
  const product = state.products.find(p => p.id === id)
  const isFavorite = product ? favoritesState.favoriteIds.includes(product.id) : false

  // Mock additional product images for gallery
  const productImages = product ? [
    product.image,
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBLqK2L0sOwCFonNwSFRJixWsjcS-J2Fyekt3H7AMpCs-EBwZb7Jm3fSY3ewOCDrgQ1qJptgbWNF9KRquNRIa-ZwC66G38JAr2WKk6FHWLE7Co3V0EyGM_fsjB9Y9-W_LSGUk96NI5zLAg-y2sB9ZmP5vWnYPAGHEZVGYQk_uhuHEeyF4F-kwaUp6FgGtPIYxuClcTMPxpfmwjWUt5mBNtCOFDCulF1PVKUOC6iF-aEbDd3ZP1EWiBOIfNaw8Ydqsgx7yGPzvMzio3",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC0WbOv40Tsw9I8GP1PdFTTU1B5OPgRZ_fRwypUANTUfJYdh6qAR-zuddooaZdFdYwk4YaN1OWKcOVWlxH8z049aV-mszTeQyJC_yVD1IolgT02ukEuZImZuf1BHHumQalZfRDg18ZY_NaaCN2T-USD5fwZix-0zfbo0vg45Fh9l0aTAl5CtV__usw2s8ohDKY7AGArBpGGPh8oc_cnrZwPyHLO_R5BSkHuaWZlOru5iAwMcOeDzhSb_Ah64w6w3TT7XMmJk76h6ZtT"
  ] : []

  // Mock related products
  const relatedProducts = state.products
    .filter(p => p.id !== id && p.category === product?.category)
    .slice(0, 4)

  if (!product) {
    return (
      <div className="flex w-full max-w-7xl flex-1 flex-col items-center justify-center py-12">
        <div className="text-center">
          <h1 className="mb-4 text-3xl font-bold text-[#4A3F00]">Product Not Found</h1>
          <p className="mb-8 text-[#8C7B00]">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/")}
            className="rounded-lg bg-[#FFDE59] px-6 py-3 font-semibold text-[#4A3F00] transition-opacity hover:opacity-90"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      dispatch({
        type: "ADD_ITEM",
        payload: {
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.image,
          category: product.category,
        },
      })
    }
  }

  const toggleFavorite = () => {
    favoritesDispatch({
      type: "TOGGLE_FAVORITE",
      payload: product.id,
    })
  }

  const handlePreviousImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1))
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "painting":
        return "Paintings"
      case "craft":
        return "Crafts"
      case "tote-bag":
        return "Tote Bags"
      default:
        return "Products"
    }
  }

  const getCategoryPath = (category: string) => {
    switch (category) {
      case "painting":
        return "/paintings"
      case "craft":
        return "/crafts"
      case "tote-bag":
        return "/tote-bags"
      default:
        return "/"
    }
  }

  return (
    <div className="flex w-full max-w-7xl flex-1 flex-col">
      <Breadcrumbs 
        items={[
          { label: "Home", href: "/" },
          { label: getCategoryLabel(product.category), href: getCategoryPath(product.category) },
          { label: product.title }
        ]} 
      />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            <img
              src={productImages[selectedImageIndex] || "/placeholder.svg"}
              alt={product.title}
              className="h-full w-full object-cover"
            />
            
            {/* Image Navigation */}
            {productImages.length > 1 && (
              <>
                <button
                  onClick={handlePreviousImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-[#4A3F00] transition-all hover:bg-white hover:shadow-md"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-[#4A3F00] transition-all hover:bg-white hover:shadow-md"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Favorite Button */}
            <button
              onClick={toggleFavorite}
              className={`absolute right-4 top-4 rounded-full bg-white/80 p-2 transition-all hover:bg-white ${
                isFavorite ? 'text-red-500' : 'text-[#8C7B00] hover:text-red-500'
              }`}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Thumbnail Images */}
          {productImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    selectedImageIndex === index
                      ? "border-[#FFDE59]"
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

        {/* Product Information */}
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
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-[#8C7B00]">(24 reviews)</span>
            </div>

            <div className="text-3xl font-bold text-[#4A3F00] mb-4">
              ₹{product.price.toFixed(2)}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="mb-2 font-semibold text-[#4A3F00]">Description</h3>
            <p className="text-[#8C7B00] leading-relaxed">
              {product.description || 
                `This beautiful ${product.category.replace("-", " ")} is carefully crafted with attention to detail and artistic vision. Each piece is unique and made with high-quality materials to ensure lasting beauty and durability.`
              }
            </p>
          </div>

          {/* Quantity and Add to Cart */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#4A3F00] mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="rounded-lg border border-[#FFF5CC] px-3 py-2 text-[#4A3F00] transition-colors hover:bg-[#FFFBEB]"
                >
                  -
                </button>
                <span className="w-12 text-center font-medium text-[#4A3F00]">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="rounded-lg border border-[#FFF5CC] px-3 py-2 text-[#4A3F00] transition-colors hover:bg-[#FFFBEB]"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#FFDE59] px-6 py-3 font-semibold text-[#4A3F00] transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </button>
              <button 
                onClick={toggleFavorite}
                className={`rounded-lg border border-[#FFF5CC] p-3 transition-colors hover:bg-[#FFFBEB] ${
                  isFavorite ? 'text-red-500 border-red-200 bg-red-50' : 'text-[#8C7B00]'
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button className="rounded-lg border border-[#FFF5CC] p-3 text-[#8C7B00] transition-colors hover:bg-[#FFFBEB]">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3 border-t border-[#FFF5CC] pt-6">
            <div className="flex items-center gap-3 text-sm text-[#8C7B00]">
              <Truck className="h-5 w-5" />
              <span>Free shipping on orders over ₹8,000</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#8C7B00]">
              <Shield className="h-5 w-5" />
              <span>Secure payment & buyer protection</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#8C7B00]">
              <RotateCcw className="h-5 w-5" />
              <span>30-day return policy</span>
            </div>
          </div>

          {/* Product Details */}
          <div className="border-t border-[#FFF5CC] pt-6">
            <h3 className="mb-3 font-semibold text-[#4A3F00]">Product Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#8C7B00]">Category:</span>
                <span className="font-medium text-[#4A3F00] capitalize">{product.category.replace("-", " ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C7B00]">SKU:</span>
                <span className="font-medium text-[#4A3F00]">{product.id.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C7B00]">Added:</span>
                <span className="font-medium text-[#4A3F00]">{product.createdAt.toLocaleDateString()}</span>
              </div>
              {product.category === "painting" && (
                <>
                  {product.medium && (
                    <div className="flex justify-between">
                      <span className="text-[#8C7B00]">Medium:</span>
                      <span className="font-medium text-[#4A3F00]">{product.medium}</span>
                    </div>
                  )}
                  {product.height && product.width && (
                    <div className="flex justify-between">
                      <span className="text-[#8C7B00]">Size:</span>
                      <span className="font-medium text-[#4A3F00]">{product.width}" × {product.height}"</span>
                    </div>
                  )}
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
