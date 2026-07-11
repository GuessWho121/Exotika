"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, useState, type ReactNode } from "react"
import { useAdmin } from "./AdminContext"

export interface CartItem {
  id: string
  title: string
  price: number
  image: string
  quantity: number
  category: "painting" | "craft" | "tote-bag" | "apparel"
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity"> }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "INIT_CART"; payload: CartState }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
} | null>(null)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "INIT_CART": {
      return action.payload
    }

    case "ADD_ITEM": {
      const existingItem = state.items.find((item) => item.id === action.payload.id)

      if (existingItem) {
        const updatedItems = state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
        return {
          ...state,
          items: updatedItems,
          total: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
          itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        }
      }

      const newItems = [...state.items, { ...action.payload, quantity: 1 }]
      return {
        ...state,
        items: newItems,
        total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
      }
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter((item) => item.id !== action.payload)
      return {
        ...state,
        items: newItems,
        total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
      }
    }

    case "UPDATE_QUANTITY": {
      const newItems = state.items
        .map((item) =>
          item.id === action.payload.id ? { ...item, quantity: Math.max(0, action.payload.quantity) } : item,
        )
        .filter((item) => item.quantity > 0)

      return {
        ...state,
        items: newItems,
        total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
      }
    }

    case "CLEAR_CART":
      return {
        items: [],
        total: 0,
        itemCount: 0,
      }

    default:
      return state
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
  })
  const [isInitialized, setIsInitialized] = useState(false)
  const { state: adminState } = useAdmin()
  const user = adminState.user

  // Load initial cart from localStorage or backend database on mount/login change
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        try {
          // 1. Fetch user's cart from database
          const res = await fetch("/api/cart")
          if (res.ok) {
            const json = await res.json()
            const dbItems = json.data.items || []
            
            // 2. Check if we have guest items in localStorage to merge
            const saved = localStorage.getItem("exotika_cart")
            let localItems = []
            if (saved) {
              const parsed = JSON.parse(saved)
              if (parsed && Array.isArray(parsed.items)) {
                localItems = parsed.items
              }
            }

            if (localItems.length > 0) {
              // Merge local guest items into database cart
              const mergedMap = new Map<string, any>()
              dbItems.forEach((item: any) => {
                mergedMap.set(item.id, item)
              })
              
              localItems.forEach((item: any) => {
                if (mergedMap.has(item.id)) {
                  const existing = mergedMap.get(item.id)
                  mergedMap.set(item.id, {
                    ...existing,
                    quantity: existing.quantity + item.quantity
                  })
                } else {
                  mergedMap.set(item.id, item)
                }
              })

              const mergedItems = Array.from(mergedMap.values())
              
              // Save the merged cart to the database
              const syncRes = await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  items: mergedItems.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                  }))
                })
              })

              if (syncRes.ok) {
                const syncJson = await syncRes.json()
                const updatedItems = syncJson.data.items || []
                
                dispatch({
                  type: "INIT_CART",
                  payload: {
                    items: updatedItems,
                    total: updatedItems.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0),
                    itemCount: updatedItems.reduce((sum: number, i: any) => sum + i.quantity, 0)
                  }
                })
                
                // Clear guest cart
                localStorage.removeItem("exotika_cart")
              }
            } else {
              // No guest cart to merge, just initialize with DB cart
              dispatch({
                type: "INIT_CART",
                payload: {
                  items: dbItems,
                  total: dbItems.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0),
                  itemCount: dbItems.reduce((sum: number, i: any) => sum + i.quantity, 0)
                }
              })
            }
          }
        } catch (err) {
          console.error("Failed to load user cart from database:", err)
        } finally {
          setIsInitialized(true)
        }
      } else {
        // Guest mode: load from localStorage
        try {
          const saved = localStorage.getItem("exotika_cart")
          if (saved) {
            const parsed = JSON.parse(saved)
            if (parsed && Array.isArray(parsed.items)) {
              dispatch({ type: "INIT_CART", payload: parsed })
            }
          } else {
            dispatch({
              type: "INIT_CART",
              payload: { items: [], total: 0, itemCount: 0 }
            })
          }
        } catch (err) {
          console.error("Failed to load cart from localStorage:", err)
        } finally {
          setIsInitialized(true)
        }
      }
    }

    loadCart()
  }, [user])

  // Persist cart changes to localStorage or DB
  useEffect(() => {
    if (isInitialized) {
      if (user) {
        const syncCartWithDb = async () => {
          try {
            await fetch("/api/cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                items: state.items.map(item => ({
                  productId: item.id,
                  quantity: item.quantity
                }))
              })
            })
          } catch (err) {
            console.error("Failed to sync cart with database:", err)
          }
        }
        syncCartWithDb()
      } else {
        try {
          localStorage.setItem("exotika_cart", JSON.stringify(state))
        } catch (err) {
          console.error("Failed to save cart to localStorage:", err)
        }
      }
    }
  }, [state, isInitialized, user])

  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
