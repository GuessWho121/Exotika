"use client"
import { useNavigate } from "react-router-dom"
import { Plus, Minus, Trash2 } from 'lucide-react'
import { useCart } from "../contexts/CartContext"

export function Cart() {
  const { state, dispatch } = useCart()
  const navigate = useNavigate()

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  }

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })
  }

  const handleCheckout = () => {
    navigate("/checkout")
  }

  if (state.items.length === 0) {
    return (
      <div className="flex w-full max-w-7xl flex-1 flex-col items-center justify-center py-12">
        <div className="text-center">
          <h1 className="mb-4 text-3xl font-bold text-[#4A3F00]">Your Cart is Empty</h1>
          <p className="mb-8 text-[#8C7B00]">Add some beautiful items to your cart to get started.</p>
          <button
            onClick={() => navigate("/")}
            className="rounded-lg bg-[#FFDE59] px-6 py-3 font-semibold text-[#4A3F00] transition-opacity hover:opacity-90"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-7xl flex-1 flex-col">
      <h1 className="mb-8 text-3xl font-bold text-[#4A3F00]">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {state.items.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-lg border border-[#FFF5CC] bg-white p-6 shadow-sm">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  className="h-24 w-24 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#4A3F00]">{item.title}</h3>
                  <p className="text-[#8C7B00]">₹{item.price.toFixed(2)} each</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="rounded-full p-2 text-[#8C7B00] hover:bg-[#FFFBEB]"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center font-medium text-[#4A3F00]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="rounded-full p-2 text-[#8C7B00] hover:bg-[#FFFBEB]"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-[#4A3F00]">₹{(item.price * item.quantity).toFixed(2)}</span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="rounded-full p-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-[#FFF5CC] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-[#4A3F00]">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-[#8C7B00]">
                <span>Subtotal ({state.itemCount} items)</span>
                <span>₹{state.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#8C7B00]">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t border-[#FFF5CC] pt-2">
                <div className="flex justify-between text-lg font-semibold text-[#4A3F00]">
                  <span>Total</span>
                  <span>₹{state.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="mt-6 w-full rounded-lg bg-[#FFDE59] px-4 py-3 font-semibold text-[#4A3F00] transition-opacity hover:opacity-90"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
