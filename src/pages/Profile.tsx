"use client"

import { useState, useEffect, useRef } from "react"
import { User, Package, Settings, Heart, MapPin, Phone, Mail, Edit, Save, X } from 'lucide-react'
import { useNavigate, useLocation } from "react-router-dom"
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
  const { state: adminState, fetchSession } = useAdmin()
  const { state: favoritesState, dispatch: favoritesDispatch } = useFavorites()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "favorites" | "settings">("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [editForm, setEditForm] = useState<UserProfile | null>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  const user = adminState.user

  // Synchronize URL search params with active tab state
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tab = params.get("tab")
    if (tab === "orders" || tab === "favorites" || tab === "settings" || tab === "profile") {
      setActiveTab(tab as any)
    }
  }, [location.search])

  const changeTab = (tabId: "profile" | "orders" | "favorites" | "settings") => {
    setActiveTab(tabId)
    navigate(`/profile?tab=${tabId}`, { replace: true })
  }

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (user && activeTab === "orders") {
      const fetchOrders = async () => {
        setLoadingOrders(true)
        try {
          const res = await fetch("/api/orders")
          if (res.ok) {
            const json = await res.json()
            setOrders(json.data.orders || [])
          }
        } catch (err) {
          console.error("Failed to fetch orders:", err)
        } finally {
          setLoadingOrders(false)
        }
      }
      fetchOrders()
    }
  }, [user, activeTab])

  // Session verification and redirect
  useEffect(() => {
    if (!adminState.loading && !user) {
      navigate("/login")
    }
  }, [user, adminState.loading, navigate])

  // Sync user profile state
  useEffect(() => {
    if (user) {
      const profileData: UserProfile = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        zipCode: user.zipCode || "",
        joinedDate: new Date(),
        preferences: {
          newsletter: true,
          orderUpdates: true,
          promotions: false
        }
      }
      setUserProfile(profileData)
      setEditForm(profileData)
    }
  }, [user])

  // Get favorite items from the admin state based on favorites context
  const favoriteItems = adminState.products.filter(product => 
    favoritesState.favoriteIds.includes(product.id)
  )

  // Address book state management
  const [addresses, setAddresses] = useState<any[]>([])
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [addressForm, setAddressForm] = useState({
    title: "Home",
    name: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    country: "India"
  })

  // Verification states
  const [isBookAddressVerified, setIsBookAddressVerified] = useState(false)
  const fetchAddresses = async () => {
    setLoadingAddresses(true)
    try {
      const res = await fetch("/api/auth/addresses")
      if (res.ok) {
        const json = await res.json()
        setAddresses(json.data.addresses || [])
      }
    } catch (err) {
      console.error("Failed to fetch addresses:", err)
    } finally {
      setLoadingAddresses(false)
    }
  }

  useEffect(() => {
    if (user && activeTab === "settings") {
      fetchAddresses()
    }
  }, [user, activeTab])

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingAddressId 
        ? `/api/auth/addresses/${editingAddressId}` 
        : "/api/auth/addresses"
      const method = editingAddressId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressForm)
      })

      if (res.ok) {
        setIsAddressFormOpen(false)
        setEditingAddressId(null)
        setAddressForm({
          title: "Home",
          name: "",
          phone: "",
          address: "",
          city: "",
          zipCode: "",
          country: "India"
        })
        fetchAddresses()
      } else {
        alert("Failed to save address. Please check input requirements.")
      }
    } catch (err) {
      console.error("Error saving address:", err)
    }
  }

  const handleAddressEditInit = (addr: any) => {
    setEditingAddressId(addr.id)
    setAddressForm({
      title: addr.title,
      name: addr.name,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      zipCode: addr.zipCode,
      country: addr.country || "India"
    })
    setIsBookAddressVerified(true)
    setIsAddressFormOpen(true)
  }

  const handleAddressDelete = async (addrId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return
    try {
      const res = await fetch(`/api/auth/addresses/${addrId}`, {
        method: "DELETE"
      })
      if (res.ok) {
        fetchAddresses()
      } else {
        alert("Failed to delete address.")
      }
    } catch (err) {
      console.error("Error deleting address:", err)
    }
  }

  const [bookSuggestions, setBookSuggestions] = useState<any[]>([])
  const [showBookSuggestions, setShowBookSuggestions] = useState(false)
  const bookContainerRef = useRef<HTMLDivElement>(null)

  const cleanQueryForGooglePlaces = (query: string): string => {
    let cleaned = query
    // 1. Remove leading room/flat numbers with hyphen/slashes, e.g., "1111 - Block B, SKA..." -> "Block B, SKA..."
    cleaned = cleaned.replace(/^\d+[-/]\d+\s*[-/]?\s*/i, '')
    cleaned = cleaned.replace(/^\d+\s*[-/]\s*/i, '')
    // 2. Remove flat/apartment prefixes, e.g., "Flat 101", "Flat No 101", "Apt 2B", "Apt-2B"
    cleaned = cleaned.replace(/\b(flat|apt|apartment|room|house|villa|no|num|number)\.?\s*\d+[a-zA-Z]?\b\s*[-/,\s]*/i, '')
    // 3. Remove typical unit patterns like "A-101", "F-302", "Block B"
    cleaned = cleaned.replace(/\b[a-zA-Z]-\d+\b\s*[-/,\s]*/i, '')
    cleaned = cleaned.replace(/\b(block|wing|tower)\s*[a-zA-Z0-9]\b\s*[-/,\s]*/i, '')
    // 4. Clean leading commas/spaces
    cleaned = cleaned.replace(/^[,.\-\s]+/, '')
    return cleaned.trim()
  }

  const getCountryCode = (countryName: string): string => {
    const map: {[key: string]: string} = {
      "india": "IN",
      "united states": "US",
      "united kingdom": "GB",
      "canada": "CA",
      "australia": "AU",
      "germany": "DE",
      "france": "FR",
      "japan": "JP",
      "singapore": "SG",
      "united arab emirates": "AE"
    }
    return map[countryName.toLowerCase()] || ""
  }



  const handleBookSuggestionSelect = (suggestion: any) => {
    setShowBookSuggestions(false)
    if (!window.google || !window.google.maps) return

    const placesService = new window.google.maps.places.PlacesService(document.createElement('div'))
    placesService.getDetails(
      {
        placeId: suggestion.place_id,
        fields: ["address_components", "geometry", "name"]
      },
      (place: any, status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place && place.address_components) {
          let streetAddress = ""
          let sublocality = ""
          let city = ""
          let zipCode = ""
          let country = "India"

          for (const component of place.address_components) {
            const types = component.types
            if (types.includes("street_number")) {
              streetAddress = component.long_name + " " + streetAddress
            } else if (types.includes("route")) {
              streetAddress = streetAddress + component.long_name
            } else if (types.includes("sublocality") || types.includes("neighborhood")) {
              sublocality = sublocality + (sublocality ? ", " : "") + component.long_name
            } else if (types.includes("locality") || types.includes("administrative_area_level_2")) {
              city = component.long_name
            } else if (types.includes("postal_code")) {
              zipCode = component.long_name
            } else if (types.includes("country")) {
              country = component.long_name
            }
          }

          const finalAddress = [streetAddress.trim(), sublocality.trim()].filter(Boolean).join(", ") || place.name || suggestion.structured_formatting.main_text
          setAddressForm(prev => ({
            ...prev,
            address: finalAddress,
            city: city,
            zipCode: zipCode,
            country: country
          }))
          setIsBookAddressVerified(true)
        }
      }
    )
  }

  // Google autocomplete dynamic loader
  useEffect(() => {
    const apiKey = (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY
    if (apiKey) {
      if (!window.google) {
        const scriptId = "google-maps-api-script"
        let script = document.getElementById(scriptId) as HTMLScriptElement
        if (!script) {
          script = document.createElement("script")
          script.id = scriptId
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
          script.async = true
          script.defer = true
          script.onload = () => {
            console.log("Google Maps script loaded inside Profile.")
          }
          document.head.appendChild(script)
        }
      }
    }
  }, [])

  // Close suggestions overlay when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (bookContainerRef.current && !bookContainerRef.current.contains(e.target as Node)) {
        setShowBookSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [])





  const handleBookAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setAddressForm(prev => ({ ...prev, address: val }))
    setIsBookAddressVerified(false)

    if (val.trim().length < 3 || !window.google || !window.google.maps || !window.google.maps.places) {
      setBookSuggestions([])
      setShowBookSuggestions(false)
      return
    }

    const cleanedQuery = cleanQueryForGooglePlaces(val)
    if (!cleanedQuery) return

    const cc = getCountryCode(addressForm.country || "India")
    const service = new window.google.maps.places.AutocompleteService()
    service.getPlacePredictions(
      {
        input: cleanedQuery,
        types: ["address"],
        ...(cc ? { componentRestrictions: { country: cc } } : {})
      },
      (predictions: any, status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setBookSuggestions(predictions)
          setShowBookSuggestions(true)
        } else {
          setBookSuggestions([])
          setShowBookSuggestions(false)
        }
      }
    )
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "Orders", icon: Package },
    { id: "favorites", label: "Favorites", icon: Heart },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const

  const handleSave = async () => {
    if (!editForm) return
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          phone: editForm.phone,
          address: editForm.address,
          city: editForm.city,
          zipCode: editForm.zipCode
        })
      })
      if (res.ok) {
        await fetchSession()
        setIsEditing(false)
      } else {
        alert("Failed to update profile settings.")
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleCancel = () => {
    if (userProfile) {
      setEditForm(userProfile)
    }
    setIsEditing(false)
  }

  if (!userProfile || !editForm) {
    return <div className="py-20 text-center text-[#4A3F00]">Loading profile...</div>
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
                    onClick={() => changeTab(tab.id)}
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
            <div className="space-y-6">
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


              </div>
            </div>

              {/* Address Book */}
              <div className="rounded-lg border border-[#FFF5CC] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-[#FFF5CC] pb-3">
                  <h2 className="text-xl font-bold text-[#4A3F00]">Address Book</h2>
                  {!isAddressFormOpen && (
                    <button
                      onClick={() => {
                        setEditingAddressId(null)
                        setAddressForm({
                          title: "Home",
                          name: "",
                          phone: "",
                          address: "",
                          city: "",
                          zipCode: "",
                          country: "India"
                        })
                        setIsBookAddressVerified(false)
                        setIsAddressFormOpen(true)
                      }}
                      className="rounded-lg bg-[#FFDE59] px-4 py-2 text-sm font-bold text-[#4A3F00] transition-opacity hover:opacity-90"
                    >
                      Add New Address
                    </button>
                  )}
                </div>

                {isAddressFormOpen ? (
                  <form onSubmit={handleAddressSubmit} className="space-y-4 border border-[#E6C747] p-4 rounded-xl bg-[#FFFBEB]/30">
                    <h3 className="font-bold text-md text-[#4A3F00]">
                      {editingAddressId ? "Edit Shipping Address" : "Add Shipping Address"}
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#4A3F00] mb-1">Label (e.g. Home, Office)</label>
                        <input
                          type="text"
                          value={addressForm.title}
                          onChange={(e) => setAddressForm({ ...addressForm, title: e.target.value })}
                          required
                          className="w-full rounded-lg border border-[#E6C747] bg-[#FFFBEB] px-3 py-2 text-sm text-[#4A3F00] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#4A3F00] mb-1">Recipient Name</label>
                        <input
                          type="text"
                          value={addressForm.name}
                          onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                          required
                          className="w-full rounded-lg border border-[#E6C747] bg-[#FFFBEB] px-3 py-2 text-sm text-[#4A3F00] outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#4A3F00] mb-1">Phone Number</label>
                        <input
                          type="text"
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          required
                          className="w-full rounded-lg border border-[#E6C747] bg-[#FFFBEB] px-3 py-2 text-sm text-[#4A3F00] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#4A3F00] mb-1">Country</label>
                        <input
                          type="text"
                          value={addressForm.country}
                          onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                          required
                          className="w-full rounded-lg border border-[#E6C747] bg-[#FFFBEB] px-3 py-2 text-sm text-[#4A3F00] outline-none"
                        />
                      </div>
                    </div>

                    <div ref={bookContainerRef} className="relative">
                      <label className="block text-xs font-bold text-[#4A3F00] mb-1">Street Address</label>
                      <input
                        type="text"
                        value={addressForm.address}
                        onChange={handleBookAddressChange}
                        required
                        className="w-full rounded-lg border border-[#8B4513]/30 bg-[#FFFBEB] px-3 py-2 text-sm text-[#4A3F00] outline-none focus:border-[#8B4513]"
                        placeholder="e.g. Park Street, Bandra"
                      />
                      {showBookSuggestions && bookSuggestions.length > 0 && (
                        <ul className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto rounded-lg border border-[#E6C747] bg-[#FFFBEB] shadow-lg divide-y divide-[#FFF5CC]">
                          {bookSuggestions.map((suggestion) => (
                            <li
                              key={suggestion.place_id}
                              onClick={() => handleBookSuggestionSelect(suggestion)}
                              className="flex items-start gap-2.5 px-4 py-3 cursor-pointer text-sm text-[#4A3F00] hover:bg-[#FFDE59] transition-colors"
                            >
                              <MapPin className="h-4 w-4 mt-0.5 text-[#8C7B00] shrink-0" />
                              <div>
                                <span className="font-semibold block">
                                  {suggestion.structured_formatting.main_text}
                                </span>
                                <span className="text-xs text-[#8C7B00]">
                                  {suggestion.structured_formatting.secondary_text}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                      {isBookAddressVerified && (
                        <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-green-600">
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-green-100 text-green-600 font-extrabold text-[10px]">✓</span>
                          <span>Verified via Google Maps</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#4A3F00] mb-1">City</label>
                        <input
                          type="text"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          required
                          className="w-full rounded-lg border border-[#E6C747] bg-[#FFFBEB] px-3 py-2 text-sm text-[#4A3F00] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#4A3F00] mb-1">Zip / Postal Code</label>
                        <input
                          type="text"
                          value={addressForm.zipCode}
                          onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                          required
                          className="w-full rounded-lg border border-[#E6C747] bg-[#FFFBEB] px-3 py-2 text-sm text-[#4A3F00] outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddressFormOpen(false)}
                        className="rounded-lg border border-[#E6C747] bg-white px-4 py-2 text-xs font-bold text-[#4A3F00]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-lg bg-[#FFDE59] px-4 py-2 text-xs font-bold text-[#4A3F00]"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                ) : loadingAddresses ? (
                  <div className="text-center py-4 text-[#8C7B00] text-sm">Loading addresses...</div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-6 text-sm text-[#8C7B00] border border-dashed border-[#FFF5CC] bg-[#FFFBEB]/10 rounded-xl">
                    No shipping addresses saved. Click "Add New Address" above to save one.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="rounded-xl border border-[#E6C747]/40 bg-white p-4 shadow-sm relative flex flex-col justify-between hover:border-[#E6C747] transition-all">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="rounded-full bg-[#FFFBEB] border border-[#E6C747] px-2 py-0.5 text-xs font-bold text-[#4A3F00]">
                              {addr.title}
                            </span>
                            <span className="font-bold text-[#4A3F00] text-sm">{addr.name}</span>
                          </div>
                          <p className="text-xs text-[#8C7B00] leading-relaxed">
                            {addr.address}, {addr.city} - {addr.zipCode}
                          </p>
                          <p className="text-xs text-[#8C7B00] mt-1 font-medium">
                            Phone: {addr.phone} | Country: {addr.country || "India"}
                          </p>
                        </div>
                        <div className="flex justify-end gap-2 mt-4 border-t border-gray-100 pt-2.5">
                          <button
                            onClick={() => handleAddressEditInit(addr)}
                            className="text-xs font-bold text-[#4A3F00] hover:underline"
                          >
                            Edit
                          </button>
                          <span className="text-gray-200">|</span>
                          <button
                            onClick={() => handleAddressDelete(addr.id)}
                            className="text-xs font-bold text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="rounded-lg border border-[#FFF5CC] bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold text-[#4A3F00]">Order History</h2>
              {loadingOrders ? (
                <div className="py-12 text-center text-[#8C7B00]">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center">
                  <Package className="mx-auto mb-4 h-12 w-12 text-[#8C7B00]" />
                  <h3 className="mb-2 text-lg font-semibold text-[#4A3F00]">No orders yet</h3>
                  <p className="text-[#8C7B00]">Start shopping to see your orders here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((transaction) => (
                    <div key={transaction.id} className="rounded-lg border border-[#FFF5CC] p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="font-semibold text-[#4A3F00]">Order #{transaction.id.substring(0, 8)}...</h3>
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(transaction.status.toLowerCase())}`}>
                              {transaction.status}
                            </span>
                          </div>
                          <p className="text-sm text-[#8C7B00] mb-2">
                            {new Date(transaction.createdAt).toLocaleDateString()} • {transaction.items.length} item(s)
                          </p>
                          <div className="space-y-1">
                            {transaction.items.map((item: any, index: number) => (
                              <div key={index} className="text-sm text-[#8C7B00]">
                                {item.title} × {item.quantity} (₹{Number(item.price).toFixed(2)})
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-[#4A3F00]">₹{Number(transaction.totalAmount).toFixed(2)}</div>
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
