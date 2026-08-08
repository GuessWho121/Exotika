"use client"

import { memo } from 'react'
import { Heart } from 'lucide-react'
import { useNavigate } from "react-router-dom"
import { useCart } from "../contexts/CartContext"
import { useFavorites } from "../contexts/FavoritesContext"
import { useNotifications } from "../contexts/NotificationContext"

interface ProductCardProps {
  id?: string
  title: string
  price: string
  image: string
  description?: string
  aspectRatio?: "square" | "4/3" | "3/4"
  category?: "painting" | "craft" | "tote-bag" | "apparel"
  inStock?: boolean
}

export const ProductCard = memo(function ProductCard({ id, title, price, image, description, aspectRatio = "square", category, inStock = true }: ProductCardProps) {
  const { dispatch } = useCart()
  const { state: favoritesState, dispatch: favoritesDispatch } = useFavorites()
  const { addNotification } = useNotifications()
  const navigate = useNavigate()

  const aspectClasses = {
    square: "aspect-square",
    "4/3": "aspect-[4/3]",
    "3/4": "aspect-[3/4]",
  }

  // Generate a simple ID from title if not provided
  const productId = id || title.toLowerCase().replace(/\s+/g, "-")
  const isFavorite = favoritesState.favoriteIds.includes(productId)

  const addToCart = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent navigation when clicking add to cart
    
    if (!inStock) return

    const numericPrice = Number.parseFloat(price.replace("₹", ""))

    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: productId,
        title,
        price: numericPrice,
        image,
        category: category || "painting",
      },
    })

    // Show notification
    addNotification({
      type: "success",
      title: "Added to Cart!",
      message: `${title} has been added to your cart.`,
      duration: 3000,
    })
  }

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent navigation when clicking favorite
    favoritesDispatch({
      type: "TOGGLE_FAVORITE",
      payload: productId,
    })

    // Show notification
    const isCurrentlyFavorite = favoritesState.favoriteIds.includes(productId)
    addNotification({
      type: "info",
      title: isCurrentlyFavorite ? "Removed from Favorites" : "Added to Favorites",
      message: `${title} has been ${isCurrentlyFavorite ? "removed from" : "added to"} your favorites.`,
      duration: 2000,
    })
  }

  const handleCardClick = () => {
    if (id) {
      navigate(`/product/${id}`)
    }
  }

  return (
    <div 
      className="group flex flex-col overflow-hidden rounded-lg border border-[#FFF5CC] bg-white shadow-sm transition-all hover:shadow-lg hover:border-[#FFDE59] cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className={`w-full object-cover transition-transform duration-300 group-hover:scale-105 ${aspectClasses[aspectRatio]}`}
        />
        <button 
          onClick={toggleFavorite}
          className={`absolute right-3 top-3 rounded-full bg-white/80 p-2 transition-colors hover:bg-white ${
            isFavorite ? 'text-red-500' : 'text-[#8C7B00] hover:text-[#FFDE59]'
          }`}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h3 className="text-base font-semibold leading-snug text-[#4A3F00] transition-colors group-hover:text-[#FFDE59] truncate">
            {title}
          </h3>
          {description && <p className="mt-1 text-sm font-normal leading-normal text-[#8C7B00]">{description}</p>}
          <p className="mt-2 text-lg font-bold text-[#4A3F00]">{price}</p>
        </div>

        <button
          onClick={addToCart}
          disabled={!inStock}
          className={`mt-4 flex w-full items-center justify-center rounded-md px-4 py-2.5 text-sm font-bold transition-opacity hover:opacity-90 ${
            !inStock
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-[#FFDE59] text-[#4A3F00]"
          }`}
        >
          {!inStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  )
})
