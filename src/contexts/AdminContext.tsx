"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, type ReactNode, useCallback } from "react"
import { useNotifications } from "./NotificationContext"
import type { ProductResponse, OrderResponse, OrderItemResponse, CustomOrderResponse } from "../types/api"
import { api, APIError } from "../lib/api"

export interface Product {
  id: string
  title: string
  price: number
  image: string
  description?: string
  category: "painting" | "craft" | "tote-bag" | "apparel"
  inStock: boolean
  createdAt: Date
  height?: string
  width?: string
  medium?: string
}

export interface Transaction {
  id: string
  items: Array<{
    id: string
    title: string
    price: number
    quantity: number
  }>
  total: number
  customerInfo: {
    name: string
    email: string
    address: string
    phone: string
  }
  status: "pending" | "processing" | "shipped" | "delivered"
  createdAt: Date
  paymentId?: string | null
  isPaid?: boolean
}

export interface CustomOrder {
  id: string
  type: "painting" | "craft"
  description: string
  size?: string
  budget: number
  customerInfo: {
    name: string
    email: string
    phone: string
  }
  status: "pending" | "in-progress" | "completed" | "cancelled"
  createdAt: Date
  referenceImages?: string[]
}

export interface User {
  id: string
  name: string
  email: string
  role: "CUSTOMER" | "ADMIN"
  phone?: string
  address?: string
  city?: string
  zipCode?: string
  phoneVerified?: boolean
  createdAt?: string
}

interface AdminState {
  products: Product[]
  transactions: Transaction[]
  customOrders: CustomOrder[]
  isAdmin: boolean
  user: User | null
  loading: boolean
}

type AdminAction =
  | { type: "SET_PRODUCTS"; payload: Product[] }
  | { type: "SET_TRANSACTIONS"; payload: Transaction[] }
  | { type: "SET_CUSTOM_ORDERS"; payload: CustomOrder[] }
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_ADMIN_STATUS"; payload: boolean }
  | { type: "SET_LOADING"; payload: boolean }

interface AdminContextType {
  state: AdminState
  dispatch: React.Dispatch<AdminAction>
  refreshProducts: () => Promise<void>
  refreshTransactions: () => Promise<void>
  refreshCustomOrders: () => Promise<void>
  fetchSession: () => Promise<User | null>
  logoutUser: () => Promise<void>
}

const AdminContext = createContext<AdminContextType | null>(null)

function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case "SET_PRODUCTS":
      return { ...state, products: action.payload }
    case "SET_TRANSACTIONS":
      return { ...state, transactions: action.payload }
    case "SET_CUSTOM_ORDERS":
      return { ...state, customOrders: action.payload }
    case "SET_USER":
      return { ...state, user: action.payload, isAdmin: action.payload?.role === "ADMIN" }
    case "SET_ADMIN_STATUS":
      return { ...state, isAdmin: action.payload }
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    default:
      return state
  }
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const { addNotification } = useNotifications()
  const [state, dispatch] = useReducer(adminReducer, {
    products: [],
    transactions: [],
    customOrders: [],
    isAdmin: false,
    user: null,
    loading: true
  })

  // 1. Fetch catalog products
  const refreshProducts = useCallback(async () => {
    try {
      const json = await api.get("/api/products?limit=100")
      const formatted: Product[] = json.data.products.map((p: ProductResponse) => ({
        id: p.id,
        title: p.title,
        price: Number(p.price),
        image: p.imageUrl,
        description: p.description || "",
        category: p.category.toLowerCase().replace(/_/g, "-") as any,
        inStock: p.inStock,
        createdAt: new Date(p.createdAt),
        height: p.height || undefined,
        width: p.width || undefined,
        medium: p.medium || undefined
      }))
      dispatch({ type: "SET_PRODUCTS", payload: formatted })
    } catch (err) {
      console.error("Failed to fetch products:", err)
      addNotification({ type: "error", title: "Network Error", message: "Failed to load product catalog." })
    }
  }, [addNotification])

  // 2. Fetch standard transactions (Admin only API)
  const refreshTransactions = useCallback(async () => {
    try {
      const json = await api.get("/api/orders")
      const formatted: Transaction[] = json.data.orders.map((o: OrderResponse) => ({
        id: o.id,
        total: Number(o.totalAmount),
        status: o.status.toLowerCase() as any,
        createdAt: new Date(o.createdAt),
        paymentId: o.paymentId || null,
        isPaid: o.isPaid || false,
        customerInfo: {
          name: o.customerName,
          email: o.customerEmail,
          phone: o.customerPhone,
          address: `${o.shippingAddress}, ${o.shippingCity} - ${o.shippingZipCode}`
        },
        items: (o.items || []).map((i: OrderItemResponse) => ({
          id: i.productId || "",
          title: i.title,
          price: Number(i.price),
          quantity: i.quantity
        }))
      }))
      dispatch({ type: "SET_TRANSACTIONS", payload: formatted })
    } catch (err) {
      console.error("Failed to fetch transactions:", err)
      addNotification({ type: "error", title: "Network Error", message: "Failed to load transactions." })
    }
  }, [addNotification])

  // 3. Fetch custom orders (comissions requests)
  const refreshCustomOrders = useCallback(async () => {
    try {
      const json = await api.get("/api/custom-orders")
      const formatted: CustomOrder[] = json.data.customOrders.map((c: CustomOrderResponse) => ({
        id: c.id,
        type: c.type.toLowerCase() as any,
        description: c.description,
        size: c.size || "",
        budget: Number(c.budget),
        status: c.status.toLowerCase() as any,
        createdAt: new Date(c.createdAt),
        customerInfo: {
          name: c.customerName,
          email: c.customerEmail,
          phone: c.customerPhone
        },
        referenceImages: (c.references || []).map((r: { referenceUrl: string }) => r.referenceUrl)
      }))
      dispatch({ type: "SET_CUSTOM_ORDERS", payload: formatted })
    } catch (err) {
      console.error("Failed to fetch custom orders:", err)
      addNotification({ type: "error", title: "Network Error", message: "Failed to load custom orders." })
    }
  }, [addNotification])

  // 4. Check active auth session
  const fetchSession = useCallback(async (): Promise<User | null> => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const json = await api.get("/api/auth/me")
      const user: User = json.data.user
      dispatch({ type: "SET_USER", payload: user })
      dispatch({ type: "SET_LOADING", payload: false })
      return user
    } catch (err) {
      if (err instanceof APIError && err.status === 401) {
        dispatch({ type: "SET_USER", payload: null })
        dispatch({ type: "SET_LOADING", payload: false })
        return null
      }
      console.error("Session verification failed:", err)
      addNotification({ type: "error", title: "Network Error", message: "Failed to connect to authentication server." })
    }
    dispatch({ type: "SET_USER", payload: null })
    dispatch({ type: "SET_LOADING", payload: false })
    return null
  }, [addNotification])

  // 5. Logout User Session
  const logoutUser = useCallback(async () => {
    try {
      await api.post("/api/auth/logout")
    } catch (err) {
      console.error("Logout API request error:", err)
    }
    dispatch({ type: "SET_USER", payload: null })
    dispatch({ type: "SET_TRANSACTIONS", payload: [] })
    dispatch({ type: "SET_CUSTOM_ORDERS", payload: [] })
  }, [])

  // Load initial products and auth session on mount
  useEffect(() => {
    refreshProducts()
    fetchSession()
  }, [refreshProducts, fetchSession])

  return (
    <AdminContext.Provider
      value={{
        state,
        dispatch,
        refreshProducts,
        refreshTransactions,
        refreshCustomOrders,
        fetchSession,
        logoutUser
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}
