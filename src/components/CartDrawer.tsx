"use client"
import { X, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCart } from "../contexts/CartContext"

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  onCheckout: () => void
}

export function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const { state, dispatch } = useCart()

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  }

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#FFF5CC] p-4">
            <h2 className="text-lg font-semibold text-[#4A3F00]">Shopping Cart</h2>
            <button onClick={onClose} className="rounded-full p-2 text-[#8C7B00] hover:bg-[#FFFBEB]">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {state.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingBag className="h-12 w-12 text-[#8C7B00] mb-4" />
                <p className="text-[#8C7B00]">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div key={item.id} className="flex gap-4 rounded-lg border border-[#FFF5CC] p-4">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-[#4A3F00]">{item.title}</h3>
                      <p className="text-sm text-[#8C7B00]">₹{item.price.toFixed(2)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="rounded-full p-1 text-[#8C7B00] hover:bg-[#FFFBEB]"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-[#4A3F00]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="rounded-full p-1 text-[#8C7B00] hover:bg-[#FFFBEB]"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-auto text-sm text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {state.items.length > 0 && (
            <div className="border-t border-[#FFF5CC] p-4">
              <div className="mb-4 flex justify-between text-lg font-semibold text-[#4A3F00]">
                <span>Total:</span>
                <span>₹{state.total.toFixed(2)}</span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full rounded-lg bg-[#FFDE59] px-4 py-3 font-semibold text-[#4A3F00] transition-opacity hover:opacity-90"
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
