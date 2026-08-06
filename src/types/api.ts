export interface ProductResponse {
  id: string
  title: string
  price: string | number
  imageUrl: string
  description?: string | null
  category: string
  inStock: boolean
  createdAt: string
  height?: string | null
  width?: string | null
  medium?: string | null
}

export interface OrderItemResponse {
  productId?: string | null
  title: string
  price: string | number
  quantity: number
}

export interface OrderResponse {
  id: string
  totalAmount: string | number
  status: string
  createdAt: string
  paymentId?: string | null
  isPaid?: boolean
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: string
  shippingCity: string
  shippingZipCode: string
  items?: OrderItemResponse[]
}

export interface CustomOrderResponse {
  id: string
  type: string
  description: string
  size?: string | null
  budget: string | number
  status: string
  createdAt: string
  customerName: string
  customerEmail: string
  customerPhone: string
  references?: Array<{ referenceUrl: string }>
}

export interface UserAddressResponse {
  id: string
  userId: string
  title: string
  name: string
  phone: string
  address: string
  city: string
  zipCode: string
  country: string
  createdAt: string
}

export interface FavoriteApiResponse {
  id: string
  title: string
  price: string | number
  imageUrl: string
}

export interface CartItemApiResponse {
  id: string
  productId: string
  title: string
  price: number
  quantity: number
  imageUrl?: string
}

export interface GooglePlaceSuggestion {
  place_id: string
  description: string
  structured_formatting?: {
    main_text: string
    secondary_text?: string
  }
}
