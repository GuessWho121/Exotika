"use client"

import { useState } from "react"
import { User, Package, Settings, Heart, MapPin, Phone, Mail, Edit, Save, X } from 'lucide-react'
import { useNavigate } from "react-router-dom"
import { useAdmin } from "../contexts/AdminContext"
import { useFavorites } from "../contexts/FavoritesContext"

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  zipCode: string
  avatar?: string
  joinedDate: Date
  preferences: {
    newsletter: boolean
    orderUpdates: boolean
    promotions: boolean
  }
}

export function Profile() {
  const { state } = useAdmin()
  const { state: favoritesState, dispatch: favoritesDispatch } = useFavorites()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "favorites" | "settings">("profile")
  const [isEditing, setIsEditing] = useState(false)

  // Mock user data - in a real app, this would come from authentication context
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: "user-1",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+91 98765 43210",
    address: "123 Art Street",
    city: "Mumbai",
    zipCode: "400001",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAlIMID0Rr8XwiipX30IfJWh5uxepFRXeunLhP1r9_w2vO8DwP_07xhtwoNa8OuGe0RCzDq2wYXdlFBdQbyydjzhPo7MQZxRURF3vg57EwHaoRqeSfuJNndeI9ihSBp8_3VTIRKg8F9uynryPNh8La3GAwnRQFoLFzfw15fy900ncuB7hzpZZZsc8RbRZJqKq1I7ECBdc9WLSSGL_YYN85YhBXW5dKlnDMVrK69WSziKim-aCIAtb33ymaMn0R-Qcwdn5ck3UoZKqcS",
    joinedDate: new Date("2023-06-15"),
    preferences: {
      newsletter: true,
      orderUpdates: true,
      promotions: false,
    },
  })

  const [editForm, setEditForm] = useState(userProfile)

  // Get favorite items from the admin state based on favorites context
  const favoriteItems = state.products.filter(product => 
    favoritesState.favoriteIds.includes(product.id)
  )

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "Orders", icon: Package },
    { id: "favorites", label: "Favorites", icon: Heart },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const

  const handleSave = () => {
    setUserProfile(editForm)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditForm(userProfile)
    setIsEditing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleFavoriteClick = (productId: string) => {
    navigate(`/product/${productId}`)
  }

  const removeFavorite = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    favoritesDispatch({
      type: "REMOVE_FAVORITE",
      payload: productId,
    })
  }

  return (
    <div className="flex w-full max-w-7xl flex-1 flex-col">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold text-[#4A3F00]">My Account</h1>
        <p className="text-[#8C7B00]">Manage your profile, orders, and preferences.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-[#FFF5CC] bg-white p-6 shadow-sm">
            {/* Profile Summary */}
            <div className="mb-6 text-center">
              <img
                src={userProfile.avatar || "/placeholder.svg?height=80&width=80"}
                alt={userProfile.name}
                className="mx-auto mb-3 h-20 w-20 rounded-full object-cover"
              />
              <h3 className="font-semibold text-[#4A3F00]">{userProfile.name}</h3>
              <p className="text-sm text-[#8C7B00]">Member since {userProfile.joinedDate.getFullYear()}</p>
            </div>

            {/* Navigation Tabs */}
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "bg-[#FFDE59] text-[#4A3F00]"
                        : "text-[#8C7B00] hover:bg-[#FFFBEB] hover:text-[#4A3F00]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                    {tab.id === "favorites" && favoriteItems.length > 0 && (
                      <span className="rounded-full bg-[#FFDE59] px-2 py-1 text-xs font-bold text-[#4A3F00]">
                        {favoriteItems.length}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="rounded-lg border border-[#FFF5CC] bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#4A3F00]">Profile Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 rounded-lg bg-[#FFDE59] px-4 py-2 text-sm font-medium text-[#4A3F00] transition-opacity hover:opacity-90"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 rounded-lg border border-[#FFF5CC] px-4 py-2 text-sm font-medium text-[#4A3F00] transition-colors hover:bg-[#FFFBEB]"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[#4A3F00]">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="mt-1 block w-full rounded-lg border border-[#FFF5CC] bg-[#FFFBEB] px-3 py-2 text-[#4A3F00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]"
                    />
                  ) : (
                    <div className="mt-1 flex items-center gap-2 text-[#8C7B00]">
                      <User className="h-4 w-4" />
                      {userProfile.name}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4A3F00]">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="mt-1 block w-full rounded-lg border border-[#FFF5CC] bg-[#FFFBEB] px-3 py-2 text-[#4A3F00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]"
                    />
                  ) : (
                    <div className="mt-1 flex items-center gap-2 text-[#8C7B00]">
                      <Mail className="h-4 w-4" />
                      {userProfile.email}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4A3F00]">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="mt-1 block w-full rounded-lg border border-[#FFF5CC] bg-[#FFFBEB] px-3 py-2 text-[#4A3F00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]"
                    />
                  ) : (
                    <div className="mt-1 flex items-center gap-2 text-[#8C7B00]">
                      <Phone className="h-4 w-4" />
                      {userProfile.phone}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4A3F00]">City</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="mt-1 block w-full rounded-lg border border-[#FFF5CC] bg-[#FFFBEB] px-3 py-2 text-[#4A3F00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]"
                    />
                  ) : (
                    <div className="mt-1 flex items-center gap-2 text-[#8C7B00]">
                      <MapPin className="h-4 w-4" />
                      {userProfile.city}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#4A3F00]">Address</label>
                  {isEditing ? (
                    <textarea
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full rounded-lg border border-[#FFF5CC] bg-[#FFFBEB] px-3 py-2 text-[#4A3F00] focus:border-[#FFDE59] focus:outline-none focus:ring-2 focus:ring-[#FFDE59]"
                    />
                  ) : (
                    <div className="mt-1 text-[#8C7B00]">
                      {userProfile.address}, {userProfile.city} {userProfile.zipCode}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="rounded-lg border border-[#FFF5CC] bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold text-[#4A3F00]">Order History</h2>
              {state.transactions.length === 0 ? (
                <div className="py-12 text-center">
                  <Package className="mx-auto mb-4 h-12 w-12 text-[#8C7B00]" />
                  <h3 className="mb-2 text-lg font-semibold text-[#4A3F00]">No orders yet</h3>
                  <p className="text-[#8C7B00]">Start shopping to see your orders here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.transactions.map((transaction) => (
                    <div key={transaction.id} className="rounded-lg border border-[#FFF5CC] p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="font-semibold text-[#4A3F00]">Order #{transaction.id}</h3>
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </div>
                          <p className="text-sm text-[#8C7B00] mb-2">
                            {transaction.createdAt.toLocaleDateString()} • {transaction.items.length} item(s)
                          </p>
                          <div className="space-y-1">
                            {transaction.items.map((item, index) => (
                              <div key={index} className="text-sm text-[#8C7B00]">
                                {item.title} × {item.quantity}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-[#4A3F00]">₹{transaction.total.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === "favorites" && (
            <div className="rounded-lg border border-[#FFF5CC] bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold text-[#4A3F00]">Favorite Items</h2>
              {favoriteItems.length === 0 ? (
                <div className="py-12 text-center">
                  <Heart className="mx-auto mb-4 h-12 w-12 text-[#8C7B00]" />
                  <h3 className="mb-2 text-lg font-semibold text-[#4A3F00]">No favorites yet</h3>
                  <p className="text-[#8C7B00]">Save items you love to see them here.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {favoriteItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="group cursor-pointer rounded-lg border border-[#FFF5CC] p-4 transition-shadow hover:shadow-md"
                      onClick={() => handleFavoriteClick(item.id)}
                    >
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="mb-3 h-32 w-full rounded-lg object-cover"
                      />
                      <h3 className="font-semibold text-[#4A3F00] mb-1 group-hover:text-[#FFDE59] transition-colors">{item.title}</h3>
                      <p className="text-sm text-[#8C7B00] mb-2 capitalize">{item.category.replace("-", " ")}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#4A3F00]">₹{item.price.toFixed(2)}</span>
                        <button 
                          onClick={(e) => removeFavorite(item.id, e)}
                          className="rounded-full p-2 text-red-500 hover:bg-red-50"
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* Notification Preferences */}
              <div className="rounded-lg border border-[#FFF5CC] bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-[#4A3F00]">Notification Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-[#4A3F00]">Newsletter</h3>
                      <p className="text-sm text-[#8C7B00]">Receive updates about new artworks and collections</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={userProfile.preferences.newsletter}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          preferences: { ...userProfile.preferences, newsletter: e.target.checked },
                        })
                      }
                      className="h-4 w-4 rounded border-[#FFF5CC] text-[#FFDE59] focus:ring-[#FFDE59]"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-[#4A3F00]">Order Updates</h3>
                      <p className="text-sm text-[#8C7B00]">Get notified about your order status</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={userProfile.preferences.orderUpdates}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          preferences: { ...userProfile.preferences, orderUpdates: e.target.checked },
                        })
                      }
                      className="h-4 w-4 rounded border-[#FFF5CC] text-[#FFDE59] focus:ring-[#FFDE59]"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-[#4A3F00]">Promotions</h3>
                      <p className="text-sm text-[#8C7B00]">Receive special offers and discounts</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={userProfile.preferences.promotions}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          preferences: { ...userProfile.preferences, promotions: e.target.checked },
                        })
                      }
                      className="h-4 w-4 rounded border-[#FFF5CC] text-[#FFDE59] focus:ring-[#FFDE59]"
                    />
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div className="rounded-lg border border-[#FFF5CC] bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-[#4A3F00]">Account Actions</h2>
                <div className="space-y-4">
                  <button className="w-full rounded-lg border border-[#FFDE59] px-4 py-3 text-left font-medium text-[#4A3F00] transition-colors hover:bg-[#FFFBEB]">
                    Change Password
                  </button>
                  <button className="w-full rounded-lg border border-[#FFDE59] px-4 py-3 text-left font-medium text-[#4A3F00] transition-colors hover:bg-[#FFFBEB]">
                    Download My Data
                  </button>
                  <button className="w-full rounded-lg border border-red-300 px-4 py-3 text-left font-medium text-red-600 transition-colors hover:bg-red-50">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
