"use client"

import type React from "react"

import { createContext, useContext, useReducer, type ReactNode } from "react"

export interface Product {
id: string
title: string
price: number
image: string
description?: string
category: "painting" | "craft" | "tote-bag"
inStock: boolean
createdAt: Date
// Additional fields for paintings
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
referenceImages?: string[] // Array of base64 image strings
}

interface AdminState {
products: Product[]
transactions: Transaction[]
customOrders: CustomOrder[]
isAdmin: boolean // Added isAdmin state
}

type AdminAction =
| { type: "ADD_PRODUCT"; payload: Omit<Product, "id" | "createdAt"> }
| { type: "UPDATE_PRODUCT"; payload: Product }
| { type: "DELETE_PRODUCT"; payload: string }
| { type: "ADD_TRANSACTION"; payload: Omit<Transaction, "id" | "createdAt"> }
| { type: "UPDATE_TRANSACTION_STATUS"; payload: { id: string; status: Transaction["status"] } }
| { type: "ADD_CUSTOM_ORDER"; payload: Omit<CustomOrder, "id" | "createdAt"> }
| { type: "UPDATE_CUSTOM_ORDER_STATUS"; payload: { id: string; status: CustomOrder["status"] } }
| { type: "SET_ADMIN_STATUS"; payload: boolean } // Added action type

const AdminContext = createContext<{
state: AdminState
dispatch: React.Dispatch<AdminAction>
} | null>(null)

// Sample initial data with rupees
const initialProducts: Product[] = [
{
  id: "1",
  title: "Vibrant Sunset",
  price: 15000,
  image:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCQXUUOu8-Ftxlj8LN_4MLnolOEWM838mOfrJi7oXk9dMFcN_rus5L5fhypsp3oTu89tKlE1UE3fMY_kpx_aHjbDlrFT7KBoQ1Bfd-T2-iz2qx1StCNV2dNySE7IwBrVmUgHiTve1-kXSk165bS-HxerPVVOK0k5Nx67tLyyqzbVpnDl2r_nHJfJABsdM-QUx4dJpZByiVvOIflPKMqaYYVpRc2c9nWBay5V9gGIRuES59Wu7I3--zKZCGtAXX9o4JS6d5uxu10M2yQ",
  category: "painting",
  inStock: true,
  createdAt: new Date("2024-01-15"),
  height: "20",
  width: "16",
  medium: "Acrylic on Canvas",
},
{
  id: "2",
  title: "Handmade Ceramic Bowl",
  price: 3750,
  image:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCWhaAhSnzROQO65Ls7V8WOBWoQvUowtQc6afr-mJpB28BvHKIPoYZtDWHS-L7HTtLK1x3WVxhfO2c88w76keXDO9fFq8nBesMq3-xWxSOlGgx9O_283gPrEVjqd-uSudzaldRJGCtEX9Jj8eBBKzTeCk-_SBAP_dxThVFwoi8jZ3RR91uWuef94TJoQ3yPwNE8HpOltcdijf4eHeOVkUtx1ICgxY9ugrB-DX1dBNGkm2fRDM-qM-apabS0bIodBpwo78wmynQ-9Qjt",
  category: "craft",
  inStock: true,
  createdAt: new Date("2024-01-20"),
},
{
  id: "3",
  title: "Floral Symphony Tote",
  price: 2100,
  image:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCPq7r7Zc_62QlWRGfVq2E81FmWGpCWCfdIO3RghgDn_Zdcu9e7Wwu0-Jids6xuc8-_NunsHE814Y90nmV5JR13av-CHX0i6AgJjrA_42DuExbqZLUPloD6S13XOw-xE22VOkX0amWoaaQZ5nrjm7z11dKC9X3uAkKHdcSSO_Nl0cYtTammHcu7wlGNvmsvtwyOLlYGaqZQwAw1gvphLDRRJZuzuAqLwIIU4nMNGtomk42CP7Ej8VRLZahnzLLNM07Cn5T_zv8y8kY-",
  category: "tote-bag",
  inStock: true,
  createdAt: new Date("2024-01-25"),
},
]

function adminReducer(state: AdminState, action: AdminAction): AdminState {
switch (action.type) {
  case "ADD_PRODUCT":
    return {
      ...state,
      products: [
        ...state.products,
        {
          ...action.payload,
          id: Date.now().toString(),
          createdAt: new Date(),
        },
      ],
    }

  case "UPDATE_PRODUCT":
    return {
      ...state,
      products: state.products.map((product) => (product.id === action.payload.id ? action.payload : product)),
    }

  case "DELETE_PRODUCT":
    return {
      ...state,
      products: state.products.filter((product) => product.id !== action.payload),
    }

  case "ADD_TRANSACTION":
    return {
      ...state,
      transactions: [
        ...state.transactions,
        {
          ...action.payload,
          id: Date.now().toString(),
          createdAt: new Date(),
        },
      ],
    }

  case "UPDATE_TRANSACTION_STATUS":
    return {
      ...state,
      transactions: state.transactions.map((transaction) =>
        transaction.id === action.payload.id ? { ...transaction, status: action.payload.status } : transaction,
      ),
    }

  case "ADD_CUSTOM_ORDER":
    return {
      ...state,
      customOrders: [
        ...state.customOrders,
        {
          ...action.payload,
          id: Date.now().toString(),
          createdAt: new Date(),
        },
      ],
    }

  case "UPDATE_CUSTOM_ORDER_STATUS":
    return {
      ...state,
      customOrders: state.customOrders.map((order) =>
        order.id === action.payload.id ? { ...order, status: action.payload.status } : order,
      ),
    }

  case "SET_ADMIN_STATUS": // New case for setting admin status
    return {
      ...state,
      isAdmin: action.payload,
    }

  default:
    return state
}
}

export function AdminProvider({ children }: { children: ReactNode }) {
const [state, dispatch] = useReducer(adminReducer, {
  products: initialProducts,
  transactions: [],
  customOrders: [],
  isAdmin: false, // Initial state for isAdmin
})

return <AdminContext.Provider value={{ state, dispatch }}>{children}</AdminContext.Provider>
}

export function useAdmin() {
const context = useContext(AdminContext)
if (!context) {
  throw new Error("useAdmin must be used within an AdminProvider")
}
return context
}
